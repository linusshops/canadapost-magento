# magento-canadapost
Provide Canada Post helpers for Magento

* Provides frontend helpers for creating Direct to Post Office maps with Google Maps

## Installation
This should be installed using Composer. A magento build should also include the Magento Composer Installer. This module follows the module structure guidelines provided by Firegento, which will also make it very easy to submit to the Firegento Composer Repository.

## Usage
* In the Magento Admin, set your Google Maps Javascript API Key, and your Canada Post keys
* On the page where you want to create the maps, use your layout xml to install
the javascript module and config template. To do this add `<update handle="linus_canadapost_d2po/>`
to the page handle. See linus_canadapost.xml for an example of how to do this.
* On the page, call linus.canadapost.d2po.render with the appropriate parameters to create your map.

## Demo
If you have developer mode enabled, you can view a demo of the D2PO map creation
at /canadapost/demo. It is highly recommend to examine this, as it demonstrates
creating the maps on the frontend, as well as how to use layout xml to add D2PO to a page.

## Customization
The infowindow markup is rendered via the Common.tpl method. To modify the look
of the infowindow, you can modify `frontend/base/default/template/tpl/linuscanadapost/mapmarker.phtml`
in your theme.
