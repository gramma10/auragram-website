import type { ReactNode } from 'react';
import { Eyebrow } from './Section';

/** Κοινό κέλυφος για /privacy και /terms. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="surface-dark px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <div className="mx-auto w-full max-w-3xl">
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h1 className="pt-6 font-display text-[30px] font-extrabold leading-[1.06] tracking-tightest text-white sm:text-[42px]">
            {title}
          </h1>
          <p className="pt-4 font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">
            Τελευταία ενημέρωση: {updated}
          </p>
        </div>
      </section>

      <section className="surface-light on-light px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">{children}</div>
      </section>
    </>
  );
}

export function LegalSection({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-ink/10 pt-8">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[12px] tabular-nums tracking-[0.1em] text-ink-soft">{n}</span>
        <h2 className="font-display text-[19px] font-extrabold tracking-tight text-ink sm:text-[21px]">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 pl-0 pt-4 text-[15px] leading-relaxed text-ink/75 sm:pl-[calc(12px+1rem)]">
        {children}
      </div>
    </section>
  );
}
