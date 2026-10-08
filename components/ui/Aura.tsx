'use client';

import { useEffect, useRef } from 'react';

/**
 * Κινούμενο «aura» φόντο — ΜΟΝΟ hero + agents. 3 μεγάλα απαλά radial-gradient blobs (cyan/teal, opacity 0.10–0.18, ΚΑΝΕΝΑ mov),
 * ΟΧΙ filter:blur· animates μόνο transform (translate+scale), 24–32s, διαφορετική διάρκεια ανά blob. Βλ. .aura-* στο globals.css.
 * Το μοναδικό JS είναι ένα IntersectionObserver που κάνει pause το animation όταν το section είναι εκτός οθόνης.
 * Μπαίνει ως ΠΡΩΤΟ παιδί του section (που έχει `relative overflow-hidden isolate`): z -10 → πίσω από το περιεχόμενο ΚΑΙ το grid.
 */
export function Aura({ tall = false }: { tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => {
      el.dataset.paused = e.isIntersecting ? 'false' : 'true';
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className={`aura${tall ? ' aura-tall' : ''} pointer-events-none absolute inset-0 -z-10 overflow-hidden`}>
      <span className="aura-blob aura-a" />
      <span className="aura-blob aura-b" />
      <span className="aura-blob aura-c" />
    </div>
  );
}
