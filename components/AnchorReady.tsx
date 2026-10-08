'use client';

import { useEffect } from 'react';

/**
 * Συνοδεύει το `content-visibility: auto` του globals.css: τα sections κάτω από το
 * hero δεν γίνονται render μέχρι να πλησιάσουν (γρηγορότερο πρώτο layout / LCP).
 * Μέχρι όμως να γίνουν render, το ύψος τους είναι εκτίμηση — άρα ένα anchor jump
 * (π.χ. το CTA → #klisi) θα μπορούσε να προσγειωθεί λάθος. Γι’ αυτό, ΠΡΙΝ από κάθε
 * πλοήγηση σε hash, βάζουμε `data-ready` στο <html> και ΟΛΑ γίνονται render κανονικά.
 */
export function AnchorReady() {
  useEffect(() => {
    const root = document.documentElement;
    const ready = () => root.setAttribute('data-ready', '');
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]');
      if (a) ready();
    };
    // capture: τρέχει πριν από τον browser / το Next Link
    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', ready);
    window.addEventListener('popstate', ready);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('hashchange', ready);
      window.removeEventListener('popstate', ready);
    };
  }, []);
  return null;
}
