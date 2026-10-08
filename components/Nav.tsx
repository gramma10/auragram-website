'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoMark } from './Logo';
import { CTA } from '@/lib/config';
import { menuSheet } from '@/lib/content';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { MENU_SHEET_ID, useMobileChrome } from './chrome/MobileChrome';

const links = [
  { href: '/#agents', label: 'AI Agents' },
  { href: '/#ypiresies', label: 'Υπηρεσίες' },
  { href: '/#kladoi', label: 'Κλάδοι' },
  { href: '/#pilot', label: 'Το pilot' },
  { href: '/about', label: 'Ποιοι είμαστε' },
];

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Auragram — αρχική"
      className="flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-full"
    >
      <LogoMark className="h-8 w-auto sm:h-9" priority />
      <span className="font-display text-[14px] leading-none tracking-[0.16em] text-white sm:text-[15px]">
        <span className="font-extrabold">AURA</span>
        <span className="font-medium text-fg-dim">GRAM</span>
      </span>
    </Link>
  );
}

/**
 * Nav: συμπαγές pill (#0A1020 στο 96%, χωρίς blur, hairline 8%).
 *
 * ≥ 1024px : links στο κέντρο, CTA δεξιά (ΑΜΕΤΑΒΛΗΤΟ).
 * < 1024px : λογότυπο + ☰ όσο είμαστε στην κορυφή. Μόλις εμφανιστεί το bottom dock (που έχει δικό του ☰)
 *            το top bar δείχνει ΜΟΝΟ λογότυπο — ποτέ δύο ☰ μαζί — και κρύβεται στο scroll down /
 *            ξαναεμφανίζεται στο scroll up. Το ☰ ανοίγει bottom sheet (βλ. MobileChrome).
 * Το CTA δεν ζει στο mobile top bar: το πλήρες label δεν χωράει· το αναλαμβάνει το dock.
 */
export function Nav() {
  const { dockVisible, openSheet } = useMobileChrome();
  const [hidden, setHidden] = useState(false); // κρυμμένο λόγω scroll down (μόνο όσο φαίνεται το dock)

  useEffect(() => {
    if (!dockVisible) {
      setHidden(false);
      return;
    }
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const d = y - last;
      if (Math.abs(d) < 6) return; // αγνοούμε το «τρεμούλιασμα»
      setHidden(d > 0 && y > 80); // κάτω → κρύψιμο, πάνω → εμφάνιση
      last = y;
    };
    // passive + throttled στο rAF: το πολύ μία δουλειά ανά frame
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dockVisible]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-3 z-50 px-4 sm:top-4 sm:px-6',
        'max-lg:transition-transform max-lg:duration-300 max-lg:ease-out motion-reduce:transition-none',
        hidden && 'max-lg:-translate-y-[150%]'
      )}
    >
      <nav
        aria-label="Κύριο μενού"
        className="relative mx-auto flex h-[60px] w-full max-w-page items-center justify-between rounded-full border border-white/[0.08] bg-night-900/[0.96] pl-5 pr-2 sm:h-[68px] sm:pl-8 sm:pr-3"
      >
        <Brand />

        <div className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-display text-[12.5px] font-bold uppercase tracking-[0.08em] text-fg transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <a
          href={CTA.href}
          data-cta="nav"
          onClick={() => track('hero_cta_click', { where: 'nav' })}
          className="btn-cta hidden !min-h-0 !px-6 !py-3.5 !text-[12.5px] uppercase tracking-[0.08em] lg:inline-flex"
        >
          <span>{CTA.label}</span>
        </a>

        {/* ☰ του top bar: ΜΟΝΟ όσο ΔΕΝ φαίνεται το dock (αλλιώς θα υπήρχαν δύο) */}
        <button
          type="button"
          data-menu-trigger
          aria-haspopup="dialog"
          aria-controls={MENU_SHEET_ID}
          aria-label={menuSheet.open}
          onClick={(e) => openSheet(e.currentTarget)}
          className={cn(
            'h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[0.06] lg:hidden',
            dockVisible ? 'hidden' : 'flex'
          )}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M3 7h16M3 15h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
