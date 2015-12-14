var linus = linus || {};

linus.d2po = linus.d2po || (function($)
{
    'use strict';

    var loaded = false;
    var apiKey = null;

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
                    url: "https://maps.googleapis.com/maps/api/js?key=" + getApiKey() + "&callback=initMap",
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

    function makeMap($target, epicenter)
    {
        getPostOfficeData(
            epicenter.postalCode,
            epicenter.city,
            epicenter.province
        ).done(function(response){
            var offices = response.payload;
            getPostalCodeCoordinates(epicenter.postalCode)
                .done(function(response){
                    markOffices(
                        createMap($target, center),
                        offices
                    );
                });
        })
    }

    function createMap($target, center)
    {

    }

    function markOffices(map, offices)
    {

    }

    function getPostOfficeData(postalCode, city, province)
    {
        $.ajax('/canadapost/office/nearest?postal_code='+postalCode+'&city='+city+'&province='+province, {
            method: 'GET',
            dataType: 'json'
        });
    }

    //Get the lat/long coordinates for the postal code
    function getPostalCodeCoordinates(postalCode)
    {

    }

    function map(apiKey, $target, epicenter)
    {
        setApiKey(apiKey);

        lazyLoadGoogleMapsLibrary()
            .then(function(){
                makeMap($target, epicenter);
            });
    }

    return {
        map: map
    };
})(jQuery);
