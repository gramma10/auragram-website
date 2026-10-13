'use client';

import { useEffect, useState } from 'react';
import { CTA } from '@/lib/config';
import { menuSheet } from '@/lib/content';
import { track, trackOnce } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { MENU_SHEET_ID, useMobileChrome } from './chrome/MobileChrome';

/**
 * Mobile bottom DOCK — αντικαθιστά το παλιό sticky CTA bar:  [ ☰ ]  [ Κλείστε τον Χάρτη AI — 30′ δωρεάν → ]
 * (κουμπί menu 48×48 + το CTA με το ΠΛΗΡΕΣ label να γεμίζει τον υπόλοιπο χώρο). Μόνο < 1024px.
 *
 * Κανόνες εμφάνισης/απόκρυψης — ΑΚΡΙΒΩΣ οι ίδιοι με το sticky CTA της Φάσης 4:
 *  • ΕΜΦΑΝΙΖΕΤΑΙ όταν το CTA του hero βγει από το viewport.
 *  • ΚΡΥΒΕΤΑΙ όσο φαίνεται οποιοδήποτε άλλο CTA (`[data-cta]`) ή το booking (#klisi, από το πρώτο pixel
 *    του και 120px νωρίτερα) — ώστε να μην καλύψει ποτέ φόρμα / Cal.com.
 *  • Στοιβάζεται ΠΑΝΩ από το cookie banner (--cookie-h).
 *  • Υποχωρεί στο mini-bar του calculator (html[data-minibar] → βλ. globals.css).
 * Ενημερώνει το MobileChrome (dockVisible) ώστε το top bar να κρύψει το δικό του ☰.
 */
export function StickyCta() {
  const { openSheet, setDockVisible } = useMobileChrome();
  const [heroOut, setHeroOut] = useState(false);
  const [otherVisible, setOtherVisible] = useState(false);

  useEffect(() => {
    // Ποια elements είναι τώρα στο viewport — κρατάμε ένα Set, όχι boolean ανά observer.
    const visible = new Set<Element>();
    let heroSeen = false;
    // Σελίδες χωρίς hero CTA (π.χ. /about): το dock εμφανίζεται μετά το πρώτο scroll.
    const hasHero = !!document.querySelector('[data-cta="hero"]');

    const sync = () => {
      let hero = false;
      let other = false;
      visible.forEach((el) => {
        if (el.getAttribute('data-cta') === 'hero') hero = true;
        else other = true;
      });
      setHeroOut(hasHero ? !hero && heroSeen : window.scrollY > 520);
      setOtherVisible(other);
    };

    const handle = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((e) => {
        const isHero = e.target.getAttribute('data-cta') === 'hero';
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
        // Το "hero βγήκε" ισχύει μόνο αφού το είδαμε πρώτα (ή το προσπεράσαμε προς τα κάτω).
        if (isHero && (e.isIntersecting || e.boundingClientRect.top < 0)) heroSeen = true;
      });
      sync();
    };
    // Τα CTA είναι μικρά στοιχεία: αρκεί 10% ορατότητα.
    const io = new IntersectionObserver(handle, { threshold: 0.1 });
    // Το booking είναι τεράστιο section: το dock κρύβεται ΑΠΟ ΤΟ πρώτο pixel του (και 120px νωρίτερα).
    const ioForm = new IntersectionObserver(handle, { threshold: 0, rootMargin: '0px 0px 120px 0px' });

    document.querySelectorAll('[data-cta]').forEach((el) => io.observe(el));
    const form = document.getElementById('klisi');
    if (form) ioForm.observe(form);

    // CTA που μπαίνουν ΜΕΤΑ το mount (lazy sections: calculator, bottom sheet) πρέπει να παρατηρούνται κι αυτά —
    // αλλιώς το dock θα τα κάλυπτε. Όσα φεύγουν από το DOM βγαίνουν από το Set.
    const ctasIn = (n: Node): Element[] =>
      n instanceof Element ? [...(n.matches('[data-cta]') ? [n] : []), ...Array.from(n.querySelectorAll('[data-cta]'))] : [];
    const mo = new MutationObserver((records) => {
      let changed = false;
      records.forEach((rec) => {
        rec.addedNodes.forEach((n) => ctasIn(n).forEach((el) => io.observe(el)));
        rec.removedNodes.forEach((n) =>
          ctasIn(n).forEach((el) => {
            io.unobserve(el);
            if (visible.delete(el)) changed = true;
          })
        );
      });
      if (changed) sync();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Ανάλυση: σταθερή συμπεριφορά (δεν άλλαξε) — scroll depth 75%.
    let raf = 0;
    const update = () => {
      raf = 0;
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
      if (pct > 0.75) trackOnce('scroll_75');
      if (!hasHero) sync();
    };
    // passive + throttled στο rAF (η σημασιολογία του scroll_75 δεν αλλάζει)
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll(); // πρώτο update στο επόμενο frame — όχι σύγχρονη ανάγνωση layout (scrollHeight) μέσα στο hydration
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
      ioForm.disconnect();
    };
  }, []);

  const show = heroOut && !otherVisible;

  useEffect(() => {
    setDockVisible(show);
    return () => setDockVisible(false);
  }, [show, setDockVisible]);

  return (
    <div
      className={cn(
        'sticky-cta fixed inset-x-0 z-40 border-t border-white/[0.08] bg-night-900/[0.96] px-4 pt-3 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      )}
      style={{ bottom: 'var(--cookie-h, 0px)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      aria-hidden={!show}
    >
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          data-menu-trigger
          tabIndex={show ? 0 : -1}
          aria-haspopup="dialog"
          aria-controls={MENU_SHEET_ID}
          aria-label={menuSheet.open}
          onClick={(e) => openSheet(e.currentTarget)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.14] text-white transition-colors hover:bg-white/[0.06]"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <a
          href={CTA.href}
          tabIndex={show ? 0 : -1}
          onClick={() => track('hero_cta_click', { where: 'sticky_bar' })}
          className="btn-cta min-w-0 flex-1 !min-h-[48px] !gap-2 !px-3 !py-2 !text-[13.5px] leading-tight"
        >
          <span className="min-w-0 text-center">{CTA.label}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="btn-arrow">
            <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
          </svg>
        </a>
      </div>
    </div>
  );
}
