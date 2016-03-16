jQuery(document).ready( function() {
    jQuery('#demo-map').on('click', function (event) {
        linus.canadapost.d2po.setMaxOffices(10);

        linus.canadapost.d2po.render(
            '#map', //The target div to render your map to.
            {postalCode: 'H3V 1H6', city: 'Montreal', province: 'QC'},
            {showMarkersOnLoad: true}
        );
    });

    var $map = jQuery('#map');

    $map.on('onMapLoaded', function(event, map){
        console.log(event);
        console.log(map);
    });

    $map.on('onOfficeMarkerClick', function(event, office){
        console.log(event);
        console.log(office); //The office object represented by the marker. Contains all office data.
    });

    $map.on('onOfficesLoaded', function(event, offices){
        console.log(event);
        console.log(offices); //An array of objects that contain office data.
    });

    $map.on('onMapDragEndGeocode', function(event, postalCode){
        console.log(event);
        console.log(postalCode);
    });
});


function demoReposition() {
    linus.canadapost.d2po.setMaxOffices(5);
    linus.canadapost.d2po.reposition({postalCode: "K1A 0A6", city: "Ottawa", province: "ON"});
}

function demoReturnToStart() {
    linus.canadapost.d2po.setMaxOffices(3);
    linus.canadapost.d2po.reposition({postalCode: 'H3V 1H6', city: 'Montreal', province: 'QC'});
}
