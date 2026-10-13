'use client';

import { useEffect, useRef, useState } from 'react';
import { heroPhone } from '@/lib/content';
import { ChatPlayer } from '@/components/phone/ChatPlayer';
import { cn } from '@/lib/cn';

const MQ_MOBILE = '(max-width: 639px)';
const MQ_REDUCED = '(prefers-reduced-motion: reduce)';

/** Mobile scroll-driven mode: < 640px και χωρίς reduced motion. (Server: πάντα false.) */
const scrollMode = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ_MOBILE).matches && !window.matchMedia(MQ_REDUCED).matches;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Κείμενο hero: opacity 1 ως 15% του settle → 0 στο 70% (ease-in-out)· ταυτόχρονα lift −24px και scale 1 → .98
const FADE_FROM = 0.15;
const FADE_TO = 0.7;
const LIFT = -24;

const TILT = -9; // deg, STATE 0
const SCALE0 = 0.82; // STATE 0
const NAV_B = 72; // top bar: top-3 (12) + 60
const DOCK_FALLBACK = 72;

/**
 * Το hero visual: πραγματική ελληνική συνομιλία AI Agent — ΕΝΑ κινητό.
 *
 * Mobile (< 640px, χωρίς reduced motion) — «phone settle»:
 *  • STATE 0: κεκλιμένο (−9°), scale .82, κρυφοκοιτάει από το κάτω μέρος της πρώτης οθόνης (CSS: .hero-phone). Ήπιο idle float ±5px/5s ΜΟΝΟ
 *    όσο scrollY ≈ 0. Δείχνει ΜΟΝΟ το πρώτο μήνυμα του πελάτη· το toast είναι κρυμμένο.
 *  • SETTLE: scroll-linked (όχι χρονικό). Το διάστημα είναι [0, y1] όπου y1 = το scroll στο οποίο το sticky «πιάνει» (το κινητό φτάνει στη
 *    θέση pin = κέντρο ανάμεσα σε top bar και dock). rotate → 0° και scale → 1 (ease-out cubic) ΑΚΡΙΒΩΣ μέχρι εκεί, άρα στο 100% του settle
 *    το κινητό είναι ευθύ, πλήρους μεγέθους ΚΑΙ κεντραρισμένο — και δεν περνά ποτέ πάνω από το κείμενο του hero που φεύγει (η θέση ακολουθεί
 *    τη ροή της σελίδας, όχι transform).
 *  • PINNED: καρφωμένο ~50svh scroll (ο spacer .hero-pin — το padding ΔΕΝ δουλεύει με sticky). Η συνομιλία ξεκινά ΜΙΑ φορά τη στιγμή που
 *    ολοκληρώνεται το settle και δεν ξαναρχίζει ποτέ· το toast βγαίνει από το άκρο του κινητού στο βήμα κράτησης· η λεζάντα εμφανίζεται.
 *  • RELEASE: το sticky λήγει και το κινητό φεύγει κανονικά.
 *  • CINEMATIC (Round 8): (1) το κείμενο του hero ξεθωριάζει + ανεβαίνει (15% → 70% του settle)· (2) το κινητό «ανεβαίνει μόνο του»: η θέση του
 *    στην οθόνη = lerp(startTop, pinTop, easeInOutCubic(p)) — transform translateY = (καμπύλη − φυσική θέση ροής), που είναι ΑΚΡΙΒΩΣ 0 στο p=0 και
 *    στο p=1 (εκεί πιάνει το sticky) → απόλυτα ομαλό hand-off και προς τις δύο κατευθύνσεις· (3) levitation: σκιά/λάμψη που στενεύει καθώς
 *    ανεβαίνει + ήπιο float ±2.5px/6s όσο είναι καρφωμένο (σε εσωτερικό wrapper — δεν συγκρούεται με το scroll transform).
 *  Η λειτουργία (scroll-driven ή όχι) είναι ΑΝΤΙΔΡΑΣΤΙΚΗ στα media queries: αλλαγή πλάτους παραθύρου / DevTools device mode / περιστροφή
 *  οθόνης μετά το φόρτωμα δεν αφήνει το κινητό κολλημένο στο STATE 0 (το CSS αντιδρά ζωντανά, άρα και το JS).
 *  Κανόνες: ΠΟΤΕ preventDefault/snap/wheel interception· ένας passive, rAF-throttled scroll handler· γράφουμε μόνο transform.
 */
