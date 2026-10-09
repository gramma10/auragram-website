'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Ήσυχο πλέγμα κόμβων ως φόντο για τα ανοιχτόχρωμα sections — με «σήματα».
 *
 * Διακοσμητικό στρώμα (`pointer-events-none`, aria-hidden). ΕΝΑ canvas, ΕΝΑ frame loop για τα πάντα:
 *  • Signals (όλες οι συσκευές, και touch): κάθε 1.8–3s ένας παλμός ξεκινά από τυχαίο κόμβο μέσα στο ορατό κομμάτι και ταξιδεύει
 *    4–6 hops πάνω στους υπάρχοντες συνδέσμους (τυχαία κατεύθυνση, χωρίς άμεση επιστροφή) με ~180px/s. Κεφάλι: κουκκίδα 2.5px aura
 *    #22D3EE με απαλό glow· οι σύνδεσμοι που πέρασε παίρνουν ίχνος aura-deep #0E7490 που σβήνει σε ~900ms. Το πολύ 3 ζωντανά.
 *    Οι εκκινήσεις ζυγίζονται προς τις άκρες της μάσκας και τα κενά δεξιά/αριστερά του container — όχι στο κέντρο του κειμένου.
 *  • Desktop (pointer: fine): ώθηση κόμβων + cyan «spotlight» — κόμβοι/σύνδεσμοι ≤ 160px από το cursor γέρνουν προς aura-deep
 *    (alpha ως ~0.35) και επιστρέφουν ομαλά όταν φύγει το cursor.
 *  • Touch: πολύ απαλή απόκριση στο scroll — η ταχύτητα δίνει μικρή κάθετη ώθηση σε κύμα (μετατόπιση ≤ ~4px, clamp, αγνοείται αν το
 *    delta είναι μικρό).
 *  • Performance: καμία έξτρα επιφάνεια/canvas· ό,τι ζωγραφίζεται, ζωγραφίζεται στο ίδιο καρέ. Η φυσική και η ζωγραφική γίνονται ΜΟΝΟ για
 *    τις γραμμές που φαίνονται στο viewport (το canvas είναι ψηλό όσο το section). IntersectionObserver pause, DPR ≤ 2, lazy init.
 *  • TEXT-SAFE: πίσω από τα μπλοκ κειμένου (headings, παράγραφοι, λίστες, κείμενο των panels) κόμβοι, σύνδεσμοι και ίχνη signals
 *    σβήνουν σε ≤ 30% του κανονικού alpha, με απαλό ~24px feathered άκρο· σε πλήρη ένταση φαίνεται μόνο στα gutters και στα κενά. Το
 *    spotlight δεν βάφει ΠΟΤΕ πάνω σε κείμενο. Τα ορθογώνια του κειμένου υπολογίζονται ΜΙΑ φορά ανά layout (mount, resize, fonts, lazy mounts)
 *    και μετατρέπονται σε πίνακες συντελεστών ανά κόμβο/σύνδεσμο — στο frame loop είναι μόνο ένας πολλαπλασιασμός (alpha lookup).
 *  • prefers-reduced-motion → ένα στατικό καρέ: κανένα signal, spotlight ή ripple (το text-safe ισχύει και εκεί).
 *  • Μάσκα στις άκρες ώστε το πλέγμα να λιώνει μέσα στο section και να μένει καθαρά ΠΙΣΩ από το κείμενο.
 */
