import { faq } from '@/lib/content';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { FaqLazy } from './FaqLazy';

/** Στατική εκδοχή του accordion (SSR): πρώτη ερώτηση ανοιχτή, ίδιο markup/διαστάσεις με το FaqList. */
function FaqStatic() {
  return (
    <div className="border-t border-ink/10">
      {faq.map((item, i) => {
        const on = i === 0;
        return (
          <div key={item.q} className="border-b border-ink/10">
            <h3>
              <button
                type="button"
                tabIndex={-1}
                aria-expanded={on}
                aria-controls={`faq-s-${i}`}
                className="flex w-full items-start gap-4 py-5 text-left"
              >
                <span className="mt-[3px] font-mono text-[12px] tabular-nums tracking-[0.1em] text-ink-soft">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`flex-1 font-display text-[16px] font-extrabold leading-snug tracking-tight sm:text-[17px] ${on ? 'text-ink' : 'text-ink/70'}`}
                >
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={`mt-1 shrink-0 text-[15px] ${on ? 'rotate-45 text-ink' : 'text-ink-soft'}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div id={`faq-s-${i}`} hidden={!on} className="pb-6 pl-[38px] pr-8">
              <p className="max-w-prose text-[15px] leading-relaxed text-ink/75">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Server shell: heading + στατική λίστα στο HTML· το διαδραστικό accordion φορτώνει lazy (FaqLazy → FaqList). */
export function Faq() {
  return (
    <Section tone="light" id="erotiseis">
      <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
        <Reveal>
          <Eyebrow tone="light">ΕΡΩΤΗΣΕΙΣ</Eyebrow>
          <H2 tone="light" className="pt-6">
            Ό,τι ρωτάνε όλοι, πριν το ρωτήσετε.
          </H2>
        </Reveal>

        <FaqLazy placeholder={<FaqStatic />} />
      </div>
    </Section>
  );
}
