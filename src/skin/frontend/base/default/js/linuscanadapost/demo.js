jQuery(document).ready( function() {
    jQuery('#demo-map').on('click', function (event) {
        linus.canadapost.d2po.setMaxOffices(10);

        linus.canadapost.d2po.render(
            '#map', //The target div to render your map to.
            {postalCode: 'H4G1J9', city: 'Montreal', province: 'QC'} //All of these options are required.
        );
    });

    var $map = jQuery('#map');

    $map.on('onOfficeMarkerClick', function(event, office){
        console.log(event);
        console.log(office); //The office object represented by the marker. Contains all office data.
    });

    $map.on('onOfficesLoaded', function(event, offices){
        console.log(event);
        console.log(offices); //An array of objects that contain office data.
    });
});


function demoReposition() {
    linus.canadapost.d2po.setMaxOffices(5);
    linus.canadapost.d2po.reposition({postalCode: "K1A 0A6", city: "Ottawa", province: "ON"});
}

function demoReturnToStart() {
    linus.canadapost.d2po.setMaxOffices(3);
    linus.canadapost.d2po.reposition({postalCode: 'H4G1J9', city: 'Montreal', province: 'QC'});
}