export function ConstellationGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const INK = '15, 23, 32'; // ink #0F1720
    const DEEP = '14, 116, 144'; // aura-deep #0E7490
    const AURA = '34, 211, 238'; // aura #22D3EE
    const GAP = 66;
    const MAX_DIST = 84;
    const LINK_A = 0.17; // ήταν 0.13
    const NODE_A = 0.18; // ήταν 0.13
    const SPOT_R = 160;
    const SPOT_A = 0.35;
    const SIGNAL_SPEED = 180; // px/s
    const TRAIL_MS = 900;
    const MAX_SIGNALS = 3;
    // text-safe
    const SAFE_MIN = 0.3; // ≤ 40% του κανονικού alpha κάτω από το κείμενο
    const SAFE_FEATHER = 24; // px
    const TEXT_SEL = 'h1,h2,h3,h4,h5,p,li,dt,dd,label,blockquote,figcaption,summary,button,a';

    type N = { x: number; y: number; vx: number; vy: number; bx: number; by: number; r: number; p: number };
    type Sig = { path: number[]; s: number; crossed: number[]; doneAt: number };
    let nodes: N[] = [];
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    const mouse = { x: -9999, y: -9999 };
    const spot = { x: -9999, y: -9999, k: 0 }; // λειασμένη θέση + ένταση του spotlight (0..1)
    const sigs: Sig[] = [];
    let nextSpawn = 0;
    // συντελεστές text-safe (1 = πλήρης ένταση, SAFE_MIN = κάτω από κείμενο): ανά κόμβο και ανά σύνδεσμο (δεξιά / κάτω)
    let safeNode = new Float32Array(0);
    let safeH = new Float32Array(0);
    let safeV = new Float32Array(0);
    // χάρτης κάλυψης κειμένου (ένα κελί = CELL px): 0 = ελεύθερο, 255 = μέσα σε μπλοκ κειμένου· χτίζεται ΜΙΑ φορά ανά layout
    const CELL = 8;
    let cov = new Uint8Array(0);
    let covW = 0;
    let covH = 0;
    let scrollImpulse = 0; // touch: συσσωρευμένο delta scroll που καταναλώνεται στο επόμενο καρέ
    let lastScrollY = window.scrollY;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const idx = (i: number, j: number) => i * rows + j;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / GAP) + 2;
      rows = Math.ceil(h / GAP) + 2;
      nodes = new Array(cols * rows);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i - 0.5) * GAP;
          const y = (j - 0.5) * GAP;
          nodes[idx(i, j)] = { x, y, vx: 0, vy: 0, bx: x, by: y, r: Math.random() * 0.55 + 0.7, p: Math.random() * Math.PI * 2 };
        }
      }
      sigs.length = 0;
      computeSafe();
    };

    /** Κάλυψη κειμένου στο (x,y) σε συντεταγμένες canvas: 0..1 (lookup στον χάρτη, O(1)). */
    const coverAt = (x: number, y: number) => {
      const cx = Math.floor(x / CELL);
      const cy = Math.floor(y / CELL);
      if (cx < 0 || cy < 0 || cx >= covW || cy >= covH) return 0;
      return cov[cy * covW + cx] / 255;
    };
    const safeAt = (x: number, y: number) => 1 - (1 - SAFE_MIN) * coverAt(x, y);
    /** Ο πιο «προστατευμένος» (μικρότερος) συντελεστής κατά μήκος ενός συνδέσμου — συντηρητικό: αν το κείμενο τον διασχίζει οπουδήποτε, σβήνει. */
    const minAlong = (x0: number, y0: number, x1: number, y1: number) => {
      // δείγμα κάθε ~4px: μια γραμμή κειμένου (≥ 8px) δεν μπορεί να «πέσει» ανάμεσα σε δύο δείγματα
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
      let m = 1;
      for (let k = 0; k <= n; k++) m = Math.min(m, safeAt(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n));
      return m;
    };

    /**
     * Υπολογίζει (μία φορά ανά layout) τον χάρτη κάλυψης και τους συντελεστές text-safe. Τα ορθογώνια είναι τα ΣΤΕΝΑ κουτιά κειμένου
     * (Range πάνω στο περιεχόμενο κάθε στοιχείου), σε συντεταγμένες canvas· κάθε κελί παίρνει 1 μέσα στο ορθογώνιο και πέφτει γραμμικά
     * στο 0 μέσα σε SAFE_FEATHER px από την άκρη. Κόμβοι: συντελεστής στο σημείο τους· σύνδεσμοι: ελάχιστο κατά μήκος τους.
     */
    const computeSafe = () => {
      const host = canvas.parentElement;
      const total = cols * rows;
      safeNode = new Float32Array(total).fill(1);
      safeH = new Float32Array(total).fill(1);
      safeV = new Float32Array(total).fill(1);
      covW = Math.ceil(w / CELL);
      covH = Math.ceil(h / CELL);
      cov = new Uint8Array(covW * covH);
      if (!host) return;
      const cr = canvas.getBoundingClientRect();
      const range = document.createRange();
      let any = false;
      // Τα στοιχεία μέσα σε .reveal ξεκινούν μετατοπισμένα (fade-up 14px) — μετράμε τη ΤΕΛΙΚΗ θέση τους (αφαιρούμε το τρέχον translate),
      // αλλιώς ο χάρτης θα ήταν μετατοπισμένος μέχρι να τελειώσει η μετάβαση.
      const revealShift = new Map<Element, number>();
      host.querySelectorAll(TEXT_SEL).forEach((el) => {
        if (el.closest('canvas')) return;
        if (!(el.textContent || '').trim()) return;
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        any = true;
        let dy = 0;
        const rv = el.closest('.reveal');
        if (rv) {
          if (!revealShift.has(rv)) {
            const tr = getComputedStyle(rv).transform;
            revealShift.set(rv, tr && tr !== 'none' ? new DOMMatrixReadOnly(tr).m42 : 0);
          }
          dy = revealShift.get(rv) || 0;
        }
        const l = r.left - cr.left;
        const t = r.top - cr.top - dy;
        const rr = r.right - cr.left;
        const bb = r.bottom - cr.top - dy;
        // rasterise: μόνο τα κελιά μέσα στο ορθογώνιο + feather
        const cx0 = Math.max(0, Math.floor((l - SAFE_FEATHER) / CELL));
        const cx1 = Math.min(covW - 1, Math.floor((rr + SAFE_FEATHER) / CELL));
        const cy0 = Math.max(0, Math.floor((t - SAFE_FEATHER) / CELL));
        const cy1 = Math.min(covH - 1, Math.floor((bb + SAFE_FEATHER) / CELL));
        for (let cy = cy0; cy <= cy1; cy++) {
          const py = (cy + 0.5) * CELL;
          const dy = Math.max(t - py, 0, py - bb);
          for (let cx = cx0; cx <= cx1; cx++) {
            const px = (cx + 0.5) * CELL;
            const dx = Math.max(l - px, 0, px - rr);
            const c = 1 - Math.hypot(dx, dy) / SAFE_FEATHER;
            if (c <= 0) continue;
            const v = Math.round(Math.min(1, c) * 255);
            const k = cy * covW + cx;
            if (v > cov[k]) cov[k] = v;
          }
        }
      });
      if (!any) return;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const k = idx(i, j);
          const n = nodes[k];
          safeNode[k] = safeAt(n.bx, n.by);
          if (i + 1 < cols) safeH[k] = minAlong(n.bx, n.by, n.bx + GAP, n.by); // σύνδεσμος → δεξιά
          if (j + 1 < rows) safeV[k] = minAlong(n.bx, n.by, n.bx, n.by + GAP); // σύνδεσμος → κάτω
        }
      }
    };
    /** Συντελεστής συνδέσμου μεταξύ δύο γειτονικών κόμβων (a, b = ευρετήρια). */
    const linkSafe = (a: number, b: number) => {
      if (b === a + rows) return safeH[a];
      if (b === a - rows) return safeH[b];
      if (b === a + 1) return safeV[a];
      return safeV[b];
    };
    const spotMask = (f: number) => Math.max(0, Math.min(1, (f - SAFE_MIN) / (1 - SAFE_MIN))); // 0 κάτω από κείμενο → 1 στα κενά

    // ── Signals ────────────────────────────────────────────────────────────
    /** Βάρος εκκίνησης: μακριά από το κέντρο της μάσκας (εκεί είναι το κείμενο), περισσότερο στα κενά δεξιά/αριστερά του container. */
    const spawnWeight = (x: number, y: number) => {
      const q = Math.hypot((x - 0.5 * w) / (0.9 * w), (y - 0.42 * h) / (0.78 * h)); // 0 = κέντρο μάσκας, 1 = εξαφάνιση
      let wt = Math.exp(-(((q - 0.62) / 0.22) ** 2)) + 0.04;
      if (Math.abs(x - 0.5 * w) > 592) wt *= 1.8; // έξω από το max-w-page (72rem) → κενά στις άκρες
      return wt;
    };

    const spawn = () => {
      const rect = canvas.getBoundingClientRect();
      const y0 = Math.max(0, -rect.top);
      const y1 = Math.min(h, window.innerHeight - rect.top);
      if (y1 - y0 < GAP * 2) return;
      // υποψήφιοι κόμβοι μέσα στο ΟΡΑΤΟ τμήμα (με μικρό περιθώριο), επιλογή με βάρη
      const iMin = 1;
      const iMax = cols - 2;
      const jMin = Math.max(1, Math.ceil(y0 / GAP + 0.5));
      const jMax = Math.min(rows - 2, Math.floor(y1 / GAP + 0.5) - 1);
      if (jMax < jMin || iMax < iMin) return;
      let best = -1;
      let bestW = -1;
      for (let k = 0; k < 14; k++) {
        const i = iMin + Math.floor(Math.random() * (iMax - iMin + 1));
        const j = jMin + Math.floor(Math.random() * (jMax - jMin + 1));
        const n = nodes[idx(i, j)];
        const wt = spawnWeight(n.bx, n.by) * safeNode[idx(i, j)] * Math.random(); // τυχαιότητα πάνω στα βάρη· όχι πάνω σε κείμενο
        if (wt > bestW) {
          bestW = wt;
          best = idx(i, j);
        }
      }
      if (best < 0) return;
      const path = [best];
      let prev = -1;
      const hops = 4 + Math.floor(Math.random() * 3); // 4–6
      for (let hop = 0; hop < hops; hop++) {
        const cur = path[path.length - 1];
        const i = Math.floor(cur / rows);
        const j = cur % rows;
        const opts: number[] = [];
        if (i + 1 < cols) opts.push(idx(i + 1, j));
        if (i - 1 >= 0) opts.push(idx(i - 1, j));
        if (j + 1 < rows) opts.push(idx(i, j + 1));
        if (j - 1 >= 0) opts.push(idx(i, j - 1));
        const fwd = opts.filter((o) => o !== prev); // χωρίς άμεση επιστροφή
        if (!fwd.length) break;
        prev = cur;
        path.push(fwd[Math.floor(Math.random() * fwd.length)]);
      }
      if (path.length < 3) return;
      sigs.push({ path, s: 0, crossed: [], doneAt: 0 });
    };

    const drawSignals = (now: number, dt: number) => {
      for (let q = sigs.length - 1; q >= 0; q--) {
        const sg = sigs[q];
        const hops = sg.path.length - 1;
        if (!sg.doneAt) {
          sg.s += SIGNAL_SPEED * dt;
          const k = Math.min(Math.floor(sg.s / GAP), hops);
          while (sg.crossed.length < k) sg.crossed.push(now);
          if (sg.s >= hops * GAP) sg.doneAt = now;
        }
        // πέρα από το τέλος του ίχνους → αφαίρεση
        if (sg.doneAt && now - sg.doneAt > TRAIL_MS) {
          sigs.splice(q, 1);
          continue;
        }
        // ίχνος: ολοκληρωμένοι σύνδεσμοι σβήνουν σε ~900ms· ο τρέχων σύνδεσμος ζωγραφίζεται ως το κεφάλι
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        const k = Math.min(Math.floor(sg.s / GAP), hops - 1);
        for (let j = 0; j < hops; j++) {
          const a = nodes[sg.path[j]];
          const b = nodes[sg.path[j + 1]];
          let alpha = 0;
          let ex = b.x;
          let ey = b.y;
          if (j < sg.crossed.length) {
            alpha = 1 - (now - sg.crossed[j]) / TRAIL_MS;
          } else if (j === k) {
            alpha = 1;
            const f = Math.min(1, (sg.s - j * GAP) / GAP);
            ex = a.x + (b.x - a.x) * f;
            ey = a.y + (b.y - a.y) * f;
          }
          if (alpha <= 0) continue;
          const sf = linkSafe(sg.path[j], sg.path[j + 1]); // text-safe: το ίχνος σβήνει πάνω από κείμενο
          // πάνω από κείμενο το ίχνος σβήνει ΕΝΤΕΛΩΣ (spotMask) — ίχνος + κόμβος στοιβαγμένα έδιναν 4.06:1 < 4.5:1 για ink-soft
          ctx.strokeStyle = `rgba(${DEEP}, ${(alpha * 0.6 * spotMask(sf)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
        // κεφάλι (σβήνει γρήγορα μόλις φτάσει στο τέλος)
        const headLife = sg.doneAt ? Math.max(0, 1 - (now - sg.doneAt) / 220) : 1;
        if (headLife > 0) {
          const j = Math.min(Math.floor(sg.s / GAP), hops - 1);
          const a = nodes[sg.path[j]];
          const b = nodes[sg.path[j + 1]];
          const f = Math.min(1, (sg.s - j * GAP) / GAP);
          const hx = a.x + (b.x - a.x) * f;
          const hy = a.y + (b.y - a.y) * f;
          // text-safe: ο ελάχιστος συντελεστής στο κέντρο και γύρω από το glow (ακτίνα 13px) — το glow δεν «τρέχει» μέσα σε κείμενο
          // → το κεφάλι (και το glow του) εξαφανίζεται ΕΝΤΕΛΩΣ πάνω από μπλοκ κειμένου (spotMask: 0 κάτω από κείμενο, 1 στα κενά), το ίχνος μένει ≤ 0.18
          const headA = headLife * spotMask(Math.min(safeAt(hx, hy), safeAt(hx - 11, hy), safeAt(hx + 11, hy), safeAt(hx, hy - 11), safeAt(hx, hy + 11)));
          const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 13);
          glow.addColorStop(0, `rgba(${AURA}, ${(0.45 * headA).toFixed(3)})`);
          glow.addColorStop(1, `rgba(${AURA}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(hx, hy, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${AURA}, ${headA.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // ── Frame ──────────────────────────────────────────────────────────────
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.7;
      ctx.lineCap = 'butt';

      // ΜΟΝΟ οι γραμμές που φαίνονται στο viewport (± 2 γραμμές) φυσικά και ζωγραφικά
      const rect = canvas.getBoundingClientRect();
      const y0 = Math.max(0, -rect.top);
      const y1 = Math.min(h, window.innerHeight - rect.top);
      // reduced motion: το ΕΝΑ στατικό καρέ ζωγραφίζεται ολόκληρο (μπορεί να γίνει ενώ το section είναι ακόμα εκτός viewport)
      const j0 = reduce ? 0 : Math.max(0, Math.floor(y0 / GAP) - 2);
      const j1 = reduce ? rows - 1 : Math.min(rows - 1, Math.ceil(y1 / GAP) + 2);

      const K = 13;
      const DAMP = 0.87;
      const R = 168;

      // spotlight: λειασμένη θέση/ένταση
      const inside = finePointer && mouse.x > -1000 && mouse.x < w + 1 && mouse.y > -1 && mouse.y < h + 1;
      if (finePointer && !reduce) {
        if (inside) {
          if (spot.k < 0.01) {
            spot.x = mouse.x;
            spot.y = mouse.y;
          }
          const f = Math.min(1, dt * 14);
          spot.x += (mouse.x - spot.x) * f;
          spot.y += (mouse.y - spot.y) * f;
        }
        spot.k += ((inside ? 1 : 0) - spot.k) * Math.min(1, dt * 5);
        if (spot.k < 0.005) spot.k = 0;
      }
      const spotOn = spot.k > 0.01;

      // touch: κύμα από scroll (ταχύτητα → μικρή κάθετη ώθηση, clamp)
      let ripple = 0;
      if (!finePointer && !reduce && scrollImpulse !== 0) {
        ripple = Math.max(-0.22, Math.min(0.22, scrollImpulse * 0.0035));
        scrollImpulse = 0;
      }

      for (let i = 0; i < cols; i++) {
        for (let j = j0; j <= j1; j++) {
          const n = nodes[idx(i, j)];
          n.p += dt * 1.5;
          if (finePointer) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const force = (1 - d / R) * 240; // απαλή ώθηση, χωρίς ταχύτητα-shockwave
              n.vx -= (dx / d) * force * dt;
              n.vy -= (dy / d) * force * dt;
            }
          } else if (ripple !== 0) {
            n.vy += ripple * Math.sin(i * 0.4 + j * 0.7);
          }
          n.vx += (n.bx - n.x) * K * dt;
          n.vy += (n.by - n.y) * K * dt;
          n.vx *= DAMP;
          n.vy *= DAMP;
          n.x += n.vx * dt * 60;
          n.y += n.vy * dt * 60;
          if (!finePointer) {
            // touch: η μετατόπιση δεν ξεπερνά ~4px
            const oy = n.y - n.by;
            if (oy > 4.5) n.y = n.by + 4.5;
            else if (oy < -4.5) n.y = n.by - 4.5;
          }
        }
      }

      // Συνδέσεις μόνο με οριζόντιους/κάθετους γείτονες (οι διαγώνιοι είναι > MAX_DIST και δεν ζωγραφίζονταν ποτέ).
      const sr2 = SPOT_R * SPOT_R;
      for (let i = 0; i < cols; i++) {
        for (let j = j0; j <= j1; j++) {
          const a = nodes[idx(i, j)];
          for (let side = 0; side < 2; side++) {
            const ni = i + (side === 0 ? 1 : 0);
            const nj = j + (side === 0 ? 0 : 1);
            if (ni >= cols || nj >= rows) continue;
            const b = nodes[idx(ni, nj)];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d >= MAX_DIST) continue;
            let alpha = (1 - d / MAX_DIST) * LINK_A;
            let col = INK;
            const sf = side === 0 ? safeH[idx(i, j)] : safeV[idx(i, j)];
            if (spotOn) {
              const mx = (a.x + b.x) / 2 - spot.x;
              const my = (a.y + b.y) / 2 - spot.y;
              const m2 = mx * mx + my * my;
              if (m2 < sr2) {
                // το spotlight δεν βάφει πάνω σε κείμενο (spotMask → 0 κάτω από τα μπλοκ κειμένου)
                const t = spot.k * (1 - Math.sqrt(m2) / SPOT_R) ** 1.4 * spotMask(sf);
                if (t > 0.004) {
                  alpha += (SPOT_A - alpha) * t;
                  col = DEEP;
                }
              }
            }
            alpha *= sf;
            ctx.strokeStyle = `rgba(${col}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < cols; i++) {
        for (let j = j0; j <= j1; j++) {
          const n = nodes[idx(i, j)];
          let alpha = NODE_A + Math.sin(n.p) * 0.045;
          let col = INK;
          const sf = safeNode[idx(i, j)];
          if (spotOn) {
            const dx = n.x - spot.x;
            const dy = n.y - spot.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < sr2) {
              const t = spot.k * (1 - Math.sqrt(d2) / SPOT_R) ** 1.4 * spotMask(sf);
              if (t > 0.004) {
                alpha += (SPOT_A - alpha) * t;
                col = DEEP;
              }
            }
          }
          alpha *= sf;
          ctx.fillStyle = `rgba(${col}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // signals — στο ΙΔΙΟ καρέ (χωρίς reduced motion)
      if (!reduce) {
        if (now >= nextSpawn) {
          if (sigs.length < MAX_SIGNALS) spawn();
          nextSpawn = now + rand(1800, 3000);
        }
        if (sigs.length) drawSignals(now, dt);
      }

      if (running && !reduce) raf = requestAnimationFrame(frame);
    };

    // Το πλέγμα στήνεται (build + πρώτο καρέ) μόνο όταν το section πλησιάσει το viewport (800px πριν): έτσι τα
    // canvas των sections κάτω από το fold δεν κοστίζουν layout/allocation/ζωγραφική στο hydration.
    let ready = false;
    const init = () => {
      if (ready) return;
      ready = true;
      build();
      // ένα καρέ αμέσως, ώστε το πλέγμα να υπάρχει και με reduced-motion / πριν το scroll
      last = performance.now();
      nextSpawn = last + rand(900, 1600); // το πρώτο signal λίγο μετά την εμφάνιση
      frame(last);
    };
    const start = () => {
      init();
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const preIo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          init();
          preIo.disconnect();
        }
      },
      { rootMargin: '800px' }
    );
    preIo.observe(canvas);

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '120px' });
    io.observe(canvas);

    // Η διάταξη του κειμένου αλλάζει χωρίς resize του canvas όταν: φορτώνουν τα fonts, κάνουν mount τα lazy σώματα (Industries, Calculator,
    // FAQ). Ξαναϋπολογίζουμε (debounced) — ΠΟΤΕ ανά frame.
    let safeTimer: ReturnType<typeof setTimeout>;
    const scheduleSafe = () => {
      clearTimeout(safeTimer);
      safeTimer = setTimeout(() => {
        if (!ready) return;
        computeSafe();
        if (!running) frame(performance.now());
      }, 180);
    };
    const host = canvas.parentElement;
    const mo = host ? new MutationObserver(scheduleSafe) : null;
    if (host && mo) mo.observe(host, { childList: true, subtree: true });
    document.fonts?.ready.then(scheduleSafe);
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'transform' && (e.target as Element).classList?.contains('reveal')) scheduleSafe();
    };
    host?.addEventListener('transitionend', onTransitionEnd);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!ready) return; // το πρώτο callback του RO έρχεται αμέσως μετά το mount — δεν στήνουμε τίποτα πριν χρειαστεί
        build();
        if (!running) frame(performance.now());
      }, 150);
    });
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    // touch: ταχύτητα scroll → ripple. Passive· αγνοούνται τα μικρά delta.
    const onScroll = () => {
      const y = window.scrollY;
      const d = y - lastScrollY;
      lastScrollY = y;
      if (Math.abs(d) < 3) return;
      scrollImpulse = Math.max(-80, Math.min(80, scrollImpulse + d));
    };
    if (!reduce) {
      if (finePointer) {
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseout', onLeave);
      } else {
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    }

    return () => {
      stop();
      preIo.disconnect();
      io.disconnect();
      ro.disconnect();
      clearTimeout(resizeTimer);
      clearTimeout(safeTimer);
      if (mo) mo.disconnect();
      host?.removeEventListener('transitionend', onTransitionEnd);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      style={{
        maskImage: 'radial-gradient(ellipse 90% 78% at 50% 42%, #000 38%, transparent 92%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 78% at 50% 42%, #000 38%, transparent 92%)',
      }}
    />
  );
}

export default ConstellationGrid;
