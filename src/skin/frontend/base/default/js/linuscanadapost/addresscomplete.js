var linus = linus || {};
linus.canadapost = linus.canadapost || {};

linus.canadapost.addresscomplete = (function($, Common, _)
{
    'use strict';

    /**
     * Create an address completion object on a fieldset
     * @param fields
     * @param options
     * @return AddressControl
     */
    function apply(fields, options)
    {
        if (_.isUndefined(options)) {
            options = {};
        }

        _.defaultsDeep(options, {
            key: Common.getCspData('addresscomplete_key')
        });

        return new pca.Address(fields, options);
    }

    (function __init(){
        $(document).ready(function(){
            //Common.lazy(Common.getCspData('addresscomplete_style'));
            //Common.lazy(Common.getCspData('addresscomplete_script'));
        });
    })();

    return {
        apply: apply
    }

})(jQuery, linus.common, lodash);
