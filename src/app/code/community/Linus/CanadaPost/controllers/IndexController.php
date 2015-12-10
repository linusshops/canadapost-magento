<?php
/**
 * Index Controller
 *
 */
class Linus_CanadaPost_IndexController extends Mage_Core_Controller_Front_Action
{
    /**
     * Index Action
     */
    public function indexAction()
    {
        $this->loadLayout();
        $this->renderLayout();
    }
}
