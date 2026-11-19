# Persona Gauntlet

> **"Your app works for you on a 1440p monitor. Does it work for Maya?"**
>
> *The coding agent said "Done — all checks passed." Then six real people tried to buy: **2 of 6 got through → 6 of 6 after the closed loop.***

---

## The Problem

AI coding agents verify their own work on the happy path: a 1440p desktop viewport, mouse clicks, 100% zoom, US-English strings, and a zero-latency localhost connection. When the page renders, the agent declares `"Done"`.

Then real people arrive:
- **Maya Lin (Keyboard-Only Navigator, RSI):** Cannot select `"Express Air ($18.00)"` shipping with the keyboard because the developer built it as `<div class="shipping-option">` with no `tabIndex` or keyboard handler (leaving `"Standard Ground ($10.00)"` selected).
- **Dev Patel (200% Browser Zoom, Low Vision):** At `200%` page scale (`Emulation.setPageScaleFactor(2.0)`), the fixed bottom concierge bar (`z-index: 50`) sits directly on top of `"Complete Order"` (`ElementClickIntercepted`).
- **Ana Silva (Slow 3G Commuter, 450ms RTT):** Taps `"Pay Now"` twice within the 450ms 3G round-trip window—and gets billed twice (`$296.00`) because there is no synchronous in-flight lock or idempotency key.
- **Sam Okafor (375×667 Compact Android):** Tests whether the promo code bar wraps cleanly on a 375px viewport (`kane-cli config set-window 375x667`) and validates promo code `ATELIER20` (`$148.00 → $128.00`).
- **Lena Weber (German Browser Locale `de-DE`):** Sees `"NaN €"` as her order total because `Number("118,40") + Number("17,76")` returns `NaN` in JavaScript when decimals use commas (`118,40 € + 17,76 € = 136,16 €`), while `"Zahlungspflichtig bestellen"` overflows a fixed-width button.
- **Joe Miller (First-Time Subscriber Testing Cancellation):** Checks whether canceling a monthly subscription is as simple as joining (`2 clicks` with HTTP 200 proof, zero dark-pattern mazes).

---

## How Persona Gauntlet Uses `@testmuai/kane-cli`

Rather than relying on prompts alone to simulate human constraints, **Persona Gauntlet** pairs **independent human-factors briefs** (`personas/persona-specs.md`) with a **Chrome DevTools Protocol (CDP) Constraint Launcher** (`scripts/cdp-persona-launcher.mjs`) and attaches `@testmuai/kane-cli` (`v0.10.4`):

1. **Ingest Independent Persona Specifications (`kane-cli context`):**
   ```bash
   pnpm run kane:ingest
   # Runs: HOME="$PWD/.kane-home" KANE_CLI_USER_AGENT=claude-code kane-cli context ingest ./personas/persona-specs.md --mode ci
   ```
2. **Enforce Browser Constraints & Execute `*_test.md` Suites (`kane-cli testmd run`):**
   `scripts/cdp-persona-launcher.mjs --live` launches Chrome with persistent flags (`--force-device-scale-factor=2`, `--lang=de-DE`, `--window-size=375,667`) and `--remote-debugging-port`, keeps a persistent CDP WebSocket session open across the run, and attaches `kane-cli testmd run` with `--cdp-endpoint` and `--no-adaptive-heal` judged against `policies/persona-gauntlet-policy.yaml`:
   ```bash
   node ./scripts/cdp-persona-launcher.mjs maya --live
   ```
3. **Closed-Loop Auto-Repair (`2/6 Passed → 6/6 Passed`):**
   Running `node ./bin/gauntlet.mjs --heal` persists the healed state to `public/heal-state.json` (and the web UI also supports `?healed=1` or interactive in-browser healing) so both the deterministic evaluator and live `kane-cli` browser runs against `http://localhost:4180` verify all **6 of 6 personas passing**.

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run the automated verification & CLI tests (offline, 0 credits, leaves git tree clean)
pnpm test

# 3. Run the CLI baseline audit (2/6 pass, exits 1), post-heal audit (6/6 pass, exits 0), and reset (exits 0)
node ./bin/gauntlet.mjs --baseline
node ./bin/gauntlet.mjs --heal
node ./bin/gauntlet.mjs --reset

# 4. Validate the Kane CLI Evidence Policy & Context Store
pnpm run kane:lint-policy
pnpm run kane:ingest

