var linus = linus || {};
linus.canadapost = linus.canadapost || {};

linus.canadapost.d2po = linus.canadapost.d2po || (function($, _, Common)
{
    'use strict';

    var loaded = false;
    var apiKey = null;
    var map;

    var maxOffices = 10;

    var markers = [];
    var offices;

    function setApiKey(key)
    {
        apiKey = key;
    }

    function getApiKey()
    {
        return apiKey;
    }

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

    //Get the lat/long coordinates for the postal code
    function getPostalCodeCoordinates(postalCode, callback)
    {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({address: postalCode}, callback);
    }

    /**
     * Load the google maps library, then center on the give area code
     * @param $target
     * @param epicenter
     * @returns {*}
     */
    function createMap($target, epicenter)
    {
        return lazyLoadGoogleMapsLibrary()
            .then(function () {
                getPostalCodeCoordinates(epicenter.postalCode, function(results, status){
                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                        map = new google.maps.Map($target[0], {
                            center: results[0].geometry.location
                        });

                        map.addListener('dragend', onDragEnd);
                    }
                });
            });
    }

    function onDragEnd()
    {
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

                    clearAllMarkers();
                    displayOfficeMarkers({postalCode: newPostalCode}, false);
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

                var content = '<div class="canadapost marker">' +
                    '<span class="office-name">'+office.name + '</span>' +
                    '<br/><span class="office-address">' + office.address['office-address']+ '</span>' +
                    '<br/><span class="office-city">' + office.address.city+ '</span>'  +
                    ', <span class="office-province">' + office.address.province+ '</span>'  +
                    ' <span class="office-postal">' + office.address['postal-code']+ '</span>' +
                    '</div>'
                ;

                var infowindow = new google.maps.InfoWindow({
                    content: content
                });

                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                    $mapDiv.trigger('onOfficeMarkerClick', [office]);
                });

                markers.push(marker);
            });

            if (recenter) {
                map.fitBounds(markerBounds);
            }
        });
    }

    /**
     * Wrap map creation (if not already created) and adding markers
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

    function setMaxOffices(max)
    {
        maxOffices = max;
    }

    return {
        clearAllMarkers: clearAllMarkers,
        getMap: getMap,
        render: render,
        reposition: reposition,
        setMaxOffices: setMaxOffices
    };
})(jQuery, lodash, linus.common);
