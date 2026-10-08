'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { menuSheet } from '@/lib/content';
import { Cta } from '@/components/ui/Cta';
import { cn } from '@/lib/cn';
import { MENU_SHEET_ID, useMobileChrome } from './MobileChrome';

/**
 * Bottom sheet (όχι overlay πλήρους οθόνης): anchor links, «Η ιστορία μας» και το CTA.
 * role="dialog" + aria-modal, focus trap, κλείνει με Esc / tap στο backdrop / tap σε link.
 * Γραμμές ≥ 44px. Συμπαγές background. Μόνο mobile (lg:hidden) — το desktop δεν αλλάζει.
 */
export default function MenuSheet() {
  const { sheetOpen, closeSheet } = useMobileChrome();
  const dialog = useRef<HTMLDivElement>(null);

  // Το component γίνεται mount ΑΡΓΟΤΕΡΑ (πρώτο tap στο ☰, lazy chunk) με sheetOpen ήδη true. Για να παίξει το slide-in,
  // το πρώτο paint γίνεται σε κλειστή κατάσταση και το «άνοιγμα» εφαρμόζεται στο επόμενο frame.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  const open = sheetOpen && entered;

  useEffect(() => {
    if (!open) return;
    const root = dialog.current;
    if (!root) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSheet();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const inside = root.contains(document.activeElement);
      if (!inside || (e.shiftKey && document.activeElement === first)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    const mq = window.matchMedia('(min-width: 1024px)'); // μεγάλωσε σε desktop → δεν έχει νόημα
    const onMq = () => mq.matches && closeSheet();
    mq.addEventListener('change', onMq);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open, closeSheet]);

  return (
    <div
      className={cn('fixed inset-0 z-[70] lg:hidden', !open && 'pointer-events-none')}
      // tap σε οποιοδήποτε link (και στο CTA) κλείνει το sheet
      onClick={(e) => {
        if ((e.target as Element).closest('a')) closeSheet();
      }}
    >
      {/* backdrop */}
      <div
        aria-hidden
        onClick={closeSheet}
        className={cn(
          'absolute inset-0 bg-black/60 motion-reduce:[transition:none]',
          // ανοίγει ΑΜΕΣΑ ορατό (visibility 0s)· στο κλείσιμο το visibility αργεί 300ms ώστε να παίξει το fade-out
          open
            ? 'visible opacity-100 [transition:opacity_300ms_ease-out,visibility_0s_linear_0s]'
            : 'invisible opacity-0 [transition:opacity_300ms_ease-out,visibility_0s_linear_300ms]'
        )}
      />

      {/* sheet */}
      <div
        id={MENU_SHEET_ID}
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-sheet-title"
        className={cn(
          'absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto overscroll-contain rounded-t-[28px] border border-b-0 border-white/[0.1] bg-night-900 px-4 pt-3 shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.8)] motion-reduce:[transition:none]',
          // Το focus() στο άνοιγμα απαιτεί ήδη ορατό στοιχείο: visibility αμέσως στο άνοιγμα, με καθυστέρηση στο κλείσιμο.
          open
            ? 'visible translate-y-0 [transition:transform_300ms_ease-out,visibility_0s_linear_0s]'
            : 'invisible translate-y-full [transition:transform_300ms_ease-out,visibility_0s_linear_300ms]'
        )}
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <span aria-hidden className="mx-auto mb-1 block h-1 w-10 rounded-full bg-white/20" />
        <div className="flex items-center justify-between">
          <p id="menu-sheet-title" className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-fg-dim">
            {menuSheet.title}
          </p>
          <button
            type="button"
            onClick={closeSheet}
            aria-label={menuSheet.close}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[0.06]"
          >
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden>
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="pt-1">
          {menuSheet.links.map((l) => (
            <li key={l.href} className="border-t border-white/[0.08]">
              <Link
                href={l.href}
                className="flex min-h-[52px] items-center justify-between font-display text-[18px] font-bold tracking-tight text-white"
              >
                {l.label}
                <span aria-hidden className="text-[16px] text-aura">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-white/[0.08] pt-4">
          <Cta where="menu_sheet" full />
        </div>
      </div>
    </div>
  );
}