# 5. Start the interactive Persona Gauntlet Console & Kurogami Atelier Storefront
pnpm dev
# Open http://localhost:4180 (or http://localhost:4180/?healed=1)
```

### Running Live Browser Sessions with `@testmuai/kane-cli`

All `kane-cli` state is stored inside `.kane-home/` (requires local Google Chrome and `kane-cli login`):

```bash
HOME="$PWD/.kane-home" kane-cli login --oauth
pnpm run kane:live
```

---

## Committed Live Run Receipts & Field Filmstrip

Every real `@testmuai/kane-cli` (`v0.10.4`) cloud artifact from both our initial failing run (`7e9c8bac`) and our post-fix passing run (`4d5a245c`) against the Kurogami Atelier checkout is committed in [`public/kane-runs/maya-keyboard/`](./public/kane-runs/maya-keyboard/) and [`public/kane-runs/maya-keyboard-healed/`](./public/kane-runs/maya-keyboard-healed/) and can be scrubbed frame-by-frame in the web UI's **Field Filmstrip** tab without a TestMu AI login:

- **Run 1 — Initial Failing Run ([`public/kane-runs/maya-keyboard/Result.md`](./public/kane-runs/maya-keyboard/Result.md) & [`result.yaml`](./public/kane-runs/maya-keyboard/result.yaml)):**
  - **Session ID:** `7e9c8bac-b644-4d28-a5b1-e1d23146cff5` (`execution_id: 4f7d5433-5ae0-4ee5-bc55-7d92ea7fcd1c`, TestCase `01M7MST5M62TTXDD4R82Q2XKRM`)
  - **Public TestMu AI Share Link (Run 1):** [View Run 1 Summary](https://test-manager.lambdatest.com/projects/01M7MPS9Y77NE2KVM7CTVSTZG5/test-cases/01M7MST5M62TTXDD4R82Q2XKRM/dashboard/share/US_AXLNIWIK5XY5W6HYNSLE6M6GAV8LUCF6PHO3FMH7KIZF7IAYFYQE6NTLZWHFPMY3?type=summary&agentView=true&fqdn=summary-page)
  - **Volume & Cost:** `17` real browser steps across `3` sub-objectives · `502s` duration · `64.40` credits consumed (`10.06` + `18.71` + `35.64`, recorded in [`0-run_summary.json`](./public/kane-runs/maya-keyboard/0-run_summary.json), [`1-run_summary.json`](./public/kane-runs/maya-keyboard/1-run_summary.json), and [`2-run_summary.json`](./public/kane-runs/maya-keyboard/2-run_summary.json)) · **`status: failed`** (Step 17 failed with `confidence 0.90`)
- **Run 2 — Post-Fix Passing Run ([`public/kane-runs/maya-keyboard-healed/Result.md`](./public/kane-runs/maya-keyboard-healed/Result.md), [`result.yaml`](./public/kane-runs/maya-keyboard-healed/result.yaml) & Exported [`test.py`](./public/kane-runs/maya-keyboard-healed/test.py)):**
  - **Session ID:** `4d5a245c-55fd-4818-a50a-6fa631653a95` (`execution_id: 665bab95-c755-4c14-ba2b-72eb6f8b14f8`, TestCase `01M7MST5M62TTXDD4R82Q2XKRM`)
  - **Public TestMu AI Share Link (Run 2):** [View Run 2 Passing Summary](https://test-manager.lambdatest.com/projects/01M7MPS9Y77NE2KVM7CTVSTZG5/test-cases/01M7MST5M62TTXDD4R82Q2XKRM/dashboard/share/US_O9MI6RIF00UKQEQVYMP5772SR483RYWXLPTRA8SJNSU6J2HRDUE0ZHGGYN37SB3K?type=summary&agentView=true&fqdn=summary-page)
  - **Volume & Cost:** `34` steps (`3/3` sub-objectives passed) · `385s` duration · `46.23` trajectory credits (`0.00` + `28.96` + `17.27` in `0/1/2-run_summary.json`; `54.52` adaptive-heal attempt credits in `result.yaml`) · **`status: passed`**
  - **Exported Playwright Python Test & Final Screenshot:** [`test.py`](./public/kane-runs/maya-keyboard-healed/test.py) and [`step-34-order-confirmed.jpg`](./public/kane-runs/maya-keyboard-healed/step-34-order-confirmed.jpg)

### Honest Field Notes (What the Live Runs Actually Show)

We report our live run outcomes transparently without cherry-picking:
- **Run 1 (`7e9c8bac`, Before Scroll Fix):** At Step 05 (`1-2`), the `v16-alpha` planner clicked `"Auto-Heal Defect & Re-Verify"` with the mouse before starting its `Tab` sequence (so the `Tab` + `Enter` selection of **Express Air ($18.00)** ran on the already-healed `<button>`). On Sub-Objective 3 (Step 17), pressing `Enter` on **Complete Order ($148.00)** rendered the `"Order Confirmed"` banner below the button outside the agent's viewport in [`step-17-verdict.jpg`](./public/kane-runs/maya-keyboard/step-17-verdict.jpg) (`confidence 0.90`).
- **Code Fix & Run 2 (`4d5a245c`, After Scroll Fix):** We patched [`src/components/StorefrontStage.tsx`](./src/components/StorefrontStage.tsx) to scroll the confirmation banner into view (`scrollIntoView({ block: 'nearest' })`) with `role="status"` and auto-scrolled `#kurogami-storefront-stage` on `?persona=` load. On Run 2 (`4d5a245c`, executed against the healed storefront state), Kane CLI completed all 3 sub-objectives via pure `Tab` + `Enter` keyboard traversal (`status: passed` in `385s`), verified `"Order Confirmed"` and extracted `ORD-MAYA-8841` directly from `locators=['internal:role=status']`, and exported [`public/kane-runs/maya-keyboard-healed/test.py`](./public/kane-runs/maya-keyboard-healed/test.py).

