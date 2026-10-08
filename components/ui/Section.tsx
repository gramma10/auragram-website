import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ConstellationGrid } from './constellation-grid';

/**
 * Εναλλαγή dark/light ανά section — δίνει ρυθμό στη σελίδα.
 * ΚΑΝΟΝΑΣ (Round 4, «το accent ακολουθεί την επιφάνεια»): cyan πάνω σε dark επιφάνειες, lime (#C7F94B) πάνω σε light.
 * Το lime ΠΟΤΕ δεν είναι χρώμα κειμένου ούτε λεπτή γραμμή μόνο του πάνω σε light.
 */
export function Section({
  id,
  tone,
  children,
  className,
  grid = false,
  mesh,
  before,
}: {
  id?: string;
  tone: 'dark' | 'light';
  children: ReactNode;
  className?: string;
  /** Grid background — μόνο σε dark sections, χαμηλό opacity. */
  grid?: boolean;
  /** Ήσυχο πλέγμα κόμβων στο φόντο. Προεπιλογή: ναι στα ανοιχτόχρωμα sections. */
  mesh?: boolean;
  /** Διακοσμητικό στρώμα ΠΡΙΝ από το υπόλοιπο περιεχόμενο (π.χ. <Aura />). Το section χρειάζεται `isolate`. */
  before?: ReactNode;
}) {
  const showMesh = mesh ?? tone === 'light';
  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden scroll-mt-24',
        tone === 'dark' ? 'surface-dark' : 'surface-light on-light',
        grid && 'grid-bg',
        // 72px mobile / 128px desktop · gutter 16px / 24px
        'px-4 py-[72px] sm:px-6 md:py-24 lg:py-32',
        className
      )}
    >
      {before}
      {showMesh && <ConstellationGrid />}
      <div className="relative z-[1] mx-auto w-full max-w-page">{children}</div>
    </section>
  );
}

export function Eyebrow({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone: 'dark' | 'light';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'eyebrow flex items-center gap-2.5',
        tone === 'dark' ? 'text-aura' : 'text-ink-soft',
        className
      )}
    >
      <span
        // light: lime «κάψουλα» 6px με ink/10 περίγραμμα (σχήμα, όχι λεπτή γραμμή — το lime μόνο του δεν διαβάζεται πάνω στο #FAFAF7)
        className={cn('w-6', tone === 'dark' ? 'h-px bg-aura/60' : 'h-1.5 rounded-full border border-ink/10 bg-volt')}
        aria-hidden
      />
      {children}
    </p>
  );
}

export function H2({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone: 'dark' | 'light';
  className?: string;
}) {
  return (
    <h2
      className={cn(
        'h2',
        tone === 'dark' ? 'text-white' : 'text-ink',
        className
      )}
    >
      {children}
    </h2>
  );
}

/** Μεγάλο mono numbering — μαζί με τα brackets, η υπογραφή του brand. */
export function Numeral({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone: 'dark' | 'light';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-mono text-[13px] tabular-nums tracking-[0.1em]',
        tone === 'dark' ? 'text-aura' : 'text-ink-soft',
        className
      )}
    >
      {children}
    </span>
  );
}
