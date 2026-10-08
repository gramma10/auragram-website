import type { CSSProperties } from 'react';
import { agents, agentsFeed } from '@/lib/content';
import { Reveal } from '@/components/ui/Reveal';

/**
 * «Μια νύχτα με τους agents σας» — ΕΝΑ κοινό live feed κάτω από τις κάρτες. Server component: καθαρό HTML + CSS, μηδέν client JS.
 * ΠΟΤΕ άδειο κουτί: και οι 6 γραμμές είναι πάντα στο DOM· πριν «φτάσουν» κάθονται στο 25% opacity και φωτίζονται η μία
 * μετά την άλλη (~500ms, βλ. .feed-row στο globals.css) όταν η κάρτα μπει στο viewport — μία φορά (το Reveal βάζει το .is-in).
 * Χωρίς JS / reduced motion → όλες 100%, χωρίς pulse.
 */
export function AgentsFeed() {
  const nameOf = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  return (
    <Reveal className="mx-auto mt-8 max-w-[920px] sm:mt-10">
      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-4 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[17px] font-extrabold leading-snug tracking-tight text-white sm:text-[20px]">
            {agentsFeed.title}
          </h3>
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-[12px] font-medium text-aura">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-aura animate-pulse-dot" />
            {agentsFeed.live}
          </span>
        </div>

        <ul className="flex flex-col gap-3.5 pt-5">
          {agentsFeed.rows.map((r, i) => (
            <li key={i} className="feed-row flex items-start gap-3" style={{ '--i': i } as CSSProperties}>
              <span className="w-[3.1rem] shrink-0 pt-[3px] font-mono text-[12px] tabular-nums text-fg-dim">{r.time}</span>
              <div className="min-w-0 flex-1">
                {/* tag: δική του γραμμή κάτω από την ώρα όταν δεν χωρά, αλλιώς ίδια γραμμή με το κείμενο */}
                <span className="mb-1 mr-2 inline-flex max-w-full items-center rounded-full border border-aura/30 bg-aura/[0.08] px-2 py-0.5 font-mono text-[12px] font-medium leading-tight text-aura sm:mb-0">
                  {nameOf(r.agent)}
                </span>
                <span className="text-[14px] leading-snug text-fg">{r.text}</span>
              </div>
              <span aria-hidden className="shrink-0 pt-[1px] text-[14px] text-aura">
                ✓
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
