'use client';

import { useState } from 'react';
import { heroPhone } from '@/lib/content';
import { ChatPlayer } from '@/components/phone/ChatPlayer';
import { cn } from '@/lib/cn';

/**
 * Το hero visual: πραγματική ελληνική συνομιλία AI Agent.
 * Όχι ρομπότ, όχι neural network. Το προϊόν, να δουλεύει.
 * Η συνομιλία παίζει μέσα από το <ChatPlayer> (loop). Το απαλό φόντο πίσω από τη συσκευή είναι το <Aura /> του hero.
 */
export function HeroChat() {
  // Το toast εμφανίζεται όταν ο agent κλείσει το ραντεβού (τελευταίο βήμα του σεναρίου).
  const [booked, setBooked] = useState(false);

  return (
    <div className="relative mx-auto w-[80%] max-w-[330px] sm:w-full">
      {/* Toast που «σπάει» το περίγραμμα του κινητού — μετά το κλείσιμο του ραντεβού */}
      <div
        aria-hidden
        className={cn(
          'absolute -right-3 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-night-700 px-3.5 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] transition-all duration-500 ease-out sm:-right-10',
          booked ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aura">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2.5" y="3.5" width="13" height="12" rx="2.5" stroke="#0A1020" strokeWidth="1.6" />
            <path d="M2.5 7.5h13M6 2v3M12 2v3" stroke="#0A1020" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M6.5 11.2l1.7 1.7 3.3-3.4" stroke="#0A1020" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-display text-[13px] font-bold leading-tight text-white">{heroPhone.toast}</span>
      </div>

      <ChatPlayer
        scenario={heroPhone.scenario}
        screenClassName="h-[600px] max-h-[70svh] sm:max-h-none"
        onFinishedChange={setBooked}
      />

      <p className="pt-4 text-center font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">
        {heroPhone.caption}
      </p>
    </div>
  );
}
