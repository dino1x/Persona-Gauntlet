import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PERSONAS, PersonaSpec } from './data/personas';
import { StorefrontStage } from './components/StorefrontStage';
import { gauntletAudio } from './lib/audio';
import { copyToClipboard } from './lib/clipboard';
import {
  Sparkles,
  RotateCcw,
  Terminal,
  FileCode2,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';

type HealMap = Record<PersonaSpec['id'], boolean>;

const PERSONA_COLORS: Record<PersonaSpec['id'], string> = {
  maya: '#9553F9',
  dev: '#0A84FF',
  ana: '#F97316',
  sam: '#30C25A',
  lena: '#F966AC',
  joe: '#F5A524',
};

const BASELINE_HEAL_MAP: HealMap = {
  maya: false,
  dev: false,
  ana: false,
  sam: true,
  lena: false,
  joe: true,
};

const FULL_HEALED_MAP: HealMap = {
  maya: true,
  dev: true,
  ana: true,
  sam: true,
  lena: true,
  joe: true,
};

function renderPersonaVignette(persona: PersonaSpec, isPassed: boolean) {
  switch (persona.id) {
    case 'maya':
      return (
        <div className="p-3 rounded-[16px] bg-[#1C1C1E] text-[#F4F8FF] font-mono-code text-[11px] space-y-2">
          <div className="flex items-center justify-between text-[10px] text-[#8E8E93]">
            <span>TAB SEQUENCE TRACE</span>
            <span className={isPassed ? 'text-[#30C25A]' : 'text-[#EF4444]'}>
              {isPassed ? 'tabIndex=0 · <button>' : 'tabIndex=-1 · <div>'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="px-2.5 py-1.5 rounded bg-[#2C2C2E] border border-[#3A3A3C] text-[10px]">
              1. Standard ($10)
            </div>
            <div
              className={`px-2.5 py-1.5 rounded text-[10px] border ${
                isPassed
                  ? 'bg-[#30C25A]/20 border-[#30C25A] text-[#30C25A] ring-2 ring-[#30C25A]/30'
                  : 'bg-[#EF4444]/15 border-dashed border-[#EF4444] text-[#EF4444]'
              }`}
            >
              {isPassed ? '2. Express ($18) [TAB OK]' : '2. Express ($18) [SKIPPED]'}
            </div>
          </div>
        </div>
      );
    case 'dev':
      return (
        <div className="p-3 rounded-[16px] bg-[#F4F8FF] border border-[#CCE4FF] font-mono-code text-[11px] relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] text-[#0062CC] mb-1.5">
            <span>VIEWPORT REFLOW · 200% SCALE</span>
            <span className={isPassed ? 'text-[#15803D] font-semibold' : 'text-[#EF4444] font-semibold'}>
              {isPassed ? '0px Occluded' : '152px Occluded'}
            </span>
          </div>
          <div className="py-1.5 px-3 rounded bg-[#1F1E1D] text-[#FFFFFF] text-[10px] text-center">
            Complete Order ($148.00)
          </div>
          {!isPassed && (
            <div className="absolute inset-x-2 bottom-1.5 py-1.5 px-2.5 rounded bg-[#EF4444] text-[#FFFFFF] text-[10px] font-semibold flex items-center justify-between shadow-sm">
              <span>.fixed-concierge-bar (z-50)</span>
              <span>BLOCKS CLICK</span>
            </div>
          )}
        </div>
      );
    case 'ana':
      return (
        <div className="p-3 rounded-[16px] bg-[#1C1C1E] text-[#F4F8FF] font-mono-code text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8E8E93]">
            <span>3G RTT WINDOW (450ms)</span>
            <span className={isPassed ? 'text-[#30C25A]' : 'text-[#EF4444]'}>
              {isPassed ? '1x Billed ($148.00)' : '2x Billed ($296.00)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-1 rounded bg-[#30C25A]/20 text-[#30C25A] border border-[#30C25A]/30">
              Click #1 (0ms)
            </span>
            <ArrowRight className="w-3 h-3 text-[#8E8E93]" />
            <span
              className={`px-2 py-1 rounded border ${
                isPassed
                  ? 'bg-[#2C2C2E] text-[#8E8E93] border-[#3A3A3C] line-through'
                  : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]'
              }`}
            >
              {isPassed ? 'Click #2 Locked' : 'Click #2 Charges!'}
            </span>
          </div>
        </div>
      );
    case 'sam':
      return (
        <div className="p-3 rounded-[16px] bg-[#F4F8FF] border border-[#CCE4FF] font-mono-code text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#0062CC]">
            <span>375×667 MOBILE FRAME</span>
            <span className="text-[#15803D] font-semibold">ATELIER20 (-$20)</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#FFFFFF] border border-[#EFEDEA] text-[10px] text-[#1F1E1D]">
            <span>Promo: ATELIER20</span>
            <span className="font-semibold text-[#15803D]">$148 → $128.00</span>
          </div>
        </div>
      );
    case 'lena':
      return (
        <div className="p-3 rounded-[16px] bg-[#1C1C1E] text-[#F4F8FF] font-mono-code text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8E8E93]">
            <span>LOCALE: de-DE (COMMA DECIMAL)</span>
            <span className={isPassed ? 'text-[#30C25A]' : 'text-[#EF4444]'}>
              {isPassed ? 'Integer Cents OK' : 'Number("118,40")'}
            </span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#2C2C2E] border border-[#3A3A3C] text-[10px]">
            <span>118,40 € + 17,76 € =</span>
            <span className={`font-bold ${isPassed ? 'text-[#30C25A]' : 'text-[#EF4444]'}`}>
              {isPassed ? '136,16 €' : 'NaN €'}
            </span>
          </div>
        </div>
      );
    case 'joe':
      return (
        <div className="p-3 rounded-[16px] bg-[#F4F8FF] border border-[#CCE4FF] font-mono-code text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#0062CC]">
            <span>SUBSCRIPTION PARITY</span>
            <span className="text-[#15803D] font-semibold">2 Clicks · HTTP 200</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#FFFFFF] border border-[#EFEDEA] text-[10px] text-[#1F1E1D]">
            <span>Join: 2 Clicks</span>
            <span className="text-[#15803D] font-semibold">Cancel: 2 Clicks ✓</span>
          </div>
        </div>
      );
  }
}

export function App() {
  const initialPersonaFromUrl = (): PersonaSpec['id'] => {
    if (typeof window === 'undefined') return 'maya';
    const params = new URLSearchParams(window.location.search);
    const p = params.get('persona') as PersonaSpec['id'] | null;
    if (p && PERSONAS.some((item) => item.id === p)) {
      return p;
    }
    return 'maya';
  };

  const initialHealMapFromUrl = (): HealMap => {
    if (typeof window === 'undefined') return { ...BASELINE_HEAL_MAP };
    const params = new URLSearchParams(window.location.search);
    if (params.get('healed') === '1' || params.get('healed') === 'true') {
      return { ...FULL_HEALED_MAP };
    }
    return { ...BASELINE_HEAL_MAP };
  };

  const [selectedId, setSelectedId] = useState<PersonaSpec['id']>(initialPersonaFromUrl);
  const [healedMap, setHealedMap] = useState<HealMap>(initialHealMapFromUrl);
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [loopStepLabel, setLoopStepLabel] = useState<string>('Ready — Baseline 2 of 6 personas passing');
  const [muted, setMuted] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [inspectorTab, setInspectorTab] = useState<'ndjson' | 'diff' | 'policy'>('ndjson');

  const loopTimersRef = useRef<number[]>([]);
  const clearAllLoopTimers = useCallback(() => {
    for (const id of loopTimersRef.current) {
      window.clearTimeout(id);
    }
    loopTimersRef.current = [];
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('healed') === '0') return;
    fetch('/heal-state.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.healedMap) {
          setHealedMap((prev) => ({ ...prev, ...data.healedMap }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => clearAllLoopTimers();
  }, [clearAllLoopTimers]);

  const timecodeRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let active = true;
    const tick = (now: number) => {
      if (!active) return;
      if (timecodeRef.current) {
        const elapsed = (now - startTimeRef.current) / 1000;
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(Math.floor(elapsed % 60)).padStart(2, '0');
        const frames = String(Math.floor((elapsed % 1) * 60)).padStart(2, '0');
        timecodeRef.current.textContent = `${mins}:${secs}:${frames}`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const activePersona = PERSONAS.find((p) => p.id === selectedId) || PERSONAS[0];
  const isCurrentHealed = healedMap[activePersona.id];

  const passedCount = PERSONAS.filter((p) => healedMap[p.id] || p.baselineStatus === 'passed').length;

  const handleSelectPersona = useCallback((id: PersonaSpec['id']) => {
    gauntletAudio.tap(350);
    setSelectedId(id);
  }, []);

  const handleHealSingle = useCallback((id: PersonaSpec['id']) => {
    gauntletAudio.statusChime(true);
    setHealedMap((prev) => ({ ...prev, [id]: true }));
    const target = PERSONAS.find((p) => p.id === id);
    if (target) {
      setLoopStepLabel(
        `Closed-Loop Repaired: ${target.name} (${target.fileTarget}) -> Re-verified via kane-cli testmd run (EXIT 0)`
      );
    }
  }, []);

  const handleTriggerSingleVerify = useCallback(
    (id: PersonaSpec['id']) => {
      const target = PERSONAS.find((p) => p.id === id);
      if (!target) return;
      const isOk = healedMap[id] || target.baselineStatus === 'passed';
      gauntletAudio.statusChime(isOk);
      setLoopStepLabel(
        `kane-cli testmd run ${target.kaneTestFile} --no-adaptive-heal --agent -> ${
          isOk ? 'PASSED (EXIT 0)' : 'FAILED (EXIT 1)'
        }`
      );
    },
    [healedMap]
  );

  const handleRunFullClosedLoop = () => {
    if (isLoopRunning) return;
    clearAllLoopTimers();
    gauntletAudio.tap(440);
    setIsLoopRunning(true);
    startTimeRef.current = performance.now();

    const failingQueue: PersonaSpec['id'][] =
      passedCount === 6
        ? ['maya', 'dev', 'ana', 'sam', 'lena', 'joe']
        : ['maya', 'dev', 'ana', 'lena'];
    let idx = 0;

    setLoopStepLabel('Running 6-Persona Gauntlet via kane-cli + CDP Constraint Proxy...');

    const advance = () => {
      if (idx >= failingQueue.length) {
        setIsLoopRunning(false);
        gauntletAudio.statusChime(true);
        setLoopStepLabel(
          'Closed-Loop Complete: 6 of 6 personas passed · Policy persona-gauntlet-gate VERDICT: PASS (0 replay credits)'
        );
        return;
      }
      const currentId = failingQueue[idx];
      const spec = PERSONAS.find((p) => p.id === currentId)!;
      setSelectedId(currentId);
      setLoopStepLabel(
        `[Step ${idx + 1}/${failingQueue.length}] Verifying ${spec.fileTarget} for ${spec.name} with kane-cli...`
      );
      const t1 = window.setTimeout(() => {
        setHealedMap((prev) => ({ ...prev, [currentId]: true }));
        gauntletAudio.statusChime(true);
        idx += 1;
        const t2 = window.setTimeout(advance, 380);
        loopTimersRef.current.push(t2);
      }, 380);
      loopTimersRef.current.push(t1);
    };

    const t0 = window.setTimeout(advance, 400);
    loopTimersRef.current.push(t0);
  };

  const handleResetBaseline = () => {
    clearAllLoopTimers();
    gauntletAudio.tap(260);
    setIsLoopRunning(false);
    setHealedMap({ ...BASELINE_HEAL_MAP });
    setSelectedId('maya');
    setLoopStepLabel('Reset to Baseline — 2 of 6 personas passing (4 blocked by happy-path defects)');
  };

  const toggleMute = () => {
    gauntletAudio.muted = !muted;
    setMuted(!muted);
  };

  const kaneCliCommand = `HOME="$PWD/.kane-home" KANE_CLI_USER_AGENT=claude-code kane-cli testmd run ${activePersona.kaneTestFile} --no-adaptive-heal --policy ./policies/persona-gauntlet-policy.yaml --agent`;

  const copyCommand = () => {
    void copyToClipboard(kaneCliCommand).then((ok) => {
      setCopiedCmd(ok ? 'copied' : 'failed');
      if (ok) gauntletAudio.tap(500);
      const tid = window.setTimeout(() => setCopiedCmd('idle'), 1800);
      loopTimersRef.current.push(tid);
    });
  };

  const activeNdjson = isCurrentHealed ? activePersona.healedNdjson : activePersona.baselineNdjson;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F1E1D] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/85 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[9px] bg-[#1F1E1D] grid grid-cols-2 gap-[3px] p-[6px]">
              {['#9553F9', '#0A84FF', '#F97316', '#30C25A'].map((c) => (
                <span key={c} className="rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="font-architectural font-semibold text-[16px] text-[#1F1E1D]">Persona Gauntlet</span>
            <span className="hidden sm:inline-block text-[12px] font-mono-code text-[#84827F] ml-1">kane-cli v0.10.4</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex h-9 px-3.5 rounded-full bg-[#F4F2EF] text-[13px] items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30C25A]" />
              <span ref={timecodeRef} className="font-mono-code text-[#1F1E1D] tabular-nums">
                00:00:00
              </span>
            </div>

            <div
              className={`h-9 px-3.5 rounded-full text-[13px] font-medium inline-flex items-center ${
                passedCount === 6 ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#FEF2F2] text-[#DC2626]'
              }`}
            >
              {passedCount}/6 passing
            </div>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute audio feedback' : 'Mute audio feedback'}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-[#F4F2EF] text-[#84827F] hover:text-[#1F1E1D] cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col">
        {/* Hero */}
        <section className="max-w-[1180px] mx-auto w-full px-6 pt-16 sm:pt-24 pb-10 text-center">
          <div className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-[#F4F8FF] text-[13px] font-medium text-[#0062CC]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chrome CDP constraint harness</span>
          </div>

          <h1 className="font-architectural mt-6 text-[44px] sm:text-[68px] font-semibold text-[#343433] leading-[1.06]">
            Your app works on a 1440p monitor.
            <br className="hidden sm:block" />{' '}
            <span className="text-[#B5B2AE]">Does it work for Maya?</span>
          </h1>

          <p className="mt-6 text-[16px] sm:text-[18px] leading-[1.6] max-w-[680px] mx-auto text-[#84827F]">
            <span className="text-[#474645] font-medium">
              AI coding agents declare &ldquo;done&rdquo; the moment the happy path renders.
            </span>{' '}
            Persona Gauntlet attaches{' '}
            <code className="font-mono-code text-[14px] text-[#1F1E1D] bg-[#F4F2EF] px-1.5 py-0.5 rounded-md">kane-cli</code> to a
            Chrome DevTools Protocol launcher that enforces real keyboard-only focus, 200% zoom, 450ms 3G latency, 375px
            viewports, and German comma-decimals.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRunFullClosedLoop}
              disabled={isLoopRunning}
              className="h-12 px-6 rounded-full bg-[#1F1E1D] hover:bg-[#3A3836] disabled:opacity-45 text-[#FFFFFF] font-medium text-[15px] inline-flex items-center gap-2.5 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isLoopRunning
                ? 'Running Verification Sweep...'
                : passedCount === 6
                ? 'Re-Run All 6 Personas (6/6 Verified)'
                : 'Heal All Failing Personas (2/6 → 6/6)'}
            </button>

            <button
              type="button"
              onClick={handleResetBaseline}
              className="h-12 px-5 rounded-full bg-[#F4F2EF] hover:bg-[#EFEDEA] text-[15px] font-medium text-[#1F1E1D] inline-flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Baseline (2/6)
            </button>
          </div>
        </section>

        {/* Survival scorecard: one bubble per persona */}
        <section aria-label="Survival scorecard" className="max-w-[1180px] mx-auto w-full px-6 pb-12">
          <div className="soft-card !rounded-[28px] px-6 sm:px-10 py-8 flex flex-col lg:flex-row lg:items-center gap-8 hover:!transform-none hover:!shadow-none">
            <div className="lg:w-[260px] shrink-0 text-left space-y-2">
              <div className="text-[13px] font-medium text-[#84827F]">Survival scorecard</div>
              <div className="font-architectural text-[48px] font-semibold leading-none text-[#1F1E1D]">
                {passedCount}
                <span className="text-[24px] text-[#B5B2AE] font-medium"> / 6</span>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-[12px] font-medium ${
                  passedCount === 6 ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#FEF2F2] text-[#DC2626]'
                }`}
              >
                {passedCount === 6 ? 'Verdict: pass (exit 0)' : `${6 - passedCount} blocked`}
              </span>
            </div>

            <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-4">
              {PERSONAS.map((p) => {
                const ok = healedMap[p.id] || p.baselineStatus === 'passed';
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p.id)}
                    className="flex flex-col items-center gap-2.5 cursor-pointer group"
                  >
                    <span className="relative">
                      <span
                        key={active ? `${p.id}-on` : p.id}
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-architectural font-semibold text-[18px] text-[#FFFFFF] transition ${
                          active ? 'bubble-pop ring-4 ring-offset-2 ring-[#1F1E1D]/10' : 'group-hover:scale-105'
                        }`}
                        style={{ background: PERSONA_COLORS[p.id] }}
                      >
                        {p.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')}
                      </span>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-[3px] border-[#FBFAF9] flex items-center justify-center ${
                          ok ? 'bg-[#30C25A]' : 'bg-[#EF4444]'
                        }`}
                      />
                    </span>
                    <span className="text-[13px] font-medium text-[#1F1E1D] leading-tight">{p.name.split(' ')[0]}</span>
                    <span className={`text-[11px] font-mono-code ${ok ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                      {ok ? 'PASS' : 'FAIL'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-2 text-[13px]">
            <div className="flex items-center gap-2 text-[#474645]">
              <Terminal className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
              <span className="font-mono-code text-[12px]">{loopStepLabel}</span>
            </div>
            <span className="text-[#84827F]">
              Gate: persona-gauntlet-gate
            </span>
          </div>
        </section>

        {/* Persona cards */}
        <section aria-label="Six Human Personas" className="max-w-[1180px] mx-auto w-full px-6 pb-16">
          <h2 className="font-architectural text-[32px] sm:text-[40px] font-semibold text-[#343433] leading-[1.1] mb-8">
            Six real people.
            <br />
            <span className="text-[#B5B2AE]">One checkout.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERSONAS.map((persona) => {
              const isSelected = persona.id === selectedId;
              const isPassed = healedMap[persona.id] || persona.baselineStatus === 'passed';
              return (
                <div
                  key={persona.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectPersona(persona.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectPersona(persona.id);
                    }
                  }}
                  className={`gpu-card soft-card text-left p-5 cursor-pointer flex flex-col gap-5 ${
                    isSelected ? 'ring-2 ring-[#1F1E1D]' : ''
                  }`}
                >
                  {/* Visual vignette */}
                  <div className="rounded-[16px] bg-[#FFFFFF] p-3 shadow-[0_1px_2px_rgba(31,30,29,0.04)]">
                    {renderPersonaVignette(persona, isPassed)}
                  </div>

                  <div className="space-y-1.5 px-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold text-[#FFFFFF]"
                          style={{ background: PERSONA_COLORS[persona.id] }}
                        >
                          {persona.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')}
                        </span>
                        <span className="font-semibold text-[15px] text-[#1F1E1D] truncate">{persona.name}</span>
                        <span className="text-[12px] text-[#84827F] truncate">
                          {persona.age}, {persona.city}
                        </span>
                      </div>
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </span>
                      )}
                    </div>

                    <div className="text-[14px] font-medium text-[#474645]">{persona.role}</div>
                    <p className="text-[14px] text-[#84827F] leading-relaxed line-clamp-2">&ldquo;{persona.quote}&rdquo;</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 px-1 mt-auto">
                    <span className="text-[11px] font-mono-code text-[#84827F] truncate">{persona.cdpConstraintBadge}</span>
                    <span className="text-[13px] font-medium text-[#1F1E1D] flex items-center gap-1 shrink-0">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workspace: live storefront stage beside the Kane CLI inspector */}
        <section className="max-w-[1180px] mx-auto w-full px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-[28px] bg-[#FBFAF9]">
            <StorefrontStage
              activePersona={activePersona}
              isHealed={isCurrentHealed}
              onTriggerSingleVerify={handleTriggerSingleVerify}
              onHealPersona={handleHealSingle}
            />
          </div>

          {/* Inspector */}
          <div className="lg:col-span-5 bg-[#FFFFFF] rounded-[28px] border border-[#EFEDEA] overflow-hidden flex flex-col">
            <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInspectorTab('ndjson')}
                  className={`h-8 px-3 rounded-full text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    inspectorTab === 'ndjson'
                      ? 'bg-[#1F1E1D] text-[#FFFFFF]'
                      : 'bg-[#F4F2EF] text-[#84827F] hover:text-[#1F1E1D]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Kane NDJSON
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('diff')}
                  className={`h-8 px-3 rounded-full text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    inspectorTab === 'diff'
                      ? 'bg-[#1F1E1D] text-[#FFFFFF]'
                      : 'bg-[#F4F2EF] text-[#84827F] hover:text-[#1F1E1D]'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  Closed-Loop Diff
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('policy')}
                  className={`h-8 px-3 rounded-full text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    inspectorTab === 'policy'
                      ? 'bg-[#1F1E1D] text-[#FFFFFF]'
                      : 'bg-[#F4F2EF] text-[#84827F] hover:text-[#1F1E1D]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  CDP &amp; Policy
                </button>
              </div>
              <span className="text-[11px] font-mono-code text-[#84827F]">{activePersona.kaneTestFile}</span>
            </div>

            {/* Command Copy Box */}
            <div className="mx-5 px-3.5 py-2.5 rounded-[14px] bg-[#1C1C1E] flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono-code text-[#F4F8FF] truncate">{kaneCliCommand}</code>
              <button
                type="button"
                onClick={copyCommand}
                className="px-3 py-1 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-mono-code text-[#FFFFFF] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedCmd === 'copied' ? <Check className="w-3.5 h-3.5 text-[#30C25A]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCmd === 'copied' ? 'Copied' : copiedCmd === 'failed' ? 'Copy failed' : 'Copy'}
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-4 max-h-[540px] overflow-y-auto group">
              {inspectorTab === 'ndjson' && (
                <div className="space-y-3 group-hover:[animation-play-state:paused]">
                  <div className="p-4 rounded-[16px] bg-[#F4F8FF] border border-[#CCE4FF]">
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-[#0062CC] mb-1">
                      Objective
                    </div>
                    <div className="text-xs font-mono-code text-[#1F1E1D] leading-relaxed">
                      &ldquo;{activePersona.kaneObjective}&rdquo;
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-[#84827F]">
                      NDJSON events
                    </div>
                    {activeNdjson.map((ev, index) => (
                      <pre
                        key={index}
                        className={`p-3 rounded-[16px] border text-[11px] font-mono-code overflow-x-auto whitespace-pre-wrap ${
                          ev.status === 'failed'
                            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]'
                            : ev.type === 'run_end' && ev.status === 'passed'
                            ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                            : 'bg-[#1C1C1E] border-[#2C2C2E] text-[#E5E5EA]'
                        }`}
                      >
                        {JSON.stringify(ev)}
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {inspectorTab === 'diff' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-[16px] bg-[#FBFAF9] border border-[#EFEDEA] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1F1E1D]">{activePersona.defectCategory}</span>
                      <span className="font-mono-code text-[#0062CC] font-medium">{activePersona.fileTarget}</span>
                    </div>
                    <p className="text-xs text-[#84827F]">{activePersona.defectRootCause}</p>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono-code uppercase text-[#EF4444] font-semibold mb-1">
                      - Before (Unhealed Happy-Path Code)
                    </div>
                    <pre className="p-3.5 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-mono-code text-[#1F1E1D] overflow-x-auto">
                      {activePersona.codeBefore}
                    </pre>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono-code uppercase text-[#15803D] font-semibold mb-1">
                      + After (Closed-Loop Patch Verified by Kane CLI)
                    </div>
                    <pre className="p-3.5 rounded-[16px] bg-[#F0FDF4] border border-[#BBF7D0] text-[11px] font-mono-code text-[#1F1E1D] overflow-x-auto">
                      {activePersona.codeAfter}
                    </pre>
                  </div>
                </div>
              )}

              {inspectorTab === 'policy' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-[16px] bg-[#FBFAF9] border border-[#EFEDEA] space-y-2">
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-[#1F1E1D] font-semibold">
                      Enforced Chrome DevTools Protocol (CDP) Calls
                    </div>
                    {activePersona.cdpProtocolCalls.map((call, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-[#1C1C1E] font-mono-code text-xs text-[#F4F8FF]"
                      >
                        {call}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-[16px] bg-[#FBFAF9] border border-[#EFEDEA] space-y-2">
                    <div className="text-[11px] font-mono-code uppercase tracking-wider text-[#15803D] font-semibold">
                      Evidence Policy Gate (policies/persona-gauntlet-policy.yaml)
                    </div>
                    <pre className="text-[11px] font-mono-code text-[#1F1E1D] bg-[#FFFFFF] p-3 rounded-lg border border-[#EFEDEA] overflow-x-auto">
{`policy: persona-gauntlet-gate
gates:
  - id: zero-failed-personas (totals.failed == 0)
  - id: every-persona-asserts-outcome (metrics.tests_without_checks == 0)
  - id: zero-silent-heals (metrics.heal.healed_tests <= 0)`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
