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

// Κείμενο hero: opacity 1 → 0 ΑΚΡΙΒΩΣ μέχρι το τέλος του settle (p = 1) — όσο το κινητό δεν έχει φτάσει στο κέντρο, το κείμενο δεν έχει εξαφανιστεί.
// Ταυτόχρονα lift −24px και scale 1 → .98.
const FADE_FROM = 0.08;
const FADE_TO = 1;
const LIFT = -24;

// Pin → συνομιλία: 6 βήματα × 90px scroll = 540px pin. Βήμα n (1..6 = μήνυμα 2, 3, 4, 5, chip «Ραντεβού κλείστηκε», toast) φαίνεται όταν το scroll
// μέσα στο pin φτάσει (n − ½)·90px — δηλ. ομοιόμορφα απλωμένα, κάθε κατάσταση «κρατά» 90px. Το βήμα είναι ΣΥΝΑΡΤΗΣΗ της θέσης (αντιστρέψιμο).
// Το μήνυμα 1 φαίνεται ήδη πριν το pin. Το ύψος του .hero-pin (globals.css) = PIN_PX.
const STEP_PX = 90;
const STEPS = 6;
const PIN_PX = STEP_PX * STEPS;
// Idle fallback: αν ο επισκέπτης μείνει μέσα στο pin χωρίς scroll για IDLE_MS, προχωρά ένα βήμα ανά ADVANCE_MS μέχρι να ολοκληρωθεί.
const IDLE_MS = 3000;
const ADVANCE_MS = 1000;
// Αγνοούμε resize που αλλάζει ΜΟΝΟ το ύψος κατά λιγότερο από αυτό (η μπάρα του Safari που μαζεύεται/ανοίγει).
const TOOLBAR_RESIZE_PX = 120;

const stepFromScroll = (y: number, y1: number) => Math.min(STEPS, Math.max(0, Math.floor((y - y1) / STEP_PX + 0.5)));

// cubic-bezier(.42,0,.58,1) (CSS ease-in-out) — για να υπολογίσουμε αναλυτικά τη θέση του float χωρίς να διαβάσουμε το DOM.
const easeInOutCss = (x: number) => {
  let t = x;
  for (let i = 0; i < 6; i++) {
    const cx = 3 * (1 - t) * (1 - t) * t * 0.42 + 3 * (1 - t) * t * t * 0.58 + t * t * t - x;
    const d = 3 * (1 - t) * (1 - t) * 0.42 + 6 * (1 - t) * t * (0.58 - 0.42) + 3 * t * t * (1 - 0.58);
    if (Math.abs(d) < 1e-6) break;
    t -= cx / d;
  }
  return 3 * (1 - t) * t * t + t * t * t;
};

const TILT = -9; // deg, STATE 0
const SCALE0 = 0.82; // STATE 0
const NAV_B = 72; // top bar: top-3 (12) + 60
const DOCK_FALLBACK = 72;

