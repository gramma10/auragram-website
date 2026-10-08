'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CAL_LINK, contactEmail } from '@/lib/config';
import { track } from '@/lib/analytics';

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, unknown> };
  }
}

/**
 * Inline Cal.com — εμφανίζεται ΜΟΝΟ αφού σταλεί η φόρμα, ώστε να έχουμε
 * ήδη το email ακόμα κι αν ο επισκέπτης εγκαταλείψει το ημερολόγιο.
 * Στο `bookingSuccessful` πάμε στο /confirmation.
 */
export function CalEmbed({
  prefill,
}: {
  prefill: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const mounted = useRef(false);

  useEffect(() => {
    if (!CAL_LINK || mounted.current) return;
    mounted.current = true;

    // Stub του Cal.com: μαζεύει εντολές σε ουρά· το embed.js τις εκτελεί μόλις φορτώσει.
    const w = window as any;
    if (!w.Cal) {
      const stub: any = function (...args: unknown[]) {
        if (!stub.loaded) {
          stub.ns = {};
          stub.q = stub.q || [];
          const s = document.createElement('script');
          s.src = 'https://app.cal.com/embed/embed.js';
          s.async = true;
          document.head.appendChild(s);
          stub.loaded = true;
        }
        stub.q.push(args);
      };
      stub.q = [];
      stub.ns = {};
      w.Cal = stub;
    }

    window.Cal?.('init', { origin: 'https://cal.com' });

    window.Cal?.('inline', {
      elementOrSelector: '#cal-inline',
      calLink: CAL_LINK,
      layout: 'month_view',
      config: {
        name: prefill.name,
        email: prefill.email,
        'attendeePhoneNumber': prefill.phone,
        theme: 'light',
      },
    });

    window.Cal?.('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view',
      cssVarsPerTheme: {
        light: { 'cal-brand': '#0F1720' },
      },
    });

    window.Cal?.('on', {
      action: 'bookingSuccessful',
      callback: () => {
        track('booking_complete', { source: 'cal_inline' });
        router.push('/confirmation');
      },
    });
  }, [prefill, router]);

  if (!CAL_LINK) {
    return (
      <div className="border border-dashed border-ink/25 bg-ink/[0.03] p-6 text-center">
        <p className="font-display text-[15px] font-extrabold tracking-tight text-ink">
          Το ημερολόγιο δεν έχει συνδεθεί ακόμα.
        </p>
        <p className="mx-auto max-w-sm pt-2 text-[13px] leading-relaxed text-ink-soft">
          Ορίστε το <code className="font-mono text-[12px]">NEXT_PUBLIC_CAL_LINK</code> (π.χ.
          <code className="font-mono text-[12px]"> auragram/xartis-ai</code>) στο{' '}
          <code className="font-mono text-[12px]">.env.local</code>. Μέχρι τότε, το lead έχει
          ήδη σταλεί και μπορείτε να απαντήσετε χειροκίνητα.
        </p>
        <a
          href={`mailto:${contactEmail()}`}
          className="mt-4 inline-block border-b-2 border-ink pb-0.5 font-display text-[15px] font-extrabold text-ink"
        >
          {contactEmail()}
        </a>
      </div>
    );
  }

  return (
    <div
      id="cal-inline"
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      className="min-h-[620px] bg-white"
    />
  );
}
