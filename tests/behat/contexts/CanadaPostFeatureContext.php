<?php
use \LinusShops\Contexts\Web;


/**
 * Defines application features from the specific context.
 */
class CanadaPostFeatureContext extends Web
{
    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct()
    {

    }

    /**
     * @Given /^My viewport is desktop sized$/
     */
    public function myViewportIsDesktopSized()
    {
        $this->setViewportSize(1900, 700);
    }

    /**
     * @Then /^I should see the rendered map$/
     */
    public function iShouldSeeTheRenderedMap()
    {
        $this->waitForSelectorExistence('.gm-style');
    }

    /**
     * @Given /^I should see the demo render button$/
     */
    public function iShouldSeeTheDemoRenderButton()
    {
        $this->waitForSelectorExistence('#demo-map');
    }
}
