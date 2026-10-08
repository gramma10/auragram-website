import type { CSSProperties } from 'react';
import { servicePreviews } from '@/lib/content';
import { cn } from '@/lib/cn';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

const box =
  'pv flex h-full flex-col justify-center rounded-xl border border-white/[0.08] bg-night-800 p-4 sm:p-5';

/** Tab 02 — Αυτοματισμοί: ροή από κόμβους· οι συνδέσεις γεμίζουν με τη σειρά. */
function FlowPreview({ play }: { play: boolean }) {
  const nodes = servicePreviews.flow;
  return (
    <div aria-hidden="true" className={cn(box, play && 'is-play')}>
      <div className="flex flex-col items-stretch sm:flex-row sm:items-center">
        {nodes.map((label, i) => (
          <div key={label} className="flex flex-col items-center sm:flex-1 sm:flex-row">
            <div
              data-step
              style={step(i)}
              className="flex min-h-[38px] w-full items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-center text-[13px] font-medium leading-tight text-white/90 sm:min-h-[44px] sm:flex-1 sm:py-2"
            >
              {label}
            </div>
            {i < nodes.length - 1 && (
              <span className="relative block h-3 w-[2px] shrink-0 bg-white/10 sm:h-[2px] sm:w-6">
                <span
                  data-fill
                  data-fill-v
                  style={step(i)}
                  className="absolute inset-0 block bg-aura"
                />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tab 03 — Analytics & AI: δύο KPI tiles + sparkline. */
function DashboardPreview({ play }: { play: boolean }) {
  return (
    // overflow-hidden: το sparkline «σπάει» τα paddings και φτάνει στις άκρες του preview (τα στρογγυλά γωνιακά το κόβουν)
    <div aria-hidden="true" className={cn(box, 'overflow-hidden', play && 'is-play')}>
      <div className="grid grid-cols-2 gap-3">
        {servicePreviews.dashboardTiles.map((t, i) => (
          <div
            key={t.label}
            data-step
            style={step(i)}
            className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-3"
          >
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-fg-dim">{t.label}</p>
            <div className="flex items-center justify-between gap-2 pt-1.5">
              <p className="font-display text-[22px] font-extrabold leading-none text-white tnum">{t.value}</p>
              <span className="rounded-md border border-aura/30 bg-aura/[0.08] px-1.5 py-0.5 font-mono text-[12px] font-medium leading-none text-aura">
                {t.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sparkline σε ΠΛΗΡΕΣ πλάτος: αρνητικά margins ίσα με το padding του preview */}
      <svg
        viewBox="0 0 300 64"
        className="-mx-4 -mb-4 mt-4 block h-auto w-[calc(100%+2rem)] max-w-none sm:-mx-5 sm:-mb-5 sm:w-[calc(100%+2.5rem)]"
      >
        <path
          data-step
          style={step(2)}
          d="M0 52 L50 44 L100 48 L150 30 L200 34 L250 14 L300 8 L300 64 L0 64 Z"
          fill="rgba(34,211,238,0.08)"
        />
        <path
          data-draw
          pathLength={1}
          d="M0 52 L50 44 L100 48 L150 30 L200 34 L250 14 L300 8"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Tab 01 — compact chat: header εφαρμογής, δύο φούσκες και ένα chip παράδοσης σε άνθρωπο. */
function ChatPreview({ play }: { play: boolean }) {
  const c = servicePreviews.chat;
  return (
    <div aria-hidden="true" className={cn(box, 'overflow-hidden !p-0', play && 'is-play')}>
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-aura" />
        <span className="font-mono text-[12px] font-medium text-fg-dim">{c.app}</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        <div
          data-step
          style={step(0)}
          className="w-fit max-w-[88%] self-start rounded-[12px] rounded-bl-[4px] bg-white/[0.08] px-3 py-1.5 text-[13px] leading-snug text-white/90"
        >
          {c.them}
        </div>
        <div
          data-step
          style={step(1)}
          className="w-fit max-w-[88%] self-end rounded-[12px] rounded-br-[4px] bg-aura px-3 py-1.5 text-[13px] leading-snug text-night-900"
        >
          {c.agent}
        </div>
        <div
          data-step
          style={step(2)}
          className="mt-0.5 flex w-fit items-center gap-2 rounded-lg border border-aura/30 bg-aura/[0.08] px-2.5 py-1 font-mono text-[12px] font-medium text-aura"
        >
          <span>→</span>
          <span>{c.handoff}</span>
        </div>
      </div>
    </div>
  );
}

/** Tab 04 — mini app window: sidebar + header + 3 γραμμές πίνακα με status pills. HTML/CSS μόνο. */
function AppWindowPreview({ play }: { play: boolean }) {
  const a = servicePreviews.app;
  return (
    <div aria-hidden="true" className={cn(box, 'overflow-hidden !p-0', play && 'is-play')}>
      <div className="flex h-full">
        <div className="flex w-[52px] shrink-0 flex-col gap-2.5 border-r border-white/[0.08] bg-white/[0.02] px-3 py-3.5 sm:w-[64px]">
          <span className="h-2 w-5 rounded-full bg-aura" />
          <span className="h-2 w-full rounded-full bg-white/15" />
          <span className="h-2 w-full rounded-full bg-white/15" />
          <span className="h-2 w-3/4 rounded-full bg-white/15" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-3.5 py-2.5">
            <span className="truncate font-display text-[13px] font-extrabold tracking-tight text-white">{a.title}</span>
            <span className="h-5 w-5 shrink-0 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 px-3.5 py-2">
            {a.rows.map((r, i) => (
              <div
                key={r.name}
                data-step
                style={step(i)}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5"
              >
                <span className="truncate text-[12px] font-medium text-white/85">{r.name}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[12px] font-medium leading-none',
                    r.done ? 'border-aura/30 bg-aura/[0.08] text-aura' : 'border-white/[0.14] text-fg'
                  )}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tab 05 — mini browser: URL bar + hero block + product grid, με μικρή φούσκα chat κάτω δεξιά. */
function BrowserPreview({ play }: { play: boolean }) {
  const b = servicePreviews.browser;
  return (
    <div aria-hidden="true" className={cn(box, 'relative overflow-hidden !p-0', play && 'is-play')}>
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 py-2">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white/[0.06] px-2.5 py-0.5 text-center font-mono text-[12px] text-fg-dim">
          {b.url}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-3.5">
        <div data-step style={step(0)} className="flex h-[58px] flex-col justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5">
          <span className="h-2.5 w-2/5 rounded-full bg-white/30" />
          <span className="h-2 w-3/5 rounded-full bg-white/15" />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} data-step style={step(i + 1)} className="flex flex-col gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-2">
              <span className="min-h-0 flex-1 rounded-md bg-white/[0.07]" />
              <span className="h-1.5 w-3/4 rounded-full bg-white/20" />
              <span className="h-1.5 w-1/3 rounded-full bg-aura/70" />
            </div>
          ))}
        </div>
      </div>
      <div
        data-step
        style={step(4)}
        className="absolute bottom-2.5 right-2.5 max-w-[62%] rounded-[12px] rounded-br-[4px] bg-aura px-2.5 py-1.5 text-[12px] font-medium leading-snug text-night-900"
      >
        {b.chat}
      </div>
    </div>
  );
}

/** Όλα τα visuals έχουν το ίδιο ύψος → ο panel δεν έχει «νεκρό» χώρο ανάμεσα στα tabs. */
export function ServiceVisual({ n, play }: { n: string; play: boolean }) {
  return (
    <div className="h-[216px] sm:h-[200px]">
      {n === '01' ? (
        <ChatPreview play={play} />
      ) : n === '02' ? (
        <FlowPreview play={play} />
      ) : n === '03' ? (
        <DashboardPreview play={play} />
      ) : n === '04' ? (
        <AppWindowPreview play={play} />
      ) : (
        <BrowserPreview play={play} />
      )}
    </div>
  );
}
