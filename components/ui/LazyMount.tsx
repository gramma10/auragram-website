'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lazy mount: το βαρύ client κομμάτι ενός section φορτώνεται (next/dynamic) και «ανεβαίνει» μόνο όταν
 * πλησιάσει το viewport — έως τότε υπάρχει μόνο ένα placeholder με ΡΕΑΛΙΣΤΙΚΟ ύψος.
 *
 *  • `children` πρέπει να είναι στοιχείο που φορτώνει lazy (π.χ. <CalculatorBody /> από next/dynamic ssr:false):
 *    το module κατεβαίνει μόνο όταν γίνει render, δηλαδή μόνο μετά το IntersectionObserver.
 *  • `rootMargin` 700px: ξεκινά ΠΡΙΝ φτάσει ο επισκέπτης → η όποια μικρή διαφορά ύψους συμβαίνει εκτός οθόνης (CLS ≈ 0).
 *  • Το placeholder ΜΕΝΕΙ μέχρι το lazy σώμα να γίνει πραγματικά mount (το chunk μπορεί να αργεί): το σώμα καλεί
 *    useLazyReady() σε layout effect → το placeholder φεύγει πριν το επόμενο paint. Αλλιώς, όσο κατεβαίνει το
 *    chunk, το section θα «έπεφτε» στο μηδέν και η σελίδα θα πήδαγε (CLS).
 *  • Όταν το σώμα είναι έτοιμο, το wrapper γίνεται `display: contents` (δεν επηρεάζει τη διάταξη — τα παιδιά
 *    είναι άμεσα grid/flex items του γονέα).
 *  • `placeholder`: προαιρετικό server-rendered στατικό markup (π.χ. οι ερωτήσεις του FAQ για SEO) που
 *    αντικαθίσταται από το διαδραστικό κομμάτι.
 *  • Χωρίς IntersectionObserver → mount αμέσως (ποτέ δεν χάνεται περιεχόμενο).
 */
const ReadyCtx = createContext<(() => void) | null>(null);

/** Καλείται από το lazy σώμα: σημαίνει «έγινα mount — βγάλε το placeholder» (layout effect: πριν το paint). */
export function useLazyReady() {
  const ready = useContext(ReadyCtx);
  useLayoutEffect(() => {
    ready?.();
  }, [ready]);
}

export function LazyMount({
  children,
  placeholder,
  className,
  rootMargin = '700px 0px',
  eager = false,
}: {
  children: ReactNode;
  placeholder?: ReactNode;
  /** Διαστάσεις του placeholder (min-height). Δεν εφαρμόζεται μετά το mount. */
  className?: string;
  rootMargin?: string;
  /** true → mount αμέσως, χωρίς να περιμένει το viewport (π.χ. deep link `/?industry=…`). */
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  // σταθερό callback: αλλιώς το layout effect του σώματος θα ξανάτρεχε σε κάθε render του LazyMount
  const markReady = useRef(() => setReady(true)).current;

  useEffect(() => {
    if (eager) setShow(true);
  }, [eager]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={ready ? 'contents' : cn(className)}>
      {!ready && placeholder}
      {show && <ReadyCtx.Provider value={markReady}>{children}</ReadyCtx.Provider>}
    </div>
  );
}
