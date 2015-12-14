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

    function lazyInit()
    {
        if (getApiKey() == null) {
            throw Exception('No GMaps Api key provided. Terminating.');
        }

        var promise = null;

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

    function buildMap($target)
    {

    }

    function addMarker()
    {

    }

    function getPostOfficeData(postalCode, city, province)
    {
        $.ajax('/canadapost/office/nearest?postal_code='+postalCode+'&city='+city+'&province='+province, {
            method: 'GET',
            dataType: 'json'
        });
    }

    function map(apiKey, $target, epicenter)
    {
        setApiKey(apiKey);

        lazyInit()
            .then(function(){
                return getPostOfficeData(
                    epicenter.postalCode,
                    epicenter.city,
                    epicenter.province
                );
            })
    }

    return {
        map: map
    };
})(jQuery);
