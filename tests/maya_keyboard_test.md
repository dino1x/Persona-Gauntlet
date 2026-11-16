---
mode: testing
tags: [persona, accessibility, keyboard]
---

# Maya Lin — Keyboard-Only Checkout Verification

## Open Storefront in Keyboard-Only Mode
Go to http://localhost:4180/?persona=maya and verify the Kurogami Atelier checkout stage is visible.

## Select Express Shipping via Keyboard Focus
Focus the Express Air shipping option using keyboard navigation, activate it with Enter or Space, and verify the shipping badge updates to Express Air.

## Complete Keyboard Checkout and Extract Receipt
Activate the Complete Order button using the keyboard, store the displayed order receipt code as 'order_receipt', and verify the confirmation banner contains "Order Confirmed".
