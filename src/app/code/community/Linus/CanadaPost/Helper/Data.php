<?php
use LinusShops\CanadaPost\Service;
use LinusShops\CanadaPost\ServiceFactory;

/**
 * Helper
 *
 */
class Linus_CanadaPost_Helper_Data extends Mage_Core_Helper_Abstract
{
    /**
     * @param $name
     * @return Service
     */
    public function getService($name)
    {
        return (new ServiceFactory(
            Mage::getStoreConfig('linus_canadapost/api/endpointurl'),
            Mage::getStoreConfig('linus_canadapost/api/userid'),
            Mage::getStoreConfig('linus_canadapost/api/password')
        ))->getService($name);
    }
}
