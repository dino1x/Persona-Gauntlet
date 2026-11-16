---
mode: testing
tags: [persona, cancellation, dark-patterns]
---

# Joe Miller — Subscription Cancellation Parity & Network Integrity

## Open Subscription Management Portal
Go to http://localhost:4180/?persona=joe and verify the active "Artisan Roast Monthly Club" membership card is visible.

## Cancel Subscription and Assert 200 Network Status
Click "Cancel Membership", click "Confirm Immediate Cancellation", store the membership status badge as 'cancellation_status', and verify the status is "Canceled" with zero 500 server errors in the console or network log.
