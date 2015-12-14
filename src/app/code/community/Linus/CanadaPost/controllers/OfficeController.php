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
        $max = $this->getRequest()->get('max');

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

            if ($max = null) {
                $max = 10;
            }

            $common->sendResponseJson(array(), 'Missing required fields: '.$msg);
            return;
        }

        $offices = Mage::helper('linus_canadapost')->getNearbyPostOffices(
            $postalCode,
            $city,
            $province,
            $max
        );

        $common->sendResponseJson($offices);
    }
}