export function HeroChat() {
  // Το toast εμφανίζεται όταν ο agent κλείσει το ραντεβού (τελευταίο βήμα του σεναρίου).
  const [booked, setBooked] = useState(false);
  // Mobile scroll-driven (ή όχι): ζωντανό, από τα media queries.
  const [scrollDriven, setScrollDriven] = useState(scrollMode);
  // Μόνο σε scroll-driven mode: έγινε το settle (latched όσο μένουμε σε αυτό το mode).
  const [settled, setSettled] = useState(false);
  const started = !scrollDriven || settled;

  const stage = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const floatEl = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const shadow = useRef<HTMLDivElement>(null);

  // ── Mode: ακολουθεί τα media queries ──────────────────────────────────────
  useEffect(() => {
    const a = window.matchMedia(MQ_MOBILE);
    const r = window.matchMedia(MQ_REDUCED);
    const sync = () => setScrollDriven(scrollMode());
    sync();
    a.addEventListener('change', sync);
    r.addEventListener('change', sync);
    return () => {
      a.removeEventListener('change', sync);
      r.removeEventListener('change', sync);
    };
  }, []);

  // ── Scroll-driven settle ──────────────────────────────────────────────────
  useEffect(() => {
    const P = phone.current;
    const S = stage.current;
    const F = floatEl.current;
    const C = caption.current;
    const SH = shadow.current;
    const T = S?.closest('section')?.querySelector<HTMLElement>('[data-hero-text]') ?? null; // μπλοκ κειμένου του hero
    const root = document.documentElement;
    if (!scrollDriven || !P || !S || !F || !C || !SH) return;

    let sF = 1; // τελικό scale (≤ 1)
    let y1 = 0.6 * window.innerHeight; // scroll στο οποίο ολοκληρώνεται το settle (= στο οποίο το sticky «πιάνει»)
    let stageTop = 0; // θέση του stage στο έγγραφο (= STATE 0 θέση του κινητού στην οθόνη, scrollY = 0)
    let ptop = 0; // pinTop
    let pinEnd = 0; // scrollY όπου λήγει το sticky
    let floatMode: '' | 'top' | 'pin' = '';
    let textFx = false; // will-change στο κείμενο
    let lastFade = -1;
    let lastTy = NaN;
    let done = false;
    let ranged = false; // will-change ενεργό
    let lastT = '';
    let raf = 0;

    setSettled(false);
    P.dataset.armed = '';

    const measure = () => {
      // καλείται από ResizeObserver / resize (όχι σύγχρονα στο mount)
      const vh = window.innerHeight;
      const dock = document.querySelector<HTMLElement>('.sticky-cta');
      const dockH = dock ? dock.offsetHeight : DOCK_FALLBACK;
      const capH = C.offsetHeight; // λεζάντα (με το padding της)
      const Hf = P.offsetHeight - capH; // ΤΟ ΚΙΝΗΤΟ (χωρίς τη λεζάντα)
      const avail = vh - NAV_B - dockH;
      // Το κινητό κεντραρισμένο ανάμεσα σε top bar και dock, ΚΑΙ η λεζάντα να χωρά από κάτω: (avail − Hf·s)/2 ≥ capH·s
      sF = Math.max(SCALE0, Math.min(1, avail / (Hf + 2 * capH)));
      const top = NAV_B + (avail - Hf * sF) / 2;
      P.style.setProperty('--ptop', `${top.toFixed(1)}px`);
      // Σε ποιο scrollY «πιάνει» το sticky: θέση του stage στο έγγραφο − top. (Το stage δεν έχει transform → η μέτρηση είναι αξιόπιστη.)
      stageTop = S.getBoundingClientRect().top + window.scrollY;
      ptop = top;
      y1 = Math.max(120, stageTop - top);
      pinEnd = y1 + (S.querySelector<HTMLElement>('.hero-pin')?.offsetHeight ?? 0);
      P.style.setProperty('--y1', `${Math.round(y1)}px`);
    };

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const p = clamp01(y / y1);
      const e = easeOutCubic(p);
      // Θέση: lerp(startTop, pinTop, easeInOutCubic(p)) — αποσυνδεδεμένη από τη ροή. flow = που θα ήταν το κινητό χωρίς transform (stageTop − y,
      // μέχρι να πιάσει το sticky). ty = επιθυμητή − flow· ακριβώς 0 στο p=0 (startTop = stageTop) και στο p=1 (stageTop − y1 = ptop).
      const lift = easeInOutCubic(p);
      const ty = p < 1 ? stageTop + (ptop - stageTop) * lift - (stageTop - y) : 0;
      const t = `translateY(${ty.toFixed(2)}px) rotate(${(TILT * (1 - e)).toFixed(2)}deg) scale(${(SCALE0 + (sF - SCALE0) * e).toFixed(4)})`;
      if (t !== lastT) {
        lastT = t;
        P.style.transform = t;
      }
      lastTy = ty;
      // will-change μόνο όσο είμαστε μέσα στο εύρος της κίνησης
      const inRange = p < 1;
      if (inRange !== ranged) {
        ranged = inRange;
        P.style.willChange = inRange ? 'transform' : '';
      }

      // Σκιά/λάμψη κάτω από το κινητό: στενεύει (scaleX 1 → .7) και ξεθωριάζει (opacity 1 → .4 ≙ cyan .25 → .10) καθώς ανεβαίνει
      SH.style.transform = `scaleX(${(1 - 0.3 * lift).toFixed(3)})`;
      SH.style.opacity = (1 - 0.6 * lift).toFixed(3);

      // Κείμενο hero: opacity 1 → 0 (15% → 70%, ease-in-out) + lift −24px + scale 1 → .98 — scroll-linked, άρα πλήρως αντιστρέψιμο
      if (T) {
        const f = easeInOutCubic(clamp01((p - FADE_FROM) / (FADE_TO - FADE_FROM)));
        if (Math.abs(f - lastFade) > 0.002) {
          lastFade = f;
          if (f <= 0) {
            T.style.opacity = '';
            T.style.transform = '';
            T.style.pointerEvents = '';
          } else {
            T.style.opacity = (1 - f).toFixed(3);
            T.style.transform = `translateY(${(LIFT * f).toFixed(2)}px) scale(${(1 - 0.02 * f).toFixed(4)})`;
            T.style.pointerEvents = f >= 1 ? 'none' : ''; // μόνο όταν είναι πλήρως αόρατο
          }
          const fx = f > 0 && f < 1;
          if (fx !== textFx) {
            textFx = fx;
            T.style.willChange = fx ? 'transform, opacity' : '';
          }
          // το dock πρέπει να έχει βγει ΜΕΧΡΙ το CTA να ξεθωριάσει κάτω από 0.5
          if (1 - f < 0.5) root.setAttribute('data-hero-faded', '');
          else root.removeAttribute('data-hero-faded');
        }
      }

      // Float: «top» (±5px/5s) μόνο στην κορυφή· «pin» (±2.5px/6s) μόνο όσο είναι καρφωμένο. Έξοδος ΟΜΑΛΗ (από την τρέχουσα θέση στο 0).
      const want: '' | 'top' | 'pin' = y < 4 ? 'top' : y >= y1 && y <= pinEnd ? 'pin' : '';
      if (want !== floatMode) {
        if (floatMode) {
          const cur = getComputedStyle(F).transform; // τρέχουσα θέση του float
          F.classList.remove('is-idle', 'is-pin');
          F.style.transform = cur === 'none' ? '' : cur;
          void F.offsetWidth;
          F.style.transition = 'transform 220ms ease-out';
          F.style.transform = 'translateY(0px)';
        }
        if (want) {
          F.style.transition = '';
          F.style.transform = '';
          F.classList.add(want === 'top' ? 'is-idle' : 'is-pin');
        }
        floatMode = want;
      }

      if (p >= 1 && !done) {
        done = true; // latched: δεν ξαναρχίζει
        P.dataset.settled = '';
        setSettled(true);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure(); // το ύψος του viewport άλλαξε (περιστροφή, μπάρα browser) → νέα θέση pin
      schedule();
    };

    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(P);
    if (T) ro.observe(T); // αλλαγή ύψους του κειμένου (font swap) μετακινεί το stage → νέο stageTop / y1
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      delete P.dataset.armed;
      delete P.dataset.settled;
      P.style.transform = '';
      P.style.willChange = '';
      P.style.removeProperty('--ptop');
      P.style.removeProperty('--y1');
      F.classList.remove('is-idle', 'is-pin');
      F.style.transform = '';
      F.style.transition = '';
      SH.style.transform = '';
      SH.style.opacity = '';
      if (T) {
        T.style.opacity = '';
        T.style.transform = '';
        T.style.pointerEvents = '';
        T.style.willChange = '';
      }
      root.removeAttribute('data-hero-faded');
    };
  }, [scrollDriven]);

  return (
    <div ref={stage} className="hero-stage">
      <div ref={phone} className="hero-phone relative mx-auto w-[80%] max-w-[330px] sm:w-full">
        <div ref={floatEl} className="hero-float">
          {/* Toast: «βγαίνει» από το δεξί άκρο του κινητού, πάνω στην περιοχή της συνομιλίας (όχι πάνω από το κείμενο του hero) —
              μόνο μετά το κλείσιμο του ραντεβού. */}
          <div
            aria-hidden
            className={cn(
              'absolute -right-3 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-night-700 px-3.5 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] transition-all duration-500 ease-out max-sm:right-0 max-sm:top-[104px] sm:-right-10',
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

          {/* key: αλλαγή mode → καθαρή επανεκκίνηση (STATE 0 δείχνει ΜΟΝΟ το πρώτο μήνυμα· ποτέ μισή συνομιλία από άλλο mode) */}
          <ChatPlayer
            key={scrollDriven ? 'scroll' : 'free'}
            scenario={heroPhone.scenario}
            playing={started}
            loop={!scrollDriven}
            screenClassName="h-[600px] max-h-[min(70svh,calc(100svh_-_236px))] sm:max-h-none"
            onFinishedChange={setBooked}
          />

          {/* Λεζάντα + σκιά/λάμψη (levitation) κάτω από το κινητό: ελλειπτικό radial-gradient, το θόλωμα είναι στο gradient (όχι filter),
              γράφουμε μόνο transform (scaleX) + opacity ανά scroll. Αγκυρωμένη στο κάτω άκρο του κινητού (πάνω άκρο αυτού του wrapper). */}
          <div className="relative">
            <div
              ref={shadow}
              aria-hidden
              className="hero-shadow pointer-events-none absolute inset-x-[12%] top-0 z-0 h-[26px]"
              style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.25), rgba(34,211,238,0) 100%)' }}
            />
            <p ref={caption} className="hero-caption relative z-[1] pt-4 text-center font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">
              {heroPhone.caption}
            </p>
          </div>
        </div>
      </div>
      {/* Pin: ~50svh επιπλέον scroll όσο το κινητό μένει καρφωμένο (βλ. .hero-pin στο globals.css) */}
      <div aria-hidden className="hero-pin" />
    </div>
  );
}
