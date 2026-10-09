'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { industriesSection, roiCopy } from '@/lib/content';
import { industries, type Industry, type IndustryStat } from '@/lib/industries';
import { track } from '@/lib/analytics';
import { setIndustry } from '@/lib/roiStore';
import { scrollPillIntoView, useEdgeFade, useInView, usePrefersReducedMotion } from '@/lib/hooks';
import { useLazyReady } from '@/components/ui/LazyMount';
import { Cta } from '@/components/ui/Cta';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { EstimatePill } from '@/components/ui/RoiBlock';
import { ToolChips } from '@/components/ui/ToolChip';
import { cn } from '@/lib/cn';
import { IndustryIcon } from './IndustryIcon';

type Via = 'tap' | 'swipe' | 'arrow' | 'deeplink';

const COUNT = industries.length;

/** Deep link: `/?industry=<slug>` → index του κλάδου, αλλιώς -1 (άγνωστο slug = σιωπηλά το πρώτο tab). */
function slugFromUrl(): number {
  try {
    const slug = new URLSearchParams(window.location.search).get('industry');
    return industries.findIndex((i) => i.slug === slug);
  } catch {
    return -1;
  }
}

/**
 * «≈ 870 €» / «24 ώρ.» → μεγάλο νούμερο + μικρά prefix/unit ώστε 3 στήλες σε μία σειρά να χωράνε στα 360px χωρίς να μικρύνει το
 * νούμερο κάτω από τα 28px. Τα ψηφία κάνουν count-up· τιμές όπως «24/7» μένουν στατικές.
 */
function StatValue({ value, run }: { value: string; run: boolean }) {
  const m = /^([^\d]*?)(\d+)(.*)$/.exec(value);
  if (!m || m[3].startsWith('/')) return <>{value}</>;
  const [, prefix, digits, suffix] = m;
  const attached = /^[\s ]*[″%+€]/.test(suffix); // σύμβολα που μένουν στο μεγάλο νούμερο
  const unit = attached ? '' : suffix.trim();
  return (
    <>
      {prefix.trim() && <span className="mr-0.5 align-baseline text-[0.5em] font-bold opacity-80">{prefix.trim()}</span>}
      <AnimatedNumber value={Number(digits)} format={(n) => String(Math.round(n))} run={run} duration={400} />
      {attached ? suffix : null}
      {unit && <span className="ml-1 align-baseline text-[0.46em] font-bold opacity-80">{unit}</span>}
    </>
  );
}

function Stat({ stat, run }: { stat: IndustryStat; run: boolean }) {
  return (
    <li className="flex min-w-0 flex-col items-start px-2.5 py-3 sm:px-5 sm:py-5">
      {/* σταθερή γραμμή για το pill → όλες οι στήλες έχουν τον ίδιο ρυθμό ακόμα κι όταν δεν έχουν «ΕΚΤΙΜΗΣΗ» */}
      <span className="flex h-5 items-center">{stat.estimate && <EstimatePill tone="light" compact />}</span>
      <p className="whitespace-nowrap pt-1.5 font-display text-[clamp(28px,5vw,40px)] font-extrabold leading-none tracking-tight text-ink tnum">
        {stat.marker ? (
          <span className="marker">
            <StatValue value={stat.value} run={run} />
          </span>
        ) : (
          <StatValue value={stat.value} run={run} />
        )}
      </p>
      <p className="pt-2 text-[12px] font-medium uppercase leading-snug tracking-[0.03em] text-ink-soft">{stat.label}</p>
    </li>
  );
}

