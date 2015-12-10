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
        /** @var GetNearestPostOffice $service */
        $service = Mage::helper('linus_canadapost')->getService('GetNearestPostOffice');
    }
}
