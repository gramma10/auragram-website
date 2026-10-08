'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks';

// Στον server το useLayoutEffect δεν κάνει τίποτα (και προειδοποιεί)· στον client τρέχει πριν το paint.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Count-up που ξεκινά κάθε φορά που το `run` γίνεται true (π.χ. tab ενεργό ΚΑΙ μέσα στο viewport) και ακολουθεί
 * τις αλλαγές της τιμής (π.χ. προσωπικό ROI από τον calculator) από την τρέχουσα τιμή.
 *
 *  • Αρχική κατάσταση = ΤΕΛΙΚΗ τιμή (SSR / χωρίς JS / reduced motion) — δεν υπάρχει «0» που τρεμοπαίζει.
 *  • Ο αόρατος sizer κρατά το πλάτος της τελικής τιμής (tabular numerals) → το animated overlay μεγαλώνει
 *    «μέσα» στο κουτί του και τίποτα γύρω του δεν μετακινείται (layout shift = 0).
 *  • Το overlay είναι διακοσμητικό (aria-hidden, ::after από data-v): ο sizer κρατά την τιμή για screen readers.
 *  • prefers-reduced-motion → καμία κίνηση, πάντα η τελική τιμή.
 */
export function AnimatedNumber({
  value,
  format,
  run,
  duration = 600,
  className,
}: {
  value: number;
  format: (n: number) => string;
  run: boolean;
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(value);
  const current = useRef(value); // τιμή που εμφανίζεται τώρα (χωρίς re-render)
  const wasRunning = useRef(false);

  useIsoLayoutEffect(() => {
    if (reduced) {
      current.current = value;
      setShown(value);
      return;
    }
    if (!run) {
      // Διακοπή στη μέση (βγήκε από το viewport / άλλαξε tab): η τελική τιμή, ποτέ μια «κολλημένη» ενδιάμεση.
      if (wasRunning.current) {
        current.current = value;
        setShown(value);
      }
      wasRunning.current = false;
      return;
    }
    // Νέα εκκίνηση (rising edge) → από το 0· αλλαγή τιμής ενώ τρέχει → από την τρέχουσα.
    const origin = wasRunning.current ? current.current : 0;
    wasRunning.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo — ίδιο με το CountUp
      const v = origin + (value - origin) * eased;
      current.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    current.current = origin;
    setShown(origin);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, run, reduced, duration]);

  return (
    <span className={`relative inline-block tnum ${className ?? ''}`}>
      <span className="opacity-0">{format(value)}</span>
      <span aria-hidden data-v={format(Math.round(shown))} className="absolute inset-0 after:content-[attr(data-v)]" />
    </span>
  );
}
