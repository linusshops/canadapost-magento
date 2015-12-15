jQuery(document).ready( function() {
    jQuery('#demo-map').on('click', function (event) {
        linus.canadapost.d2po.render(
            jQuery('#map'),
            {postalCode: 'H4G1J9', city: 'Montreal', province: 'QC'}
        );
    });

    jQuery('#map').on('onOfficeMarkerClick', function(event, id){
        console.log(event);
        console.log('office id: '+id);
    });
});
