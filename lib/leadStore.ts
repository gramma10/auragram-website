'use client';

/**
 * Μικρό «πέρασμα» από τη φόρμα στη σελίδα /confirmation: το πρώτο όνομα (και αν η αποστολή ήταν δοκιμαστική).
 * Δεν μπαίνει ΠΟΤΕ σε URL (προσωπικά δεδομένα). Κρατιέται στη μνήμη (client-side πλοήγηση) και στο sessionStorage
 * (refresh) — και τα δύο προαιρετικά: χωρίς αυτά η σελίδα δείχνει ουδέτερο κείμενο.
 */
export type SubmittedLead = { firstName: string; testMode: boolean };

const KEY = 'aura-lead-submitted';
let memory: SubmittedLead | null = null;

export function rememberSubmittedLead(lead: SubmittedLead) {
  memory = lead;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(lead));
  } catch {
    /* ιδιωτική περιήγηση / in-app browser χωρίς storage */
  }
}

export function readSubmittedLead(): SubmittedLead | null {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v && typeof v.firstName === 'string') {
      memory = { firstName: v.firstName.slice(0, 40), testMode: !!v.testMode };
      return memory;
    }
  } catch {
    /* ignore */
  }
  return null;
}
