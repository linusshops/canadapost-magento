var linus = linus || {};
linus.canadapost = linus.canadapost || {};

linus.canadapost.d2po = linus.canadapost.d2po || (function($, Common)
{
    'use strict';

    var loaded = false;
    var apiKey = null;
    var map;

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
                $.ajax({
                    url: "https://maps.googleapis.com/maps/api/js?key=" + getApiKey(),
                    dataType: 'script',
                    cache: true,
                    crossDomain: true
                })
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
        return $.ajax('/canadapost/office/nearest?postal_code='+epicenter.postalCode+'&city='+epicenter.city+'&province='+epicenter.province, {
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
                    }
                });
            });
    }

    /**
     * Load the post office data from Canada Post, and inject it as map markers.
     * @param epicenter
     */
    function displayOfficeMarkers(epicenter)
    {
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
                    '<span class="office-info">' +
                    office.name +
                    '<br/>' + office.address['office-address'] +
                    '<br/>' + office.address.city  +
                    ', ' + office.address['postal-code'] +
                    '</span></div>'
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

            map.fitBounds(markerBounds);
        });
    }

    /**
     * Zoom and center on a specific location, generally to show an office
     * at a sane default zoom level.
     * @param latitude
     * @param longitude
     */
    function recenterAndZoom(latitude, longitude)
    {
        var markerBounds = new google.maps.LatLngBounds();
        var location = new google.maps.LatLng(
            latitude,
            longitude
        );
        markerBounds.extend(location);
        map.fitBounds(markerBounds);
        map.setZoom(16);
    }

    /**
     * Resets the zoom and map bounds to contain all displayed post offices.
     */
    function resetZoom()
    {
        var markerBounds = new google.maps.LatLngBounds();
        $.each(offices, function(index, office) {
            var location = new google.maps.LatLng(
                office.address.latitude,
                office.address.longitude
            );

            markerBounds.extend(location);
        });
        map.fitBounds(markerBounds);
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

    /**
     * Get the current map object
     */
    function getMap()
    {
        return map;
    }

    return {
        getMap: getMap,
        recenterAndZoom: recenterAndZoom,
        render: render,
        resetZoom: resetZoom
    };
})(jQuery, linus.common);
