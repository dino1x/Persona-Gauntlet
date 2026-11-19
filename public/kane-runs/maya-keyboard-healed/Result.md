---
test: ../maya_keyboard_test.md
status: passed
started: 2026-11-21T09:24:03.707Z
duration_s: 385
session_id: 4d5a245c-55fd-4818-a50a-6fa631653a95
---

# Maya Lin — Keyboard-Only Checkout Verification — Result

## Open Storefront in Keyboard-Only Mode ✓ passed (4.57s)
md5: daf30967a46206b694d206d44b4deaef
Go to http://localhost:4180/?persona=maya and verify the Kurogami Atelier checkout stage is visible.

## Select Express Shipping via Keyboard Focus ✓ passed (177.3s)
md5: ad9d440187f0567f21c639f46115e2de
Focus the Express Air shipping option using keyboard navigation, activate it with Enter or Space, and verify the shipping badge updates to Express Air.

## Complete Keyboard Checkout and Extract Receipt ✓ passed (148.4s)
md5: e93ed5c79091f9fc82c70ebbbd3d63e1
Activate the Complete Order button using the keyboard, store the displayed order receipt code as 'order_receipt', and verify the confirmation banner contains "Order Confirmed".
