import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Το «κινητό» του hero: τιτάνιο frame, πλαϊνά κουμπιά,
 * Dynamic Island, status bar, home indicator. Δεν ξέρει τίποτα για συνομιλίες —
 * το περιεχόμενο της οθόνης έρχεται ως children.
 */
export function PhoneFrame({
  time,
  header,
  screenClassName,
  children,
}: {
  /** Ώρα στο status bar */
  time: string;
  /** Header εφαρμογής κάτω από το status bar (null = lock screen) */
  header?: { title: string; sub: string } | null;
  /** Ύψος οθόνης, π.χ. 'h-[600px] max-h-[70svh] sm:max-h-none' */
  screenClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <span aria-hidden className="absolute -left-[3px] top-[88px] h-7 w-[3px] rounded-l-sm bg-[#2b3140]" />
      <span aria-hidden className="absolute -left-[3px] top-[132px] h-12 w-[3px] rounded-l-sm bg-[#2b3140]" />
      <span aria-hidden className="absolute -left-[3px] top-[190px] h-12 w-[3px] rounded-l-sm bg-[#2b3140]" />
      <span aria-hidden className="absolute -right-[3px] top-[150px] h-16 w-[3px] rounded-r-sm bg-[#2b3140]" />

      <div className="rounded-[50px] border border-white/[0.14] bg-gradient-to-b from-[#2a3142] to-[#111826] p-[9px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <div
          className={cn(
            'relative flex flex-col overflow-hidden rounded-[41px] bg-night-800',
            screenClassName
          )}
        >
          {/* Dynamic Island */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[9px] z-10 flex h-[26px] w-[88px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-3"
          >
            <span className="h-[7px] w-[7px] rounded-full bg-[#10192b] ring-1 ring-white/10" />
          </div>

          {/* status bar */}
          <div className="flex h-[44px] shrink-0 items-center justify-between px-7 pt-1 text-white" aria-hidden>
            <span className="text-[13px] font-semibold tabular-nums">{time}</span>
            <span className="flex items-center gap-1.5">
              <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                <rect x="0" y="7" width="3" height="4" rx="0.8" />
                <rect x="4.6" y="5" width="3" height="6" rx="0.8" />
                <rect x="9.2" y="2.5" width="3" height="8.5" rx="0.8" />
                <rect x="13.8" y="0" width="3" height="11" rx="0.8" />
              </svg>
              <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
                <rect x="0.5" y="0.5" width="22" height="11" rx="3.2" stroke="currentColor" opacity="0.4" />
                <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
                <path d="M24 4v4c.8-.3 1.5-1.1 1.5-2S24.8 4.3 24 4z" fill="currentColor" opacity="0.45" />
              </svg>
            </span>
          </div>

          {header && (
            <div className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.08] px-4 pb-3 pt-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aura/15 ring-1 ring-aura/40">
                <span className="h-2 w-2 rounded-full bg-aura animate-pulse-dot" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="font-display text-[12.5px] font-bold text-white">{header.title}</p>
                <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">{header.sub}</p>
              </div>
            </div>
          )}

          {children}

          {/* home indicator */}
          <div className="flex h-6 shrink-0 items-center justify-center" aria-hidden>
            <span className="h-[5px] w-[110px] rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
