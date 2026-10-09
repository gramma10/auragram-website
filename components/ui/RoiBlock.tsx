'use client';

import { useRef, useSyncExternalStore } from 'react';
import { roiCopy, type RoiSpec } from '@/lib/content';
import { formatEUR } from '@/lib/format';
import { lostRevenueFormula, timeValueFormula } from '@/lib/roi';
import { getRoi, getRoiServer, getRoiTouched, getRoiTouchedServer, subscribeRoi } from '@/lib/roiStore';
import { useInView } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { AnimatedNumber } from './AnimatedNumber';

const FORMATS = {
  eur: formatEUR,
  hours: (n: number) => `${Math.round(n)} ώρ.`,
} as const;

/** Pill «ΕΚΤΙΜΗΣΗ» — μικρό mono tag δίπλα σε κάθε εκτιμώμενο νούμερο. */
export function EstimatePill({
  tone = 'dark',
  compact = false,
  className,
}: {
  tone?: 'dark' | 'light';
  /** Στενά κουτιά (metric tiles σε mobile): μικρότερα paddings/tracking ώστε να χωρά στα 360px. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border py-0.5 font-mono text-[12px] font-medium uppercase leading-none',
        compact ? 'px-1 tracking-normal sm:px-2 sm:tracking-[0.08em]' : 'px-2 tracking-[0.08em]',
        tone === 'dark' ? 'border-white/25 text-white/85' : 'border-ink/30 text-ink-soft',
        className
      )}
    >
      {roiCopy.estimate}
    </span>
  );
}

/**
 * Το ΕΝΑ RoiBlock (Services tabs + Industries panels): label «ROI», ένα μεγάλο νούμερο + unit, μία γραμμή label,
 * pill «ΕΚΤΙΜΗΣΗ» όταν είναι estimate, τύπος (footnote) και προαιρετικό link προς τον calculator.
 *
 *  • Personalisation: αν `personal` και ο επισκέπτης έχει αλλάξει πραγματικά κάποιο slider/input του calculator,
 *    δείχνει τα δικά του νούμερα («Με τα νούμερα που βάλατε») με τον τύπο πάνω στις δικές του τιμές.
 *    Αλλιώς δείχνει την προεπιλογή (που προκύπτει από τον ίδιο τύπο με τον calculator).
 *  • Χωρίς layout shift στην εναλλαγή: tabular numerals + min-width στο νούμερο· το label/formula έχουν σταθερό αριθμό γραμμών
 *    στη συνηθισμένη περίπτωση και το νούμερο δεσμεύει το πλάτος της τελικής τιμής (AnimatedNumber).
 *  • Count-up όταν μπει στο viewport ΚΑΙ `run` (π.χ. ενεργό tab)· στατικό σε reduced motion.
 *  • dark: cyan border 35% + background 6% · light: ink border + aura-deep #0E7490 νούμερο.
 */
export function RoiBlock({
  spec,
  tone = 'dark',
  run = true,
  className,
}: {
  spec: RoiSpec;
  tone?: 'dark' | 'light';
  run?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  const snapshot = useSyncExternalStore(subscribeRoi, getRoi, getRoiServer);
  const touched = useSyncExternalStore(subscribeRoi, getRoiTouched, getRoiTouchedServer);
  const personal = !!(spec.personal && touched && snapshot);

  let value = spec.value;
  let label = spec.label;
  let formula = spec.formula;
  if (personal && snapshot && spec.personal) {
    value = snapshot[spec.personal];
    label = roiCopy.personalLabel;
    formula = spec.personal === 'lostRevenue' ? lostRevenueFormula(snapshot) : timeValueFormula(snapshot);
  }

  const dark = tone === 'dark';
  const format = FORMATS[spec.format ?? 'eur'];
  const estimate = spec.kind === 'estimate';

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border p-3.5 sm:p-5',
        dark ? 'border-aura/35 bg-aura/[0.06]' : 'border-ink/25 bg-white',
        className
      )}
    >
      <p className={cn('font-mono text-[12px] font-medium uppercase tracking-[0.12em]', dark ? 'text-aura' : 'text-ink-soft')}>
        {roiCopy.label}
      </p>

      {value !== undefined ? (
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2">
          <span
            className={cn(
              'inline-block min-w-[6ch] font-display text-[clamp(28px,6vw,36px)] font-extrabold leading-none tracking-tight tnum',
              dark ? (estimate ? 'text-white' : 'text-aura') : 'text-aura-deep'
            )}
          >
            {estimate && '≈ '}
            <AnimatedNumber value={value} format={format} run={run && inView} />
          </span>
          {spec.unit && (
            <span className={cn('font-mono text-[12px] font-medium', dark ? 'text-fg-dim' : 'text-ink-soft')}>{spec.unit}</span>
          )}
          {estimate && <EstimatePill tone={tone} />}
        </p>
      ) : (
        <p className={cn('pt-2.5 font-display text-[22px] font-extrabold leading-tight tracking-tight', dark ? 'text-aura' : 'text-aura-deep')}>
          {spec.text}
        </p>
      )}

      <p className={cn('pt-2 text-[14px] leading-snug', dark ? 'text-fg' : 'text-ink/75')}>{label}</p>

      {formula && (
        <p className={cn('pt-1.5 text-[12px] leading-snug tnum', dark ? 'text-fg-dim' : 'text-ink-soft')}>{formula}</p>
      )}

      {spec.calcLink && (
        <a href="#ypologismos" className="mt-1 inline-flex min-h-[44px] items-center text-[14px] font-medium">
          <span
            className={cn(
              'border-b transition-colors',
              dark ? 'border-aura/40 text-aura hover:border-aura' : 'border-aura-deep text-ink hover:border-ink'
            )}
          >
            {roiCopy.calcLink}
          </span>
        </a>
      )}
    </div>
  );
}
