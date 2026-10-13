'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { formCopy } from '@/lib/content';
import {
  MIN_FILL_MS,
  athensIso,
  calculatorSchema,
  firstName,
  makeLeadSchema,
  type LeadFieldKey,
} from '@/lib/lead';
import { release, reserve } from '@/lib/rateLimit';

const schema = makeLeadSchema({ reasons: formCopy.reasons, revenues: formCopy.revenues });

export type LeadState = {
  status: 'idle' | 'ok' | 'error';
  message?: string;
  errors?: Partial<Record<LeadFieldKey, string>>;
  lead?: { firstName: string };
  /** true ΜΟΝΟ σε `next dev` χωρίς LEAD_WEBHOOK_URL: το lead καταγράφηκε στο log, δεν στάλθηκε πουθενά. */
  testMode?: boolean;
};

const DELIVERY_ERROR = 'Κάτι πήγε στραβά στην αποστολή. Δοκιμάστε ξανά σε λίγο.';
const WEBHOOK_TIMEOUT_MS = 10_000;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing'] as const;

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const errors: NonNullable<LeadState['errors']> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as LeadFieldKey;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: 'error', message: 'Ελέγξτε τα πεδία με κόκκινο.', errors };
  }

  const data = parsed.data;

  // Το bot γέμισε το honeypot: απαντάμε «ok» και δεν στέλνουμε τίποτα.
  if (data.website) return { status: 'ok', lead: { firstName: '' } };

  // Υποβολή < 3″ από τη στιγμή που η φόρμα έγινε ορατή = σχεδόν σίγουρα bot. Ήπιο μήνυμα, γιατί μπορεί να είναι
  // άνθρωπος με autofill: ξαναπατά το κουμπί και περνά.
  if (data.elapsedMs < MIN_FILL_MS) {
    return { status: 'error', message: 'Δοκιμάστε ξανά σε λίγο.' };
  }

  // ── Rate limit (βλ. lib/rateLimit.ts: best-effort, σε μνήμη) ──
  const slot = reserve(clientIp(), data.phone);
  if (slot === 'ip') {
    return { status: 'error', message: 'Πολλές αποστολές από αυτή τη σύνδεση. Δοκιμάστε ξανά αργότερα.' };
  }
  if (slot === 'phone') {
    return {
      status: 'error',
      message: 'Έχουμε ήδη το αίτημά σας με αυτό το κινητό — θα σας καλέσουμε σύντομα.',
    };
  }

  const utm = parseUtm(data.utm);
  const lead = {
    id: randomUUID(), // για να μην διπλογραφτεί αν ξαναδοκιμάσουμε (retry) — το Apps Script το ελέγχει
    submittedAt: athensIso(),
    name: data.name,
    phone: data.phone,
    email: data.email,
    business: data.business,
    reasons: data.reason ? [data.reason] : [],
    revenue: data.revenue,
    industryViewed: data.industry,
    calculator: parseCalculator(data.roi),
    utm,
    page: data.page || utm.landing || '',
  };

  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    // Χωρίς webhook (τοπικά/preview) το site δουλεύει, αλλά το lead δεν πάει πουθενά: το καταγράφουμε.
    console.warn('[auragram] LEAD_WEBHOOK_URL δεν έχει οριστεί — το lead ΔΕΝ προωθήθηκε (test mode).', JSON.stringify(lead));
    release(slot); // τίποτα δεν στάλθηκε πραγματικά — δεν «καίμε» το όριο των δοκιμών
    return {
      status: 'ok',
      lead: { firstName: firstName(data.name) },
      testMode: process.env.NODE_ENV === 'development',
    };
  }

  const delivered = await deliver(url, JSON.stringify({ secret: process.env.LEAD_WEBHOOK_SECRET ?? '', ...lead }));
  if (!delivered.ok) {
    release(slot);
    // Δεν χάνεται ποτέ: ολόκληρο το lead (χωρίς το secret) μένει στα Vercel logs.
    console.error('[auragram] LEAD ΔΕΝ ΠΑΡΑΔΟΘΗΚΕ — αποθηκεύστε το χειροκίνητα:', delivered.reason, JSON.stringify(lead));
    return { status: 'error', message: DELIVERY_ERROR };
  }

  return { status: 'ok', lead: { firstName: firstName(data.name) } };
}

/**
 * POST στο Apps Script web app. Το /exec απαντά με 302 προς το googleusercontent· το `redirect: 'follow'` το ακολουθεί
 * (ως GET) και η απάντηση είναι το JSON του doPost. `text/plain` ώστε να μην χρειάζεται preflight.
 * Timeout 10″ ανά προσπάθεια· ΜΙΑ επανάληψη σε σφάλμα δικτύου/timeout ή 5xx.
 */
async function deliver(url: string, body: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  let reason = 'unknown';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });
      if (res.status >= 500) {
        reason = `webhook ${res.status}`;
        continue; // retry
      }
      const text = await res.text();
      let json: { ok?: boolean; error?: string } | null = null;
      try {
        json = JSON.parse(text);
      } catch {
        /* όχι JSON (π.χ. HTML σελίδα σφάλματος του Google) */
      }
      if (res.ok && json?.ok === true) return { ok: true };
      return { ok: false, reason: `webhook ${res.status}: ${json?.error ?? text.slice(0, 160)}` }; // όχι retry
    } catch (err) {
      reason = `network: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  return { ok: false, reason };
}

function clientIp(): string | null {
  try {
    const h = headers();
    const xff = h.get('x-forwarded-for')?.split(',')[0]?.trim();
    return xff || h.get('x-real-ip') || null; // null = άγνωστη IP → δεν εφαρμόζεται όριο IP (τοπικά/δοκιμές)
  } catch {
    return null;
  }
}

function parseCalculator(value: string) {
  if (!value) return null;
  try {
    const r = calculatorSchema.safeParse(JSON.parse(value));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

function parseUtm(value: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!value) return out;
  try {
    const obj = JSON.parse(value);
    if (obj && typeof obj === 'object') {
      for (const k of UTM_KEYS) if (typeof obj[k] === 'string') out[k] = obj[k].slice(0, 200);
    }
  } catch {
    /* ignore */
  }
  return out;
}
