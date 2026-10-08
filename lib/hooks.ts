'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/** Μπήκε το στοιχείο στο viewport; Μικρό IntersectionObserver hook. */
export function useInView(
  ref: RefObject<Element>,
  { once = true, amount = 0.3 }: { once?: boolean; amount?: number } = {}
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true); // χωρίς IO, δείχνουμε τα πάντα
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, amount]);

  return inView;
}

/** Σέβεται το `prefers-reduced-motion` του λειτουργικού. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduced;
}

/** Σύγχρονη ανάγνωση (μόνο για client-only components που ΔΕΝ γίνονται SSR, π.χ. τα lazy σώματα). */
export const prefersReducedMotionNow = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Βοηθητικό: σταθερό ref + inView σε μία γραμμή. */
export function useInViewRef<T extends Element>(opts?: { once?: boolean; amount?: number }) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, opts);
  return [ref, inView] as const;
}

/**
 * Fade στις άκρες ενός οριζόντιου scroller (pill rows σε mobile): γράφει τα CSS vars --fl / --fr (px) ώστε το
 * mask (.fade-x στο globals.css) να σβήνει ΜΟΝΟ την πλευρά που έχει κι άλλο περιεχόμενο. Χωρίς layout reads στο mount:
 * το πρώτο update έρχεται από ResizeObserver (μετά το layout). Passive scroll listener, τίποτα στο render.
 */
export function useEdgeFade(ref: RefObject<HTMLElement>, size = 28) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.style.setProperty('--fl', el.scrollLeft > 2 ? `${size}px` : '0px');
      el.style.setProperty('--fr', max - el.scrollLeft > 2 ? `${size}px` : '0px');
    };
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [ref, size]);
}

/** Φέρνει το ενεργό pill στο κέντρο του οριζόντιου scroller (μόνο οριζόντια — ποτέ scroll της σελίδας). */
export function scrollPillIntoView(list: HTMLElement | null, pill: HTMLElement | null, smooth: boolean) {
  if (!list || !pill || list.scrollWidth <= list.clientWidth) return;
  const left = pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2;
  list.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
}
