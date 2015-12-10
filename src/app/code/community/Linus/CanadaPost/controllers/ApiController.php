<?php
use LinusShops\CanadaPost\Services\GetNearestPostOffice;

/**
 * Index Controller
 *
 */
class Linus_CanadaPost_OfficeController extends Mage_Core_Controller_Front_Action
{
    /**
     * Get the list of nearest post offices
     */
    public function nearestAction()
    {
        $common = Mage::helper('linus_common/request');

        //Require: Postal code
        $postalCode = $this->getRequest()->get('postal_code');
        $city = $this->getRequest()->get('city');
        $province = $this->getRequest()->get('province');

        if (in_array(null, array($postalCode, $city, $province))) {
            $msg = '';

            if ($postalCode == null) {
                $msg .= 'postal code ';
            }

            if ($city == null) {
                $msg .= 'city ';
            }

            if ($province == null) {
                $msg .= 'province ';
            }

            $common->sendResponseJson(array(), 'Missing required fields: '.$msg);
            return;
        }

        /** @var GetNearestPostOffice $service */
        $service = Mage::helper('linus_canadapost')->getService('GetNearestPostOffice');
        $offices = $service
            ->setParameter('d2po', 'true')
            ->setParameter('postalCode', $postalCode)
            ->setParameter('city', $city)
            ->setParameter('province', $province)
            ->send()
        ;
    }
}
