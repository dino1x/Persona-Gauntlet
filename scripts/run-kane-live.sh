#!/usr/bin/env bash
set -euo pipefail

# Persona Gauntlet — Live Kane CLI Verification Runner
# Uses project-local .kane-home directory for reproducible local/CI state

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export HOME="$ROOT_DIR/.kane-home"
export KANE_CLI_USER_AGENT="${KANE_CLI_USER_AGENT:-claude-code}"
export KANE_CLI_DISABLE_UPDATE_CHECK="1"
mkdir -p "$HOME"

echo "================================================================"
echo "  Persona Gauntlet — Live Kane CLI Verification Suite"
echo "  Workspace Kane Home: .kane-home"
echo "================================================================"

echo "[1/4] Validating Evidence Verdict Policy with kane-cli..."
kane-cli evidence lint-policy ./policies/persona-gauntlet-policy.yaml

echo "[2/4] Ingesting Persona Specifications into local .context/ store..."
kane-cli context ingest ./personas/persona-specs.md --mode ci
kane-cli context list --json

echo "[3/4] Checking Kane CLI authentication status..."
if ! kane-cli whoami >/dev/null 2>&1; then
  echo "Notice: Not authenticated in .kane-home yet."
  echo "To run live browser sessions against your TestMu AI account:"
  echo "  HOME=\"\$PWD/.kane-home\" kane-cli login --oauth"
  echo "  bash ./scripts/run-kane-live.sh"
  exit 0
fi

echo "[4/4] Running 6-Persona Gauntlet Suite with per-persona CDP constraints..."
node ./scripts/cdp-persona-launcher.mjs all --live
