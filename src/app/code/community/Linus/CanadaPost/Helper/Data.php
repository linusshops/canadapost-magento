<?php
use LinusShops\CanadaPost\Service;
use LinusShops\CanadaPost\ServiceFactory;

/**
 * Provide helper access to Canada Post Api
 *
 */
class Linus_CanadaPost_Helper_Data extends Mage_Core_Helper_Abstract
{
    /**
     * Get post offices near a given location.
     * @param $postalCode
     * @param $city
     * @param $province
     * @return array list of post offices and their locations
     */
    public function getNearbyPostOffices($postalCode, $city, $province, $max =10)
    {
        $service = (new ServiceFactory(
            Mage::getStoreConfig('linus_canadapost/api/endpointurl'),
            Mage::getStoreConfig('linus_canadapost/api/userid'),
            Mage::getStoreConfig('linus_canadapost/api/password')
        ))->getService('GetNearestPostOffice');

        $response = $service
            ->setParameter('d2po', 'true')
            ->setParameter('postalCode', $postalCode)
            ->setParameter('city', $city)
            ->setParameter('province', $province)
            ->setParameter('maximum', $max)
            ->send()
        ;

        $document = new DOMDocument();
        $document->loadXML($response->getBody());

        $offices = array();

        /** @var DOMNode $office */
        foreach ($document->getElementsByTagName('post-office') as $office) {
            $parsed = array('address'=>array());

            foreach ($office->childNodes as $node) {
                if ($node->nodeName == 'address') {
                    foreach ($node->childNodes as $a) {
                        $parsed['address'][$a->nodeName] = $a->nodeValue;
                    }
                } else {
                    $parsed[$node->nodeName] = $node->nodeValue;
                }
            }

            $offices[] = $parsed;
        }

        return $offices;
    }
}
