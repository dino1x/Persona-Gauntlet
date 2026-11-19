#!/usr/bin/env node
/**
 * Persona Gauntlet CLI (`node ./bin/gauntlet.mjs`)
 *
 * Evaluates all 6 human personas against the live Kurogami Atelier storefront logic,
 * supports persistent healing (`--heal`) and baseline reset (`--reset`), or triggers
 * live Chrome CDP + `kane-cli` verification (`--live`).
 */

import { buildKaneCommand, runLivePersonaWithCdp, PERSONA_CDP_PROFILES } from '../scripts/cdp-persona-launcher.mjs';
import {
  DEFAULT_HEAL_MAP,
  evaluateAllPersonas,
  readHealState,
  writeHealState,
} from '../scripts/storefront-evaluator.mjs';

const VALID_TOKENS = new Set([
  '--help',
  '-h',
  '--heal',
  'heal',
  '--reset',
  'reset',
  '--baseline',
  'baseline',
  '--json',
  '--live',
  'audit',
]);

const args = process.argv.slice(2);

for (const arg of args) {
  if (arg.startsWith('--persona=')) {
    const val = arg.slice('--persona='.length).trim();
    if (!val || !PERSONA_CDP_PROFILES[val]) {
      console.error(
        `Error: Invalid or empty --persona value "${val}". Valid personas: ${Object.keys(PERSONA_CDP_PROFILES).join(', ')}`
      );
      process.exit(2);
    }
    continue;
  }
  if (arg === '--persona') {
    console.error('Error: --persona needs a value in the form --persona=<id> (maya, dev, ana, sam, lena, joe).');
    process.exit(2);
  }
  if (!VALID_TOKENS.has(arg)) {
    console.error(`Error: Unknown argument "${arg}". Run "node ./bin/gauntlet.mjs --help" for usage.`);
    process.exit(2);
  }
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Persona Gauntlet CLI — Human-Factors Browser Verification & Self-Healing Harness

Usage:
  node ./bin/gauntlet.mjs [options]

Options:
  --baseline       Evaluate baseline storefront state (2 of 6 personas passing, exits 1)
  --heal           Apply closed-loop fixes to public/heal-state.json and verify all 6 personas (6/6 pass, exits 0)
  --reset          Reset public/heal-state.json back to unhealed baseline (exits 0)
  --live           Launch headless Chrome with real CDP constraints per persona and run kane-cli
  --persona=<id>   Target a single persona (maya, dev, ana, sam, lena, joe)
  --json           Emit structured JSON report to stdout
  -h, --help       Show this help message
`);
  process.exit(0);
}

const personaFlag = args.find((a) => a.startsWith('--persona='));
const targetPersonaId = personaFlag ? personaFlag.slice('--persona='.length).trim() : null;

const hasResetFlag = args.includes('--reset') || args.includes('reset');
const hasHealFlag = args.includes('--heal') || args.includes('heal');
const hasBaselineFlag = args.includes('--baseline') || args.includes('baseline');

if ([hasResetFlag, hasHealFlag, hasBaselineFlag].filter(Boolean).length > 1) {
  console.error(
    'Error: Contradictory mode flags (--heal, --reset, and --baseline are mutually exclusive).'
  );
  process.exit(2);
}

const isResetOnly = hasResetFlag && !args.includes('audit');

if (hasResetFlag) {
  writeHealState(DEFAULT_HEAL_MAP);
  if (isResetOnly) {
    if (args.includes('--json')) {
      console.log(JSON.stringify({ status: 'reset', mode: 'baseline', healedMap: DEFAULT_HEAL_MAP }, null, 2));
    } else {
      console.log('Reset public/heal-state.json to baseline state (2 of 6 personas passing).');
    }
    process.exit(0);
  }
}

const isHeal = args.includes('--heal') || args.includes('heal');
const isBaselineExplicit = args.includes('--baseline') || args.includes('baseline');
const isJson = args.includes('--json');
const isLive = args.includes('--live');

if (isLive) {
  try {
    const ids = targetPersonaId ? [targetPersonaId] : Object.keys(PERSONA_CDP_PROFILES);
    let exitCode = 0;
    for (let i = 0; i < ids.length; i++) {
      const code = await runLivePersonaWithCdp(ids[i], 9240 + i);
      if (code !== 0) exitCode = code;
    }
    process.exit(exitCode);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }
}

let activeHealMap;
if (isHeal) {
  activeHealMap = {
    maya: true,
    dev: true,
    ana: true,
    sam: true,
    lena: true,
    joe: true,
  };
  writeHealState(activeHealMap);
} else if (isBaselineExplicit) {
  activeHealMap = { ...DEFAULT_HEAL_MAP };
} else {
  activeHealMap = readHealState();
}

const isCurrentlyHealedMode = Object.values(activeHealMap).every(Boolean);

const evaluated = evaluateAllPersonas(activeHealMap)
  .filter((r) => !targetPersonaId || r.id === targetPersonaId)
  .map((r) => ({
    ...r,
    kaneCommand: buildKaneCommand(r.id).args.join(' '),
  }));

const passedCount = evaluated.filter((r) => r.status === 'passed').length;
const allPassed = passedCount === evaluated.length && evaluated.length > 0;

if (isJson) {
  console.log(
    JSON.stringify(
      {
        mode: isCurrentlyHealedMode ? 'healed' : 'baseline',
        passed: passedCount,
        total: evaluated.length,
        verdict: allPassed ? 'PASS' : 'FAIL',
        personas: evaluated,
      },
      null,
      2
    )
  );
  process.exit(allPassed ? 0 : 1);
}

console.log(
  `\nPersona Gauntlet — ${isCurrentlyHealedMode ? 'Post-Heal Verification' : 'Storefront Persona Audit'}`
);
console.log(`Score: ${passedCount} of ${evaluated.length} real people completed the flow\n`);
for (const r of evaluated) {
  const badge = r.status === 'passed' ? '[PASS]' : '[FAIL]';
  console.log(`${badge} ${r.persona.padEnd(14)} | ${r.constraint}`);
  if (r.status === 'failed' && r.failureRemark) {
    console.log(`       Kane CLI Failure: ${r.failureRemark}`);
  } else {
    console.log(`       Kane Final State: ${JSON.stringify(r.extractedState)} (${r.durationSec}s)`);
  }
}
console.log('');
process.exit(allPassed ? 0 : 1);