/**
 * Το hero visual: πραγματική ελληνική συνομιλία AI Agent — ΕΝΑ κινητό.
 *
 * Mobile (< 640px, χωρίς reduced motion) — «phone settle» + scrubbing συνομιλία:
 *  • STATE 0: κεκλιμένο (−9°), scale .82, κρυφοκοιτάει από το κάτω μέρος της πρώτης οθόνης (CSS: .hero-phone). Ήπιο idle float ±5px/5s ΜΟΝΟ
 *    όσο scrollY ≈ 0. Δείχνει ΜΟΝΟ το πρώτο μήνυμα του πελάτη· το toast είναι κρυμμένο.
 *  • SETTLE: scroll-linked [0, y1], y1 = το scroll στο οποίο το sticky «πιάνει» (το κινητό φτάνει στη θέση pin = κέντρο ανάμεσα σε top bar και
 *    dock). rotate → 0° και scale → 1 ακριβώς μέχρι εκεί. Το κείμενο του hero ξεθωριάζει ΜΕΧΡΙ το y1 (όχι νωρίτερα — δεν υπάρχει κενή οθόνη).
 *  • PINNED: καρφωμένο για PIN_PX = 6 × 90px scroll (spacer .hero-pin). Μέσα στο pin η συνομιλία είναι ΣΥΝΑΡΤΗΣΗ της θέσης scroll:
 *    step = floor((y − y1)/90 + ½) ∈ 0..6 → μηνύματα 2–5, chip, toast. ΑΝΤΙΣΤΡΕΨΙΜΟ: scroll προς τα πάνω κρύβει τις φούσκες με την ίδια μετάβαση
 *    ανάποδα (opacity + translateY, 200ms). Όποιος περάσει το pin βλέπει ολοκληρωμένη τη συνομιλία.
 *  • IDLE FALLBACK: αν ο επισκέπτης μείνει μέσα στο pin 3″ χωρίς scroll → +1 βήμα/1″ μέχρι το τέλος. Οποιοδήποτε scroll ακυρώνει το auto-advance και
 *    από εκεί και πέρα η θέση ορίζει ξανά την κατάσταση.
 *  • RELEASE: το sticky λήγει· το stage έχει αρνητικό margin-bottom ίσο με το «χαμένο» ύψος του scale (--gapfix), ώστε το proof bar να ακολουθεί
 *    αμέσως μετά τη λεζάντα (χωρίς κενό spacer).
 *  Απόδοση: ΟΛΕΣ οι μετρήσεις (viewport, dock, ύψη, stageTop, y1, pinEnd) γίνονται στο measure() — mount, fonts.ready, resize που αλλάζει πλάτος ή
 *  ύψος ≥ 120px, ResizeObserver. Ο scroll handler (ένας passive, rAF-throttled) δεν διαβάζει ΚΑΝΕΝΑ layout/DOM — μόνο scrollY και αριθμητικά· γράφει
 *  μόνο transform (translate3d/rotate/scale) και opacity. will-change ΜΟΝΟ όσο το κινητό/κείμενο είναι μέσα στην κίνηση. Τα aura blobs και το
 *  pulse-dot του κινητού σταματούν όσο τρέχει το hero scroll (html[data-hero-anim]). Η λειτουργία είναι ΑΝΤΙΔΡΑΣΤΙΚΗ στα media queries
 *  (αλλαγή πλάτους / device mode / περιστροφή). Κανόνες: ΠΟΤΕ preventDefault/snap/wheel interception.
 */
