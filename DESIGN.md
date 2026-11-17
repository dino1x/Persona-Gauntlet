# DESIGN.md — Persona Gauntlet Design Contract

## 1. Aesthetic Direction & Domain Identity
- **Aesthetic:** Soft, friendly consumer product. White page, warm grays, generous whitespace, `24px`–`28px` rounded cards, black pill buttons, and one vivid color per persona so each person is recognizable at a glance.
- **Core Emotional Signal:** Empathy backed by browser proof. Every persona represents a real human being locked out by happy-path developer assumptions; the scorecard shows them as faces first and verdicts second.

## 2. Typography Scale
- **Display headlines (`Plus Jakarta Sans`, 600):** `44px`–`68px`, tracking `-0.035em`, two-tone (dark statement, light-gray question).
- **UI and narrative (`Inter`, 400–600):** `13px`–`18px`.
- **Telemetry, NDJSON, CDP constraints and diffs (`DM Mono`, 400–500).**

## 3. Color Palette & Surface Hierarchy
- `--pg-canvas`: `#FFFFFF` (page)
- `--pg-card`: `#FBFAF9` (soft card surface)
- `--pg-hairline`: `#EFEDEA` (warm `1px` rule)
- `--pg-ink`: `#1F1E1D` (headings, primary buttons) · `--pg-body`: `#474645` · `--pg-muted`: `#84827F`
- `--pg-pass`: `#30C25A` (persona verified by Kane CLI)
- `--pg-fail`: `#EF4444` (persona blocked)
- `--pg-blue`: `#0A84FF` (active CDP constraint, informational tint)
- Persona colors: Maya `#9553F9`, Dev `#0A84FF`, Ana `#F97316`, Sam `#30C25A`, Lena `#F966AC`, Joe `#F5A524`
- Dark vignette surfaces: `#1C1C1E` / `#2C2C2E` with `#3A3A3C` rules

## 4. Performance & Compositor Guardrails
- Zero high-frequency React `useState` intervals: running timecodes and frame counters update directly via DOM `ref.current.textContent`.
- Hardware-accelerated `translate3d(x, y, 0)` transitions with `will-change: transform` and `contain: layout paint`.
- Zero overlapping `backdrop-filter: blur()` across moving cards (the sticky top bar is the only blurred surface); all panels use solid hex surfaces.
