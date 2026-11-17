# Architecture & Implementation Plan: 030-cms-plugins

## 1. WooCommerce Plugin
- PHP 7.4 - 8.3 compatible.
- Hooks into `woocommerce_checkout_fields` and `woocommerce_shipping_calculator`.
- Uses local bundled JSON cache of districts/upazilas with optional API key for real-time validation.

## 2. Laravel Package
- Service provider registering `Desh` facade.
- Custom validation rules and Blade helpers.
