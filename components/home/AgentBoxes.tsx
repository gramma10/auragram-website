import { agentsCopy, type agents } from '@/lib/content';
import { RichText } from '@/components/ui/RichText';
import { ToolChips } from '@/components/ui/ToolChip';
import { cn } from '@/lib/cn';

type Agent = (typeof agents)[number];

function Label({ children, tone }: { children: string; tone: 'rose' | 'cyan' }) {
  return (
    <p
      className={cn(
        'flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.12em]',
        tone === 'cyan' ? 'text-aura' : 'text-[#FCA5A5]'
      )}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', tone === 'cyan' ? 'bg-aura' : 'bg-[#FCA5A5]')} />
      {children}
    </p>
  );
}

/** Διακοσμητικό κυκλικό βέλος. Στο mobile δείχνει ↓: γυρίζει ο ΓΟΝΙΟΣ, το nudge τρέχει στο παιδί. */
export function Arrow({ play, size }: { play: boolean; size: number }) {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <span
        style={{ width: size, height: size }}
        className="grid shrink-0 rotate-90 place-items-center rounded-full border border-aura/35 bg-aura/[0.08] text-aura md:rotate-0"
      >
        <span className={cn('grid place-items-center', play && 'animate-arrow-nudge')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </div>
  );
}

/**
 * «ΣΗΜΕΡΑ → ΜΕ ΤΟΝ AGENT»: 3 στήλες minmax(0,1fr) 40px minmax(0,1fr) από md· στοίβα + ↓ κάτω από md.
 * minmax(0,1fr) παντού: τίποτα δεν μπορεί να διογκώσει τη στήλη (το bug των 472px).
 * Round 4: το «ΣΗΜΕΡΑ» παίρνει rose tint (dark surface), τα tool chips έχουν brand χρώματα.
 */
export function AgentBoxes({ agent, arrowPlay = false }: { agent: Agent; arrowPlay?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] md:items-stretch md:gap-3">
      <div className="min-w-0 rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.05)] p-4">
        <Label tone="rose">{agentsCopy.today}</Label>
        <p className="pt-2.5 text-[15px] font-medium leading-snug text-fg">
          <RichText parts={agent.today.text} />
        </p>
        <div className="pt-3">
          <ToolChips ids={agent.today.tools} />
        </div>
      </div>

      <Arrow play={arrowPlay} size={40} />

      <div className="min-w-0 rounded-2xl border border-aura/35 bg-aura/[0.06] p-4">
        <Label tone="cyan">{agentsCopy.withAgent}</Label>
        <p className="pt-2.5 text-[15px] font-medium leading-snug text-white">
          <RichText parts={agent.withAgent.text} />
        </p>
        <div className="pt-3">
          <ToolChips ids={agent.withAgent.tools} tone="cyan" />
        </div>
      </div>
    </div>
  );
}

/** Γραμμή αποτελέσματος — εμφανίζεται ΜΟΝΟ με πραγματικό δεδομένο (METRICS.agentResults). */
export function AgentResult({ result }: { result: string | null }) {
  if (!result) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-aura/25 bg-aura/[0.06] px-4 py-3">
      <span className="font-mono text-[13px] text-aura" aria-hidden>
        →
      </span>
      <p className="font-display text-[15px] font-extrabold tracking-tight text-aura tnum">{result}</p>
    </div>
  );
}
