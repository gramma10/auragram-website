import { CONTACT, LEGAL } from './config';

/**
 * Νομικά στοιχεία (privacy / terms). Τα συμπληρώνετε ΜΟΝΟ στα `LEGAL` και `CONTACT` του lib/config.ts.
 * Μέχρι να υπάρξει εταιρεία οι ιδρυτές είναι ατομικά υπεύθυνοι επεξεργασίας: απαιτούνται μόνο τα δύο ονόματα,
 * η πόλη και το email επικοινωνίας (όχι ΑΦΜ / ΓΕΜΗ / διεύθυνση).
 *
 *  • development : κάθε κενό πεδίο φαίνεται ως ΣΑΦΩΣ σημαδεμένο TODO block (components/ui/LegalDetails).
 *  • production  : ΚΑΝΕΝΑ literal «{{TODO}}» δεν βγαίνει ποτέ. Αν λείπει έστω ένα πεδίο, το build ΑΠΟΤΥΓΧΑΝΕΙ
 *                  (θα το δείτε στο `next build`, πριν φτάσει οτιδήποτε σε παραγωγή).
 *  • Μόνο για build δοκιμών/preview (όχι production): `LEGAL_TODO_OK=1 next build` παρακάμπτει τον έλεγχο
 *    και τα κενά πεδία παραλείπονται σιωπηλά από το κείμενο.
 */
export type LegalKey = keyof typeof LEGAL | 'email';

export const LEGAL_LABELS: Record<LegalKey, string> = {
  controllerA: 'όνομα υπευθύνου (Παναγιώτης)',
  controllerB: 'όνομα υπευθύνου (Χρήστος)',
  city: 'πόλη',
  email: 'email επικοινωνίας (CONTACT.email)',
};

/** Η τιμή ενός πεδίου — ή null όταν λείπει / είναι ακόμα {{TODO}}. */
export const legalValue = (k: LegalKey): string | null => {
  const v = k === 'email' ? CONTACT.email : LEGAL[k];
  const t = v ? String(v).trim() : '';
  return t && !t.includes('{{') ? t : null;
};

export const legalMissing = (): LegalKey[] =>
  ([...(Object.keys(LEGAL) as (keyof typeof LEGAL)[]), 'email'] as LegalKey[]).filter((k) => !legalValue(k));

// Μόνο στη φάση του build: ο έλεγχος πρέπει να σταματά το `next build`, ΟΧΙ να ρίχνει 500 σε ζωντανό server
// (τα RSC/prefetch requests ξαναφορτώνουν το module στο runtime).
if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE === 'phase-production-build' &&
  !process.env.LEGAL_TODO_OK
) {
  const missing = legalMissing();
  if (missing.length) {
    throw new Error(
      `\n\n[legal] Λείπουν νομικά στοιχεία (lib/config.ts): ${missing
        .map((k) => `${k} (${LEGAL_LABELS[k]})`)
        .join(', ')}.\nΤο production build δεν επιτρέπεται με κενά πεδία. (Μόνο για preview/δοκιμές: LEGAL_TODO_OK=1.)\n`
    );
  }
}
