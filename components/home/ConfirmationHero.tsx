'use client';

import { useEffect, useState } from 'react';
import { readSubmittedLead, type SubmittedLead } from '@/lib/leadStore';
import { Eyebrow } from '@/components/ui/Section';

/**
 * Τα τηλέφωνα από τα οποία καλούμε. ΜΟΝΟ εδώ (σελίδα επιβεβαίωσης) και στο email επιβεβαίωσης (docs/apps-script/Code.gs) —
 * ΠΟΤΕ σε footer, JSON-LD, metadata ή στο lib/config.ts (εκεί θα έμπαιναν σε shared chunk που φορτώνουν όλες οι σελίδες).
 */
const CALLBACK_PHONES = ['698 171 8440', '694 323 2385'] as const;

/**
 * Το «Λάβαμε το αίτημά σας». Διαβάζει το πρώτο όνομα από τη φόρμα (μνήμη/sessionStorage — ποτέ από URL).
 * Τα τηλέφωνα εμφανίζονται ΜΟΝΟ εδώ (και στο email επιβεβαίωσης): αν δεν υπάρχει υποβολή σε αυτή τη συσκευή
 * (άμεση επίσκεψη, bot, scraper) δεν βγαίνουν καθόλου — ούτε στο HTML του server.
 */
export function ConfirmationHero() {
  const [lead, setLead] = useState<SubmittedLead | null | undefined>(undefined);
  useEffect(() => setLead(readSubmittedLead()), []);

  // undefined = δεν έχουμε διαβάσει ακόμα (SSR/πρώτο render): κρατάμε το ύψος, δεν δείχνουμε τίποτα.
  if (lead === undefined) return <div className="min-h-[320px] sm:min-h-[300px]" aria-hidden />;

  if (!lead) {
    return (
      <div>
        <Eyebrow tone="dark">ΑΙΤΗΜΑ</Eyebrow>
        <h1 className="pt-7 font-display text-[28px] font-extrabold leading-[1.08] tracking-tightest text-balance text-white sm:text-[40px]">
          Δεν βρήκαμε αίτημα σε αυτή τη συσκευή.
        </h1>
        <p className="pt-5 t-body text-fg">
          Αν μόλις στείλατε τη φόρμα, ελέγξτε το email σας — θα βρείτε εκεί την επιβεβαίωση. Αλλιώς, ζητήστε τον Χάρτη AI
          από τη φόρμα και σας καλούμε.
        </p>
        <a href="/#klisi" className="btn-cta mt-8 w-full sm:w-auto">
          Πηγαίνετε στη φόρμα
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aura">
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7.5 5.5 11 12 3.5" stroke="#0A1020" strokeWidth="2.4" strokeLinecap="square" />
          </svg>
        </span>
        <Eyebrow tone="dark">ΛΗΦΘΗΚΕ</Eyebrow>
      </div>

      <h1 className="pt-7 font-display text-[30px] font-extrabold leading-[1.08] tracking-tightest text-balance text-white sm:text-[44px]">
        Λάβαμε το αίτημά σας{lead.firstName ? `, ${lead.firstName}` : ''}.
      </h1>
      <p className="pt-5 t-body text-fg">
        Θα σας καλέσει ο Παναγιώτης ή ο Χρήστος σήμερα ή την επόμενη εργάσιμη. Σας στείλαμε και email επιβεβαίωσης.
      </p>
      <p className="pt-4 text-[14px] leading-relaxed text-fg-dim">
        Θα σας καλέσουμε από το{' '}
        <span className="whitespace-nowrap font-medium text-fg">{CALLBACK_PHONES[0]}</span> ή το{' '}
        <span className="whitespace-nowrap font-medium text-fg">{CALLBACK_PHONES[1]}</span> — αποθηκεύστε τα για να
        σηκώσετε.
      </p>

      {lead.testMode && (
        <p className="mt-6 inline-block rounded-lg border border-dashed border-amber-400 bg-amber-100 px-3 py-2 font-mono text-[12px] text-amber-900">
          ΔΟΚΙΜΑΣΤΙΚΗ ΛΕΙΤΟΥΡΓΙΑ (dev) — το lead καταγράφηκε στο log, δεν στάλθηκε πουθενά.
        </p>
      )}
    </div>
  );
}