function Compare({ industry }: { industry: Industry }) {
  const list = (items: Industry['today']) => (
    <ul className="flex flex-col gap-1.5 pt-2 sm:gap-2 sm:pt-2.5">
      {items.map((b) => (
        <li key={b.lead} className="text-[13px] leading-[1.35] text-ink sm:text-[14px] sm:leading-snug">
          <strong className="font-bold">{b.lead}:</strong> {b.text}
        </li>
      ))}
    </ul>
  );
  const circle = 'grid place-items-center rounded-full border border-ink/10 bg-white text-ink';
  return (
    <div className="grid grid-cols-1 gap-1 pt-3 sm:pt-4 md:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] md:items-stretch md:gap-3">
      {/* ΣΗΜΕΡΑ: #FEF3F2 / #FECDCA, label #B42318 */}
      <div className="flex min-w-0 flex-col rounded-2xl border border-[#FECDCA] bg-[#FEF3F2] p-3 sm:p-4">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-[#B42318]">
          <span aria-hidden>✕</span> {industriesSection.today}
        </p>
        {list(industry.today)}
        <div className="mt-auto pt-2.5">
          <ToolChips ids={industry.tools.today} surface="light" />
        </div>
      </div>

      {/* βέλος: ↓ ανάμεσα στα στοιβαγμένα κουτιά (mobile), 40px κυκλικό ανάμεσα στα δύο (desktop) */}
      <div aria-hidden className="flex items-center justify-center">
        <span className={cn(circle, 'h-8 w-8 rotate-90 md:h-10 md:w-10 md:rotate-0')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* ΜΕ ΤΗΝ AURAGRAM: aura-tint #ECFEFF / aura-line #A5F3FC, label aura-deep #0E7490 */}
      <div className="flex min-w-0 flex-col rounded-2xl border border-aura-line bg-aura-tint p-3 sm:p-4">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-aura-deep">
          <span aria-hidden>✓</span> {industriesSection.after}
        </p>
        {list(industry.after)}
        <div className="mt-auto pt-2.5">
          <ToolChips ids={industry.tools.after} surface="light" />
        </div>
      </div>
    </div>
  );
}

export default function IndustriesBody() {
  useLazyReady();
  const reduced = usePrefersReducedMotion();
  const [deep] = useState(slugFromUrl);
  const [active, setActive] = useState(deep >= 0 ? deep : 0);

  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<HTMLDivElement>(null);
  const inView = useInView(panels, { once: false, amount: 0.2 });
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEdgeFade(list);

  const select = (i: number, via: Via) => {
    if (i === active) return;
    setActive(i);
    track('industry_view', { industry: industries[i].slug, via });
  };
  const step = (dir: 1 | -1, via: Via) => select((active + dir + COUNT) % COUNT, via);

  // «Τελευταίος κλάδος που είδε» → hidden field της φόρμας. Ο αρχικός (πρώτος) μετράει μόλις το panel μπει στο viewport.
  useEffect(() => {
    if (inView || deep >= 0) setIndustry(industries[active].slug);
  }, [inView, active, deep]);

  // Deep link: event + scroll στο section. Δεύτερο scroll μετά από λίγο, αν ο επισκέπτης δεν έχει κουνηθεί —
  // τα lazy sections από πάνω αλλάζουν ύψος καθώς φορτώνουν και θα μετέθεταν τον στόχο.
  useEffect(() => {
    if (deep < 0) return;
    track('industry_view', { industry: industries[deep].slug, via: 'deeplink' });
    const go = () => document.getElementById('kladoi')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    go();
    let y = window.scrollY;
    const t = window.setTimeout(() => {
      if (Math.abs(window.scrollY - y) < 4) go();
    }, 900);
    const mark = () => {
      y = -9999; // ο χρήστης κύλησε μόνος του → δεν το ξαναδιορθώνουμε
    };
    window.addEventListener('wheel', mark, { passive: true, once: true });
    window.addEventListener('touchmove', mark, { passive: true, once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('wheel', mark);
      window.removeEventListener('touchmove', mark);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mobile pill row: το ενεργό pill στο κέντρο (οριζόντιο scroll μόνο του row).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (deep < 0) return;
    }
    scrollPillIntoView(list.current, tabs.current[active], !reduced);
  }, [active, reduced, deep]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (active + 1) % COUNT;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (active - 1 + COUNT) % COUNT;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = COUNT - 1;
    else return;
    e.preventDefault();
    select(next, 'arrow');
    tabs.current[next]?.focus();
  };

  // Swipe στο panel (mobile): οριζόντια ≥ 50px και σαφώς πιο οριζόντια παρά κάθετη → αλλαγή κλάδου. Τα κάθετα scrolls αγνοούνται.
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1, 'swipe');
  };

  const circle =
    'flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:bg-ink/[0.04]';
  const titleCls = 'h3 pt-2 text-ink';
  const subCls = 'pt-1.5 text-[14px] leading-snug text-ink-soft sm:pt-2 sm:text-[15px]';
  const cur = industries[active];

  return (
    <div>
      {/* Mobile: pills + ‹ › στην ΙΔΙΑ γραμμή (εξοικονόμηση ύψους). md+: μετρητής πάνω-αριστερά, ‹ › πάνω-δεξιά, pills κεντραρισμένα. */}
      <div className="relative flex items-center gap-2 md:block md:pt-14">
        <p className="absolute left-0 top-3 hidden font-mono text-[12px] font-medium tabular-nums tracking-[0.12em] text-ink-soft md:block" aria-hidden>
          {String(active + 1).padStart(2, '0')} / {String(COUNT).padStart(2, '0')}
        </p>

        {/* Pills: ανενεργά = λευκό + ink/10 + ink κείμενο· ενεργό = ink (#0A1020) φόντο + λευκό κείμενο */}
        <div
          ref={list}
          role="tablist"
          aria-label={industriesSection.tabsLabel}
          onKeyDown={onKeyDown}
          className="fade-x fade-x-md no-scrollbar relative -my-2 flex min-w-0 flex-1 snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain px-0.5 py-2 md:flex-none md:flex-wrap md:justify-center md:overflow-visible"
        >
          {industries.map((ind, i) => {
            const on = i === active;
            return (
              <button
                key={ind.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`ind-tab-${ind.slug}`}
                aria-selected={on}
                aria-controls={`ind-panel-${ind.slug}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i, 'tap')}
                className={cn(
                  'inline-flex min-h-[44px] shrink-0 snap-center items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 px-4 font-display text-[14px] font-bold tracking-tight transition-colors duration-200',
                  on ? 'border-night-900 bg-night-900 text-white' : 'bg-white text-ink hover:border-ink/25'
                )}
              >
                <IndustryIcon name={ind.icon} />
                {ind.tab}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:absolute md:right-0 md:top-0 md:gap-2">
          <button type="button" onClick={() => step(-1, 'arrow')} aria-label={industriesSection.prev} className={circle}>
            <span aria-hidden className="text-[18px] leading-none">
              ‹
            </span>
          </button>
          <button type="button" onClick={() => step(1, 'arrow')} aria-label={industriesSection.next} className={circle}>
            <span aria-hidden className="text-[18px] leading-none">
              ›
            </span>
          </button>
        </div>
      </div>

      {/* Λευκό panel */}
      <div className="mt-3 rounded-[20px] border border-ink/[0.08] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,32,0.04),0_8px_24px_rgba(15,23,32,0.06)] sm:mt-5 sm:p-8">
        <p className="eyebrow flex items-center gap-2.5 text-ink-soft">
          <span aria-hidden className="h-0.5 w-6 bg-aura-deep" />
          {industriesSection.panelEyebrow}
        </p>

        {/* Τίτλος + υπότιτλος: ΕΝΑ ορατό στοιχείο που αλλάζει (aria-live="polite" πάνω στον ίδιο τον τίτλο → οι screen readers
            ακούνε τον κλάδο ΜΙΑ φορά). Αόρατοι sizers (aria-hidden) κρατούν το ύψος του ψηλότερου → καμία μετατόπιση στην αλλαγή. */}
        <div className="grid">
          <div className="col-start-1 row-start-1">
            <h3 aria-live="polite" aria-atomic="true" className={titleCls}>
              {cur.title}
            </h3>
            <p className={subCls}>{cur.sub}</p>
          </div>
          {industries.map((ind) => (
            <div key={ind.slug} aria-hidden className="pointer-events-none invisible col-start-1 row-start-1">
              <p className={cn(titleCls, 'h3')}>{ind.title}</p>
              <p className={subCls}>{ind.sub}</p>
            </div>
          ))}
        </div>

        {/* Panels στοιβαγμένα στο ίδιο κελί → το ύψος = του ψηλότερου κλάδου (μετρημένο από τον browser) → μηδέν layout shift. */}
        <div ref={panels} className="grid touch-pan-y" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {industries.map((ind, i) => {
            const on = i === active;
            const run = on && inView;
            return (
              <div
                key={ind.slug}
                role="tabpanel"
                id={`ind-panel-${ind.slug}`}
                aria-labelledby={`ind-tab-${ind.slug}`}
                aria-hidden={!on}
                className={cn(
                  'col-start-1 row-start-1 flex min-w-0 flex-col transition-[opacity,visibility] duration-[180ms] ease-out motion-reduce:transition-none',
                  on ? 'visible opacity-100' : 'invisible opacity-0'
                )}
              >
                <Compare industry={ind} />

                {/* Stats strip */}
                <ul className="mt-2.5 grid grid-cols-3 divide-x divide-ink/10 rounded-2xl bg-[#F4F4F0] sm:mt-4">
                  {ind.stats.map((st) => (
                    <Stat key={st.label} stat={st} run={run} />
                  ))}
                </ul>

                {ind.formula ? (
                  <p className="pt-2.5 text-[12px] leading-snug text-ink-soft tnum">{ind.formula}</p>
                ) : (
                  <a href="#ypologismos" className="mt-auto inline-flex min-h-[44px] items-center self-start pt-2 text-[14px] font-medium">
                    <span className="border-b-2 border-aura-deep text-ink transition-colors hover:border-ink">{roiCopy.calcLinkIndustry}</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Κάτω γραμμή + cyan CTA (μία φορά, κοινή για όλους τους κλάδους) */}
        <div className="mt-3 border-t border-ink/10 pt-3.5 sm:mt-6 sm:pt-6">
          <p className="max-w-xl font-display text-[15px] font-extrabold leading-snug tracking-tight text-ink sm:text-[18px]">
            {industriesSection.bottom}
          </p>
          <div className="pt-3">
            <Cta where="industries" className="max-sm:!px-4 max-sm:!text-[14px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
