jQuery(document).ready( function() {
    jQuery('#demo-map').on('click', function (event) {
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
