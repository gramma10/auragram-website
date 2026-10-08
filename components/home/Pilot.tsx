'use client';

import { useEffect, useRef } from 'react';
import { useInView } from '@/lib/hooks';
import { pilot } from '@/lib/content';
import { PRICING } from '@/lib/config';
import { formatEUR } from '@/lib/format';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { Cta, CtaMicro } from '@/components/ui/Cta';
import { Frame } from '@/components/ui/Frame';
import { Brackets } from '@/components/ui/Brackets';
import { trackOnce } from '@/lib/analytics';

export function Pilot() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) trackOnce('pilot_section_view');
  }, [inView]);

  return (
    <Section tone="dark" id="pilot">
      <div ref={ref} className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <Eyebrow tone="dark">{pilot.eyebrow}</Eyebrow>
            <H2 tone="dark" className="pt-6">
              {pilot.h2}
            </H2>
          </Reveal>
          <Reveal delay={0.07}>
            <p className="t-body pt-6 text-fg">{pilot.body}</p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-6 pt-9">
              <div>
                <p className="whitespace-nowrap font-display text-[34px] font-extrabold leading-none tracking-tightest text-white tnum sm:text-[40px]">
                  {pilot.pricePrefix} <CountUp value={PRICING.pilotFromValue} format={formatEUR} />
                </p>
                <p className="pt-2 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-fg-dim">
                  τιμή εκκίνησης
                </p>
              </div>
              <div>
                <p className="font-display text-[34px] font-extrabold leading-none tracking-tightest text-white tnum sm:text-[40px]">
                  {pilot.duration}
                </p>
                <p className="pt-2 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-fg-dim">
                  μέχρι ζωντανό agent
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.21}>
            <div className="mt-10 flex flex-col items-start gap-3.5">
              <Cta where="pilot" />
              <CtaMicro tone="dark" />
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-4">
          <Reveal delay={0.07}>
            <Frame tone="dark" className="bg-white/[0.02]" interactive>
              <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
                <div>
                  <p className="eyebrow text-aura">ΤΙ ΠΕΡΙΛΑΜΒΑΝΕΙ</p>
                  <ul className="flex flex-col gap-3 pt-5">
                    {pilot.includes.map((x) => (
                      <li key={x} className="flex items-start gap-3">
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
                        <span className="text-[15px] leading-snug text-white/85">{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Αυτά είναι ΟΦΕΛΗ (κανένα συμβόλαιο, καμία κρυφή χρέωση) — όχι «ελλείψεις».
                  Ουδέτερο «—», ίδιο χρώμα κειμένου με την αριστερή στήλη. */}
                <div>
                  <p className="eyebrow text-fg-dim">ΧΩΡΙΣ</p>
                  <ul className="flex flex-col gap-3 pt-5">
                    {pilot.excludes.map((x) => (
                      <li key={x} className="flex items-start gap-3">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden
                          className="mt-[7px] shrink-0"
                        >
                          <path
                            d="M2.5 7h9"
                            stroke="#8C96A8"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-[15px] leading-snug text-white/85">{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Frame>
          </Reveal>

          {/* Η εγγύηση: το κομμάτι που κάνει το «ναι» φθηνό — το πρώτο που πιάνει το μάτι. */}
          <Reveal delay={0.14}>
            <div className="relative rounded-[20px] border border-aura/40 bg-aura/[0.07] p-6 sm:p-8">
              <Brackets tone="dark" mode="always" />
              <div className="flex items-center gap-3">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="shrink-0"
                >
                  <path
                    d="M12 2.5 4.5 5.3v5.6c0 4.5 3.1 8.6 7.5 10.1 4.4-1.5 7.5-5.6 7.5-10.1V5.3L12 2.5Z"
                    stroke="#22D3EE"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m8.6 12.2 2.5 2.5 4.4-4.6"
                    stroke="#22D3EE"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="eyebrow text-aura">ΕΓΓΥΗΣΗ</p>
              </div>
              <p className="pt-4 text-[17px] leading-relaxed text-white sm:text-[18px]">
                {pilot.guarantee}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
