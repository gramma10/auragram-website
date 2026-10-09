'use client';

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent } from 'react';
import { agents, agentsCopy } from '@/lib/content';
import { useInView, usePrefersReducedMotion } from '@/lib/hooks';
import { trackOnce } from '@/lib/analytics';
import { Frame } from '@/components/ui/Frame';
import { AgentBoxes, AgentResult } from './AgentBoxes';
import { AgentGainPill } from './AgentGain';

type Agent = (typeof agents)[number];

/** Απόσταση ανάμεσα στις κάρτες (gap-4) και βήμα του «peek» ανά κάρτα — πρέπει να ταιριάζουν με το CSS (.agent-stack-card). */
const GAP = 16;
const STEP = 10;
/** Καλυμμένη κάρτα: scale ως 0.94· το περιεχόμενο σβήνει ως 0 και το περίγραμμα θαμπώνει ως 40%. */
const SCALE_DROP = 0.06;
const EDGE_DIM = 0.6;
/** Το fade ξεκινά όταν η επόμενη κάρτα απέχει 55% του ύψους viewport από τη θέση όπου κολλά, και τελειώνει όταν φτάσει εκεί. */
const FADE_SPAN = 0.55;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

function AgentCard({
  agent,
  index,
  active,
  register,
  onFront,
}: {
  agent: Agent;
  index: number;
  active: boolean;
  register: (el: HTMLDivElement | null) => void;
  onFront: (e: FocusEvent<HTMLDivElement>, i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Μία φορά: το βέλος κάνει ένα nudge 6px όταν η κάρτα μπει στο viewport. Τίποτα άλλο.
  const inView = useInView(ref, { once: true, amount: 0.4 });

  useEffect(() => {
    register(ref.current);
    return () => register(null);
  }, [register]);

  useEffect(() => {
    if (inView) {
      // `agents_variant` μένει στο payload (πάντα 'cards') ώστε τα ιστορικά δεδομένα να παραμένουν συγκρίσιμα.
      trackOnce(
        'agent_card_view',
        { agent: agent.name, agent_id: agent.id, agents_variant: 'cards' },
        `agent_${agent.n}_cards`
      );
    }
  }, [inView, agent]);

  return (
    // .agent-card = glow (pseudo-element)· .agent-stack-card = sticky + transform (scale/dim από τον scroll handler).
    // Το tabIndex=0 επιτρέπει στο πληκτρολόγιο να «φέρει μπροστά» την κάρτα (onFocus) — η σειρά του DOM δεν αλλάζει.
    <div
      ref={ref}
      role="group"
      aria-labelledby={`agent-h-${agent.id}`}
      tabIndex={0}
      data-i={index}
      data-active={active}
      style={{ '--i': index } as CSSProperties}
      className="agent-card agent-stack-card rounded-[20px]"
      onFocus={(e) => onFront(e, index)}
    >
      {/* Συμπαγές φόντο (οι κάρτες καλύπτουν η μία την άλλη). Τρία ανεξάρτητα layers: το ΦΟΝΤΟ μένει πάντα ορατό, το ΠΕΡΙΓΡΑΜΜΑ
          ([data-edge]) θαμπώνει στο ~40% και το ΠΕΡΙΕΧΟΜΕΝΟ ([data-content]) σβήνει καθώς η επόμενη κάρτα την καλύπτει. */}
      <Frame tone="dark" interactive className="!border-transparent bg-night-800 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.55)]">
        <span
          data-edge
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] rounded-[20px] border border-white/[0.16] transition-colors duration-300 group-hover:border-white/30"
        />
        <div data-content className="flex flex-col gap-2 p-3 sm:gap-5 sm:p-7">
          {/* Header (κεντραρισμένο) */}
          <header className="flex flex-col items-center gap-1 text-center sm:gap-2.5">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-aura">
              {agent.n} · {agentsCopy.eyebrow}
            </p>
            <h3 id={`agent-h-${agent.id}`} className="h3 text-white">
              {agent.name}
            </h3>
            <AgentGainPill gain={agent.gain} />
          </header>

          <AgentBoxes agent={agent} arrowPlay={inView} />

          <AgentResult result={agent.result} />
        </div>
      </Frame>
    </div>
  );
}

/**
 * Agents — stacking cards. Οι 4 κάρτες είναι `position: sticky` (βλ. .agent-stack-card): η N κολλά στο top = clearance του top bar
 * + N × 10px και η επόμενη ανεβαίνει και την καλύπτει σαν τράπουλα.
 *
 * Καλυμμένη κάρτα: scale → ~0.94, ΠΕΡΙΕΧΟΜΕΝΟ opacity 1 → 0 (ease-out) και περίγραμμα → 40%, γραμμένα από ΕΝΑΝ passive, rAF-throttled
 * scroll handler (όχι CSS scroll timelines — αναξιόπιστα σε iOS/Instagram WebKit). Αγγίζουμε ΜΟΝΟ transform + opacity (κανένα filter).
 * Είναι scroll-linked, άρα αντιστρέφεται ομαλά προς τα πάνω. Το περιεχόμενο μένει στο DOM και στη σειρά ανάγνωσης/tab (καμία aria-hidden).
 * Ο handler τρέχει μόνο όσο η τράπουλα είναι κοντά στο viewport. Ενεργή (glow sweep) = η μπροστινή κάρτα, δηλαδή η τελευταία που
 * έχει φτάσει στη θέση της.
 *
 * Reduced motion: κανένα sticky/scale/dim (CSS) — κανονική κάθετη λίστα· η ενεργή κάρτα (σταθερή λάμψη) είναι αυτή που διασχίζει
 * το κέντρο του viewport. Το parent ΔΕΝ μπορεί να έχει overflow hidden/auto (σπάει το sticky) — το section χρησιμοποιεί overflow-x: clip.
 */
export function AgentsCards() {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);

  const registers = useRef(
    agents.map((_, i) => (el: HTMLDivElement | null) => {
      els.current[i] = el;
    })
  ).current;

  // ── Stacking: scroll handler ─────────────────────────────────────────────
  useEffect(() => {
    const host = root.current;
    if (reduced || !host) return;
    const cardEls = els.current;
    const last = agents.map(() => -1);
    const lastFade = agents.map(() => -1);
    const contents = cardEls.map((c) => c?.querySelector<HTMLElement>('[data-content]') ?? null);
    const edges = cardEls.map((c) => c?.querySelector<HTMLElement>('[data-edge]') ?? null);
    let tops: number[] = [];
    let raf = 0;

    const measure = () => {
      // τα «κολλημένα» top από το CSS (calc με --stack-top και --i) — διαβάζονται ΜΙΑ φορά ανά resize, όχι σε κάθε frame
      tops = els.current.map((el) => (el ? parseFloat(getComputedStyle(el).top) || 0 : 0));
    };

    const update = () => {
      raf = 0;
      const cards = els.current;
      const rects = cards.map((c) => c?.getBoundingClientRect());
      const vh = window.innerHeight;
      let front = -1;
      cards.forEach((c, i) => {
        const r = rects[i];
        if (!c || !r) return;
        if (r.top <= tops[i] + 1) front = i;
        let p = 0;
        let f = 0;
        const next = rects[i + 1];
        if (next) {
          const dist = next.top - tops[i + 1]; // px που απομένουν ώσπου η επόμενη κάρτα να φτάσει στη θέση της
          // πόσο έχει καλυφθεί (scale): 0 όταν η επόμενη είναι ακόμα κάτω από αυτήν, 1 όταν έχει φτάσει στη θέση της
          p = clamp(1 - dist / Math.max(1, c.offsetHeight - STEP));
          // fade περιεχομένου: ξεκινά στο 55% του viewport, ολοκληρώνεται στη θέση κόλλησης — ease-out
          const q = clamp(1 - dist / (FADE_SPAN * vh));
          f = 1 - (1 - q) * (1 - q);
        }
        if (Math.abs(p - last[i]) > 0.003) {
          last[i] = p;
          c.style.transform = p > 0 ? `scale(${(1 - SCALE_DROP * p).toFixed(4)})` : '';
        }
        if (Math.abs(f - lastFade[i]) > 0.004) {
          lastFade[i] = f;
          const ct = contents[i];
          const eg = edges[i];
          if (ct) ct.style.opacity = f > 0 ? (1 - f).toFixed(3) : '';
          if (eg) eg.style.opacity = f > 0 ? (1 - EDGE_DIM * f).toFixed(3) : '';
        }
      });
      setActive((prev) => (prev === front ? prev : front));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    // ο handler είναι συνδεδεμένος μόνο όσο η τράπουλα είναι κοντά στο viewport
    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      measure();
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', onResize);
      schedule();
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? attach() : detach()), { rootMargin: '300px 0px' });
    io.observe(host);

    return () => {
      io.disconnect();
      detach();
      if (raf) cancelAnimationFrame(raf);
      cardEls.forEach((c) => {
        if (c) c.style.transform = '';
      });
      contents.forEach((ct) => ct && (ct.style.opacity = ''));
      edges.forEach((eg) => eg && (eg.style.opacity = ''));
    };
  }, [reduced]);

  // ── Reduced motion: ενεργή = η κάρτα στο κέντρο του viewport (μόνο σταθερή λάμψη — το sweep είναι κρυμμένο από το CSS) ──
  useEffect(() => {
    if (!reduced) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  // ── Πληκτρολόγιο: το focus φέρνει την κάρτα μπροστά (scroll στη θέση όπου η κάρτα «κολλά») ──
  const bringToFront = (e: FocusEvent<HTMLDivElement>, i: number) => {
    if (reduced || !root.current || !e.currentTarget.matches(':focus-visible')) return;
    const cards = els.current;
    let y = 0;
    for (let j = 0; j < i; j++) y += (cards[j]?.offsetHeight ?? 0) + GAP;
    const stuck = parseFloat(getComputedStyle(e.currentTarget).top) || 0;
    const rootTop = root.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: rootTop + y - stuck, behavior: 'smooth' });
  };

  return (
    <div ref={root} data-agents-variant="cards" className="agent-stack mx-auto grid max-w-[920px] grid-cols-1 items-start gap-4">
      {agents.map((a, i) => (
        <AgentCard key={a.id} agent={a} index={i} active={active === i} register={registers[i]} onFront={bringToFront} />
      ))}
    </div>
  );
}
