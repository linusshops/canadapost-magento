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
     * Contains the current Canada Post markers.
     * @type {Object}
     */
    var markers = {};

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

    var dragStartCenter;
    var dragStartPoint;
    var dragEndPoint;

    var lastPostalCode;

    /**
     * If drag distance is less than tolerance, don't requery.
     */
    var dragPixelTolerance;

    /**
     * Map zoom level used when rendering.
     *
     * @type {number}
     */
    var mapZoomLevel = 16;

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
                setLastPostalCode(epicenter.postalCode);
                getPostalCodeCoordinates(epicenter.postalCode, function(results, status){
                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                        map = new google.maps.Map($target[0], {
                            center: results[0].geometry.location,
                            mapTypeControl: false
                        });

                        var $mapDiv = $(map.getDiv());

                        //Update drag status for use by delayed dragend event.
                        map.addListener('dragstart', function(){
                            isMapCurrentlyDragging = true;
                            dragStartCenter = map.getCenter();
                            dragStartPoint = getPixelCoordinates(dragStartCenter);

                            $mapDiv.trigger('onMapDragStart', [dragStartPoint]);
                        });
                        map.addListener('dragend', function(){
                            isMapCurrentlyDragging = false;
                            dragEndPoint = getPixelCoordinates(dragStartCenter);

                            $mapDiv.trigger('onMapDragEnd', [dragEndPoint]);
                        });

                        map.addListener('dragend', function(){
                            //Check if this can be considered a minor adjustment.
                            //Don't send a query if so.
                            if (isDragDistanceInTolerance()) {
                                return;
                            }

                            //If there is a delay timer running, wipe it.
                            //We've dragged somewhere else, so we don't care
                            //about the previous end.
                            clearTimeout(lastTimer);
                            lastTimer = _.delay(onDragEnd, dragQueryDelay)
                        });

                        //Set drag tolerance if still undefined.
                        if (_.isUndefined(dragPixelTolerance)) {
                            resetDragTolerance();
                        }
                    }

                    $target.trigger('onMapLoaded', [map]);
                });
            });
    }

    /**
     * Is the distance the map was dragged within the tolerance for minor adjustments?
     * @returns {boolean}
     */
    function isDragDistanceInTolerance()
    {
        var start = dragStartPoint;
        var end = dragEndPoint;

        //Now use math. :O (it's the distance formula)
        var distance = Math.sqrt(
            Math.pow((end.x - start.x), 2) + Math.pow((end.y - start.y), 2)
        );

        return distance < dragPixelTolerance;
    }

    /**
     * Translate lati
     * http://stackoverflow.com/questions/3410600/convert-lat-lon-to-pixels-and-back
     * @param latLng
     * @returns {{x: number, y: number}}
     */
    function getPixelCoordinates(latLng)
    {
        var projection = map.getProjection();
        var bounds = map.getBounds();
        var topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
        var bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = projection.fromLatLngToPoint(latLng);
        return {x: Math.floor((worldPoint.x - bottomLeft.x) * scale), y:Math.floor((worldPoint.y - topRight.y) * scale)};
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
                        setLastPostalCode(newPostalCode);
                        var $mapDiv = $(map.getDiv());
                        $mapDiv.trigger('onMapDragEndGeocode', [lastPostalCode]);
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
                //If the office is already on the map, don't animate again.
                if (_.has(markers, _.get(office, 'office-id'))) {
                    return;
                }

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
                var $infoContent = $('#d2po_temp_info_content');

                if (!$infoContent.length) {
                    $('body').append('<div id="d2po_temp_info_content" class="js-hidden"><div class="d2po_info_window_content"></div></div>');
                }

                //Copy some values to remove dashes from keys, which are
                //problematic when templating.
                _.set(office, 'address.office_address', office.address['office-address']);
                _.set(office, 'address.postal_code', office.address['postal-code']);
                Common.tpl('.d2po_info_window_content', office);

                var infowindow = new google.maps.InfoWindow({
                    content: $infoContent.html()
                });

                marker.addListener('click', function() {
                    if (_.isObject(openedInfoWindow)) {
                        openedInfoWindow.close();
                    }

                    infowindow.open(map, marker);

                    $mapDiv.trigger('onOfficeMarkerClick', [office]);
                    openedInfoWindow = infowindow;
                });

                markers[_.get(office, 'office-id')] = marker;
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
    function render(target, epicenter, options)
    {
        var $target = $(target);

        if (!_.isObject(options)) {
            options = {};
        }

        if (typeof _.get(options, 'apiKey') == 'undefined' || _.get(options, 'apiKey') == null) {
           apiKey = linus.common.getCspData('gmaps_api_key');
        }

        setApiKey(apiKey);

        $.when(createMap($target, epicenter))
            .then(function(){
                if (_.get(options,'showMarkersOnLoad', true)) {
                    displayOfficeMarkers(epicenter);
                } else {
                    $target.on('onMapLoaded', function(event, map){
                        var bounds = new google.maps.LatLngBounds();
                        bounds.extend(map.getCenter());
                        map.fitBounds(bounds);
                        google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
                            this.setZoom(mapZoomLevel);
                        });
                    });
                }
            });
    }

    /**
     * Repositions the map to a new epicenter, then looks up nearby Canada Post
     * offices.
     * @param epicenter
     */
    function reposition(epicenter)
    {
        setLastPostalCode(epicenter.postalCode);
        getPostalCodeCoordinates(epicenter.postalCode, function(results, status){
            if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                clearAllMarkers();
                map.setCenter(results[0].geometry.location);
                displayOfficeMarkers(epicenter);

                google.maps.event.trigger(map, 'resize');
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

    /**
     * Resets drag tolerance to the default (5% of
     * map div width, or 50px, whichever is smaller).
     */
    function resetDragTolerance()
    {
        var tolerance = 50;

        var width = $(map.getDiv()).width();

        if (_.isNumber(width)) {
            var tenPercent = width * 0.05;
            if (tenPercent < 50) {
                tolerance = tenPercent;
            }

            Common.log(tenPercent, tolerance);
        }

        setDragTolerance(tolerance);
    }

    function setDragTolerance(pixels)
    {
        Common.log('Drag tolerance set to '+pixels);
        dragPixelTolerance = pixels;
    }

    function setLastPostalCode(postalCode)
    {
        if (!_.isNull(postalCode)) {
            lastPostalCode = postalCode;
        }
    }

    /**
     * Set the default zoom level when a map renders.
     *
     * @param zoomLevel
     */
    function setZoomLevel(zoomLevel)
    {
        mapZoomLevel = zoomLevel;
    }

    return {
        clearAllMarkers: clearAllMarkers,
        render: render,
        reposition: reposition,
        setDragTolerance: setDragTolerance,
        setDragQueryDelay: setDragQueryDelay,
        setMaxOffices: setMaxOffices,
        setZoomLevel: setZoomLevel
    };
})(jQuery, lodash, linus.common);
