/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  AURAGRAM — ΚΕΝΤΡΙΚΕΣ ΡΥΘΜΙΣΕΙΣ
 * ─────────────────────────────────────────────────────────────────────────────
 *  Ό,τι αλλάζει συχνά (CTA, τιμές, νούμερα, links) ζει ΕΔΩ και πουθενά αλλού.
 *
 *  ⚠️  ΚΑΝΟΝΑΣ ΤΟΥ SPEC: κανένα εφευρεμένο νούμερο.
 *      Ό,τι είναι `null` παρακάτω απλά ΔΕΝ εμφανίζεται στη σελίδα.
 *      Βάλτε τιμή μόνο όταν έχετε πραγματικό δεδομένο.
 */
import { formatEUR, formatEURRange } from './format';

// ── ΤΟ ΕΝΑ ΚΑΙ ΜΟΝΑΔΙΚΟ CTA ────────────────────────────────────────────────
// Χρησιμοποιείται αυτούσιο σε ΚΑΘΕ κουμπί του site. Καμία παραλλαγή.
export const CTA = {
  label: 'Κλείστε τον Χάρτη AI — 30′ δωρεάν',
  labelShort: 'Χάρτης AI — 30′ δωρεάν', // μόνο για το sticky bar σε <360px
  micro: 'Χωρίς πωλήσεις. Φεύγετε με γραπτό πλάνο και εκτίμηση ROI.',
  // '/#klisi' ώστε το ίδιο κουμπί να δουλεύει και από το /about.
  href: '/#klisi',
} as const;

export const OFFER_NAME = 'Ο Χάρτης AI της Επιχείρησής σας';

// ── ΤΙΜΕΣ ──────────────────────────────────────────────────────────────────
// Αλλάζετε τα νούμερα εδώ — η μορφή «1.200 €» βγαίνει από το lib/format.ts.
const PILOT_FROM_EUR = 1200;

export const PRICING = {
  /** Αριθμητική τιμή — για count-up στο Pilot. */
  pilotFromValue: PILOT_FROM_EUR,
  pilotFrom: formatEUR(PILOT_FROM_EUR),
  pilotRange: formatEURRange(1200, 1900),
  retainerFrom: formatEUR(400),
  mapValue: formatEUR(350),
  callsPerWeek: 4,
  /** {{TODO: τιμή «από» για ιστοσελίδες}} π.χ. formatEUR(900). null = η γραμμή «Από …» στο tab 05 δεν εμφανίζεται. */
  websiteFrom: null as string | null,
} as const;

// ── ΥΠΟΣΧΕΣΕΙΣ ΔΙΑΔΙΚΑΣΙΑΣ ──────────────────────────────────────────────────
// Εμφανίζονται μόνο όταν είναι true. Default false μέχρι να τις επιβεβαιώσουν οι ιδρυτές.
export const PROMISES = {
  /** {{TODO: confirm with founders}} «Κάθε έργο ξεκινά με γραπτή εκτίμηση ROI και χρόνο αποπληρωμής — αλλιώς δεν το φτιάχνουμε.» */
  customRoiFirst: false,
} as const;
// ── ΝΟΥΜΕΡΑ ΠΟΥ ΛΕΙΠΟΥΝ (§4, §7 του spec) ──────────────────────────────────
// Όσο είναι null, η αντίστοιχη γραμμή/στατιστικό δεν εμφανίζεται καθόλου.
export const METRICS = {
  /** {{TODO: IG_FOLLOWERS}} π.χ. '12k' → «12k άτομα μας ακολουθούν στο Instagram».
   *  Κενό (null) = η proof bar δείχνει 2 κεντραρισμένες στήλες. */
  instagramFollowers: null as string | null,

  /** Γραμμή αποτελέσματος ανά agent — μόνο μετά το 1ο πραγματικό pilot. */
  agentResults: {
    sales: null as string | null, // {{TODO: sales outcome line}} π.χ. '+8 ραντεβού/μήνα'
    support: null as string | null, // {{TODO: support outcome line}} π.χ. '68% των ερωτημάτων χωρίς άνθρωπο'
    operations: null as string | null, // {{TODO: operations outcome line}} π.χ. '31 ώρες/μήνα πίσω στην ομάδα'
    analyst: 'Απόφαση σε λεπτά, όχι σε μέρες', // ποιοτικό, όχι εφευρεμένο νούμερο
  },
} as const;

// ── ΕΠΙΚΟΙΝΩΝΙΑ & LINKS ────────────────────────────────────────────────────
export const BRAND = {
  name: 'Auragram',
  legalName: 'Auragram',
  email: 'auragram.web@gmail.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://auragram.gr',
  instagram: {
    christos: {
      handle: '@xrhstos.auramidis',
      url: 'https://www.instagram.com/xrhstos.auramidis/',
    },
    panagiotis: {
      handle: '@panagiotis.gramma',
      url: 'https://www.instagram.com/panagiotis.gramma/',
    },
  },
} as const;

/**
 * Νομικά στοιχεία της εταιρείας (privacy / terms) — ΜΙΑ πηγή. Συμπληρώστε τα όλα πριν από το production:
 * το production build ΑΠΟΤΥΓΧΑΝΕΙ όσο κάποιο είναι null (βλ. lib/legal.ts). Σε development εμφανίζονται ως TODO blocks.
 */
export const LEGAL = {
  entityName: null as string | null, // {{TODO: πλήρης επωνυμία}}
  afm: null as string | null, // {{TODO: ΑΦΜ}}
  doy: null as string | null, // {{TODO: ΔΟΥ}}
  seat: null as string | null, // {{TODO: έδρα}}
  courtCity: null as string | null, // {{TODO: πόλη έδρας για τα δικαστήρια}}
};

/**
 * Το επίσημο email επικοινωνίας — ΜΙΑ σταθερά. {{TODO: hello@<domain>}}
 * Όσο είναι TODO, το footer δείχνει το BRAND.email (Gmail) ως fallback.
 */
export const CONTACT = {
  email: '{{TODO: hello@<domain>}}',
};
export const contactEmail = () => (CONTACT.email.includes('{{TODO') ? BRAND.email : CONTACT.email);

/** Cal.com: π.χ. 'auragram/xartis-ai'. Χωρίς αυτό δείχνουμε fallback. */
export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK || '';

// ── INDEXING ───────────────────────────────────────────────────────────────
/**
 * Preview / development deployments στο Vercel ΔΕΝ πρέπει να ευρετηριάζονται ποτέ: το VERCEL_ENV (ορίζεται αυτόματα από το
 * Vercel στο build ΚΑΙ στο runtime) είναι 'production' | 'preview' | 'development'. Εκτός Vercel (τοπικό build, self-host) δεν μπλοκάρει.
 * Χειροκίνητο override: NEXT_PUBLIC_NOINDEX=1.
 */
export const BLOCK_INDEXING =
  process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development' || process.env.NEXT_PUBLIC_NOINDEX === '1';

// ── ANALYTICS ──────────────────────────────────────────────────────────────
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || '';
