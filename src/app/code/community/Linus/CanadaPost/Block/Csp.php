<?php

/**
 *
 *
 * @author Sam Schmidt <samuel@dersam.net>
 * @since 2016-06-27
 */
class Linus_CanadaPost_Block_Csp extends Linus_Common_Block_CspAbstract
{
    /**
     * Defines the CSP data to be encoded in this block.
     */
    public function defineCspData()
    {
        $this->setCspData([
            'gmaps_api_key' => Mage::getStoreConfig('linus_canadapost/maps/key'),
            'cpost_logo' => Mage::getBaseUrl(Mage_Core_Model_Store::URL_TYPE_SKIN).'frontend/base/default/images/linuscanadapost/map_pin_logo.png',
            'addresscomplete_script' => Mage::getStoreConfig('linus_canadapost/addresscomplete/js'),
            'addresscomplete_style' => Mage::getStoreConfig('linus_canadapost/addresscomplete/css'),
            'addresscomplete_key' => Mage::getStoreConfig('linus_canadapost/addresscomplete/key')
        ]);
    }
}
