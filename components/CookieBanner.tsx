'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CONSENT_EVENT, CONSENT_KEY, readConsent } from './Analytics';

/** GDPR banner. Καμία προεπιλεγμένη συγκατάθεση, καμία dark pattern. */
export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Καθυστέρηση ώστε να μην ανταγωνίζεται το LCP του hero.
    const t = setTimeout(() => setOpen(readConsent() === null), 1200);
    return () => clearTimeout(t);
  }, []);

  // Δημοσιεύει το ύψος του banner ως --cookie-h: το sticky CTA και το mini-bar του
  // calculator ανεβαίνουν από πάνω του αντί να κρύβονται πίσω του.
  useEffect(() => {
    const root = document.documentElement;
    const el = box.current;
    if (!open || !el) {
      root.style.removeProperty('--cookie-h');
      return;
    }
    const sync = () => root.style.setProperty('--cookie-h', `${window.innerHeight - el.getBoundingClientRect().top}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      root.style.removeProperty('--cookie-h');
    };
  }, [open]);

  const decide = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ιδιωτική περιήγηση — απλώς δεν το θυμόμαστε */
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setOpen(false);
  };

  if (!open) return null;

  // Αποδοχή και Απόρριψη: ΙΔΙΟ μέγεθος, ΙΔΙΟ στυλ — η απόρριψη είναι εξίσου εύκολη με την αποδοχή.
  const choice =
    'min-h-[44px] min-w-[72px] flex-1 rounded-full border border-white/25 bg-white/[0.06] px-3 font-display text-[13px] font-bold text-white transition-colors hover:bg-white/10';

  return (
    <div
      ref={box}
      role="dialog"
      aria-label="Συγκατάθεση cookies"
      className="fixed inset-x-2 bottom-[max(8px,env(safe-area-inset-bottom))] z-[60] rounded-2xl border border-white/[0.12] bg-night-800 p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md"
    >
      <p className="text-[13px] leading-snug text-fg">Cookies ανάλυσης μόνο με τη συγκατάθεσή σας.</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button onClick={() => decide('granted')} className={choice}>
          Αποδοχή
        </button>
        <button onClick={() => decide('denied')} className={choice}>
          Απόρριψη
        </button>
        <Link
          href="/privacy"
          className="inline-flex min-h-[44px] shrink-0 items-center px-1 text-[13px] text-aura underline underline-offset-2"
        >
          Πολιτική απορρήτου
        </Link>
      </div>
    </div>
  );
}
