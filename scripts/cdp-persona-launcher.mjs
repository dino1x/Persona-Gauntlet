#!/usr/bin/env node
/**
 * Persona Gauntlet — Real CDP Constraint Launcher for Kane CLI
 *
 * Launches Chrome with a remote debugging port and persistent CLI/CDP constraints,
 * holds the CDP WebSocket session open across the run, and attaches `@testmuai/kane-cli`
 * via `--cdp-endpoint` inside `.kane-home`.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

export const ROOT_DIR = path.resolve(import.meta.dirname, '..');

export const PERSONA_CDP_PROFILES = {
  maya: {
    id: 'maya',
    name: 'Maya Lin (Keyboard-Only)',
    testFile: 'tests/maya_keyboard_test.md',
    chromeArgs: ['--window-size=1280,800'],
    cdpCommands: [
      {
        method: 'Emulation.setFocusEmulationEnabled',
        params: { enabled: true },
      },
      {
        method: 'Runtime.evaluate',
        params: {
          expression: `document.documentElement.setAttribute('data-cdp-keyboard-only', 'true');`,
        },
      },
    ],
    objective:
      "Go to http://localhost:4180/?persona=maya, navigate via keyboard focus to select Express Air shipping, activate Complete Order, store the displayed order receipt code as 'order_receipt', and verify the confirmation banner contains 'Order Confirmed'",
  },
  dev: {
    id: 'dev',
    name: 'Dev Patel (200% Browser Zoom)',
    testFile: 'tests/dev_zoom200_test.md',
    chromeArgs: ['--force-device-scale-factor=2', '--window-size=1280,720'],
    cdpCommands: [
      {
        method: 'Emulation.setPageScaleFactor',
        params: { pageScaleFactor: 2.0 },
      },
      {
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 1280, height: 720, deviceScaleFactor: 2, mobile: false },
      },
    ],
    objective:
      "Go to http://localhost:4180/?persona=dev, click Complete Order without any sticky footer intercepting the click, store the displayed order total as 'zoom_order_total', and verify the order confirmation screen is visible",
  },
  ana: {
    id: 'ana',
    name: 'Ana Silva (Slow 3G + Double-Click)',
    testFile: 'tests/ana_slow3g_test.md',
    chromeArgs: ['--window-size=1280,800'],
    cdpCommands: [
      {
        method: 'Network.enable',
        params: {},
      },
      {
        method: 'Network.emulateNetworkConditions',
        params: {
          offline: false,
          latency: 450,
          downloadThroughput: (400 * 1024) / 8,
          uploadThroughput: (150 * 1024) / 8,
          connectionType: 'cellular3g',
        },
      },
    ],
    objective:
      "Go to http://localhost:4180/?persona=ana, click Pay Now twice rapidly, store the number of recorded ledger charges as 'charge_count', store the billed amount as 'billed_amount', and verify billed_amount equals '$148.00' with charge_count equal to '1'",
  },
  sam: {
    id: 'sam',
    name: 'Sam Okafor (375x667 Compact Android)',
    testFile: 'tests/sam_mobile375_test.md',
    chromeArgs: ['--window-size=375,667'],
    cdpCommands: [
      {
        method: 'Emulation.setDeviceMetricsOverride',
        params: { width: 375, height: 667, deviceScaleFactor: 2, mobile: true },
      },
    ],
    objective:
      "Go to http://localhost:4180/?persona=sam, type 'ATELIER20' into the promo code input, click Apply, store the discounted total as 'mobile_final_total', and verify the displayed total is '$128.00'",
  },
  lena: {
    id: 'lena',
    name: 'Lena Weber (German Locale de-DE)',
    testFile: 'tests/lena_german_test.md',
    chromeArgs: ['--lang=de-DE', '--window-size=1280,800'],
    cdpCommands: [
      {
        method: 'Emulation.setLocaleOverride',
        params: { locale: 'de-DE' },
      },
      {
        method: 'Network.setExtraHTTPHeaders',
        params: { headers: { 'Accept-Language': 'de-DE,de;q=0.9' } },
      },
    ],
    objective:
      "Go to http://localhost:4180/?persona=lena, click 'Zahlungspflichtig bestellen', store the formatted Euro order total as 'euro_total', and verify euro_total is '136,16 €' and does not contain 'NaN'",
  },
  joe: {
    id: 'joe',
    name: 'Joe Miller (Subscription Cancel Parity)',
    testFile: 'tests/joe_cancel_test.md',
    chromeArgs: ['--window-size=1280,800'],
    cdpCommands: [
      {
        method: 'Network.enable',
        params: {},
      },
    ],
    objective:
      "Go to http://localhost:4180/?persona=joe, click 'Cancel Membership', click 'Confirm Immediate Cancellation', store the membership status badge as 'cancellation_status', and verify cancellation_status is 'Canceled'",
  },
};

export function buildKaneCommand(personaId, options = {}) {
  const profile = PERSONA_CDP_PROFILES[personaId];
  if (!profile) {
    throw new Error(`Unknown persona ID: ${personaId}`);
  }
  const args = [
    'testmd',
    'run',
    path.join(ROOT_DIR, profile.testFile),
    '--no-adaptive-heal',
    '--policy',
    path.join(ROOT_DIR, 'policies', 'persona-gauntlet-policy.yaml'),
    '--agent',
  ];
  if (options.headless !== false) {
    args.push('--headless');
  }
  if (options.cdpEndpoint) {
    args.push('--cdp-endpoint', options.cdpEndpoint);
  }
  return {
    binary: 'kane-cli',
    args,
    env: {
      ...process.env,
      HOME: path.join(ROOT_DIR, '.kane-home'),
      KANE_CLI_USER_AGENT: process.env.KANE_CLI_USER_AGENT || 'claude-code',
      KANE_CLI_DISABLE_UPDATE_CHECK: '1',
    },
    cdpCommands: profile.cdpCommands,
  };
}

export function findChromeBinary() {
  const candidates = [
    process.env.KANE_CLI_CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function openPersistentCdpSession(pageWsUrl, cdpCommands) {
  if (typeof WebSocket === 'undefined') return null;
  const ws = new WebSocket(pageWsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let msgId = 1;
  for (const cmd of cdpCommands) {
    const id = msgId++;
    await new Promise((resolve) => {
      const onMessage = (ev) => {
        try {
          const parsed = JSON.parse(String(ev.data));
          if (parsed.id === id) {
            ws.removeEventListener('message', onMessage);
            resolve();
          }
        } catch (_) {}
      };
      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id, method: cmd.method, params: cmd.params || {} }));
      setTimeout(() => {
        ws.removeEventListener('message', onMessage);
        resolve();
      }, 500);
    });
  }
  // Keep ws open so session-scoped CDP overrides remain active while kane-cli runs
  return ws;
}

export async function runLivePersonaWithCdp(personaId, port = 9229) {
  const profile = PERSONA_CDP_PROFILES[personaId];
  if (!profile) throw new Error(`Unknown persona ID: ${personaId}`);

  const chromeBin = findChromeBinary();
  if (!chromeBin) {
    throw new Error(
      'Google Chrome binary not found. Install Google Chrome or set KANE_CLI_CHROME_PATH to run --live.'
    );
  }

  const userDataDir = path.join(ROOT_DIR, '.kane-home', `chrome-cdp-${personaId}`);
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProc = spawn(
    chromeBin,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      ...(profile.chromeArgs || []),
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let persistentWs = null;
  try {
    let versionInfo = null;
    for (let attempt = 0; attempt < 25; attempt++) {
      try {
        versionInfo = await fetchJson(`http://127.0.0.1:${port}/json/version`);
        if (versionInfo?.webSocketDebuggerUrl) break;
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 150));
    }

    if (!versionInfo?.webSocketDebuggerUrl) {
      throw new Error(`Could not connect to Chrome CDP on port ${port}`);
    }

    const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    const pageTarget = Array.isArray(targets) && targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (pageTarget) {
      persistentWs = await openPersistentCdpSession(pageTarget.webSocketDebuggerUrl, profile.cdpCommands);
    }

    const cmd = buildKaneCommand(personaId, { cdpEndpoint: versionInfo.webSocketDebuggerUrl, headless: true });
    const exitCode = await new Promise((resolve) => {
      const kaneProc = spawn(cmd.binary, cmd.args, {
        cwd: ROOT_DIR,
        env: cmd.env,
        stdio: 'inherit',
      });
      kaneProc.on('close', (code) => resolve(code ?? 1));
      kaneProc.on('error', () => resolve(2));
    });

    return exitCode;
  } finally {
    try {
      if (persistentWs) persistentWs.close();
    } catch (_) {}
    chromeProc.kill('SIGTERM');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node ./scripts/cdp-persona-launcher.mjs [all|maya|dev|ana|sam|lena|joe] [--live]`);
    process.exit(0);
  }
  const unknownFlags = args.filter((a) => a.startsWith('-') && a !== '--live');
  if (unknownFlags.length > 0) {
    console.error(`Error: Unknown flag "${unknownFlags[0]}". Run with --help for usage.`);
    process.exit(2);
  }

  const isLive = args.includes('--live');
  const positionals = args.filter((a) => !a.startsWith('-'));
  if (positionals.length > 1) {
    console.error(`Error: Too many positional arguments: ${positionals.join(' ')}`);
    process.exit(2);
  }
  const personaArg = positionals[0] || 'all';
  const ids = personaArg === 'all' ? Object.keys(PERSONA_CDP_PROFILES) : [personaArg];

  for (const id of ids) {
    if (!PERSONA_CDP_PROFILES[id]) {
      console.error(`Error: Unknown persona "${id}". Valid personas: ${Object.keys(PERSONA_CDP_PROFILES).join(', ')}`);
      process.exit(2);
    }
  }

  const isolatedHome = path.join(ROOT_DIR, '.kane-home');
  fs.mkdirSync(isolatedHome, { recursive: true });

  if (isLive) {
    try {
      let overallExit = 0;
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        console.log(`\n[CDP Live Runner] Launching Chrome + CDP constraints for ${PERSONA_CDP_PROFILES[id].name}...`);
        const code = await runLivePersonaWithCdp(id, 9231 + i);
        if (code !== 0) overallExit = code;
      }
      process.exit(overallExit);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(2);
    }
  } else {
    console.log(`[Persona Gauntlet] Workspace HOME: ${isolatedHome}`);
    for (const id of ids) {
      const cmd = buildKaneCommand(id);
      console.log(`\n--- Persona: ${PERSONA_CDP_PROFILES[id].name} ---`);
      console.log(`Chrome Flags: ${(PERSONA_CDP_PROFILES[id].chromeArgs || []).join(' ')}`);
      console.log(`CDP Constraints: ${JSON.stringify(cmd.cdpCommands.map((c) => c.method))}`);
      console.log(`Kane CLI Command: ${cmd.binary} ${cmd.args.join(' ')}`);
    }
  }
}
