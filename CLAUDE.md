# CLAUDE.md — Persona Gauntlet Agent & Kane CLI Instructions

When modifying or verifying components in **Persona Gauntlet**, always validate the target storefront (`Kurogami Atelier`) against all six human personas using `@testmuai/kane-cli`.

## Core Verification Protocol

1. **Isolated Kane CLI Environment:**
   Always prefix `kane-cli` commands with `HOME="$PWD/.kane-home"` and `KANE_CLI_USER_AGENT=claude-code`:
   ```bash
   HOME="$PWD/.kane-home" KANE_CLI_USER_AGENT=claude-code kane-cli whoami
   ```
2. **Ingest Persona Specifications (Assurance Graph):**
   ```bash
   HOME="$PWD/.kane-home" KANE_CLI_USER_AGENT=claude-code kane-cli context ingest ./personas/persona-specs.md --mode ci
   HOME="$PWD/.kane-home" KANE_CLI_USER_AGENT=claude-code kane-cli context list --json
   ```
3. **Run Persona Suite with Hard CDP Constraints:**
   Launch the CDP Persona Constraint proxy (`./scripts/cdp-persona-launcher.mjs`) which applies real DevTools Protocol overrides (`Emulation.setPageScaleFactor`, `Emulation.setLocaleOverride`, `Emulation.setDeviceMetricsOverride`, `Network.emulateNetworkConditions`, and pointer-event blocking for keyboard-only navigation), then execute:
   ```bash
   HOME="$PWD/.kane-home" KANE_CLI_USER_AGENT=claude-code kane-cli testmd run ./tests/maya_keyboard_test.md --no-adaptive-heal --policy ./policies/persona-gauntlet-policy.yaml --agent
   ```
4. **Closed-Loop Repair Rule:**
   When a persona run exits `1`, inspect the NDJSON failing step `remark` and `.testmuai/evidence/` pack, patch the storefront bug in `src/components/StorefrontStage.tsx`, and re-run `kane-cli` until all 6 personas exit `0` and `kane-cli evidence verdict` passes.
