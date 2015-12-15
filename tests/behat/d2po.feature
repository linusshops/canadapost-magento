Feature: D2PO Maps
  In order to select a post office to deliver to
  As a person buying things
  I need to see the offices near me

  Background:
    Given My viewport is desktop sized

  Scenario: Run Demo
    Given I am on "/canadapost/demo"
    And I should see the demo render button
    When I press "Render Map"
    Then I should see the rendered map
