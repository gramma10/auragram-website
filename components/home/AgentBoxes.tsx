import { agentsCopy, type agents } from '@/lib/content';
import { RichText } from '@/components/ui/RichText';
import { ChipRow } from '@/components/ui/ChipRow';
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

/** Διακοσμητικό κυκλικό βέλος. Στο mobile δείχνει ↓ (28px, γυρίζει ο ΓΟΝΙΟΣ)· από md 40px →. Το nudge τρέχει στο παιδί. */
export function Arrow({ play }: { play: boolean }) {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <span className="grid h-7 w-7 shrink-0 rotate-90 place-items-center rounded-full border border-aura/35 bg-aura/[0.08] text-aura md:h-10 md:w-10 md:rotate-0">
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
 * Το «ΣΗΜΕΡΑ» έχει rose tint (dark surface), τα tool chips brand χρώματα. Mobile: συμπαγές (κάθε κάρτα του stack πρέπει να χωρά ολόκληρη
 * ανάμεσα στο top bar και το dock) — tool chips σε μία γραμμή με οριζόντιο scroll.
 */
export function AgentBoxes({ agent, arrowPlay = false }: { agent: Agent; arrowPlay?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] md:items-stretch md:gap-3">
      <div className="min-w-0 rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.05)] p-3 sm:p-4">
        <Label tone="rose">{agentsCopy.today}</Label>
        <p className="pt-2 text-[14px] font-medium leading-snug text-fg sm:pt-2.5 sm:text-[15px]">
          <RichText parts={agent.today.text} />
        </p>
        <div className="pt-2 sm:pt-3">
          <ChipRow ids={agent.today.tools} />
        </div>
      </div>

      <Arrow play={arrowPlay} />

      <div className="min-w-0 rounded-2xl border border-aura/35 bg-aura/[0.06] p-3 sm:p-4">
        <Label tone="cyan">{agentsCopy.withAgent}</Label>
        <p className="pt-2 text-[14px] font-medium leading-snug text-white sm:pt-2.5 sm:text-[15px]">
          <RichText parts={agent.withAgent.text} />
        </p>
        <div className="pt-2 sm:pt-3">
          <ChipRow ids={agent.withAgent.tools} tone="cyan" />
        </div>
      </div>
    </div>
  );
}

/** Γραμμή αποτελέσματος — εμφανίζεται ΜΟΝΟ με πραγματικό δεδομένο (METRICS.agentResults). */
export function AgentResult({ result }: { result: string | null }) {
  if (!result) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-aura/25 bg-aura/[0.06] px-3 py-1.5 sm:px-4 sm:py-3">
      <span className="font-mono text-[13px] text-aura" aria-hidden>
        →
      </span>
      <p className="font-display text-[15px] font-extrabold tracking-tight text-aura tnum">{result}</p>
    </div>
  );
}
