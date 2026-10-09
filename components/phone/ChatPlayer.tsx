'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';
import type { Scenario } from '@/lib/content';
import { cn } from '@/lib/cn';
import { PhoneFrame } from './PhoneFrame';

/**
 * ChatPlayer — η συνομιλία του hero μέσα στο κινητό (loop).
 *  • φούσκες + timestamps· το πρώτο μήνυμα είναι ορατό από το πρώτο paint (η οθόνη δεν αδειάζει ποτέ)
 *  • prefers-reduced-motion → ολόκληρη η τελική κατάσταση, χωρίς timers
 *  • ξαναρχίζει μετά από παύση στο τέλος
 * (Round 4: αφαιρέθηκαν τα paths που εξυπηρετούσαν μόνο το variant B των agents — notifications, mini chart, typing indicator.)
 */

type Step = { kind: 'msg' | 'status'; i?: number; wait: number };

function buildSteps(s: Scenario, gap: number): Step[] {
  const out: Step[] = [];
  s.messages.forEach((_, i) => {
    if (i === 0) return; // το πρώτο είναι ήδη ορατό
    out.push({ kind: 'msg', i, wait: gap });
  });
  if (s.status) out.push({ kind: 'status', wait: gap });
  return out;
}

const collapse =
  'overflow-hidden transition-[max-height,opacity,transform,padding] duration-500 ease-out motion-reduce:transition-none';
const shownCls = 'max-h-[260px] translate-y-0 pb-2.5 opacity-100';
const hiddenCls = 'pointer-events-none max-h-0 translate-y-2 pb-0 opacity-0';

export function ChatPlayer({
  scenario,
  playing = true,
  loop = true,
  startDelay = 1300,
  gap = 1250,
  endPause = 4200,
  screenClassName,
  onFinishedChange,
}: {
  scenario: Scenario;
  /** false = η συνομιλία περιμένει (μόνο το πρώτο μήνυμα φαίνεται)· true = ξεκινά. */
  playing?: boolean;
  /** true = ξαναρχίζει μετά από παύση στο τέλος (desktop)· false = μένει στην τελική κατάσταση (mobile scroll-driven hero). */
  loop?: boolean;
  startDelay?: number;
  gap?: number;
  endPause?: number;
  screenClassName?: string;
  /** true όταν φάνηκε το τελευταίο βήμα (π.χ. για το toast του hero) */
  onFinishedChange?: (finished: boolean) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const steps = useMemo(() => buildSteps(scenario, gap), [scenario, gap]);
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const cb = useRef({ onFinishedChange });
  cb.current = { onFinishedChange };

  // Τι φαίνεται τώρα (παράγωγο του cursor).
  const view = useMemo(() => {
    let msgs = 1;
    let status = false;
    for (let k = 0; k < cursor && k < steps.length; k++) {
      const st = steps[k];
      if (st.kind === 'msg') msgs = (st.i ?? 0) + 1;
      else status = true;
    }
    return { msgs, status };
  }, [cursor, steps]);

  const finished = cursor >= steps.length;

  // Χρονισμός
  useEffect(() => {
    if (reduced) {
      setCursor(steps.length); // τελική κατάσταση, στατικά
      return;
    }
    if (!playing) return;
    if (cursor < steps.length) {
      const t = setTimeout(() => setCursor((c) => c + 1), cursor === 0 ? startDelay : steps[cursor].wait);
      return () => clearTimeout(t);
    }
    if (!loop) return;
    const t = setTimeout(() => setCursor(0), endPause); // παύση στο τέλος, μετά restart από το 1ο μήνυμα
    return () => clearTimeout(t);
  }, [reduced, playing, loop, cursor, steps, startDelay, endPause]);

  useEffect(() => {
    cb.current.onFinishedChange?.(finished && steps.length > 0);
  }, [finished, steps.length]);

  // Κύλιση στο νεότερο μήνυμα (και ξανά όταν τελειώσει η μετάβαση ύψους).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const toEnd = () => el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
    toEnd();
    const t = setTimeout(toEnd, 520);
    return () => clearTimeout(t);
  }, [cursor, reduced]);

  const st = scenario.status;

  return (
    <PhoneFrame time={scenario.time} header={scenario.app ?? null} screenClassName={screenClassName}>
      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3 pt-4">
        {/* aria-live="off": η συνομιλία είναι διακοσμητική */}
        <div ref={listRef} aria-live="off" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {scenario.messages.map((m, i) => (
            <div key={i} className="flex flex-col">
              <div
                className={cn(
                  'max-w-[86%]',
                  collapse,
                  m.from === 'agent' ? 'self-end' : 'self-start',
                  i < view.msgs ? shownCls : hiddenCls
                )}
              >
                <div
                  className={cn(
                    'rounded-[14px] px-3.5 py-2.5 text-[13px] leading-snug',
                    m.from === 'agent'
                      ? 'rounded-br-[4px] bg-aura text-night-900'
                      : 'rounded-bl-[4px] bg-white/[0.08] text-white/85'
                  )}
                >
                  {m.text}
                </div>
                <p
                  className={cn(
                    'pt-1 font-mono text-[12px] text-fg-dim',
                    // mobile: μόνο οι ώρες του agent — λιγότερος θόρυβος σε στενή οθόνη
                    m.from === 'agent' ? 'text-right' : 'hidden text-left sm:block'
                  )}
                >
                  {m.meta}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* το αποτέλεσμα, όχι το χαρακτηριστικό — καρφωμένο κάτω, ποτέ δεν κόβεται */}
        {st && (
          <div
            className={cn(
              'mt-2.5 flex shrink-0 items-center gap-2.5 rounded-xl border border-aura/30 bg-aura/[0.07] px-3.5 py-3 transition-all duration-500 motion-reduce:transition-none',
              view.status ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            )}
          >
            {st.icon && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
                <path d="M2 7.5 5.5 11 12 3.5" stroke="#22D3EE" strokeWidth="2" strokeLinecap="square" />
              </svg>
            )}
            <span className="min-w-0 flex-1 font-display text-[12.5px] font-extrabold leading-snug tracking-tight text-white">
              {st.text}
            </span>
            {st.meta && <span className="shrink-0 font-mono text-[12px] text-aura">{st.meta}</span>}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
