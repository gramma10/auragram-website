'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, usePrefersReducedMotion } from '@/lib/hooks';

/**
 * Count-up στα νούμερα. Κάθε νούμερο στη σελίδα είναι επιχείρημα πώλησης,
 * οπότε αξίζει να το προσέξει ο επισκέπτης — μία φορά, χωρίς φιοριτούρες.
 */
export function CountUp({
  value,
  duration = 900,
  format = (n: number) => n.toLocaleString('el-GR'),
  className,
  /** Όταν true, τρέχει σε κάθε αλλαγή τιμής (π.χ. ROI calculator). */
  live = false,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  live?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Στο live mode (ROI calculator) ο χρήστης σέρνει ήδη τα sliders — δεν
  // περιμένουμε IntersectionObserver για να δείξουμε το νούμερο.
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const inView = live || seen;
  const reduced = usePrefersReducedMotion();
  // Ξεκινά πάντα από 0 ώστε server και client να συμφωνούν στο πρώτο render.
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    if (!inView) return;

    const start = performance.now();
    const origin = live ? from.current : 0;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo — γρήγορο ξεκίνημα, ήρεμο κλείσιμο
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setShown(origin + (value - origin) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, inView, duration, reduced, live]);

  // live (calculator): η τιμή αλλάζει από τον χρήστη — κανονικό inline κείμενο.
  if (live) {
    return (
      <span ref={ref} className={className ? `tnum ${className}` : 'tnum'}>
        {format(Math.round(shown))}
      </span>
    );
  }

  // Count-up μίας φοράς: ΔΕΣΜΕΥΟΥΜΕ το πλάτος της τελικής τιμής (αόρατο sizer), ώστε το
  // νούμερο να μεγαλώνει «μέσα» στο κουτί του και να μη μετακινεί/τυλίγει τίποτα γύρω του
  // (πριν, το «Από 0 €» → «Από 1.200 €» έσπρωχνε τη διπλανή στήλη σε νέα γραμμή: layout shift).
  // Ο sizer κρατά την τελική τιμή (screen readers, copy)· το animated overlay είναι διακοσμητικό.
  return (
    <span ref={ref} className={`relative inline-block tnum ${className ?? ''}`}>
      <span className="opacity-0">{format(Math.round(value))}</span>
      {/* animated τιμή ως ::after (data-v) → ΔΕΝ υπάρχει ως κείμενο στο DOM: καμία διπλή τιμή σε copy/paste ή scrapers */}
      <span aria-hidden data-v={format(Math.round(shown))} className="absolute inset-0 after:content-[attr(data-v)]" />
    </span>
  );
}
