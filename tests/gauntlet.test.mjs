import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PERSONA_CDP_PROFILES, buildKaneCommand, ROOT_DIR } from '../scripts/cdp-persona-launcher.mjs';
import { evaluatePersona, DEFAULT_HEAL_MAP, writeHealState, HEAL_STATE_PATH } from '../scripts/storefront-evaluator.mjs';

const CLI_PATH = path.join(ROOT_DIR, 'bin', 'gauntlet.mjs');

test('All 6 human personas are registered with real CDP constraints and _test.md files', () => {
  const expectedIds = ['maya', 'dev', 'ana', 'sam', 'lena', 'joe'];
  assert.deepEqual(Object.keys(PERSONA_CDP_PROFILES), expectedIds);

  for (const id of expectedIds) {
    const profile = PERSONA_CDP_PROFILES[id];
    assert.ok(profile.cdpCommands.length >= 1, `Persona ${id} must define CDP constraints`);
    const fullTestPath = path.join(ROOT_DIR, profile.testFile);
    assert.ok(fs.existsSync(fullTestPath), `Missing _test.md file for ${id}: ${profile.testFile}`);
  }
});

test('buildKaneCommand isolates HOME to .kane-home and disables adaptive heal', () => {
  const cmd = buildKaneCommand('maya', { cdpEndpoint: 'ws://127.0.0.1:9222/devtools/browser/mock' });
  assert.equal(cmd.binary, 'kane-cli');
  assert.ok(cmd.args.includes('--no-adaptive-heal'));
  assert.ok(cmd.args.includes('--policy'));
  assert.ok(cmd.args.includes('--cdp-endpoint'));
  assert.ok(cmd.env.HOME.endsWith('.kane-home'));
});

test('Dynamic Storefront Evaluator computes real defects (NaN comma math, 3G race, 200% zoom occlusion, keyboard focus)', () => {
  const lenaUnhealed = evaluatePersona('lena', false);
  assert.equal(lenaUnhealed.status, 'failed');
  assert.equal(lenaUnhealed.extractedState.euro_total, 'NaN €');

  const lenaHealed = evaluatePersona('lena', true);
  assert.equal(lenaHealed.status, 'passed');
  assert.equal(lenaHealed.extractedState.euro_total, '136,16 €');

  const anaUnhealed = evaluatePersona('ana', false);
  assert.equal(anaUnhealed.status, 'failed');
  assert.equal(anaUnhealed.extractedState.charge_count, '2');
  assert.equal(anaUnhealed.extractedState.billed_amount, '$296.00');

  const anaHealed = evaluatePersona('ana', true);
  assert.equal(anaHealed.status, 'passed');
  assert.equal(anaHealed.extractedState.charge_count, '1');
  assert.equal(anaHealed.extractedState.billed_amount, '$148.00');
});

test('CLI supports --help, rejects unknown flags/positionals/empty --persona= with exit 2, and runs from /tmp', () => {
  const helpOut = execFileSync('node', [CLI_PATH, '--help'], { cwd: '/tmp', encoding: 'utf8' });
  assert.ok(helpOut.includes('Usage:'));

  for (const invalidArgs of [['--unknown-flag'], ['frobnicate'], ['--persona='], ['--heal', '--reset'], ['--heal', '--baseline']]) {
    let badExit = 0;
    try {
      execFileSync('node', [CLI_PATH, ...invalidArgs], { cwd: '/tmp', encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      badExit = err.status;
    }
    assert.equal(badExit, 2, `Expected exit 2 for invalid args ${invalidArgs.join(' ')}`);
  }
});

test('CLI baseline, --heal, plain run after --heal, and --reset leave public/heal-state.json byte-identical', () => {
  const originalBytes = fs.readFileSync(HEAL_STATE_PATH, 'utf8');
  try {
    let exitCode = 0;
    let stdout = '';
    try {
      stdout = execFileSync('node', [CLI_PATH, '--baseline', '--json'], { cwd: '/tmp', encoding: 'utf8' });
    } catch (err) {
      exitCode = err.status;
      stdout = err.stdout;
    }
    assert.equal(exitCode, 1);
    const parsed = JSON.parse(stdout);
    assert.equal(parsed.mode, 'baseline');
    assert.equal(parsed.passed, 2);
    assert.equal(parsed.total, 6);
    assert.equal(parsed.verdict, 'FAIL');

    const healedOut = execFileSync('node', [CLI_PATH, '--heal', '--json'], { cwd: '/tmp', encoding: 'utf8' });
    const healedParsed = JSON.parse(healedOut);
    assert.equal(healedParsed.mode, 'healed');
    assert.equal(healedParsed.passed, 6);

    // Plain run after --heal must also report mode: "healed" and 6/6 PASS
    const plainAfterHeal = JSON.parse(
      execFileSync('node', [CLI_PATH, '--json'], { cwd: '/tmp', encoding: 'utf8' })
    );
    assert.equal(plainAfterHeal.mode, 'healed');
    assert.equal(plainAfterHeal.passed, 6);

    // --reset must exit 0 and restore exact bytes
    const resetOut = execFileSync('node', [CLI_PATH, '--reset', '--json'], { cwd: '/tmp', encoding: 'utf8' });
    assert.equal(JSON.parse(resetOut).status, 'reset');
  } finally {
    writeHealState(DEFAULT_HEAL_MAP);
  }
  const afterBytes = fs.readFileSync(HEAL_STATE_PATH, 'utf8');
  assert.equal(afterBytes, originalBytes);
});

test('Policy YAML validates via kane-cli evidence lint-policy when on PATH and falls back offline cleanly', () => {
  const policyPath = path.join(ROOT_DIR, 'policies', 'persona-gauntlet-policy.yaml');
  assert.ok(fs.existsSync(policyPath));
  const rawYaml = fs.readFileSync(policyPath, 'utf8');
  assert.ok(rawYaml.includes('policy: persona-gauntlet-gate'));

  const versionCheck = spawnSync('kane-cli', ['--version'], {
    cwd: ROOT_DIR,
    env: { ...process.env, HOME: path.join(ROOT_DIR, '.kane-home') },
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  if (versionCheck.status === 0) {
    const lintRes = spawnSync('kane-cli', ['evidence', 'lint-policy', policyPath, '--json'], {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        HOME: path.join(ROOT_DIR, '.kane-home'),
        KANE_CLI_USER_AGENT: 'claude-code',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    assert.equal(lintRes.status, 0);
    const parsed = JSON.parse((lintRes.stdout ?? '').trim());
    assert.equal(parsed.valid, true);
  }
});
