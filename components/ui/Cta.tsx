'use client';

import { CTA } from '@/lib/config';
import { track, type AuraEvent } from '@/lib/analytics';
import { cn } from '@/lib/cn';

/**
 * ΤΟ CTA. Ένα κείμενο, παντού, χωρίς παραλλαγές — γι’ αυτό το label
 * έρχεται από το config και δεν δέχεται prop.
 * Ένα χρώμα, επίσης: cyan και σε dark και σε light section (βλ. .btn-cta).
 */
export function Cta({
  event = 'hero_cta_click',
  className,
  where,
  full = false,
}: {
  /** @deprecated το κουμπί είναι πάντα cyan — κρατιέται για συμβατότητα με παλιές κλήσεις */
  tone?: 'dark' | 'light';
  event?: AuraEvent;
  className?: string;
  /** Ποιο section το πάτησε — πάει στα analytics. */
  where?: string;
  full?: boolean;
}) {
  return (
    <a
      href={CTA.href}
      // Το sticky bar παρατηρεί όλα τα [data-cta] (βλ. StickyCta).
      data-cta={where ?? 'cta'}
      onClick={() => track(event, { where })}
      className={cn('btn-cta', full ? 'w-full' : 'w-full sm:w-auto', className)}
    >
      <span>{CTA.label}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="btn-arrow"
      >
        <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
    </a>
  );
}

/** Το microcopy που πάει πάντα από κάτω. */
export function CtaMicro({ tone, className }: { tone: 'dark' | 'light'; className?: string }) {
  return (
    <p
      className={cn(
        'text-[14px] leading-snug',
        tone === 'dark' ? 'text-fg-dim' : 'text-ink-soft',
        className
      )}
    >
      {CTA.micro}
    </p>
  );
}
