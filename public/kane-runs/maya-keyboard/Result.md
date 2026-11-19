---
test: ../maya_keyboard_test.md
status: failed
started: 2026-11-17T13:05:48.847Z
duration_s: 502
session_id: 7e9c8bac-b644-4d28-a5b1-e1d23146cff5
---

# Maya Lin — Keyboard-Only Checkout Verification — Result

## Open Storefront in Keyboard-Only Mode ✓ passed (54.3s)
md5: daf30967a46206b694d206d44b4deaef
Go to http://localhost:4180/?persona=maya and verify the Kurogami Atelier checkout stage is visible.

## Select Express Shipping via Keyboard Focus ✓ passed (187.3s)
md5: ad9d440187f0567f21c639f46115e2de
Focus the Express Air shipping option using keyboard navigation, activate it with Enter or Space, and verify the shipping badge updates to Express Air.

## Complete Keyboard Checkout and Extract Receipt ✗ failed (224.6s)
md5: e93ed5c79091f9fc82c70ebbbd3d63e1
Reason: Final verification failed: "the confirmation banner contains "Order Confirmed"" — bug verdict: Complete Order keyboard activation does not show confirmation [application_issue/functional_defect, confidence 0.90]
Activate the Complete Order button using the keyboard, store the displayed order receipt code as 'order_receipt', and verify the confirmation banner contains "Order Confirmed".