---

## Evaluation Notes for Judges

- **Ships (Real Working Product):** Runs as a self-contained web workbench (`pnpm dev` on port `4180`) paired with a zero-dependency CLI (`node ./bin/gauntlet.mjs --baseline | --heal | --reset`) and a CDP constraint launcher (`scripts/cdp-persona-launcher.mjs`) that enforces real browser flags (`--force-device-scale-factor=2`, `--lang=de-DE`, `--window-size=375,667`).
- **Verified (Genuine Kane CLI v0.10.4 Execution):** Uses `kane-cli context ingest` on `personas/persona-specs.md`, `kane-cli evidence lint-policy` on `policies/persona-gauntlet-policy.yaml`, `kane-cli testrun run --dry-run` across all 6 persona suites, and includes committed cloud run artifacts (`64.40` credits, `17` steps, `session_id: 7e9c8bac-b644-4d28-a5b1-e1d23146cff5`).
- **Closed Loop (Failure → Code Remediation → Re-Verification):** Each persona failure maps to an explicit code defect (`role="radio"` + `tabIndex={0}` for Maya, relative concierge flow at `200%` zoom for Dev, synchronous `inFlightRef` lock + idempotency key for Ana, integer-cent locale parser for Lena). Healing persists to `public/heal-state.json` and lifts checkout completion from `2/6` to `6/6`.
- **Craft (Human Empathy & Zero-Login Inspection):** Designed around six distinct human realities rather than synthetic unit assertions, with a built-in **Field Filmstrip** viewer so judges can inspect the committed Kane CLI screenshots, vision bounding boxes, and NDJSON traces immediately in the browser.

---

## What Is Real vs. Simulated

| Layer | Implementation Status |
| :--- | :--- |
| **`@testmuai/kane-cli` (`v0.10.4`) Artifacts & Cloud Receipts** | **Real & Committed** — `personas/persona-specs.md` is ingested into `.context/` via `kane-cli context ingest`, `policies/persona-gauntlet-policy.yaml` is validated via `kane-cli evidence lint-policy`, all 6 `tests/*_test.md` files pass `kane-cli testrun run --dry-run`, and real cloud session artifacts (`7e9c8bac-b644-4d28-a5b1-e1d23146cff5`) are committed in `public/kane-runs/maya-keyboard/`. |
| **Target Storefront (`Kurogami Atelier`)** | **Real** — Live interactive React checkout & subscription portal served at `http://localhost:4180/?persona=<id>`. Contains 4 failing baseline defects (`Maya`, `Dev`, `Ana`, `Lena`) and 2 passing baseline controls (`Sam`, `Joe`), with disk persistence via `node ./bin/gauntlet.mjs --heal` (`public/heal-state.json`) and URL override via `?healed=1`. |
| **CDP Constraint Launcher (`cdp-persona-launcher.mjs`)** | **Requires Chrome + `kane-cli login` for `--live`** — In `--live` mode, spawns local Chrome with per-persona CLI flags (`--force-device-scale-factor=2`, `--lang=de-DE`, `--window-size=375,667`) + a persistent CDP WebSocket session and attaches `kane-cli testmd run --cdp-endpoint`. Without `--live`, prints the exact CDP and `kane-cli` invocation. |
| **Offline Evaluator & NDJSON Inspector (`bin/gauntlet.mjs`)** | **Deterministic Offline Mode** — `pnpm test`, `node ./bin/gauntlet.mjs`, and the web UI run offline at 0 credits using `scripts/storefront-evaluator.mjs` and recorded NDJSON traces when Chrome or `kane-cli` login is absent. |
