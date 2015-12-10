var linus = linus || {};

linus.d2po = linus.d2po || (function($)
{
    'use strict';

    function lazyInit(apiKey, onInitComplete)
    {
        $.when(
            $.ajax({
                url: "https://maps.googleapis.com/maps/api/js?key="+apiKey+"&callback=initMap",
                dataType: 'script',
                cache: true,
                crossDomain: true
            })
        ).done(onInitComplete);
    }

    function buildMap($target)
    {

    }

    function addMarker()
    {

    }

    function getPostOfficeData()
    {

    }

    function initMap(apiKey, $target)
    {
        lazyInit(apiKey, function(){
            buildMap($target);
        });
    }

    return {
        initMap: initMap
    };
})(jQuery);
