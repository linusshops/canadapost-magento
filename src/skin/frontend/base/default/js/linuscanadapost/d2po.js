var linus = linus || {};
linus.canadapost = linus.canadapost || {};

linus.canadapost.d2po = linus.canadapost.d2po || (function($, Common)
{
    'use strict';

    var loaded = false;
    var apiKey = null;
    var map;

    var markers = [];

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

    function createMap($target, epicenter)
    {
        return lazyLoadGoogleMapsLibrary()
            .then(function () {
                getPostalCodeCoordinates(epicenter.postalCode, function(results, status){
                    if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                        map = new google.maps.Map($target[0], {
                            center: results[0].geometry.location,
                            zoom: 12
                        });
                    }
                });
            });
    }

    function displayOfficeMarkers(epicenter)
    {
        getPostOfficeData(epicenter).done(function(response){
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
                    animation: google.maps.Animation.DROP
                });

                markerBounds.extend(location);

                var infowindow = new google.maps.InfoWindow({
                    content: office.name + '<br/>' + office.address['office-address']
                });

                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                    $mapDiv.trigger('onOfficeMarkerClick', [office['office-id']]);
                });

                markers.push(marker);
            });

            map.fitBounds(markerBounds);
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

    return {
        render: render
    };
})(jQuery, linus.common);
