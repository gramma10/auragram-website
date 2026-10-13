import { z } from 'zod';

/**
 * Το σχήμα της φόρμας — ΜΙΑ πηγή για τον client (inline errors) και τον server (πραγματική επικύρωση).
 * Καθαρό module: χωρίς imports από το site, ώστε να τρέχει και σε scripts δοκιμών.
 */

/** Ελληνικό κινητό: 69XXXXXXXX, προαιρετικό +30 / 0030, κενά/παύλες/τελείες/παρενθέσεις επιτρέπονται → «+3069XXXXXXXX». */
export function normalizeGreekMobile(input: string): string | null {
  const compact = input.replace(/[\s\-.()]/g, '');
  const m = compact.match(/^(?:\+30|0030)?(69\d{8})$/);
  return m ? `+30${m[1]}` : null;
}

export const MSG = {
  name: 'Γράψτε το ονοματεπώνυμό σας.',
  phone: 'Γράψτε ένα ελληνικό κινητό, π.χ. 69X XXX XXXX.',
  email: 'Ελέγξτε το email σας — π.χ. maria@company.gr.',
  business: 'Πείτε μας τι κάνει η επιχείρησή σας.',
  choice: 'Διαλέξτε μία από τις επιλογές.',
} as const;

const trimmed = (max: number) => z.string().trim().max(max);

export const calculatorSchema = z.object({
  leads: z.number().finite(),
  responseRate: z.number().finite(),
  avgValue: z.number().finite(),
  hoursPerWeek: z.number().finite(),
  lostRevenue: z.number().finite(),
  hoursPerMonth: z.number().finite(),
  timeValue: z.number().finite(),
});

/** Τα πεδία που βλέπει ο επισκέπτης (+ honeypot + χρόνος). Τα hidden (roi/utm/industry/page) επικυρώνονται χωριστά. */
export function makeLeadSchema(opts: { reasons: readonly string[]; revenues: readonly string[] }) {
  return z.object({
    name: trimmed(80).min(2, MSG.name),
    phone: trimmed(32)
      .transform((v, ctx) => {
        const n = normalizeGreekMobile(v);
        if (!n) ctx.addIssue({ code: z.ZodIssueCode.custom, message: MSG.phone });
        return n ?? v;
      }),
    email: trimmed(120).toLowerCase().email(MSG.email),
    business: trimmed(120).min(2, MSG.business),
    // προαιρετικά chips: κενό = δεν απάντησε
    reason: trimmed(80)
      .optional()
      .default('')
      .refine((v) => v === '' || opts.reasons.includes(v), MSG.choice),
    revenue: trimmed(80)
      .optional()
      .default('')
      .refine((v) => v === '' || opts.revenues.includes(v), MSG.choice),
    // Honeypot — αόρατο στους ανθρώπους, ακαταμάχητο στα bots.
    website: z.string().max(0).optional().default(''),
    // Χιλιοστά που πέρασαν από τη στιγμή που η φόρμα έγινε ορατή (βλ. MIN_FILL_MS).
    elapsedMs: z.coerce.number().finite().optional().default(0),
    roi: z.string().max(2000).optional().default(''),
    industry: z.string().max(40).optional().default(''),
    utm: z.string().max(2000).optional().default(''),
    page: z.string().max(300).optional().default(''),
  });
}

export type LeadInput = z.infer<ReturnType<typeof makeLeadSchema>>;
export type LeadFieldKey = 'name' | 'phone' | 'email' | 'business' | 'reason' | 'revenue';

/** Απορρίπτουμε υποβολές < 3″ από τη στιγμή που η φόρμα έγινε ορατή. */
export const MIN_FILL_MS = 3000;

/** Πρώτο όνομα για το «Λάβαμε το αίτημά σας, {first name}». */
export const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? '';

/** ISO με το offset της Ελλάδας, π.χ. 2026-10-13T14:05:09+03:00 (Europe/Athens, με θερινή ώρα). */
export function athensIso(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const local = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
  // offset = (τοπική ώρα ως UTC) − (πραγματικό UTC), στρογγυλοποιημένο στο λεπτό
  const asUtc = Date.parse(`${local}Z`);
  const offsetMin = Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  return `${local}${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}
