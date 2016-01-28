
jQuery(window).on('load', function() {
    linus.canadapost.addresscomplete.apply([
        {element: "street-address", field: "Line1"},
        {
            element: "street-address2",
            field: "Line2",
            mode: pca.fieldMode.POPULATE
        },
        {element: "city", field: "City", mode: pca.fieldMode.POPULATE},
        {element: "state", field: "ProvinceName", mode: pca.fieldMode.POPULATE},
        {element: "postcode", field: "PostalCode", mode: pca.fieldMode.DEFAULT},
        {element: "country", field: "CountryName", mode: pca.fieldMode.POPULATE}
    ]);
});
