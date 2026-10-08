'use client';

import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { services as allServices, servicesSection } from '@/lib/content';
import { PROMISES } from '@/lib/config';
import { track } from '@/lib/analytics';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Cta, CtaMicro } from '@/components/ui/Cta';
import { Frame } from '@/components/ui/Frame';
import { RoiBlock } from '@/components/ui/RoiBlock';
import { cn } from '@/lib/cn';
import { scrollPillIntoView, useEdgeFade, useInView, usePrefersReducedMotion } from '@/lib/hooks';
import { ServiceVisualLazy } from './ServiceVisualLazy';

export function Services() {
  // Το ROI του tab 04 είναι υπόσχεση διαδικασίας: εμφανίζεται μόνο όταν το επιβεβαιώσουν οι ιδρυτές (PROMISES).
  const services = useMemo(
    () => allServices.map((s) => ({ ...s, roi: s.roi.gate && !PROMISES[s.roi.gate] ? null : s.roi })),
    []
  );
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // Τα visuals παίζουν όταν ο panel μπει στο viewport — όχι ήδη από το mount.
  const panelRef = useRef<HTMLDivElement>(null);
  const seen = useInView(panelRef, { once: true, amount: 0.25 });
  useEdgeFade(list);

  // Mobile pill row: το ενεργό pill έρχεται στο κέντρο (μόνο οριζόντιο scroll του row, όχι της σελίδας).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollPillIntoView(list.current, tabs.current[active], !reduced);
  }, [active, reduced]);

  const select = (i: number) => {
    if (i === active) return;
    setActive(i);
    track('service_tab_view', { tab: services[i].id });
  };

  // ARIA tabs: ←/→ (και ↑/↓ στο desktop), Home/End. Αυτόματη ενεργοποίηση στο focus. Το διαχωριστικό δεν είναι tab → δεν μετράει.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = services.length - 1;
    let next = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = active === last ? 0 : active + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = active === 0 ? last : active - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  const firstSecondary = services.findIndex((s) => s.secondary);

  return (
    <Section tone="dark" id="ypiresies">
      <Reveal>
        <Eyebrow tone="dark">{servicesSection.eyebrow}</Eyebrow>
        <H2 tone="dark" className="max-w-2xl pt-6">
          {servicesSection.h2}
        </H2>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 pt-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-10 lg:pt-12">
        {/* Mobile: οριζόντιο pill row (scroll-snap, fade άκρων) · Desktop: λίστα αριστερά με διαχωριστικό */}
        <div
          ref={list}
          role="tablist"
          aria-label={servicesSection.tabsLabel}
          onKeyDown={onKeyDown}
          className={cn(
            'fade-x fade-x-lg no-scrollbar relative flex snap-x snap-proximity items-center gap-1 overflow-x-auto overscroll-x-contain rounded-full border border-white/10 bg-white/[0.03] p-1',
            'lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0'
          )}
        >
          {services.map((item, i) => {
            const on = i === active;
            return (
              <Fragment key={item.id}>
                {i === firstSecondary && (
                  // Διαχωριστικό: ΔΕΝ είναι tab, δεν παίρνει focus. Mobile = λεπτή κάθετη γραμμή· desktop = mono ετικέτα.
                  <div role="presentation" aria-hidden className="flex shrink-0 items-center self-stretch lg:block lg:self-auto">
                    <span className="mx-1.5 block h-5 w-px bg-white/25 lg:hidden" />
                    <span className="hidden border-t border-white/[0.08] px-4 pb-2 pt-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-fg-dim lg:block">
                      {servicesSection.divider}
                    </span>
                  </div>
                )}
                <button
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`tab-${item.n}`}
                  aria-selected={on}
                  aria-controls={`panel-${item.n}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  className={cn(
                    'group flex min-h-[44px] shrink-0 snap-center items-center justify-center gap-4 whitespace-nowrap rounded-full px-4 text-center transition-colors duration-200',
                    'lg:justify-start lg:whitespace-normal lg:rounded-none lg:border-l-2 lg:px-4 lg:py-5 lg:text-left',
                    on
                      ? 'bg-aura text-night-900 lg:border-aura lg:bg-white/[0.045] lg:text-white'
                      : 'text-fg hover:text-white lg:border-white/10 lg:hover:border-white/30 lg:hover:bg-white/[0.02]'
                  )}
                >
                  <span
                    className={cn(
                      'hidden font-mono text-[12px] font-medium tabular-nums tracking-[0.1em] transition-colors lg:inline',
                      on ? 'text-aura' : 'text-fg-dim'
                    )}
                  >
                    {item.n}
                  </span>
                  <span className="font-display text-[14px] font-extrabold leading-tight tracking-tight lg:text-[18px]">
                    {item.tab}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'ml-auto hidden text-[13px] transition-all duration-200 lg:inline',
                      on ? 'translate-x-0 text-aura opacity-100' : '-translate-x-1 opacity-0'
                    )}
                  >
                    →
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>

        {/* Panels στοιβαγμένα στο ίδιο κελί → το ύψος = του ψηλότερου tab → μηδέν layout shift. Crossfade 200ms. */}
        <Frame tone="dark">
          <div ref={panelRef} className="grid">
            {services.map((s, i) => {
              const on = i === active;
              return (
                <div
                  key={s.n}
                  role="tabpanel"
                  id={`panel-${s.n}`}
                  aria-labelledby={`tab-${s.n}`}
                  aria-hidden={!on}
                  tabIndex={on ? 0 : -1}
                  className={cn(
                    'col-start-1 row-start-1 p-5 transition-[opacity,visibility] duration-200 ease-out motion-reduce:transition-none sm:p-8',
                    on ? 'visible opacity-100' : 'invisible opacity-0'
                  )}
                >
                  <ServiceVisualLazy n={s.n} play={on && seen} />

                  <p className="eyebrow pt-6 text-aura">ΤΙ ΚΕΡΔΙΖΕΤΕ</p>

                  <h3 className="h3 max-w-xl pt-4 text-white">{s.title}</h3>

                  <p className="t-small max-w-xl pt-3 text-fg">{s.gain}</p>

                  <ul className="flex flex-col gap-3 pt-6">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3.5">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden
                          className="mt-[7px] shrink-0"
                        >
                          <path
                            d="M2 7.5 5.5 11 12 3.5"
                            stroke="#22D3EE"
                            strokeWidth="2"
                            strokeLinecap="square"
                          />
                        </svg>
                        <span className="text-[15px] leading-relaxed text-fg">{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Κάθε υπηρεσία δείχνει τον αριθμό που κινεί (ή την υπόσχεση διαδικασίας) — πάνω από τα chips. */}
                  {s.roi && <RoiBlock spec={s.roi} run={on} className="mt-6 max-w-xl" />}

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.08] pt-5">
                    {s.chips.map((c) => (
                      <span key={c} className="chip-dark">
                        {c}
                      </span>
                    ))}
                  </div>

                  {s.priceFrom && (
                    <p className="pt-4 font-display text-[16px] font-extrabold tracking-tight text-white">
                      {servicesSection.priceFrom} {s.priceFrom}
                    </p>
                  )}

                  {s.link && (
                    <a href={s.link.href} className="mt-3 inline-flex min-h-[44px] items-center text-[14px] font-medium">
                      <span className="border-b border-aura/40 text-aura transition-colors hover:border-aura">{s.link.label}</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Frame>
      </div>

      <Reveal delay={0.08}>
        <div className="mt-10 flex flex-col items-start gap-3.5 border-t border-white/[0.08] pt-10">
          <Cta where="services" />
          <CtaMicro tone="dark" />
        </div>
      </Reveal>
    </Section>
  );
}
