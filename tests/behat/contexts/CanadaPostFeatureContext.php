<?php

use Behat\Behat\Context\Context;
use Behat\Behat\Context\SnippetAcceptingContext;
use Behat\Mink\Exception\ElementNotFoundException;
use LinusShops\Prophet\Context\ProphetContext;

/**
 * Defines application features from the specific context.
 */
class CanadaPostFeatureContext extends ProphetContext implements Context, SnippetAcceptingContext
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
        $this->waitForElement('.gm-style');
    }

    /**
     * @Given /^I should see the demo render button$/
     */
    public function iShouldSeeTheDemoRenderButton()
    {
        $this->waitForElement('#demo-map');
    }
}
