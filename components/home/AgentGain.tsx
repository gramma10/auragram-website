'use client';

import { useSyncExternalStore } from 'react';
import { agentsCopy, type AgentGain } from '@/lib/content';
import { formatEUR } from '@/lib/format';
import { lostRevenueFormula, timeValueFormula } from '@/lib/roi';
import { getRoi, getRoiServer, getRoiTouched, getRoiTouchedServer, subscribeRoi } from '@/lib/roiStore';

/**
 * Το «gain pill» του agent: ⚡ spec · ≈ ROI [ΕΚΤΙΜΗΣΗ] + μία γραμμή τύπου (12px, muted) ΑΜΕΣΩΣ από κάτω.
 * Το ROI μέρος ακολουθεί τον calculator όταν ο επισκέπτης έχει αλλάξει πραγματικά κάποιο slider (όπως το RoiBlock)·
 * αλλιώς δείχνει την προεπιλογή (που προκύπτει από τον ΙΔΙΟ τύπο). 15px, padding 8px 14px.
 */
export function AgentGainPill({ gain }: { gain: AgentGain }) {
  const snapshot = useSyncExternalStore(subscribeRoi, getRoi, getRoiServer);
  const touched = useSyncExternalStore(subscribeRoi, getRoiTouched, getRoiTouchedServer);

  let value = gain.roi.value;
  let formula = gain.roi.formula;
  const key = gain.roi.personal;
  if (key && touched && snapshot) {
    value = snapshot[key];
    formula = key === 'lostRevenue' ? lostRevenueFormula(snapshot) : timeValueFormula(snapshot);
  }
  const shown = gain.roi.format === 'eur' ? formatEUR(value) : `${Math.round(value)}\u00a0ώρ.`;
  // «≈ 1.299 €/μήνα» δεν σπάει ΠΟΤΕ (NBSP + nowrap)· ό,τι ακολουθεί («σε χρόνο», «λιγότερα Excel») τυλίγει κανονικά
  const unitEnd = gain.roi.suffix.indexOf(' ');
  const unit = unitEnd === -1 ? gain.roi.suffix : gain.roi.suffix.slice(0, unitEnd);
  const rest = unitEnd === -1 ? '' : gain.roi.suffix.slice(unitEnd);

  return (
    <div className="flex max-w-full flex-col items-center gap-1">
      <span className="inline-flex max-w-full items-center gap-2.5 rounded-2xl border border-aura/35 bg-aura/[0.08] px-2.5 py-1 text-center text-[13px] font-medium leading-snug text-aura sm:px-3.5 sm:py-2 sm:text-[15px]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
          <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />
        </svg>
        <span className="min-w-0">
          {/* < 640px: ΔΥΟ σταθερές γραμμές (spec / ROI) χωρίς το «·»· από sm inline: «spec · ROI» */}
          <span className="block sm:inline">{gain.spec}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">
            <span className="whitespace-nowrap tnum">
              ≈&nbsp;{shown}
              {unit}
            </span>
            {rest}
          <span className="ml-2 inline-flex translate-y-[-1px] items-center rounded-full border border-aura/40 px-1.5 py-0.5 align-middle font-mono text-[12px] font-medium uppercase leading-none tracking-normal text-aura">
            {agentsCopy.estimate}
          </span>
          </span>
        </span>
      </span>
      <span className="max-w-[34rem] text-center text-[11px] leading-snug text-fg-dim tnum sm:text-[12px]">{formula}</span>
    </div>
  );
}
