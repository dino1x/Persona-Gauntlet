export interface NdjsonStepEvent {
  step?: number;
  status?: 'running' | 'done' | 'failed' | 'passed';
  remark?: string;
  type?: 'stream_start' | 'run_end';
  summary?: string;
  duration?: number;
  credits?: number;
  final_state?: Record<string, string>;
  test_url?: string;
}

export interface PersonaSpec {
  id: 'maya' | 'dev' | 'ana' | 'sam' | 'lena' | 'joe';
  name: string;
  role: string;
  age: number;
  city: string;
  quote: string;
  humanContext: string;
  cdpConstraintBadge: string;
  cdpProtocolCalls: string[];
  kaneTestFile: string;
  kaneObjective: string;
  baselineStatus: 'passed' | 'failed';
  healedStatus: 'passed';
  defectCategory: string;
  defectTitle: string;
  defectRootCause: string;
  fileTarget: string;
  codeBefore: string;
  codeAfter: string;
  baselineNdjson: NdjsonStepEvent[];
  healedNdjson: NdjsonStepEvent[];
  extractedProof: Record<string, string>;
}

export const PERSONAS: PersonaSpec[] = [
  {
    id: 'maya',
    name: 'Maya Lin',
    role: 'Keyboard-Only Navigator (RSI)',
    age: 34,
    city: 'Seattle, WA',
    quote: 'If I cannot reach your shipping options with the Tab key, I cannot buy from your store.',
    humanContext:
      'Navigates strictly with Tab, Shift+Tab, Space, and Enter. Never touches a mouse or trackpad due to severe repetitive strain injury.',
    cdpConstraintBadge: 'CDP FocusEmulation + Pointer Shield',
    cdpProtocolCalls: [
      'Emulation.setFocusEmulationEnabled({ enabled: true })',
      'Runtime.evaluate({ expression: "document.documentElement.setAttribute(\'data-cdp-keyboard-only\', \'true\')" })',
    ],
    kaneTestFile: 'tests/maya_keyboard_test.md',
    kaneObjective:
      "Go to http://localhost:4180/?persona=maya, navigate via keyboard focus to select Express Air shipping, activate Complete Order, store the displayed order receipt code as 'order_receipt', and verify the confirmation banner contains 'Order Confirmed'",
    baselineStatus: 'failed',
    healedStatus: 'passed',
    defectCategory: 'WCAG 2.1.1 Non-Focusable Control',
    defectTitle: 'Express Air shipping card coded as <div onClick> without tabIndex or keyboard handler',
    defectRootCause:
      'The developer built the Express Air ($18.00) shipping selector as a styled <div> with only an onClick handler, so sequential Tab navigation skips it and leaves Standard Ground ($10.00) selected.',
    fileTarget: 'src/components/StorefrontStage.tsx:118',
    codeBefore: `<div
  className="shipping-option cursor-pointer outline-none"
  onClick={() => setShipping('express')}
>
  <span>Express Air ($18.00)</span>
</div>`,
    codeAfter: `<button
  type="button"
  aria-pressed={shipping === 'express'}
  onClick={() => setShipping('express')}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShipping('express')}
  className="shipping-option focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
>
  <span>Express Air ($18.00)</span>
</button>`,
    baselineNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=maya with CDP FocusEmulation active' },
      {
        step: 2,
        status: 'failed',
        remark:
          'Step 2 failed: Shipping selector <div class="shipping-option"> is not keyboard focusable (tabIndex=-1, missing button role); Tab navigation skipped Express Air ($18.00) and left Standard ($10.00) selected.',
      },
      {
        type: 'run_end',
        status: 'failed',
        summary: 'Failed at step 2: Express Air shipping option is unreachable by keyboard Tab navigation.',
        duration: 6.8,
        credits: 4,
        final_state: { shipping_tier: 'Standard Ground ($10.00)' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-maya-01',
      },
    ],
    healedNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=maya with CDP FocusEmulation active' },
      { step: 2, status: 'done', remark: 'Focused <button> Express Air ($18.00) via Tab and activated with Enter key' },
      { step: 3, status: 'done', remark: 'Activated Complete Order via Enter and stored order_receipt = "ORD-MAYA-8841"' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Completed full keyboard-only checkout and verified receipt ORD-MAYA-8841.',
        duration: 5.1,
        credits: 0,
        final_state: { order_receipt: 'ORD-MAYA-8841', shipping_tier: 'Express Air ($18.00)' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-maya-01',
      },
    ],
    extractedProof: { order_receipt: 'ORD-MAYA-8841', shipping_tier: 'Express Air ($18.00)' },
  },
  {
    id: 'dev',
    name: 'Dev Patel',
    role: '200% Browser Zoom (Low Vision)',
    age: 49,
    city: 'Austin, TX',
    quote: 'At 200% zoom, your sticky concierge banner sits directly on top of the Complete Order button.',
    humanContext:
      'Uses Chrome with a permanent 200% page zoom factor due to macular degeneration. Fixed-position bars frequently collide and block primary form actions.',
    cdpConstraintBadge: 'CDP Emulation.setPageScaleFactor(2.0)',
    cdpProtocolCalls: [
      'Emulation.setPageScaleFactor({ pageScaleFactor: 2.0 })',
      'Emulation.setDeviceMetricsOverride({ width: 1280, height: 720, deviceScaleFactor: 2, mobile: false })',
    ],
    kaneTestFile: 'tests/dev_zoom200_test.md',
    kaneObjective:
      "Go to http://localhost:4180/?persona=dev, click Complete Order without any sticky footer intercepting the click, store the displayed order total as 'zoom_order_total', and verify the order confirmation screen is visible",
    baselineStatus: 'failed',
    healedStatus: 'passed',
    defectCategory: 'WCAG 1.4.4 Reflow & Fixed Viewport Collision',
    defectTitle: 'Fixed concierge bar (z-index: 50) occludes "Complete Order" CTA at 200% page scale',
    defectRootCause:
      'A fixed bottom bar (height: 80px, z-index: 50) has only 8px bottom clearance on the checkout container, occluding 152px of the primary submit button area when scaled to 200%.',
    fileTarget: 'src/components/StorefrontStage.tsx:194',
    codeBefore: `<div className="checkout-footer relative pb-2">
  <button className="w-full py-3 bg-amber-500">Complete Order ($148.00)</button>
</div>
<aside className="fixed-concierge-bar fixed bottom-0 inset-x-0 h-20 z-50 bg-zinc-900">
  Live Concierge & Cookie Notice
</aside>`,
    codeAfter: `<div className="checkout-footer relative pb-24">
  <button className="w-full py-3 bg-amber-500 relative z-20">Complete Order ($148.00)</button>
</div>
<aside className="sticky bottom-2 z-10 max-h-12 px-3 py-1.5 text-xs">
  Compact Concierge Notice (Auto-collapses at >=150% zoom)
</aside>`,
    baselineNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=dev at 200% CDP page scale factor' },
      {
        step: 2,
        status: 'failed',
        remark:
          'Step 2 failed: ElementClickIntercepted — Sticky concierge bar (.fixed-concierge-bar, z-index: 50) occludes 152px of Complete Order CTA at 200% zoom.',
      },
      {
        type: 'run_end',
        status: 'failed',
        summary: 'Failed at step 2: Fixed concierge banner (z-index: 50) intercepted click on Complete Order at 200% zoom.',
        duration: 5.4,
        credits: 4,
        final_state: { occluded_px: '152' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-dev-02',
      },
    ],
    healedNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=dev at 200% CDP page scale factor' },
      { step: 2, status: 'done', remark: 'Verified Complete Order hit-box is 100% unobstructed and clicked submit' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Order completed cleanly at 200% page zoom with zero viewport occlusion.',
        duration: 4.3,
        credits: 0,
        final_state: { zoom_order_total: '$148.00', occluded_px: '0' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-dev-02',
      },
    ],
    extractedProof: { zoom_order_total: '$148.00', occluded_px: '0' },
  },
  {
    id: 'ana',
    name: 'Ana Silva',
    role: 'Slow 3G + Impatient Double-Click',
    age: 28,
    city: 'São Paulo, BR',
    quote: 'Nothing happened for half a second on the train, so I tapped Pay again—and you charged me twice.',
    humanContext:
      'Commutes on a high-latency 3G cellular connection (450ms RTT). When a button shows no immediate loading lock, she taps twice within the 450ms window.',
    cdpConstraintBadge: 'CDP Network.emulateNetworkConditions(3G)',
    cdpProtocolCalls: [
      'Network.enable()',
      'Network.emulateNetworkConditions({ offline: false, latency: 450, downloadThroughput: 51200, uploadThroughput: 19200 })',
    ],
    kaneTestFile: 'tests/ana_slow3g_test.md',
    kaneObjective:
      "Go to http://localhost:4180/?persona=ana, click Pay Now twice rapidly, store the number of recorded ledger charges as 'charge_count', store the billed amount as 'billed_amount', and verify billed_amount equals '$148.00' with charge_count equal to '1'",
    baselineStatus: 'failed',
    healedStatus: 'passed',
    defectCategory: 'Network Race Condition & Missing Idempotency Lock',
    defectTitle: 'Double-clicking "Pay Now" within 450ms 3G window dispatches duplicate charges ($296.00)',
    defectRootCause:
      'The submit handler lacks a synchronous in-flight lock during the 450ms 3G request window, allowing a rapid double-click to dispatch two payment charges ($296.00 billed).',
    fileTarget: 'src/components/StorefrontStage.tsx:152',
    codeBefore: `function handleCheckout() {
  setTimeout(() => {
    setChargeCount((prev) => prev + 1);
    setOrderConfirmed(true);
  }, 450);
}`,
    codeAfter: `function handleCheckout() {
  if (inFlightLockRef.current) return;
  inFlightLockRef.current = true;
  setIsSubmitting(true);
  setTimeout(() => {
    setChargeCount(1);
    setIsSubmitting(false);
    setOrderConfirmed(true);
  }, 450);
}`,
    baselineNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=ana with 450ms RTT Slow 3G throttling' },
      {
        step: 2,
        status: 'failed',
        remark:
          'Step 2 failed: Expected charge_count "1" and billed_amount "$148.00", got charge_count "2" and billed_amount "$296.00" on rapid double-click within 450ms 3G window.',
      },
      {
        type: 'run_end',
        status: 'failed',
        summary: 'Duplicate payment race condition detected: user was charged twice ($296.00) on Slow 3G.',
        duration: 7.9,
        credits: 5,
        final_state: { charge_count: '2', billed_amount: '$296.00' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-ana-03',
      },
    ],
    healedNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=ana with 450ms RTT Slow 3G throttling' },
      { step: 2, status: 'done', remark: 'Triggered rapid double-click on Pay Now; second click blocked by synchronous inFlightLockRef' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Idempotency verified under 450ms 3G latency: exactly 1 charge of $148.00 recorded.',
        duration: 5.8,
        credits: 0,
        final_state: { charge_count: '1', billed_amount: '$148.00' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-ana-03',
      },
    ],
    extractedProof: { charge_count: '1', billed_amount: '$148.00' },
  },
  {
    id: 'sam',
    name: 'Sam Okafor',
    role: '375×667 Compact Android Phone',
    age: 25,
    city: 'Lagos, NG',
    quote: 'I typed ATELIER20 on my 375px screen and verified the $20 discount applied cleanly.',
    humanContext:
      'Shops on a compact Android viewport (375×667). Verifies that typing ATELIER20 and clicking Apply reduces the $148.00 total to $128.00 without horizontal overflow.',
    cdpConstraintBadge: 'kane-cli config set-window 375x667',
    cdpProtocolCalls: [
      'Emulation.setDeviceMetricsOverride({ width: 375, height: 667, deviceScaleFactor: 2, mobile: true })',
    ],
    kaneTestFile: 'tests/sam_mobile375_test.md',
    kaneObjective:
      "Go to http://localhost:4180/?persona=sam, type 'ATELIER20' into the promo code input, click Apply, store the discounted total as 'mobile_final_total', and verify the displayed total is '$128.00'",
    baselineStatus: 'passed',
    healedStatus: 'passed',
    defectCategory: 'Mobile Viewport Flex-Wrap & Promo Validation',
    defectTitle: '375px mobile promo application & ATELIER20 code validation',
    defectRootCause: 'Baseline passed — mobile promo input wraps cleanly at 375px and ATELIER20 discounts $20.00.',
    fileTarget: 'src/components/StorefrontStage.tsx:136',
    codeBefore: `<div className="flex flex-wrap gap-2 w-full">
  <input className="flex-1 min-w-0" placeholder="Enter ATELIER20" />
  <button type="button">Apply</button>
</div>`,
    codeAfter: `<div className="flex flex-wrap gap-2 w-full">
  <input className="flex-1 min-w-0" placeholder="Enter ATELIER20" />
  <button type="button">Apply</button>
</div>`,
    baselineNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=sam in 375x667 Android viewport' },
      { step: 2, status: 'done', remark: 'Entered ATELIER20, clicked Apply, stored mobile_final_total = "$128.00"' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Mobile 375x667 promo application and checkout verified.',
        duration: 4.9,
        credits: 3,
        final_state: { mobile_final_total: '$128.00', viewport: '375x667' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-sam-04',
      },
    ],
    healedNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Replayed cached step 1 from output-sam_mobile375 (0 credits)' },
      { step: 2, status: 'done', remark: 'Replayed cached step 2 from output-sam_mobile375: mobile_final_total = "$128.00"' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Deterministic cache replay passed at 375x667 viewport.',
        duration: 1.8,
        credits: 0,
        final_state: { mobile_final_total: '$128.00', viewport: '375x667' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-sam-04',
      },
    ],
    extractedProof: { mobile_final_total: '$128.00', viewport: '375x667' },
  },
  {
    id: 'lena',
    name: 'Lena Weber',
    role: 'German Browser Locale (de-DE)',
    age: 39,
    city: 'Berlin, DE',
    quote: 'Your total says "NaN €" because German uses a comma in 118,40 € instead of a period.',
    humanContext:
      'Runs Chrome in German (de-DE). Compound German words expand button labels by 45%, and localized prices use comma decimal separators (118,40 € + 17,76 € = 136,16 €).',
    cdpConstraintBadge: 'CDP Emulation.setLocaleOverride("de-DE")',
    cdpProtocolCalls: [
      'Emulation.setLocaleOverride({ locale: "de-DE" })',
      'Network.setExtraHTTPHeaders({ headers: { "Accept-Language": "de-DE,de;q=0.9" } })',
    ],
    kaneTestFile: 'tests/lena_german_test.md',
    kaneObjective:
      "Go to http://localhost:4180/?persona=lena, click 'Zahlungspflichtig bestellen', store the formatted Euro order total as 'euro_total', and verify euro_total is '136,16 €' and does not contain 'NaN'",
    baselineStatus: 'failed',
    healedStatus: 'passed',
    defectCategory: 'i18n Comma-Decimal NaN & Compound Word Overflow',
    defectTitle: 'Number("118,40") produces "NaN €" in German locale and clips CTA text',
    defectRootCause:
      'Checkout math parsed de-DE comma-formatted display strings via Number("118,40") + Number("17,76"), which evaluates to NaN in JavaScript ("NaN €").',
    fileTarget: 'src/components/StorefrontStage.tsx:88',
    codeBefore: `const formattedSub = (11840 / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 }); // "118,40"
const formattedShip = (1776 / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 }); // "17,76"
const euroTotal = \`\${(Number(formattedSub) + Number(formattedShip)).toFixed(2)} €\`; // "NaN €"`,
    codeAfter: `const totalCents = subtotalCents + shippingCents; // Integer cents (13616)
const formattedNum = (totalCents / 100).toLocaleString('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const euroTotal = \`\${formattedNum} €\`; // "136,16 €"`,
    baselineNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=lena with CDP locale de-DE' },
      {
        step: 2,
        status: 'failed',
        remark:
          'Step 2 failed: Expected euro_total "136,16 €", got "NaN €" because Number("118,40") returned NaN on German comma decimal separator.',
      },
      {
        type: 'run_end',
        status: 'failed',
        summary: 'Failed at step 2: German comma decimal calculation produced "NaN €" on checkout receipt.',
        duration: 6.1,
        credits: 4,
        final_state: { euro_total: 'NaN €' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-lena-05',
      },
    ],
    healedNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=lena with CDP locale de-DE' },
      { step: 2, status: 'done', remark: 'Clicked "Zahlungspflichtig bestellen" and verified euro_total = "136,16 €"' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'German locale checkout verified: integer-cents formatter rendered "136,16 €" cleanly.',
        duration: 4.5,
        credits: 0,
        final_state: { euro_total: '136,16 €' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-lena-05',
      },
    ],
    extractedProof: { euro_total: '136,16 €' },
  },
  {
    id: 'joe',
    name: 'Joe Miller',
    role: 'First-Timer & Cancel Flow Tester',
    age: 41,
    city: 'Chicago, IL',
    quote: 'Joining the coffee club took two clicks. Canceling takes two clicks with HTTP 200 proof.',
    humanContext:
      'Subscribes to the Artisan Roast Monthly Club and immediately tests whether canceling is honest, symmetrical, and backed by a real 200 OK response.',
    cdpConstraintBadge: 'CDP Network 200 & Cancel Parity Check',
    cdpProtocolCalls: ['Network.enable()', 'Runtime.enable()'],
    kaneTestFile: 'tests/joe_cancel_test.md',
    kaneObjective:
      "Go to http://localhost:4180/?persona=joe, click 'Cancel Membership', click 'Confirm Immediate Cancellation', store the membership status badge as 'cancellation_status', and verify cancellation_status is 'Canceled'",
    baselineStatus: 'passed',
    healedStatus: 'passed',
    defectCategory: 'Subscription Cancellation Symmetry & HTTP 200 Verification',
    defectTitle: '2-click cancellation parity with zero 5xx network errors',
    defectRootCause: 'Baseline passed — 2-click cancellation flow returns HTTP 200 OK.',
    fileTarget: 'src/components/StorefrontStage.tsx:215',
    codeBefore: `<button type="button" onClick={confirmCancel}>
  Confirm Immediate Cancellation
</button>`,
    codeAfter: `<button type="button" onClick={confirmCancel}>
  Confirm Immediate Cancellation
</button>`,
    baselineNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Opened http://localhost:4180/?persona=joe subscription portal' },
      { step: 2, status: 'done', remark: 'Completed 2-click cancellation and stored cancellation_status = "Canceled"' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Subscription cancellation verified in 2 clicks with HTTP 200.',
        duration: 5.2,
        credits: 3,
        final_state: { cancellation_status: 'Canceled', cancel_clicks: '2' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-joe-06',
      },
    ],
    healedNdjson: [
      { type: 'stream_start' },
      { step: 1, status: 'done', remark: 'Replayed cached step 1 from output-joe_cancel (0 credits)' },
      { step: 2, status: 'done', remark: 'Replayed cached step 2: cancellation_status = "Canceled"' },
      {
        type: 'run_end',
        status: 'passed',
        summary: 'Deterministic cache replay verified 2-click cancellation parity.',
        duration: 1.6,
        credits: 0,
        final_state: { cancellation_status: 'Canceled', cancel_clicks: '2' },
        test_url: 'https://test-manager.lambdatest.com/projects/gauntlet/test-cases/tc-joe-06',
      },
    ],
    extractedProof: { cancellation_status: 'Canceled', cancel_clicks: '2' },
  },
];