export function HeroChat() {
  // Το toast εμφανίζεται όταν ο agent κλείσει το ραντεβού (τελευταίο βήμα του σεναρίου).
  const [booked, setBooked] = useState(false);
  // Mobile scroll-driven (ή όχι): ζωντανό, από τα media queries. ΞΕΚΙΝΑ ΠΑΝΤΑ false (όπως ο server): ένα αρχικό state που διαφέρει από το SSR
  // αφήνει στο DOM τα className του server (το React δεν διορθώνει mismatch attributes στο hydration) — π.χ. duration-500 αντί για duration-200.
  const [scrollDriven, setScrollDriven] = useState(false);
  // Βήμα συνομιλίας 0..6 (scroll-driven mode): από τη θέση scroll, ή από το idle fallback.
  const [step, setStep] = useState(0);

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

  // ── Scroll-driven settle + scrubbing ──────────────────────────────────────
  useEffect(() => {
    const P = phone.current;
    const S = stage.current;
    const F = floatEl.current;
    const C = caption.current;
    const SH = shadow.current;
    const T = S?.closest('section')?.querySelector<HTMLElement>('[data-hero-text]') ?? null; // μπλοκ κειμένου του hero
    const root = document.documentElement;
    if (!scrollDriven || !P || !S || !F || !C || !SH) return;

    // ── cache μετρήσεων (γράφονται ΜΟΝΟ από το measure()) ──
    let vh = window.innerHeight; // viewport height (αγνοούμε τις αλλαγές της μπάρας του Safari)
    let vw = window.innerWidth;
    let sF = 1; // τελικό scale (≤ 1)
    let y1 = 0.6 * vh; // scroll στο οποίο ολοκληρώνεται το settle (= στο οποίο το sticky «πιάνει»)
    let stageTop = 0; // θέση του stage στο έγγραφο (= STATE 0 θέση του κινητού στην οθόνη, scrollY = 0)
    let ptop = 0; // pinTop
    let pinEnd = 0; // scrollY όπου λήγει το pin (πραγματικό ή «εικονικό» αν το CSS έχει pin 0)

    // ── κατάσταση του handler ──
    let floatMode: '' | 'top' | 'pin' = '';
    let floatAnim: Animation | null = null;
    let textFx = false; // will-change στο κείμενο
    let lastFade = -1;
    let done = false;
    let ranged = false; // will-change στο κινητό
    let animActive = false; // html[data-hero-anim]
    let lastT = '';
    let stepNow = 0; // το βήμα που έχουμε ήδη στείλει στο React (από scroll ή auto)
    let raf = 0;
    let idleT: ReturnType<typeof setTimeout> | 0 = 0;
    let advT: ReturnType<typeof setInterval> | 0 = 0;

    setStep(0);
    P.dataset.armed = '';

    const pushStep = (n: number) => {
      if (n === stepNow) return;
      stepNow = n;
      setStep(n);
    };
    const cancelAuto = () => {
      if (idleT) clearTimeout(idleT);
      if (advT) clearInterval(advT);
      idleT = 0;
      advT = 0;
    };
    // Idle fallback: ΜΟΝΟ μέσα στο pin και μόνο όσο η συνομιλία δεν έχει ολοκληρωθεί.
    const armIdle = (y: number, posStep: number) => {
      cancelAuto();
      if (y < y1 || y > pinEnd || posStep >= STEPS) return;
      idleT = setTimeout(() => {
        idleT = 0;
        const advance = () => {
          if (stepNow >= STEPS) {
            if (advT) clearInterval(advT);
            advT = 0;
            return;
          }
          pushStep(stepNow + 1);
        };
        advance();
        advT = setInterval(advance, ADVANCE_MS);
      }, IDLE_MS);
    };

    const measure = () => {
      // ΜΟΝΗ θέση ανάγνωσης layout: mount, fonts.ready, αληθινό resize, ResizeObserver — ΠΟΤΕ μέσα στο scroll.
      const dock = document.querySelector<HTMLElement>('.sticky-cta');
      const dockH = dock ? dock.offsetHeight : DOCK_FALLBACK;
      const capH = C.offsetHeight; // λεζάντα (με το padding της)
      const totalH = P.offsetHeight; // κινητό + λεζάντα (layout, χωρίς transform)
      const Hf = totalH - capH; // ΤΟ ΚΙΝΗΤΟ (χωρίς τη λεζάντα)
      const avail = vh - NAV_B - dockH;
      // Το κινητό κεντραρισμένο ανάμεσα σε top bar και dock, ΚΑΙ η λεζάντα να χωρά από κάτω: (avail − Hf·s)/2 ≥ capH·s
      sF = Math.max(SCALE0, Math.min(1, avail / (Hf + 2 * capH)));
      const top = NAV_B + (avail - Hf * sF) / 2;
      P.style.setProperty('--ptop', `${top.toFixed(1)}px`);
      // Σε ποιο scrollY «πιάνει» το sticky: θέση του stage στο έγγραφο − top. (Το stage δεν έχει transform → η μέτρηση είναι αξιόπιστη.)
      stageTop = S.getBoundingClientRect().top + window.scrollY;
      ptop = top;
      y1 = Math.max(120, stageTop - top);
      const pinH = S.querySelector<HTMLElement>('.hero-pin')?.offsetHeight ?? 0;
      // Σε πολύ χαμηλές οθόνες το CSS βγάζει το pin (0)· τα βήματα της συνομιλίας εξακολουθούν να προχωρούν με το scroll μετά το settle.
      pinEnd = y1 + (pinH > 1 ? pinH : PIN_PX);
      P.style.setProperty('--y1', `${Math.round(y1)}px`);
      // Το scale μικραίνει οπτικά το κινητό αλλά ΟΧΙ το box του στη ροή → αρνητικό margin ίσο με το χαμένο ύψος, ώστε το proof bar να ακολουθεί αμέσως.
      S.style.setProperty('--gapfix', `${Math.max(0, totalH * (1 - sF)).toFixed(1)}px`);
    };

    // float: WAAPI (compositor) χωρίς καμία ανάγνωση DOM στην έξοδο — η τρέχουσα θέση υπολογίζεται αναλυτικά από το progress.
    const floatY = (mode: 'top' | 'pin', progress: number) => {
      if (mode === 'top') {
        // 0%,100% → −5 · 50% → +5, ease-in-out ανά διάστημα
        const seg = progress < 0.5 ? progress / 0.5 : (progress - 0.5) / 0.5;
        const e = easeInOutCss(seg);
        return progress < 0.5 ? -5 + 10 * e : 5 - 10 * e;
      }
      // 0 → −2.5 (25%) → +2.5 (75%) → 0 (100%)
      if (progress < 0.25) return -2.5 * easeInOutCss(progress / 0.25);
      if (progress < 0.75) return -2.5 + 5 * easeInOutCss((progress - 0.25) / 0.5);
      return 2.5 - 2.5 * easeInOutCss((progress - 0.75) / 0.25);
    };
    const setFloat = (want: '' | 'top' | 'pin') => {
      if (floatAnim && floatMode) {
        const prog = Number(floatAnim.effect?.getComputedTiming().progress ?? 0) % 1;
        const cur = floatY(floatMode, prog);
        floatAnim.cancel();
        floatAnim = null;
        // έξοδος ΟΜΑΛΗ από την τρέχουσα θέση στο 0
        F.animate([{ transform: `translate3d(0, ${cur.toFixed(2)}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }], {
          duration: 220,
          easing: 'ease-out',
        });
      }
      if (want === 'top') {
        floatAnim = F.animate(
          [
            { transform: 'translate3d(0,-5px,0)', easing: 'ease-in-out' },
            { transform: 'translate3d(0,5px,0)', easing: 'ease-in-out', offset: 0.5 },
            { transform: 'translate3d(0,-5px,0)' },
          ],
          { duration: 5000, iterations: Infinity }
        );
      } else if (want === 'pin') {
        floatAnim = F.animate(
          [
            { transform: 'translate3d(0,0,0)', easing: 'ease-in-out' },
            { transform: 'translate3d(0,-2.5px,0)', easing: 'ease-in-out', offset: 0.25 },
            { transform: 'translate3d(0,2.5px,0)', easing: 'ease-in-out', offset: 0.75 },
            { transform: 'translate3d(0,0,0)' },
          ],
          { duration: 6000, iterations: Infinity }
        );
      }
      floatMode = want;
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
      const t = `translate3d(0, ${ty.toFixed(2)}px, 0) rotate(${(TILT * (1 - e)).toFixed(2)}deg) scale(${(SCALE0 + (sF - SCALE0) * e).toFixed(4)})`;
      if (t !== lastT) {
        lastT = t;
        P.style.transform = t;
      }
      // will-change μόνο όσο είμαστε μέσα στο εύρος της κίνησης
      const inRange = p < 1;
      if (inRange !== ranged) {
        ranged = inRange;
        P.style.willChange = inRange ? 'transform' : '';
      }
      // Παύση των διακοσμητικών animations (aura blobs, pulse-dot του κινητού) όσο τρέχει το hero scroll
      const anim = y > 1 && y < pinEnd + 40;
      if (anim !== animActive) {
        animActive = anim;
        if (anim) root.setAttribute('data-hero-anim', '');
        else root.removeAttribute('data-hero-anim');
      }

      // Σκιά/λάμψη κάτω από το κινητό: στενεύει (scaleX 1 → .7) και ξεθωριάζει (opacity 1 → .4 ≙ cyan .25 → .10) καθώς ανεβαίνει
      SH.style.transform = `scale3d(${(1 - 0.3 * lift).toFixed(3)}, 1, 1)`;
      SH.style.opacity = (1 - 0.6 * lift).toFixed(3);

      // Κείμενο hero: opacity 1 → 0 (FADE_FROM → FADE_TO = τέλος του settle) + lift −24px + scale 1 → .98 — scroll-linked, αντιστρέψιμο
      if (T) {
        const f = easeInOutCubic(clamp01((p - FADE_FROM) / (FADE_TO - FADE_FROM)));
        if (Math.abs(f - lastFade) > 0.002 || f === 0 || f === 1) {
          lastFade = f;
          if (f <= 0) {
            T.style.opacity = '';
            T.style.transform = '';
            T.style.pointerEvents = '';
          } else {
            T.style.opacity = (1 - f).toFixed(3);
            T.style.transform = `translate3d(0, ${(LIFT * f).toFixed(2)}px, 0) scale(${(1 - 0.02 * f).toFixed(4)})`;
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

      // Float: «top» (±5px/5s) μόνο στην κορυφή· «pin» (±2.5px/6s) μόνο όσο είναι καρφωμένο.
      const want: '' | 'top' | 'pin' = y < 4 ? 'top' : y >= y1 && y <= pinEnd ? 'pin' : '';
      if (want !== floatMode) setFloat(want);

      // Συνομιλία: το βήμα ορίζεται ΑΠΟ ΤΗ ΘΕΣΗ (αντιστρέψιμο). Οποιοδήποτε scroll ακυρώνει το auto-advance και το ξαναοπλίζει.
      const posStep = stepFromScroll(y, y1);
      pushStep(posStep);
      armIdle(y, posStep);

      if (p >= 1 && !done) {
        done = true; // latched: η λεζάντα δεν κρύβεται ξανά
        P.dataset.settled = '';
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Μόνο το ύψος άλλαξε κατά < 120px = μπάρα του Safari που μαζεύεται/ανοίγει → τίποτα δεν ξαναμετριέται, τίποτα δεν πηδά.
      if (w === vw && Math.abs(h - vh) < TOOLBAR_RESIZE_PX) return;
      vw = w;
      vh = h;
      measure();
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
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      measure();
      schedule();
    });
    measure();
    schedule();

    return () => {
      disposed = true;
      cancelAuto();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (floatAnim) floatAnim.cancel();
      delete P.dataset.armed;
      delete P.dataset.settled;
      P.style.transform = '';
      P.style.willChange = '';
      P.style.removeProperty('--ptop');
      P.style.removeProperty('--y1');
      S.style.removeProperty('--gapfix');
      SH.style.transform = '';
      SH.style.opacity = '';
      if (T) {
        T.style.opacity = '';
        T.style.transform = '';
        T.style.pointerEvents = '';
        T.style.willChange = '';
      }
      root.removeAttribute('data-hero-faded');
      root.removeAttribute('data-hero-anim');
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
              'absolute -right-3 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-night-700 px-3.5 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] transition-[opacity,transform] ease-out max-sm:right-0 max-sm:top-[104px] sm:-right-10',
              scrollDriven ? 'duration-200' : 'duration-500',
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
            controlledStep={scrollDriven ? step : undefined}
            loop={!scrollDriven}
            screenClassName="h-[600px] max-h-[min(70svh,calc(100svh_-_236px))] sm:max-h-none"
            onFinishedChange={setBooked}
          />

          {/* Λεζάντα + σκιά/λάμψη (levitation) κάτω από το κινητό: ελλειπτικό radial-gradient, το θόλωμα είναι στο gradient (όχι filter),
              γράφουμε μόνο transform (scale3d) + opacity ανά scroll. Αγκυρωμένη στο κάτω άκρο του κινητού (πάνω άκρο αυτού του wrapper). */}
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
      {/* Pin: 6 × 90px επιπλέον scroll όσο το κινητό μένει καρφωμένο (βλ. .hero-pin στο globals.css) */}
      <div aria-hidden className="hero-pin" />
    </div>
  );
}
