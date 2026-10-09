import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ConstellationGrid } from './constellation-grid';

/**
 * Εναλλαγή dark/light ανά section — δίνει ρυθμό στη σελίδα.
 * ΚΑΝΟΝΑΣ (Palette v4): ΕΝΑ χρώμα μάρκας. Cyan (#22D3EE) πάνω σε dark· πάνω σε light το cyan των γραφικών/links/labels είναι το
 * aura-deep (#0E7490), με aura-tint / aura-line για απαλά κουτιά και marker. Τα κουμπιά είναι cyan και στις δύο επιφάνειες.
 */
export function Section({
  id,
  tone,
  children,
  className,
  grid = false,
  mesh,
  before,
  clip = false,
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
  /**
   * overflow-x: clip αντί για overflow: hidden. Το hidden/auto σε πρόγονο κάνει τον πρόγονο scroll container και ΣΠΑΕΙ το
   * `position: sticky` των απογόνων (π.χ. το stacking των agent cards)· το clip κόβει οριζόντια χωρίς να δημιουργεί scroll container.
   */
  clip?: boolean;
}) {
  const showMesh = mesh ?? tone === 'light';
  return (
    <section
      id={id}
      className={cn(
        clip ? 'relative overflow-x-clip scroll-mt-24' : 'relative overflow-hidden scroll-mt-24',
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
        // light: aura-deep (2px) — dark: cyan/60 (1px)
        className={cn('w-6', tone === 'dark' ? 'h-px bg-aura/60' : 'h-0.5 bg-aura-deep')}
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
