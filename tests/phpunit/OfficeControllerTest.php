<?php

class OfficeControllerTest extends PHPUnit_Framework_TestCase
{
    public function testNearestActionNoParameters()
    {
        $request = new \LinusShops\Prophet\Injectable\Overrides\Request();
        $request->setMethod('GET');

        $response = new \LinusShops\Prophet\Injectable\Overrides\Response();

        Mage::app()->setResponse($response);

        $controller = new \Linus_CanadaPost_OfficeController($request, $response);
        $controller->nearestAction();
        $headers = $controller->getResponse()->getHeaders();
        $this->assertEquals($headers[0]['name'], 'Content-Type');
        $this->assertEquals($headers[0]['value'], 'application/json');

        $body = $controller->getResponse()->getBody();
        $json = json_decode($body, true);
        $this->assertTrue($json !== false);

        $this->assertEquals(1, $json['error']);
    }

    public function testNearestAction()
    {
        $request = new \LinusShops\Prophet\Injectable\Overrides\Request();
        $request->setMethod('GET');

        $response = new \LinusShops\Prophet\Injectable\Overrides\Response();

        $request->setParam('postal_code', 'H4G1J9');
        $request->setParam('city', 'Montreal');
        $request->setParam('province', 'QC');

        Mage::app()->setResponse($response);

        $controller = new \Linus_CanadaPost_OfficeController($request, $response);
        $controller->nearestAction();
        $headers = $controller->getResponse()->getHeaders();
        $this->assertEquals($headers[0]['name'], 'Content-Type');
        $this->assertEquals($headers[0]['value'], 'application/json');

        $body = $controller->getResponse()->getBody();
        $json = json_decode($body, true);
        $this->assertTrue($json !== false);

        $this->assertEquals(10, count($json['payload']));
    }
}
