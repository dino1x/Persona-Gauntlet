---
mode: testing
tags: [persona, network, idempotency]
---

# Ana Silva — Slow 3G Double-Submit Idempotency Verification

## Open Storefront under Slow 3G Emulation
Go to http://localhost:4180/?persona=ana and verify the checkout summary displays a single charge of \$148.00.

## Trigger Rapid Double-Click on Pay Now
Click the Pay Now button twice in rapid succession, store the number of recorded ledger charges as 'charge_count', store the billed amount as 'billed_amount', and verify the billed amount equals "\$148.00" with exactly 1 charge recorded.
