var linus = linus || {};
linus.canadapost = linus.canadapost || {};

linus.canadapost.d2po = linus.canadapost.d2po || (function($)
{
    'use strict';

    var loaded = false;
    var apiKey = null;

    var map;

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

    function loadMarkers(epicenter)
    {
        getPostOfficeData(epicenter).done(function(response){
            
        });
    }

    /**
     * Wrap map creation (if not already created) and adding markers
     */
    function render(apiKey, $target, epicenter)
    {
        setApiKey(apiKey);

        $.when(createMap($target, epicenter))
            .then(function(){
                loadMarkers(epicenter);
            });
    }

    return {
        render: render
    };
})(jQuery);
