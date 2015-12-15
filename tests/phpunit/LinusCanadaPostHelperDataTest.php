<?php

/**
 *
 *
 * @author Sam Schmidt <samuel@dersam.net>
 * @since 2015-12-15
 * @company Linus Shops
 */
class LinusCanadaPostHelperDataTest extends PHPUnit_Framework_TestCase
{
    public function testGetNearbyPostOffices()
    {
        $helper = Mage::helper('linus_canadapost');
        $offices = $helper->getNearbyPostOffices('H4G1J9', 'Montreal', 'QC');

        $this->assertNotEmpty($offices);
        $this->assertEquals(10, count($offices));
    }
}
