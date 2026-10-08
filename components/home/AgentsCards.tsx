'use client';

import { useEffect, useRef, useState } from 'react';
import { agents, agentsCopy } from '@/lib/content';
import { useInView } from '@/lib/hooks';
import { trackOnce } from '@/lib/analytics';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/ui/Reveal';
import { AgentBoxes, AgentResult } from './AgentBoxes';
import { AgentGainPill } from './AgentGain';

type Agent = (typeof agents)[number];

function AgentCard({
  agent,
  index,
  active,
  onActivate,
  cardRef,
}: {
  agent: Agent;
  index: number;
  active: boolean;
  onActivate: (i: number) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Μία φορά: το βέλος κάνει ένα nudge 6px όταν η κάρτα μπει στο viewport. Τίποτα άλλο.
  const inView = useInView(ref, { once: true, amount: 0.4 });

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
    <div ref={ref} className="h-full">
      {/* Το .agent-card είναι ΕΞΩ από το Frame (που έχει overflow-hidden): το φωτεινό περίγραμμα ζει στο ::before του. */}
      <div
        ref={cardRef}
        data-i={index}
        data-active={active}
        className="agent-card h-full rounded-[20px]"
        onMouseEnter={() => onActivate(index)}
        onFocusCapture={() => onActivate(index)}
      >
        <Frame tone="dark" interactive className="h-full transition-colors duration-300 hover:border-white/20">
          <div className="flex h-full flex-col gap-4 p-4 sm:gap-5 sm:p-7">
            {/* Header (κεντραρισμένο) */}
            <header className="flex flex-col items-center gap-2.5 text-center">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-aura">
                {agent.n} · {agentsCopy.eyebrow}
              </p>
              <h3 className="h3 text-white">{agent.name}</h3>
              <AgentGainPill gain={agent.gain} />
            </header>

            <AgentBoxes agent={agent} arrowPlay={inView} />

            <AgentResult result={agent.result} />
          </div>
        </Frame>
      </div>
    </div>
  );
}

/**
 * Agents — before → after cards (το μοναδικό layout μετά το Round 4).
 * Μία στήλη 4 full-width καρτών (max ~920px, κεντραρισμένη): κάθε κάρτα χρειάζεται πλάτος για τα δύο κουτιά της.
 * grid-cols-1 = minmax(0,1fr) ώστε τίποτα να μη ξεχειλίζει.
 *
 * Ενεργή κάρτα = αυτή που διασχίζει τη ζώνη του κέντρου του viewport (IntersectionObserver rootMargin -45% 0 -45% 0).
 * Στο desktop ενεργοποιεί και το hover/focus. Η ενεργή κάρτα παίρνει το «σάρωμα» φωτός γύρω από το περίγραμμα
 * (βλ. .agent-card στο globals.css) και μετά σταθερή απαλή λάμψη. Ένα και μόνο element κινείται κάθε φορά.
 */
export function AgentsCards() {
  const [active, setActive] = useState(-1);
  const els = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div data-agents-variant="cards" className="mx-auto grid max-w-[920px] grid-cols-1 gap-4 sm:gap-5">
      {agents.map((a, i) => (
        <Reveal key={a.id} delay={i * 0.07}>
          <AgentCard
            agent={a}
            index={i}
            active={active === i}
            onActivate={setActive}
            cardRef={(el) => {
              els.current[i] = el;
            }}
          />
        </Reveal>
      ))}
    </div>
  );
}
