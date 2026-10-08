import type { Metadata } from 'next';
import Image from 'next/image';
import { about } from '@/lib/content';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Frame } from '@/components/ui/Frame';
import { Cta, CtaMicro } from '@/components/ui/Cta';
import { TrackView } from '@/components/ui/TrackView';
import { StackIcon } from '@/components/about/StackIcon';

export const metadata: Metadata = {
  title: 'Ποιοι είμαστε',
  description:
    'Δύο άτομα, κανένα τμήμα πωλήσεων. Πώς δουλεύουμε και σε ποιους δεν κάνουμε.',
  alternates: { canonical: '/about' },
};

function PhotoSlot({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name}, συνιδρυτής της Auragram`}
        width={400}
        height={500}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/[0.03] p-4 text-center">
      <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">
        φωτογραφία
      </span>
      <span className="text-[12px] leading-snug text-fg-dim">
        {name} — πραγματική, όχι stock
      </span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <TrackView event="about_page_view" />

      {/* 1 — Hero */}
      <section className="surface-dark grid-bg relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:pt-40">
        <div className="relative mx-auto w-full max-w-page">
          <Eyebrow tone="dark">{about.hero.eyebrow}</Eyebrow>
          <h1 className="max-w-3xl pt-6 font-display text-[34px] font-extrabold leading-[1.04] tracking-tightest text-balance text-white sm:text-[52px] lg:text-[58px]">
            {about.hero.h1}
          </h1>
          <p className="pt-6 t-body text-fg">
            {about.hero.sub}
          </p>
        </div>
      </section>

      {/* 2 — Η ιστορία */}
      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <Eyebrow tone="light">{about.story.eyebrow}</Eyebrow>
            <H2 tone="light" className="pt-6">
              {about.story.h2}
            </H2>
          </Reveal>
          <div className="flex flex-col gap-5">
            {about.story.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="t-body text-ink/75">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* 3 — Οι δύο ιδρυτές */}
      <Section tone="dark">
        <Reveal>
          <Eyebrow tone="dark">ΟΙ ΔΥΟ ΜΑΣ</Eyebrow>
          <H2 tone="dark" className="max-w-2xl pt-6">
Οι άνθρωποι που θα δουλέψουν στο έργο σας
          </H2>
        </Reveal>

        <div className="grid gap-5 pt-12 lg:grid-cols-2">
          {about.people.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08} className="h-full">
              <Frame tone="dark" className="h-full" interactive>
                <div className="flex h-full flex-col gap-6 p-6 sm:flex-row sm:p-7">
                  <div className="aspect-[4/5] w-full shrink-0 overflow-hidden sm:w-[140px]">
                    <PhotoSlot name={p.name} src={p.photo || undefined} />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[13px] tabular-nums tracking-[0.1em] text-aura">
                        {p.n}
                      </span>
                      <span className="h-px flex-1 bg-white/10" aria-hidden />
                    </div>

                    <h3 className="pt-4 font-display text-[21px] font-extrabold tracking-tight text-white">
                      {p.name}
                    </h3>
                    <p className="pt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-aura">
                      {p.title}
                    </p>
                    <p className="pt-4 text-[15px] leading-relaxed text-fg">{p.body}</p>

                    <dl className="flex flex-col gap-2 pt-5 text-[13px] leading-relaxed">
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2.5">
                        <dt className="shrink-0 font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim sm:pt-[3px]">
                          Εκτός δουλειάς
                        </dt>
                        <dd className="text-fg">{p.detail}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex flex-wrap gap-4 pt-6">
                      <a
                        href={p.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim transition-colors hover:text-aura"
                      >
                        Instagram ↗
                      </a>
                      {p.linkedin && (
                        <a
                          href={p.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim transition-colors hover:text-aura"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Frame>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 4 — Πώς δουλεύουμε */}
      <Section tone="light">
        <Reveal>
          <Eyebrow tone="light">ΠΩΣ ΔΟΥΛΕΥΟΥΜΕ</Eyebrow>
          <H2 tone="light" className="max-w-2xl pt-6">
            Πέντε αρχές. Τις τηρούμε και όταν μας κοστίζουν.
          </H2>
        </Reveal>

        <ol className="pt-12">
          {about.principles.map((pr, i) => (
            <Reveal as="li" key={pr.n} delay={i * 0.05}>
              <div className="grid gap-3 border-t border-ink/10 py-7 sm:grid-cols-[64px_1fr] sm:gap-8">
                <span className="font-mono text-[13px] tabular-nums tracking-[0.1em] text-ink-soft">
                  {pr.n}
                </span>
                <div>
                  <h3 className="max-w-2xl font-display text-[19px] font-extrabold leading-snug tracking-tight text-ink sm:text-[22px]">
                    {pr.title}
                  </h3>
                  <p className="max-w-prose pt-2.5 text-[15px] leading-relaxed text-ink/70">
                    {pr.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* 5 — Με τι χτίζουμε (λογότυπα, ομαδοποιημένα — μία λίστα στο content.ts → about.stack) */}
      <Section tone="dark">
        <Reveal>
          <Eyebrow tone="dark">{about.stackSection.eyebrow}</Eyebrow>
          <H2 tone="dark" className="max-w-2xl pt-6">
            {about.stackSection.h2}
          </H2>
          <p className="max-w-xl pt-5 text-[15px] leading-relaxed text-fg">{about.stackSection.sub}</p>
        </Reveal>

        <div className="flex flex-col gap-10 pt-12">
          {about.stack.map((g, gi) => (
            <Reveal key={g.group} delay={Math.min(gi, 3) * 0.05}>
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-aura">{g.group}</p>
              <ul className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                {g.items.map((it) => (
                  <li
                    key={it.name}
                    className="flex min-w-0 items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                      <StackIcon name={it.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[15px] font-extrabold leading-tight tracking-tight text-white">{it.name}</span>
                      <span className="block pt-1 text-[13px] leading-snug text-fg-dim">{it.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 6 — Σε ποιους δεν κάνουμε */}
      <Section tone="dark">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <Eyebrow tone="dark">ΕΙΛΙΚΡΙΝΕΙΑ</Eyebrow>
            <H2 tone="dark" className="pt-6">
              {about.notFor.h2}
            </H2>
          </Reveal>

          <ul className="flex flex-col">
            {about.notFor.items.map((x, i) => (
              <Reveal as="li" key={x} delay={i * 0.06}>
                <div className="flex items-start gap-4 border-t border-white/10 py-5">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className="mt-[6px] shrink-0">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" className="text-fg-dim" />
                  </svg>
                  <p className="text-[15px] leading-relaxed text-fg">{x}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* 7 — Διαφάνεια τιμών & CTA */}
      <Section tone="light" className="pb-sticky lg:pb-32">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow tone="light" className="justify-center">
              ΤΙΜΕΣ
            </Eyebrow>
            <p className="pt-6 font-display text-[20px] font-extrabold leading-snug tracking-tight text-ink text-balance sm:text-[26px]">
              {about.pricingLine}
            </p>
            <div className="flex flex-col items-center gap-3.5 pt-10">
              <Cta tone="light" where="about_footer" />
              <CtaMicro tone="light" />
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
