# magento-canadapost
Provide Canada Post helpers for Magento

* Provides frontend helpers for creating Direct to Post Office maps with Google Maps

## Installation

## Usage
* In the Magento Admin, set your Google Maps Javascript API Key, and your Canada Post keys
* On the page where you want to create the maps, use your layout xml to install
the javascript module and config template. To do this add `<update handle="linus_canadapost_js/>`
to the page handle. See linus_canadapost.xml for an example of how to do this.
* On the page, call linus.canadapost.d2po.render with the appropriate parameters to create your map.

## Demo
If you have developer mode enabled, you can view a demo of the D2PO map creation
at /canadapost/demo.
