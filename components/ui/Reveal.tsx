'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Η ΜΟΝΗ κίνηση εισόδου του site: fade-up 400ms, σε καθαρό CSS.
 *
 * ΚΡΙΣΙΜΟ: το περιεχόμενο είναι ορατό ΑΠΟ ΠΡΟΕΠΙΛΟΓΗ. Το `opacity: 0`
 * εφαρμόζεται μόνο όταν το `<html>` έχει `data-js` (βλ. layout.tsx), δηλαδή
 * μόνο όταν τρέχει JavaScript. Αν το JS αποτύχει ή αργήσει, ο επισκέπτης
 * βλέπει ολόκληρη τη σελίδα — σε ένα site πωλήσεων αυτό δεν διαπραγματεύεται.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'span';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }
    // Αν ο επισκέπτης προσγειώθηκε σε anchor (π.χ. /#pilot), ό,τι έμεινε πάνω από το viewport δεν θα «τεμνόταν»
    // ποτέ — το δείχνουμε αμέσως. Το ελέγχουμε μέσα στο πρώτο callback του IO (boundingClientRect.bottom < 0)
    // και ΟΧΙ με getBoundingClientRect στο mount: αυτό ανάγκαζε σύγχρονο layout σε κάθε Reveal (forced reflow).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — ένα ref για τέσσερα πιθανά tags
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? { transitionDelay: `${Math.round(delay * 1000)}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
