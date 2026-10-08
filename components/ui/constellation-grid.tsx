'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Ήσυχο πλέγμα κόμβων ως φόντο για τα ανοιχτόχρωμα sections.
 *
 * Προσαρμοσμένο από το «constellation-grid» ώστε να ταιριάζει με το Apple-like
 * ύφος του site: κανένας τίτλος/ετικέτα/crosshair, πολύ χαμηλή αντίθεση, αργή
 * κίνηση, απαλή αντίδραση στον δείκτη (όχι shockwave). Είναι διακοσμητικό
 * στρώμα — `pointer-events-none`, δεν πιάνει scroll ούτε cursor.
 *
 * • Τρέχει μόνο όσο είναι ορατό (IntersectionObserver).
 * • Σέβεται το `prefers-reduced-motion` — ζωγραφίζει ένα στατικό καρέ.
 * • Χωρίς αλληλεπίδραση σε συσκευές αφής (εξοικονόμηση μπαταρίας).
 * • Μάσκα στις άκρες ώστε να λιώνει μέσα στο section.
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

    // Ink (#0F1720) σε πολύ χαμηλό alpha — μονόχρωμο, καθαρό.
    const INK = '15, 23, 32';
    const GAP = 66;
    const MAX_DIST = 84;

    type N = { x: number; y: number; vx: number; vy: number; bx: number; by: number; r: number; p: number };
    let nodes: N[] = [];
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    const mouse = { x: -9999, y: -9999 };

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
          nodes[i * rows + j] = {
            x,
            y,
            vx: 0,
            vy: 0,
            bx: x,
            by: y,
            r: Math.random() * 0.55 + 0.7,
            p: Math.random() * Math.PI * 2,
          };
        }
      }
    };

    const link = (a: N, b: N) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d >= MAX_DIST) return;
      ctx.strokeStyle = `rgba(${INK}, ${(1 - d / MAX_DIST) * 0.13})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.7;

      const K = 13;
      const DAMP = 0.87;
      const R = 168;

      for (const n of nodes) {
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
        }
        n.vx += (n.bx - n.x) * K * dt;
        n.vy += (n.by - n.y) * K * dt;
        n.vx *= DAMP;
        n.vy *= DAMP;
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
      }

      // Συνδέσεις μόνο με γείτονες πλέγματος → O(n), σταθερό framerate.
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const n = nodes[i * rows + j];
          if (i + 1 < cols) link(n, nodes[(i + 1) * rows + j]);
          if (j + 1 < rows) link(n, nodes[i * rows + j + 1]);
          if (i + 1 < cols && j + 1 < rows) link(n, nodes[(i + 1) * rows + j + 1]);
          if (i - 1 >= 0 && j + 1 < rows) link(n, nodes[(i - 1) * rows + j + 1]);
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = `rgba(${INK}, ${0.13 + Math.sin(n.p) * 0.045})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
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

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { rootMargin: '120px' }
    );
    io.observe(canvas);

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
    if (finePointer) {
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseout', onLeave);
    }

    return () => {
      stop();
      preIo.disconnect();
      io.disconnect();
      ro.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      style={{
        maskImage:
          'radial-gradient(ellipse 90% 78% at 50% 42%, #000 38%, transparent 92%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 90% 78% at 50% 42%, #000 38%, transparent 92%)',
      }}
    />
  );
}

export default ConstellationGrid;
