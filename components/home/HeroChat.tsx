'use client';

import { useEffect, useRef, useState } from 'react';
import { heroPhone } from '@/lib/content';
import { ChatPlayer } from '@/components/phone/ChatPlayer';
import { cn } from '@/lib/cn';

const MQ_MOBILE = '(max-width: 639px)';
const MQ_REDUCED = '(prefers-reduced-motion: reduce)';

/** Διάρκεια της εισόδου (πρέπει να συμφωνεί με το transition στο globals.css: .hero-phone[data-entered]). */
const ENTRANCE_MS = 800;
/** Ποσοστό του κινητού που πρέπει να μπει στο viewport για να ξεκινήσει η είσοδος. */
const ENTER_THRESHOLD = 0.35;

/** Mobile entrance mode: < 640px και χωρίς reduced motion. (Server: πάντα false.) */
const entranceMode = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ_MOBILE).matches && !window.matchMedia(MQ_REDUCED).matches;

/**
 * Το hero visual: πραγματική ελληνική συνομιλία AI Agent — ΕΝΑ κινητό.
 *
 * Mobile (< 640px, χωρίς reduced motion) — χρονική είσοδος (ΟΧΙ scroll-linked: το scroll-linked choreography δεν είναι αξιόπιστο στο iOS
 * WebKit — μεταβλητό viewport με τις μπάρες του Safari, momentum scroll, sticky μέσα σε transformed/overflow γονείς):
 *  • Κανονική ροή: κείμενο → CTA → checks → κινητό → λεζάντα → proof bar. Κανένα sticky, spacer ή scroll handler.
 *  • Όταν ≥ 35% του κινητού μπει στο viewport (IntersectionObserver, ΜΙΑ φορά) βάζουμε data-entered: CSS transition 800ms
 *    (transform + opacity μόνο) από rotate(−6°) scale(.92) translateY(16px) opacity .6 → ευθύ, πλήρες. Η συνομιλία ξεκινά όταν τελειώσει
 *    η είσοδος (transitionend, με fallback timer) — μία φορά, δεν ξαναρχίζει ποτέ.
 *  • Μετά την είσοδο: ήπιο idle float ±2px/6s στον ΕΣΩΤΕΡΙΚΟ wrapper (.hero-float) — μόνο CSS animation.
 *  • Το toast είναι έξω από την περιοχή της συνομιλίας (πάνω-δεξιά άκρο του κινητού) και κρυμμένο ως το βήμα της κράτησης.
 * Reduced motion: καμία είσοδος/float — η πλήρης συνομιλία φαίνεται στατικά (το ChatPlayer πάει στην τελική κατάσταση).
 * Desktop (≥ 640px): αμετάβλητο (συνομιλία σε loop).
 * Η λειτουργία ακολουθεί ζωντανά τα media queries (το CSS αντιδρά ζωντανά, άρα και το JS): αλλαγή πλάτους / περιστροφή δεν αφήνει το
 * κινητό κολλημένο στην αρχική κατάσταση.
 */
export function HeroChat() {
  // Το toast εμφανίζεται όταν ο agent κλείσει το ραντεβού (τελευταίο βήμα του σεναρίου).
  const [booked, setBooked] = useState(false);
  const [entrance, setEntrance] = useState(entranceMode);
  // Latched: η είσοδος ολοκληρώθηκε (δεν επιστρέφει ποτέ σε false).
  const [settled, setSettled] = useState(false);
  const started = !entrance || settled;

  const phone = useRef<HTMLDivElement>(null);

  // ── Mode: ακολουθεί τα media queries ──────────────────────────────────────
  useEffect(() => {
    const a = window.matchMedia(MQ_MOBILE);
    const r = window.matchMedia(MQ_REDUCED);
    const sync = () => setEntrance(entranceMode());
    sync();
    a.addEventListener('change', sync);
    r.addEventListener('change', sync);
    return () => {
      a.removeEventListener('change', sync);
      r.removeEventListener('change', sync);
    };
  }, []);

  // ── Είσοδος: IntersectionObserver (once) → data-entered → settled στο τέλος του transition ───────────────
  useEffect(() => {
    const P = phone.current;
    if (!entrance || !P || P.dataset.settled !== undefined) return;

    let timer = 0;
    let io: IntersectionObserver | null = null;

    const finish = () => {
      window.clearTimeout(timer);
      P.removeEventListener('transitionend', onEnd);
      P.dataset.settled = '';
      setSettled(true);
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.target === P && e.propertyName === 'transform') finish();
    };
    const enter = () => {
      P.dataset.entered = '';
      P.addEventListener('transitionend', onEnd);
      // Fallback: αν το transitionend δεν έρθει ποτέ (π.χ. στοιχείο κρυμμένο την ώρα της εισόδου) η συνομιλία ξεκινά ούτως ή άλλως.
      timer = window.setTimeout(finish, ENTRANCE_MS + 150);
    };

    if (P.dataset.entered !== undefined) {
      enter(); // το mode άλλαξε μέσα στην είσοδο
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io?.disconnect();
            enter();
          }
        },
        { threshold: ENTER_THRESHOLD }
      );
      io.observe(P);
    }

    return () => {
      io?.disconnect();
      window.clearTimeout(timer);
      P.removeEventListener('transitionend', onEnd);
    };
  }, [entrance]);

  return (
    <div className="hero-stage">
      <div ref={phone} className="hero-phone relative mx-auto w-[80%] max-w-[330px] sm:w-full">
        <div className="hero-float">
          {/* Toast: στο πάνω-δεξί άκρο του κινητού, ΕΞΩ από την περιοχή της συνομιλίας (καλύπτει μόνο το status bar/το περιθώριο) —
              ορατό μόνο μετά το κλείσιμο του ραντεβού. */}
          <div
            aria-hidden
            className={cn(
              'absolute -right-3 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-night-700 px-3.5 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] transition-all duration-500 ease-out max-sm:-right-5 max-sm:-top-1.5 max-sm:max-w-[172px] sm:-right-10',
              booked ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : '-translate-y-3 opacity-0 max-sm:translate-x-4 max-sm:translate-y-0 max-sm:scale-95'
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

          {/* key: αλλαγή mode → καθαρή επανεκκίνηση (αναμονή = ΜΟΝΟ το πρώτο μήνυμα· ποτέ μισή συνομιλία από άλλο mode) */}
          <ChatPlayer
            key={entrance ? 'entrance' : 'free'}
            scenario={heroPhone.scenario}
            playing={started}
            loop={!entrance}
            screenClassName="h-[600px] max-sm:h-[640px] sm:max-h-none"
            onFinishedChange={setBooked}
          />

          <p className="hero-caption pt-4 text-center font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">{heroPhone.caption}</p>
        </div>
      </div>
    </div>
  );
}
