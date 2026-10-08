import { LEGAL } from './config';

/**
 * Νομικά στοιχεία (privacy / terms). Τα συμπληρώνετε ΜΟΝΟ στο `LEGAL` του lib/config.ts.
 *
 *  • development : κάθε κενό πεδίο φαίνεται ως ΣΑΦΩΣ σημαδεμένο TODO block (components/ui/LegalDetails).
 *  • production  : ΚΑΝΕΝΑ literal «{{TODO}}» δεν βγαίνει ποτέ. Αν λείπει έστω ένα πεδίο, το build ΑΠΟΤΥΓΧΑΝΕΙ
 *                  (θα το δείτε στο `next build`, πριν φτάσει οτιδήποτε σε παραγωγή).
 *  • Μόνο για build δοκιμών/μετρήσεων (όχι deploy): `LEGAL_TODO_OK=1 next build` παρακάμπτει τον έλεγχο
 *    και τα κενά πεδία παραλείπονται σιωπηλά από το κείμενο.
 */
export type LegalKey = keyof typeof LEGAL;

export const LEGAL_LABELS: Record<LegalKey, string> = {
  entityName: 'πλήρης επωνυμία',
  afm: 'ΑΦΜ',
  doy: 'ΔΟΥ',
  seat: 'έδρα',
  courtCity: 'πόλη έδρας (δικαστήρια)',
};

export const legalMissing = (): LegalKey[] =>
  (Object.keys(LEGAL) as LegalKey[]).filter((k) => !LEGAL[k] || !String(LEGAL[k]).trim());

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
      `\n\n[legal] Λείπουν νομικά στοιχεία στο LEGAL (lib/config.ts): ${missing
        .map((k) => `${k} (${LEGAL_LABELS[k]})`)
        .join(', ')}.\nΤο production build δεν επιτρέπεται με κενά πεδία. (Μόνο για δοκιμές: LEGAL_TODO_OK=1.)\n`
    );
  }
}
