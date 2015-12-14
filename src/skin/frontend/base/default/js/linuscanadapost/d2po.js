var linus = linus || {};
linus.canadapost = linus.canadapost || {};

linus.canadapost.d2po = linus.canadapost.d2po || (function($)
{
    'use strict';

    var loaded = false;
    var apiKey = null;
    var lastPostCoordinates = {};

    var gmapsTimer = null;

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

    function getPostOfficeData(postalCode, city, province)
    {
        return $.ajax('/canadapost/office/nearest?postal_code='+postalCode+'&city='+city+'&province='+province, {
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

    function clearLastPostCoordinates()
    {
        lastPostCoordinates = {};
    }

    function renderMap(postalCode)
    {
        getPostalCodeCoordinates(postalCode, function(results, status){
            if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: results[0].geometry.location,
                    zoom: 12
                });
            }
        });
    }

    function initMap(apiKey, $target, epicenter)
    {
        setApiKey(apiKey);
        clearLastPostCoordinates();
        console.log(getPostOfficeData);
        getPostOfficeData(
            epicenter.postalCode,
            epicenter.city,
            epicenter.province
        ).done(function(response) {
            lastPostCoordinates = response.payload;
        });

        lazyLoadGoogleMapsLibrary()
            .then(function () {
                gmapsTimer = setTimeout(function(){
                    if (typeof google.maps.Geocoder != 'undefined') {
                        clearTimeout(gmapsTimer);
                        renderMap(epicenter.postalCode);
                    }
                }, 250);
            });
    }

    return {
        initMap: initMap
    };
})(jQuery);
