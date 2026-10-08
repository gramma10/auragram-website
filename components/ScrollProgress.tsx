'use client';

import { useEffect, useRef } from 'react';

/**
 * Μπάρα προόδου scroll: 2px cyan, καρφωμένη στο ΠΑΝΩ-ΠΑΝΩ άκρο του viewport (πάνω από το nav).
 * Ένας μόνο passive scroll listener + rAF· γράφει μόνο transform (scaleX) → κανένα layout, κανένα paint
 * πέρα από το ίδιο το στοιχείο. Διακοσμητική: aria-hidden, pointer-events none.
 * Δεν έχει transition: ακολουθεί το scroll 1:1, άρα ισχύει όπως είναι και με prefers-reduced-motion
 * (δεν είναι «κίνηση», είναι ένδειξη θέσης). Η ίδια λογική για κάθε variant των agents — μετράει το
 * πραγματικό ύψος του εγγράφου, όποιο variant κι αν είναι ενεργό.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = bar.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // Χωρίς σύγχρονο update() στο mount (forced reflow): το πρώτο ResizeObserver callback έρχεται ΜΕΤΑ το layout
    // και προγραμματίζει το πρώτο update στο επόμενο frame.
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Το ύψος του εγγράφου αλλάζει όταν αλλάζει variant / γίνονται render τα sections.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]">
      <div ref={bar} className="h-full origin-left bg-aura" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
