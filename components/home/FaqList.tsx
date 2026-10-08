'use client';

import { useState } from 'react';
import { faq } from '@/lib/content';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';
import { useLazyReady } from '@/components/ui/LazyMount';

/** Το διαδραστικό accordion του FAQ — φορτώνεται lazy (βλ. Faq.tsx). Το markup ταιριάζει με το στατικό SSR. */
export default function FaqList() {
  useLazyReady();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-ink/10">
      {faq.map((item, i) => {
        const on = open === i;
        return (
          <Reveal key={item.q} delay={Math.min(i, 5) * 0.07}>
            <div className="border-b border-ink/10">
              <h3>
                <button
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  aria-controls={`faq-${i}`}
                  className="flex w-full items-start gap-4 py-5 text-left"
                >
                  <span className="mt-[3px] font-mono text-[12px] tabular-nums tracking-[0.1em] text-ink-soft">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'flex-1 font-display text-[16px] font-extrabold leading-snug tracking-tight transition-colors sm:text-[17px]',
                      on ? 'text-ink' : 'text-ink/70 hover:text-ink'
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'mt-1 shrink-0 text-[15px] transition-all duration-200',
                      on ? 'rotate-45 text-ink' : 'text-ink-soft'
                    )}
                  >
                    +
                  </span>
                </button>
              </h3>
              <div id={`faq-${i}`} hidden={!on} className="animate-fade-up pb-6 pl-[38px] pr-8">
                <p className="max-w-prose text-[15px] leading-relaxed text-ink/75">{item.a}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
