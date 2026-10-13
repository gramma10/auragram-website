/**
 * Rate limit ΜΝΗΜΗΣ για τη φόρμα: max 3 αιτήματα ανά IP ανά ώρα, max 1 ανά (κανονικοποιημένο) κινητό ανά 24ω.
 *
 * ⚠️ BEST-EFFORT: στο Vercel κάθε serverless instance έχει δική του μνήμη και ξεκινά «άδεια» σε cold start, άρα το όριο
 * δεν είναι αυστηρό ανάμεσα σε instances (δεν προσθέτουμε πληρωμένη υπηρεσία — Redis/KV — σύμφωνα με το brief).
 * Μένει χρήσιμο απέναντι σε απλά bots/διπλά clicks που χτυπούν το ίδιο warm instance. Αν χρειαστεί αυστηρό όριο:
 * Vercel KV / Upstash με το ίδιο API (reserve / release).
 */
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_PER_IP = 3;
const MAX_KEYS = 5000; // φράγμα μνήμης

type Store = { ip: Map<string, number[]>; phone: Map<string, number> };
const g = globalThis as unknown as { __auraRate?: Store };
const store: Store = (g.__auraRate ??= { ip: new Map(), phone: new Map() });

function sweep(now: number) {
  if (store.ip.size > MAX_KEYS) {
    store.ip.forEach((arr, k) => {
      if (!arr.some((t) => now - t < HOUR)) store.ip.delete(k);
    });
  }
  if (store.phone.size > MAX_KEYS) {
    store.phone.forEach((t, k) => {
      if (now - t >= DAY) store.phone.delete(k);
    });
  }
}

export type Reservation = { ip: string | null; phone: string; at: number };

/** Κλείνει «θέση» ΠΡΙΝ την αποστολή (ώστε δύο ταυτόχρονα requests να μην περάσουν και τα δύο). */
export function reserve(ip: string | null, phone: string, now = Date.now()): Reservation | 'ip' | 'phone' {
  sweep(now);
  const recent = ip ? (store.ip.get(ip) ?? []).filter((t) => now - t < HOUR) : [];
  if (ip && recent.length >= MAX_PER_IP) return 'ip';
  const last = store.phone.get(phone);
  if (last !== undefined && now - last < DAY) return 'phone';
  if (ip) store.ip.set(ip, [...recent, now]);
  store.phone.set(phone, now);
  return { ip, phone, at: now };
}

/** Η αποστολή απέτυχε: επιστρέφουμε τη θέση, ώστε ο επισκέπτης να μπορεί να ξαναδοκιμάσει. */
export function release(r: Reservation) {
  if (r.ip) {
    const arr = store.ip.get(r.ip);
    if (arr) {
      const i = arr.indexOf(r.at);
      if (i >= 0) arr.splice(i, 1);
      if (!arr.length) store.ip.delete(r.ip);
    }
  }
  if (store.phone.get(r.phone) === r.at) store.phone.delete(r.phone);
}
