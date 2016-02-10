var linus = linus || {};
linus.canadapost = linus.canadapost || {};

/**
 * Provides a mashup between Canada Post office locator api and Google Maps.
 * Will automatically apply pins to the map in the location of Canada Post's
 * closest offices to the center of the map.
 *
 * @author Sam Schmidt <samuel@dersam.net>
 */
linus.canadapost.d2po = linus.canadapost.d2po || (function($, _, Common)
{
    'use strict';

    /**
     * Is the Google Maps Javascript api already loaded to the page?
     * @type {boolean}
     */
    var loaded = false;

    /**
     * The api key to use to access the GMaps api. Will use the one set in the
     * Magento admin if available.
     * @type {null}
     */
    var apiKey = null;

    /**
     * The Google Map to which the post office pins are applied. This library
     * assumes you will only have one D2PO map on the page, as there doesn't
     * seem to be any use case for more than one.
     */
    var map;

    /**
     * The maximum number of offices to be returned from Canada Post.
     * @type {number}
     */
    var maxOffices = 10;

    /**
     * Contains the currently active Canada Post markers.
     * @type {Array}
     */
    var markers = [];

    /**
     * The currently opened marker window.
     * @type {null}
     */
    var openedInfoWindow = null;

    var offices;

    /**
     * Milliseconds to wait before updating office locations after dragging map.
     * @type {int}
     */
    var dragQueryDelay = 650;

    /**
     * Updated when dragstart fires, indicates that the map is currently being
     * dragged. Used in the map update delay to determine if the delayed
     * action should actually be used.
     * @type {boolean}
     */
    var isMapCurrentlyDragging = false;
    var lastTimer = null;

    /**
     * Set a specific api key. If you have set this in the Magento admin, not
     * necessary to do it again.
     * @param key
     */
    function setApiKey(key)
    {
        apiKey = key;
    }

    function getApiKey()
    {
        return apiKey;
    }

    /**
     * Only load the google maps library once rendering is requested.
     * @returns {*}
     */
    function lazyLoadGoogleMapsLibrary()
    {
        if (getApiKey() == null) {
            throw Exception('No GMaps Api key provided. Terminating.');
        }

        var promise = null;

        //Make sure we only load the GMaps library once.
        if (!loaded) {
            promise = $.when(
                Common.lazy("https://maps.googleapis.com/maps/api/js?key=" + getApiKey(), 'script')
            ).then(function () {
                loaded = true;
            });
        } else {
            promise = $.when();
        }

        return promise;
    }

    /**
     * Load the office location data from Canada Post
     * @param epicenter
     * @returns {*}
     */
    function getPostOfficeData(epicenter)
    {
        return $.ajax('/canadapost/office/nearest?postal_code='+epicenter.postalCode+'&city='+epicenter.city+'&province='+epicenter.province+'&max='+maxOffices, {
            method: 'GET',
            dataType: 'json'
        });
    }

    /**
     * Get the lat/long coordinates for the postal code
     * @param postalCode
     * @param {function} callback - action to take once the coordinates are acquired.
     */
    function getPostalCodeCoordinates(postalCode, callback)
    {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({address: postalCode}, callback);
    }

    /**
     * Load the google maps library, then center on the given area code
     * @param $target
     * @param {postalCode, city, province} epicenter
     * @returns {promise}
     */
    function createMap($target, epicenter)
    {
        Common.tpl('.d2po_info_window_content');

        return lazyLoadGoogleMapsLibrary()
            .then(function () {
                getPostalCodeCoordinates(epicenter.postalCode, function(results, status){
                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                        map = new google.maps.Map($target[0], {
                            center: results[0].geometry.location
                        });

                        //Update drag status for use by delayed dragend event.
                        map.addListener('dragstart', function(){
                            isMapCurrentlyDragging = true;
                        });
                        map.addListener('dragend', function(){
                            isMapCurrentlyDragging = false;
                        });

                        map.addListener('dragend', function(){
                            //If there is a delay timer running, wipe it.
                            //We've dragged somewhere else, so we don't care
                            //about the previous end.
                            clearTimeout(lastTimer);
                            lastTimer = _.delay(onDragEnd, dragQueryDelay)
                        });
                    }
                });
            });
    }

    /**
     * Update the map after the user finishes dragging the map.
     */
    function onDragEnd()
    {
        //Don't bother querying if user has resumed panning in the delay.
        //Prevents unnecessary API queries when user is clicking and releasing
        //to drag map view.
        if (isMapCurrentlyDragging) {
            return;
        }

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'location': map.getCenter()}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var addressComponents = _.get(results, '0.address_components', null);
                if (!_.isNull(addressComponents)) {
                    var newPostalCode = _.reduce(addressComponents, function(result, component){
                        var comp = _.get(component, 'long_name', component);
                        if (_.isNull(result) && Common.validatePostalCode(comp)) {
                            result = comp;
                        }
                        return result;
                    }, null);

                    if (!_.isNull(newPostalCode)) {
                        displayOfficeMarkers({postalCode: newPostalCode}, false);
                    }
                }
            }
        });
    }

    /**
     * Load the post office data from Canada Post, and inject it as map markers.
     * @param epicenter
     * @param {boolean} recenter - if false, disables recentering on located
     * offices. Defaults to true.
     */
    function displayOfficeMarkers(epicenter, recenter)
    {
        if (_.isUndefined(recenter)) {
            recenter = true;
        }

        getPostOfficeData(epicenter).done(function(response){
            offices = response.payload;
            var $mapDiv = $(map.getDiv());

            $mapDiv.trigger('onOfficesLoaded', [response.payload]);

            var markerBounds = new google.maps.LatLngBounds();

            $.each(response.payload, function(index, office){
                var location = new google.maps.LatLng(
                    office.address.latitude,
                    office.address.longitude
                );

                var marker = new google.maps.Marker({
                    position: location,
                    title: office.name,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: Common.getCspData('cpost_logo')
                });

                markerBounds.extend(location);

                //We could place the div with the target class directly in the
                //info window, but this results in serious jank when the infowindow
                //resizes itself.  Instead, the tpl is loaded when the map is loaded,
                //so it is already available on the page. This means we can call
                //it in a synchronous manner into a hidden div, then extract that
                //rendered content into the infowindow content, resulting in
                //a jankless infowindow.
                if (!$('#d2po_temp_info_content').length) {
                    $('body').append('<div id="d2po_temp_info_content" class="js-hidden"><div class="d2po_info_window_content"></div></div>');
                }

                //Copy some values to remove dashes from keys, which are
                //problematic when templating.
                _.set(office, 'address.office_address', office.address['office-address']);
                _.set(office, 'address.postal_code', office.address['postal-code']);
                Common.tpl('.d2po_info_window_content', office);

                var infowindow = new google.maps.InfoWindow({
                    content: $('#d2po_temp_info_content').html()
                });

                marker.addListener('click', function() {
                    if (_.isObject(openedInfoWindow)) {
                        openedInfoWindow.close();
                    }

                    infowindow.open(map, marker);

                    $mapDiv.trigger('onOfficeMarkerClick', [office]);
                    openedInfoWindow = infowindow;
                });

                markers.push(marker);
            });

            if (recenter) {
                map.fitBounds(markerBounds);
            }
        });
    }

    /**
     * Wrap map creation (if not already created) and adding markers.
     *
     * If you simply want to move the map, reposition() is more performant. Only
     * use render when the map does not yet exist in the target.
     */
    function render(target, epicenter, apiKey)
    {
        var $target = $(target);

        if (typeof apiKey == 'undefined' || apiKey == null) {
           apiKey = linus.common.getCspData('gmaps_api_key');
        }

        setApiKey(apiKey);

        $.when(createMap($target, epicenter))
            .then(function(){
                displayOfficeMarkers(epicenter);
            });
    }

    /**
     * Repositions the map to a new epicenter, then looks up nearby Canada Post
     * offices.
     * @param epicenter
     */
    function reposition(epicenter)
    {
        getPostalCodeCoordinates(epicenter.postalCode, function(results, status){
            if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                clearAllMarkers();
                map.setCenter(results[0].geometry.location);
                displayOfficeMarkers(epicenter);
            }
        });
    }

    /**
     * Obliterate all markers on the map.
     */
    function clearAllMarkers()
    {
        _.forEach(markers, function(marker){
            marker.setMap(null);
        });

        markers = [];
    }

    /**
     * Get the current map object
     */
    function getMap()
    {
        return map;
    }

    /**
     * Set the maximum number of Canada Post offices to display.
     * @param {int} max
     */
    function setMaxOffices(max)
    {
        maxOffices = max;
    }

    /**
     * Set the delay between finishing dragging and the api lookup firing.
     * @param {int} milliseconds
     */
    function setDragQueryDelay(milliseconds)
    {
        dragQueryDelay = milliseconds;
    }

    return {
        clearAllMarkers: clearAllMarkers,
        getMap: getMap,
        render: render,
        reposition: reposition,
        setDragQueryDelay: setDragQueryDelay,
        setMaxOffices: setMaxOffices
    };
})(jQuery, lodash, linus.common);
