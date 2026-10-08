'use client';

import { useEffect, useRef, useState } from 'react';
import { process as processCopy } from '@/lib/content';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';

const steps = processCopy.steps;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * 4 βήματα με scroll-linked γραμμή προόδου.
 *
 *  ≥ 1024px : 4 στήλες, οριζόντια γραμμή πίσω από τις κάρτες.
 *  < 1024px : κάθετο timeline αριστερά (και σε tablet — μια οριζόντια γραμμή σε 2×2 δεν διαβάζεται ως μονοπάτι).
 *
 * Πρόοδος p (0 → 1):  0% όταν η κορυφή του section φτάσει στο 70% του viewport,
 *                     100% όταν το κέντρο της ΤΕΛΕΥΤΑΙΑΣ κάρτας φτάσει στο 50% του viewport.
 * Υλοποίηση: ένας passive scroll listener + rAF· γράφει μόνο transform (scale) στα segments.
 * Δεν βασίζεται σε CSS scroll-driven animations (animation-timeline): το WebKit/iOS (και ο in-app browser
 * του Instagram) δεν τα υποστηρίζουν παντού — έτσι η συμπεριφορά είναι ΙΔΙΑ σε κάθε browser και ακριβής.
 *
 * Κάθε κόμβος γεμίζει cyan όταν τον φτάσει η γραμμή· το νούμερο της κάρτας πάει από ink/50 σε ink και το
 * περίγραμμα δυναμώνει. Το κείμενο του σώματος ΔΕΝ ξεθωριάζει ποτέ (πλήρης αντίθεση πάντα).
 * prefers-reduced-motion → η γραμμή και όλοι οι κόμβοι εμφανίζονται γεμάτοι.
 */
export function ProcessSteps() {
  const olRef = useRef<HTMLOListElement>(null);
  const segs = useRef<(HTMLSpanElement | null)[]>([]);
  const t = useRef<number[]>(steps.map((_, i) => i / (steps.length - 1)));
  const [active, setActive] = useState<boolean[]>(() => steps.map(() => false));
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const ol = olRef.current;
    if (!ol) return;
    const lis = Array.from(ol.children) as HTMLElement[];
    const last = steps.length - 1;

    const paint = (p: number) => {
      const th = t.current;
      for (let i = 0; i < last; i++) {
        const f = clamp((p - th[i]) / (th[i + 1] - th[i] || 1));
        segs.current[i]?.style.setProperty('--f', String(f));
      }
      const next = th.map((x, i) => (i === 0 ? p > 0.001 : p >= x - 0.0005));
      setActive((cur) => (cur.every((v, i) => v === next[i]) ? cur : next));
    };

    if (reduced) {
      paint(1);
      return;
    }

    // Θέση των κόμβων πάνω στον κύριο άξονα → ποσοστό της γραμμής στο οποίο βρίσκεται ο καθένας.
    const measure = () => {
      const row = getComputedStyle(ol).gridTemplateColumns.split(' ').length > 1;
      const pos = lis.map((li) => (row ? li.offsetLeft + li.offsetWidth / 2 : li.offsetTop + 19));
      const span = pos[last] - pos[0] || 1;
      t.current = pos.map((x) => (x - pos[0]) / span);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = ol.closest('section');
      if (!sec) return;
      const vh = window.innerHeight;
      const a = 0.7 * vh - sec.getBoundingClientRect().top; // πόσο «πέρασε» το 0%
      // Κέντρο της τελευταίας κάρτας από τη ΔΙΑΤΑΞΗ (offsetTop), όχι από το getBoundingClientRect: το δεύτερο
      // περιλαμβάνει το transform του fade-up (14px) όσο η κάρτα εμφανίζεται και θα καθυστερούσε το 100%.
      const lastCenter = ol.getBoundingClientRect().top + lis[last].offsetTop + lis[last].offsetHeight / 2;
      const toEnd = lastCenter - 0.5 * vh; // πόσο απομένει ως το 100%
      const total = a + toEnd; // το σύνολο της διαδρομής, με τις τρέχουσες θέσεις
      // Στα τελευταία ~0.3% θεωρούμε τη διαδρομή ολοκληρωμένη: τα scroll offsets στρογγυλοποιούνται σε pixel,
      // οπότε το «ακριβώς 100%» αλλιώς θα έχανε τον τελευταίο κόμβο για κλάσμα pixel.
      const p = total > 0 ? clamp(a / total) : 1;
      paint(p > 0.997 ? 1 : p);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    remeasure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);
    const ro = new ResizeObserver(remeasure); // αλλαγή ύψους καρτών (γραμματοσειρές, wrap)
    ro.observe(ol);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <ol ref={olRef} className="relative mt-12 grid grid-cols-1 gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-6">
      {steps.map((s, i) => (
        <Reveal as="li" key={s.n} delay={i * 0.07} className="h-full">
          <div
            data-active={active[i] ? 'true' : 'false'}
            className="group/step relative h-full pl-9 lg:pl-0 lg:pt-10"
          >
            {/* κόμβος */}
            <span
              aria-hidden
              className="absolute left-0 top-3 z-10 h-[14px] w-[14px] rounded-full border-2 border-white/30 bg-night-900 transition-colors duration-300 group-data-[active=true]/step:border-aura group-data-[active=true]/step:bg-aura lg:left-1/2 lg:top-0 lg:-translate-x-1/2"
            />

            {/* τμήμα γραμμής από αυτόν τον κόμβο ως τον επόμενο: track 1px ink/20 + fill 2px dark cyan */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-[6px] top-[19px] h-[calc(100%+20px)] w-px bg-white/15 lg:left-1/2 lg:top-[7px] lg:h-px lg:w-[calc(100%+24px)]"
              >
                <span
                  ref={(el) => {
                    segs.current[i] = el;
                  }}
                  className="absolute -left-[0.5px] top-0 h-full w-[2px] origin-top bg-aura [transform:scaleY(var(--f,0))] lg:left-0 lg:-top-[0.5px] lg:h-[2px] lg:w-full lg:origin-left lg:[transform:scaleX(var(--f,0))]"
                />
              </span>
            )}

            <Frame
              tone="dark"
              className="h-full bg-white/[0.03] transition-colors duration-300 group-data-[active=true]/step:!border-aura/50"
              interactive
            >
              <div className="flex h-full flex-col p-5 sm:p-6">
                <span className="font-display text-[44px] font-extrabold leading-none tracking-tightest text-white/45 tnum transition-colors duration-300 group-data-[active=true]/step:text-white sm:text-[48px]">
                  {s.n}
                </span>

                <h3 className="h3 pt-4 text-white">{s.title}</h3>
                <p className="pt-1.5 font-mono text-[12px] font-medium tracking-[0.04em] text-fg-dim">
                  {s.meta}
                </p>
                <p className="t-small pt-3.5 text-fg">{s.body}</p>

                <div className="mt-auto border-t border-white/10 pt-4">
                  <p className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-fg-dim">
                    {processCopy.takeLabel}
                  </p>
                  <p className="flex items-center gap-2 pt-1.5 font-display text-[15px] font-extrabold tracking-tight text-white">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden
                      className="shrink-0"
                    >
                      <path
                        d="M2.5 7.4 5.6 10.5 11.5 3.8"
                        stroke="#22D3EE"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {s.take}
                  </p>
                </div>
              </div>
            </Frame>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
