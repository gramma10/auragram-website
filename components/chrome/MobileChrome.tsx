'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * Κοινή κατάσταση του mobile «chrome» (< 1024px): top bar, bottom dock, bottom sheet.
 *  • dockVisible : το dock εμφανίζεται (ορίζεται από το <StickyCta/>) → το top bar κρύβει το ☰ του
 *                  (ποτέ δύο ☰ μαζί) και αρχίζει να κρύβεται στο scroll down.
 *  • sheetOpen   : το bottom sheet με τα links είναι ανοιχτό. Δύο triggers (top bar ☰ / dock ☰),
 *                  ένα sheet· το focus επιστρέφει σε αυτόν που το άνοιξε.
 */
type Chrome = {
  sheetOpen: boolean;
  openSheet: (trigger: HTMLElement | null) => void;
  closeSheet: () => void;
  dockVisible: boolean;
  setDockVisible: (v: boolean) => void;
};

const Ctx = createContext<Chrome | null>(null);

export function useMobileChrome() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useMobileChrome: λείπει ο <MobileChromeProvider>');
  return c;
}

export const MENU_SHEET_ID = 'menu-sheet';

// Το bottom sheet (links + CTA) ΔΕΝ είναι στο αρχικό bundle. Το chunk κατεβαίνει στο background (prefetch) μόλις
// εμφανιστεί το dock ή, αν έρθει πρώτο, όταν το browser είναι αδρανές μετά το load — ώστε το πρώτο tap στο ☰ να
// ανοίγει αμέσως. Ένα κοινό loader: το import() επιστρέφει το ίδιο promise, άρα το chunk κατεβαίνει μία φορά.
const loadMenuSheet = () => import('./MenuSheet');
const MenuSheet = dynamic(loadMenuSheet, { ssr: false });

export function MobileChromeProvider({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMounted, setSheetMounted] = useState(false);
  const [dockVisible, setDockVisible] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);

  const openSheet = useCallback((t: HTMLElement | null) => {
    trigger.current = t;
    setSheetMounted(true);
    setSheetOpen(true);
  }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Prefetch του sheet: ό,τι έρθει πρώτο — το dock γίνεται ορατό ή idle callback μετά το load. Μόλις κατέβει το chunk,
  // το sheet γίνεται mount ΚΛΕΙΣΤΟ (invisible, εκτός οθόνης — ίδια κατάσταση με «μετά το πρώτο κλείσιμο») → το πρώτο tap στο ☰
  // αλλάζει μόνο το `open` και το άνοιγμα ξεκινά στο επόμενο frame, χωρίς να περιμένει import ή mount.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const premount = () => {
      void loadMenuSheet().then(() => {
        if (alive.current) setSheetMounted(true);
      });
    };
    if (dockVisible) {
      premount();
      return;
    }
    let cancel: () => void;
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(premount, { timeout: 4000 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(premount, 2500);
        cancel = () => window.clearTimeout(id);
      }
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      cancel?.();
    };
  }, [dockVisible]);

  // Επιστροφή focus στο ☰ που άνοιξε το sheet (αν δεν φαίνεται πια, στο ☰ που φαίνεται τώρα).
  useEffect(() => {
    if (sheetOpen || !trigger.current) return;
    const t = trigger.current;
    trigger.current = null;
    const target =
      t.getClientRects().length > 0
        ? t
        : Array.from(document.querySelectorAll<HTMLElement>('[data-menu-trigger]')).find((el) => el.getClientRects().length > 0);
    target?.focus();
  }, [sheetOpen]);

  const value = useMemo(
    () => ({ sheetOpen, openSheet, closeSheet, dockVisible, setDockVisible }),
    [sheetOpen, openSheet, closeSheet, dockVisible]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {sheetMounted && <MenuSheet />}
    </Ctx.Provider>
  );
}
