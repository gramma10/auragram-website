'use server';

import { z } from 'zod';
import { formCopy } from '@/lib/content';

const schema = z.object({
  name: z.string().trim().min(2, 'Συμπληρώστε το όνομά σας.').max(80),
  email: z.string().trim().email('Ελέγξτε το email σας.').max(120),
  // Ελληνικά κινητά & διεθνή: επιτρέπουμε +, κενά, παύλες.
  phone: z
    .string()
    .trim()
    .min(9, 'Ελέγξτε το κινητό σας.')
    .max(24)
    .regex(/^[+\d][\d\s\-().]{7,}$/, 'Ελέγξτε το κινητό σας.'),
  business: z.string().trim().min(2, 'Πείτε μας τι κάνει η επιχείρησή σας.').max(120),
  reason: z.enum(formCopy.reasons as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Διαλέξτε μία επιλογή.' }),
  }),
  revenue: z.enum(formCopy.revenues as unknown as [string, ...string[]], {
    errorMap: () => ({ message: 'Διαλέξτε μία επιλογή.' }),
  }),
  // Honeypot — αόρατο στους ανθρώπους, ακαταμάχητο στα bots.
  website: z.string().max(0).optional().default(''),
  roi: z.string().optional().default(''),
  // Round 3: ο τελευταίος κλάδος που είδε ο επισκέπτης (slug) — hidden field, όπως το roi.
  industry: z.string().max(40).optional().default(''),
  utm: z.string().optional().default(''),
});

export type LeadState = {
  status: 'idle' | 'ok' | 'error';
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof schema>, string>>;
  lead?: { name: string; email: string; phone: string };
};

/**
 * Αόρατο φιλτράρισμα (§5.11): υπολογίζουμε score, ΔΕΝ απορρίπτουμε ποτέ σκληρά.
 * Το score ταξιδεύει στο webhook και εκεί αποφασίζετε ποια slots θα δείξετε.
 */
function scoreLead(input: z.infer<typeof schema>) {
  let score = 0;
  const revenueWeights: Record<string, number> = {
    '< 50.000€': 1,
    '50.000 – 150.000€': 3,
    '150.000 – 500.000€': 5,
    '500.000€ +': 6,
    'Δεν λέω': 3,
  };
  const reasonWeights: Record<string, number> = {
    'Χάνω leads': 5,
    'Πνίγομαι σε χειροκίνητη δουλειά': 5,
    'Θέλω ανάπτυξη χωρίς προσλήψεις': 4,
    Περιέργεια: 1,
  };
  score += revenueWeights[input.revenue] ?? 0;
  score += reasonWeights[input.reason] ?? 0;
  return { score, tier: score >= 8 ? 'A' : score >= 5 ? 'B' : 'C' };
}

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const errors: LeadState['errors'] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof schema>;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: 'error', message: 'Ελέγξτε τα πεδία με κόκκινο.', errors };
  }

  const data = parsed.data;

  // Το bot γέμισε το honeypot: απαντάμε «ok» και δεν στέλνουμε τίποτα.
  if (data.website) return { status: 'ok', lead: { name: '', email: '', phone: '' } };

  const payload = {
    ...data,
    website: undefined,
    ...scoreLead(data),
    roi: safeJson(data.roi),
    utm: safeJson(data.utm),
    source: 'auragram-site',
    submittedAt: new Date().toISOString(),
  };

  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    // Χωρίς webhook το site δουλεύει, αλλά το lead δεν πάει πουθενά.
    console.warn('[auragram] LEAD_WEBHOOK_URL δεν έχει οριστεί — το lead δεν προωθήθηκε.', payload);
  } else {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.LEAD_WEBHOOK_SECRET
            ? { 'x-auragram-secret': process.env.LEAD_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (err) {
      console.error('[auragram] Αποτυχία webhook:', err);
      return {
        status: 'error',
        message:
          'Κάτι πήγε στραβά στην αποστολή. Δοκιμάστε ξανά ή γράψτε μας απευθείας στο auragram.web@gmail.com.',
      };
    }
  }

  return {
    status: 'ok',
    lead: { name: data.name, email: data.email, phone: data.phone },
  };
}

function safeJson(value: string) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
