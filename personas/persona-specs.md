# Persona Gauntlet — Independent Human-Factors Specifications

This specification defines the six mandatory human personas that every release of the **Kurogami Atelier Storefront** must satisfy in a real browser via `kane-cli`.

## Use-Case 1: Maya Lin — Keyboard-Only & Assistive Navigation (`uc-maya-keyboard`)
- **Persona Profile:** Senior data analyst with repetitive strain injury who navigates exclusively via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`) with mouse pointer events disabled.
- **Acceptance Criteria:**
  1. Every interactive control (shipping method selector, promo drawer toggle, terms dialog close button, and final checkout CTA) must be reachable via sequential `Tab` navigation with a visible `:focus-visible` indicator.
  2. Opening and closing the Terms of Service modal must not trap keyboard focus or reset focus to `<body>`.
  3. Order confirmation must render a valid `ORD-` receipt code stored as `order_receipt`.

## Use-Case 2: Dev Patel — 200% Browser Zoom / Low-Vision Layout (`uc-dev-zoom200`)
- **Persona Profile:** Staff engineer with 20/70 vision operating Chrome at `200%` page zoom (`Emulation.setPageScaleFactor(2.0)`).
- **Acceptance Criteria:**
  1. At 200% zoom, fixed or sticky banners (cookie consent bar, live support pill, sticky order summary) must never occlude or intercept clicks on the primary `"Complete Order"` button.
  2. Checkout completion must succeed without `ElementClickIntercepted` errors and store the verified total as `zoom_order_total`.

## Use-Case 3: Ana Silva — Slow 3G Connection & Double-Submit Resilience (`uc-ana-slow3g`)
- **Persona Profile:** Commuter on a high-latency 3G train connection (450ms RTT, 400kbps downlink) who clicks `"Pay Now"` twice when the UI does not immediately respond.
- **Acceptance Criteria:**
  1. Clicking the primary payment button must immediately transition the button into a locked/disabled in-flight state and attach a deterministic idempotency token.
  2. Rapidly clicking `"Pay Now"` twice during a slow network round-trip must produce exactly `1` ledger charge (`$148.00`), never a duplicate charge (`$296.00`).

## Use-Case 4: Sam Okafor — 375×667 Compact Android Viewport (`uc-sam-mobile375`)
- **Persona Profile:** Buyer on a compact 375×667 Android screen (`kane-cli config set-window 375x667`).
- **Acceptance Criteria:**
  1. Promo code input and `"Apply"` / `"Continue"` controls must wrap cleanly within a 375px viewport without horizontal clipping (`scrollWidth <= clientWidth`).
  2. Applying code `ATELIER20` must reduce the $148.00 subtotal by $20.00 to `$128.00` and store `mobile_final_total`.

## Use-Case 5: Lena Weber — German Browser Locale (`de-DE`) & Comma Decimals (`uc-lena-german`)
- **Persona Profile:** Berlin architect running Chrome with `Accept-Language: de-DE` and German number formatting (`148,00 €`).
- **Acceptance Criteria:**
  1. Long compound German CTA labels (`"Zahlungspflichtig bestellen"`) must wrap or expand without text clipping or overflowing action containers.
  2. Currency calculation and tax parsing must handle European comma decimals (`148,00 €`) without producing `NaN` in the order total.

## Use-Case 6: Joe Miller — First-Time User & Subscription Cancellation Parity (`uc-joe-cancel`)
- **Persona Profile:** First-time subscriber testing whether canceling the monthly coffee club is as straightforward as signing up ("Sign up in 2 clicks, cancel in <= 3 clicks").
- **Acceptance Criteria:**
  1. Canceling an active subscription must not require navigating deceptive retention mazes or inverted button hierarchies.
  2. Clicking `"Confirm Cancellation"` must return HTTP 200 (never a silent HTTP 500 behind an optimistic toast) and store `cancellation_status` as `"Canceled"`.
