---
mode: testing
tags: [persona, i18n, locale]
---

# Lena Weber — German Locale (de-DE) & Comma Decimal Verification

## Open Storefront with German Locale (de-DE)
Go to http://localhost:4180/?persona=lena and verify the German checkout interface ("Kasse — Kurogami Atelier") is visible.

## Verify Comma-Decimal Calculation and Submit Order
Click "Zahlungspflichtig bestellen", store the formatted Euro order total as 'euro_total', and verify the order total is "136,16 €" and does not contain "NaN".
