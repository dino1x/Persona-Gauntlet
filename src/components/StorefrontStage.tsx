import React, { useState, useRef, useEffect } from 'react';
import { PersonaSpec } from '../data/personas';
import { gauntletAudio } from '../lib/audio';
import {
  Keyboard,
  ZoomIn,
  Wifi,
  Smartphone,
  Globe,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface StorefrontStageProps {
  activePersona: PersonaSpec;
  isHealed: boolean;
  onTriggerSingleVerify: (personaId: PersonaSpec['id']) => void;
  onHealPersona: (personaId: PersonaSpec['id']) => void;
}

export const StorefrontStage: React.FC<StorefrontStageProps> = React.memo(
  ({ activePersona, isHealed, onTriggerSingleVerify, onHealPersona }) => {
    const defaultTierForPersona = (id: PersonaSpec['id']): 'standard' | 'express' =>
      id === 'maya' ? 'standard' : 'express';

    const [shippingTier, setShippingTier] = useState<'standard' | 'express'>(() =>
      defaultTierForPersona(activePersona.id)
    );
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [chargeCount, setChargeCount] = useState(0);
    const [isSubmitting3G, setIsSubmitting3G] = useState(false);
    const [interceptedError, setInterceptedError] = useState<string | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'Active' | 'CancelConfirm' | 'Canceled'>('Active');
    const inFlightLockRef = useRef(false);
    const timersRef = useRef<number[]>([]);

    const clearPendingTimers = () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
      }
      timersRef.current = [];
    };

    useEffect(() => {
      clearPendingTimers();
      setOrderConfirmed(false);
      setChargeCount(0);
      setIsSubmitting3G(false);
      setInterceptedError(null);
      setPromoCode('');
      setPromoApplied(false);
      setPromoError(null);
      setShippingTier(defaultTierForPersona(activePersona.id));
      setSubscriptionStatus('Active');
      inFlightLockRef.current = false;
      return () => clearPendingTimers();
    }, [activePersona.id, isHealed]);

    const isGerman = activePersona.id === 'lena';
    const isZoom200 = activePersona.id === 'dev';
    const isMobile375 = activePersona.id === 'sam';
    const isSlow3G = activePersona.id === 'ana';
    const isKeyboardMaya = activePersona.id === 'maya';
    const isJoeCancel = activePersona.id === 'joe';

    const baseCents = 13000;
    const shippingCents = shippingTier === 'express' ? 1800 : 1000;
    const discountCents = promoApplied ? 2000 : 0;
    const totalCents = baseCents + shippingCents - discountCents;

    // Genuine dynamic calculation respecting shippingTier & promoApplied across all personas
    const displayedTotal = (() => {
      if (isGerman) {
        const subCents = 11840;
        const shipCents = shippingTier === 'express' ? 1776 : 1000;
        const discCents = promoApplied ? 1800 : 0;
        if (!isHealed) {
          const formattedSub = (subCents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 }); // "118,40"
          const formattedShip = (shipCents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 }); // "17,76" or "10,00"
          const brokenSum = Number(formattedSub) + Number(formattedShip); // NaN in JS!
          return `${brokenSum.toFixed(2)} €`;
        }
        const cleanSum = ((subCents + shipCents - discCents) / 100).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `${cleanSum} €`;
      }
      if (isSlow3G && chargeCount > 1) {
        return `$${((totalCents * chargeCount) / 100).toFixed(2)}`;
      }
      return `$${(totalCents / 100).toFixed(2)}`;
    })();

    const handleApplyPromo = () => {
      gauntletAudio.tap(460);
      setPromoError(null);
      if (promoCode.trim().toUpperCase() === 'ATELIER20') {
        setPromoApplied(true);
      } else {
        setPromoApplied(false);
        setPromoError('Invalid promo code. Expected "ATELIER20" for $20.00 discount.');
      }
    };

    const handleSingleClickOrder = () => {
      gauntletAudio.tap(380);
      setInterceptedError(null);

      if (isKeyboardMaya && shippingTier !== 'express') {
        setInterceptedError(
          'Kane CLI Step 2 Failed: Shipping selector <div class="shipping-option"> is not keyboard focusable (tabIndex=-1, missing button role); Tab navigation skipped Express Air ($18.00) and left Standard ($10.00) selected.'
        );
        gauntletAudio.statusChime(false);
        return;
      }

      if (isGerman && displayedTotal.includes('NaN')) {
        setInterceptedError(
          `Kane CLI Step 2 Failed: Expected euro_total "136,16 €", got "${displayedTotal}" because Number("118,40") returned NaN on German comma decimal separator.`
        );
        gauntletAudio.statusChime(false);
        return;
      }

      if (isSlow3G) {
        if (isHealed && inFlightLockRef.current) {
          return;
        }
        if (!inFlightLockRef.current) {
          setChargeCount(0);
          setOrderConfirmed(false);
        }
        inFlightLockRef.current = true;
        setIsSubmitting3G(true);
        const tid = window.setTimeout(() => {
          setChargeCount((prev) => {
            const next = isHealed ? 1 : prev + 1;
            if (next > 1) {
              setInterceptedError(
                `Kane CLI Step 2 Failed: Expected charge_count "1" and billed_amount "$${(
                  totalCents / 100
                ).toFixed(2)}", got charge_count "${next}" and billed_amount "$${(
                  (totalCents * next) /
                  100
                ).toFixed(2)}" on rapid double-click within 450ms 3G window.`
              );
              gauntletAudio.statusChime(false);
            } else {
              gauntletAudio.statusChime(true);
            }
            return next;
          });
          inFlightLockRef.current = false;
          setIsSubmitting3G(false);
          setOrderConfirmed(true);
        }, 450);
        timersRef.current.push(tid);
        return;
      }

      setChargeCount(1);
      setOrderConfirmed(true);
      gauntletAudio.statusChime(true);
    };

    const handleSimulateRapidDoubleClick = () => {
      handleSingleClickOrder();
      const tid = window.setTimeout(() => {
        handleSingleClickOrder();
      }, 120);
      timersRef.current.push(tid);
    };

    const handleOccludedConciergeIntercept = () => {
      gauntletAudio.statusChime(false);
      setInterceptedError(
        'Kane CLI Step 2 Failed: ElementClickIntercepted — Sticky concierge bar (.fixed-concierge-bar, z-index: 50) occludes 152px of Complete Order CTA at 200% zoom.'
      );
    };

    return (
      <div className="bg-[#FFFFFF] border border-[#EFEDEA] rounded-2xl overflow-hidden flex flex-col shadow-2xs">
        {/* High-Contrast Dark-Navy Stage Bar */}
        <div className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#30C25A]" />
            <span className="ml-2 px-3 py-0.5 rounded-full bg-[#2C2C2E] font-mono-code text-xs text-[#E5E5EA]">
              http://localhost:4180/?persona={activePersona.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-code bg-[#0A84FF]/20 text-[#38BDF8] border border-[#0A84FF]/30">
              {activePersona.cdpConstraintBadge}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-semibold ${
                isHealed || activePersona.baselineStatus === 'passed'
                  ? 'bg-[#30C25A] text-[#1C1C1E]'
                  : 'bg-[#EF4444] text-[#FFFFFF]'
              }`}
            >
              {isHealed || activePersona.baselineStatus === 'passed' ? 'KANE VERIFIED' : 'DEFECT EXPOSED'}
            </span>
          </div>
        </div>

        {/* Active Persona Context Banner */}
        <div className="bg-[#FFFFFF] border-b border-[#EFEDEA] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F4F8FF] border border-[#CCE4FF] flex items-center justify-center text-[#0062CC]">
              {isKeyboardMaya && <Keyboard className="w-4 h-4" />}
              {isZoom200 && <ZoomIn className="w-4 h-4" />}
              {isSlow3G && <Wifi className="w-4 h-4" />}
              {isMobile375 && <Smartphone className="w-4 h-4" />}
              {isGerman && <Globe className="w-4 h-4" />}
              {isJoeCancel && <RotateCcw className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1F1E1D]">
                Testing as {activePersona.name} — {activePersona.role}
              </div>
              <div className="text-xs text-[#84827F] italic">&ldquo;{activePersona.quote}&rdquo;</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTriggerSingleVerify(activePersona.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono-code bg-[#F4F2EF] hover:bg-[#EFEDEA] border border-[#EFEDEA] text-[#1F1E1D] transition cursor-pointer"
            >
              Re-Run Kane CLI Check
            </button>
            {!isHealed && activePersona.baselineStatus === 'failed' && (
              <button
                type="button"
                onClick={() => onHealPersona(activePersona.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1F1E1D] hover:bg-[#3A3836] text-[#FFFFFF] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#30C25A]" />
                Auto-Heal Defect &amp; Re-Verify
              </button>
            )}
          </div>
        </div>

        {/* Ice-Blue Optical Storefront Stage */}
        <div className="p-5 bg-[#F4F8FF] flex-1 flex flex-col items-center justify-center relative min-h-[420px]">
          <div
            className={`w-full transition-all duration-300 rounded-2xl border border-[#EFEDEA] bg-[#FFFFFF] p-5 relative overflow-hidden shadow-xs ${
              isMobile375 ? 'max-w-[375px]' : 'max-w-2xl'
            } ${isZoom200 ? 'text-base ring-2 ring-[#EF4444]/50' : ''}`}
          >
            {/* Storefront Header */}
            <div className="flex items-center justify-between border-b border-[#EFEDEA] pb-3 mb-4">
              <div>
                <span className="text-[11px] font-mono-code uppercase tracking-widest text-[#0062CC] font-semibold">
                  Kurogami Atelier · Kyoto / Seattle
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-[#1F1E1D]">
                  {isGerman
                    ? 'Kasse — Kurogami Atelier'
                    : isJoeCancel
                    ? 'Artisan Roast Monthly Club — Membership Portal'
                    : 'Checkout — Single-Origin Gesha & Pour-Over Dripper'}
                </h3>
              </div>
              <span className="font-mono-code text-xs px-2.5 py-1 rounded-full bg-[#FBFAF9] border border-[#EFEDEA] text-[#84827F]">
                {isGerman ? 'Sprache: de-DE' : isZoom200 ? 'Scale: 200%' : isMobile375 ? '375×667' : '1280×800'}
              </span>
            </div>

            {isJoeCancel ? (
              /* Joe Miller Subscription Cancellation View */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FBFAF9] border border-[#EFEDEA] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#1F1E1D]">Artisan Roast Monthly Club (2x 250g Bags)</div>
                    <div className="text-xs text-[#84827F]">Billed monthly at $44.00 · Joined in 2 clicks</div>
                  </div>
                  <span
                    data-testid="cancellation-status"
                    className={`px-3 py-1 rounded-full text-xs font-mono-code font-semibold border ${
                      subscriptionStatus === 'Canceled'
                        ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                        : 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                    }`}
                  >
                    {subscriptionStatus}
                  </span>
                </div>

                {subscriptionStatus === 'Active' && (
                  <button
                    type="button"
                    onClick={() => {
                      gauntletAudio.tap(340);
                      setSubscriptionStatus('CancelConfirm');
                    }}
                    className="w-full py-2.5 px-4 rounded-full border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] text-sm font-medium transition cursor-pointer"
                  >
                    Cancel Membership
                  </button>
                )}

                {subscriptionStatus === 'CancelConfirm' && (
                  <div className="p-4 rounded-xl bg-[#FBFAF9] border border-[#EFEDEA] space-y-3">
                    <div className="text-xs text-[#84827F]">
                      No retention maze or mandatory survey. Confirm below to cancel immediately with HTTP 200 proof.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        gauntletAudio.statusChime(true);
                        setSubscriptionStatus('Canceled');
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-[#1F1E1D] text-[#FFFFFF] font-semibold text-sm transition cursor-pointer"
                    >
                      Confirm Immediate Cancellation
                    </button>
                  </div>
                )}

                {subscriptionStatus === 'Canceled' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs text-[#15803D] font-mono-code font-semibold">
                      <span>HTTP 200 OK · cancellation_status = &ldquo;Canceled&rdquo; (2 clicks total)</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        gauntletAudio.tap(360);
                        setSubscriptionStatus('Active');
                      }}
                      className="w-full py-2 px-4 rounded-full bg-[#F4F2EF] hover:bg-[#EFEDEA] border border-[#EFEDEA] text-xs font-mono-code text-[#1F1E1D] transition cursor-pointer"
                    >
                      Restore Active Membership
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Checkout Flow for Maya, Dev, Ana, Sam, Lena */
              <div className={`space-y-4 ${isZoom200 && !isHealed ? 'pb-2' : 'pb-6'}`}>
                {/* Line Items */}
                <div className="p-3.5 rounded-xl bg-[#FBFAF9] border border-[#EFEDEA] flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-[#1F1E1D]">
                      {isGerman ? 'Kurogami Keramik-Handfilter + Gesha Bohnen' : 'Kurogami Ceramic Dripper + Gesha Beans'}
                    </div>
                    <div className="text-xs text-[#84827F]">
                      {isKeyboardMaya
                        ? isHealed
                          ? 'Tab Focus Ring: Active (<button> semantics — press Tab then Enter on Express Air)'
                          : 'Defect: Express Air below is a non-focusable <div class="shipping-option">'
                        : 'Qty: 1 · Hand-fired stoneware'}
                    </div>
                  </div>
                  <div className="font-mono-code font-semibold text-[#1F1E1D]">
                    {isGerman ? '118,40 €' : '$130.00'}
                  </div>
                </div>

                {/* Shipping Method Selector (Maya's defect target) */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-[#84827F] mb-2">
                    {isGerman ? 'Versandart wählen' : 'Select Shipping Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        gauntletAudio.tap(300);
                        setShippingTier('standard');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                        shippingTier === 'standard'
                          ? 'border-[#1F1E1D] bg-[#F4F8FF] text-[#1F1E1D]'
                          : 'border-[#EFEDEA] bg-[#FBFAF9] text-[#84827F]'
                      }`}
                    >
                      <div className="font-semibold">Standard Ground</div>
                      <div className="font-mono-code mt-0.5">{isGerman ? '10,00 €' : '$10.00'}</div>
                    </button>

                    {isKeyboardMaya && !isHealed ? (
                      /* Unhealed Maya Defect: Intentional <div class="shipping-option"> lacking tabIndex and keyboard role */
                      <div
                        onClick={() => {
                          gauntletAudio.statusChime(false);
                          setInterceptedError(
                            'Kane CLI Step 2 Failed: Shipping selector <div class="shipping-option"> lacks tabIndex=0 and button role; keyboard Tab navigation skips Express Air ($18.00) and leaves Standard ($10.00) selected.'
                          );
                        }}
                        className="shipping-option p-3 rounded-xl border border-[#EF4444] bg-[#FEF2F2] text-left text-xs relative cursor-pointer"
                      >
                        <div className="font-semibold text-[#1F1E1D] flex items-center justify-between">
                          <span>Express Air</span>
                          <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded-full bg-[#EF4444] text-[#FFFFFF]">
                            &lt;div&gt; NO TABINDEX
                          </span>
                        </div>
                        <div className="font-mono-code mt-0.5 text-[#EF4444]">$18.00 (Skipped by Tab key)</div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-pressed={shippingTier === 'express'}
                        onClick={() => {
                          gauntletAudio.tap(420);
                          setShippingTier('express');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            gauntletAudio.tap(420);
                            setShippingTier('express');
                          }
                        }}
                        className={`shipping-option p-3 rounded-xl border text-left text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A84FF] ${
                          shippingTier === 'express'
                            ? 'border-[#30C25A] bg-[#F0FDF4] text-[#1F1E1D]'
                            : 'border-[#EFEDEA] bg-[#FBFAF9] text-[#84827F]'
                        }`}
                      >
                        <div className="font-semibold flex items-center justify-between">
                          <span>Express Air</span>
                          {isKeyboardMaya && (
                            <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded-full bg-[#30C25A] text-[#FFFFFF]">
                              &lt;button&gt; TAB OK
                            </span>
                          )}
                        </div>
                        <div className="font-mono-code mt-0.5">{isGerman ? '17,76 €' : '$18.00'}</div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Promo Input Row (Sam's 375px viewport target) */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      placeholder="Type ATELIER20 for $20 off"
                      onChange={(e) => setPromoCode(e.target.value)}
                      aria-label="Promo code"
                      className="flex-1 min-w-[140px] px-3.5 py-2 rounded-full bg-[#FBFAF9] border border-[#EFEDEA] text-xs font-mono-code text-[#1F1E1D]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 rounded-full bg-[#F4F2EF] hover:bg-[#EFEDEA] border border-[#EFEDEA] text-xs font-mono-code text-[#1F1E1D] cursor-pointer"
                    >
                      {promoApplied ? 'Applied (-$20.00)' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <div className="text-[11px] font-mono-code text-[#EF4444]">{promoError}</div>}
                </div>

                {/* Order Total Bar */}
                <div className="p-3.5 rounded-xl bg-[#FBFAF9] border border-[#EFEDEA] flex items-center justify-between">
                  <div className="text-xs text-[#84827F] font-mono-code">
                    {isSlow3G
                      ? `Network: 3G (450ms RTT) · Charges recorded: ${chargeCount}`
                      : isGerman
                      ? `Gesamtsumme (118,40 € + ${shippingTier === 'express' ? '17,76 €' : '10,00 €'} Versand)`
                      : `Verified Order Total (${shippingTier === 'express' ? 'Express $18.00' : 'Standard $10.00'})`}
                  </div>
                  <div
                    data-testid="order-total"
                    className={`text-lg font-mono-code font-bold ${
                      displayedTotal.includes('NaN') || chargeCount > 1 ? 'text-[#EF4444]' : 'text-[#15803D]'
                    }`}
                  >
                    {displayedTotal}
                  </div>
                </div>

                {/* Primary Checkout CTA(s) */}
                <div className="relative space-y-2">
                  {isSlow3G ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isHealed && isSubmitting3G}
                        onClick={handleSingleClickOrder}
                        className="py-2.5 px-4 rounded-full font-semibold text-xs bg-[#F4F2EF] hover:bg-[#EFEDEA] border border-[#EFEDEA] disabled:opacity-50 text-[#1F1E1D] transition cursor-pointer"
                      >
                        {isSubmitting3G ? 'Processing 3G (450ms)...' : 'Pay Now (Single Click)'}
                      </button>
                      <button
                        type="button"
                        disabled={isHealed && isSubmitting3G}
                        onClick={handleSimulateRapidDoubleClick}
                        className="py-2.5 px-4 rounded-full font-semibold text-xs bg-[#1F1E1D] hover:bg-[#3A3836] disabled:opacity-50 text-[#FFFFFF] transition cursor-pointer"
                      >
                        Double-Click Pay Now (2x within 450ms)
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSingleClickOrder}
                      className={`w-full py-3 px-5 rounded-full font-semibold text-sm transition cursor-pointer ${
                        isGerman && !isHealed
                          ? 'w-[180px] overflow-hidden whitespace-nowrap text-clip bg-[#EF4444] text-[#FFFFFF]'
                          : 'bg-[#1F1E1D] hover:bg-[#3A3836] text-[#FFFFFF]'
                      }`}
                    >
                      {isGerman
                        ? 'Zahlungspflichtig bestellen'
                        : `Complete Order (${displayedTotal})`}
                    </button>
                  )}

                  {/* Dev Patel's 200% Zoom Sticky Occlusion Overlay when unhealed */}
                  {isZoom200 && !isHealed && (
                    <button
                      type="button"
                      onClick={handleOccludedConciergeIntercept}
                      className="fixed-concierge-bar absolute inset-0 bg-[#1C1C1E]/95 border-2 border-[#EF4444] rounded-full flex items-center justify-between px-4 cursor-not-allowed z-50 text-left w-full"
                    >
                      <div className="flex items-center gap-2 text-xs text-[#FFFFFF] font-mono-code">
                        <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                        <span>OCCLUDED AT 200% ZOOM: Fixed Concierge Bar (.fixed-concierge-bar) intercepts click!</span>
                      </div>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-[#EF4444] text-[#FFFFFF]">
                        z-index: 50
                      </span>
                    </button>
                  )}
                </div>

                {/* Error or Confirmation Receipt */}
                {interceptedError && (
                  <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#EF4444] font-mono-code flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{interceptedError}</div>
                  </div>
                )}

                {orderConfirmed && !interceptedError && (
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#15803D] font-mono-code flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>
                        Order Confirmed · final_state = {JSON.stringify(activePersona.extractedProof)}
                      </span>
                    </div>
                    <span className="font-semibold">EXIT 0</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
