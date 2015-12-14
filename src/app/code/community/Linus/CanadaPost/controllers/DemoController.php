<?php

/**
 * Provides a sample for developers, as well as for front-end acceptance tests.
 *
 * Any action in this controller should not return if developer mode is
 * not enabled.
 *
 * @author Sam Schmidt <samuel@dersam.net>
 * @since 2015-12-14
 * @company Linus Shops
 */
class Linus_CanadaPost_DemoController extends Mage_Core_Controller_Front_Action
{
    function indexAction()
    {
        if (!Mage::getIsDeveloperMode()) {
            $this->norouteAction();
            return;
        }

        $this->loadLayout();
        $this->renderLayout();
    }
}
