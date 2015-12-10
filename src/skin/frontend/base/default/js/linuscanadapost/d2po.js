var linus = linus || {};

linus.d2po = linus.d2po || (function($){
    'use strict';

    function makeMap($target, options)
    {
        return new google.maps.Map($target[0], options);
    }

    function init(apiKey, callback)
    {
        $.when(
            $.ajax({
                url: "https://maps.googleapis.com/maps/api/js?key="+apiKey+"&callback=initMap",
                dataType: 'script',
                cache: true,
                crossDomain: true
            })
        ).done(callback);
    }

    return {
        init: init,
        makeMap: makeMap
    };
})(jQuery);
