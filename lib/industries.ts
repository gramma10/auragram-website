/**
 * AURAGRAM — ΤΑ 6 ΣΕΝΑΡΙΑ ΚΛΑΔΩΝ (Industry selector)
 * Είναι copy του site, όπως και το lib/content.ts — αλλά ζει σε δικό του module ΕΠΙΤΗΔΕΣ: το content.ts μπαίνει στο
 * αρχικό JS bundle, ενώ αυτά τα δεδομένα χρειάζονται μόνο στο lazy σώμα του selector (components/home/IndustriesBody).
 * Τα copy του section (eyebrow, H2, labels) μένουν στο content.ts → `industriesSection`.
 *
 * Κανόνας ειλικρίνειας: ΤΥΠΙΚΗ επιχείρηση — ποτέ πραγματικός πελάτης, ποτέ όνομα/πόλη. Τα ευρώ ΥΠΟΛΟΓΙΖΟΝΤΑΙ από τις ώρες και τη
 * σταθερά ωριαίου κόστους του calculator (lib/roi.ts) — δεν είναι hard-coded.
 */
import type { ToolId } from './content';
import { formatEUR } from './format';
import { hoursValue, hoursValueFormula } from './roi';

export type IndustrySlug = 'iatreia' | 'logistika' | 'gymnasthria' | 'katalymata' | 'real-estate' | 'eshop';
export type IndustryIcon = 'stethoscope' | 'calculator' | 'barbell' | 'bed' | 'home' | 'cart';

export type IndustryStat = {
  value: string;
  label: string;
  /** Εκτίμηση → pill «ΕΚΤΙΜΗΣΗ». Αλλιώς spec (από σχεδιασμό). */
  estimate?: boolean;
  /** Το ευρώ ROI παίρνει το cyan (aura-line) marker highlight πίσω από το νούμερο. */
  marker?: boolean;
};

type Pair = { lead: string; text: string };

export type Industry = {
  slug: IndustrySlug;
  tab: string;
  icon: IndustryIcon;
  title: string;
  sub: string;
  today: [Pair, Pair, Pair];
  after: [Pair, Pair, Pair];
  /** Tool chips στο κάτω μέρος κάθε κουτιού. */
  tools: { today: ToolId[]; after: ToolId[] };
  stats: [IndustryStat, IndustryStat, IndustryStat];
  /** Η γραμμή τύπου κάτω από το strip — ΜΟΝΟ όταν υπάρχει estimate. Αν λείπει, το panel κλείνει με link προς τον calculator. */
  formula?: string;
  /** Slot για ΠΡΑΓΜΑΤΙΚΟ pilot: όταν υπάρξει, το panel θα δείχνει badge «ΠΡΑΓΜΑΤΙΚΟ PILOT» + πραγματικά stats. Δεν έχει UI ακόμα. */
  realPilot?: { stats: IndustryStat[]; note?: string };
};

const eur = (hours: number, perWeek: boolean) => `≈ ${formatEUR(hoursValue(hours, perWeek))}`;

export const industries: Industry[] = [
  {
    slug: 'iatreia',
    tab: 'Ιατρεία',
    icon: 'stethoscope',
    title: 'Ιατρείο με 2 γιατρούς και μία γραμματεία',
    sub: 'Η γραμματεία σταματά να ζει στο τηλέφωνο, και τα κενά ραντεβού ξαναγεμίζουν.',
    today: [
      { lead: 'Χαμένες κλήσεις', text: 'το τηλέφωνο χτυπάει όσο εξυπηρετείτε κόσμο.' },
      { lead: 'Ραντεβού που χάνονται', text: 'κανείς δεν τα θυμίζει, ο ασθενής απλώς δεν έρχεται.' },
      { lead: 'Ίδιες ερωτήσεις', text: 'τιμές, ωράριο, διεύθυνση, 30 φορές τη μέρα.' },
    ],
    after: [
      { lead: 'Κλείσιμο 24/7', text: 'από Instagram, Viber και site, κατευθείαν στο ημερολόγιο.' },
      { lead: 'Υπενθύμιση με επιβεβαίωση', text: 'αν ακυρώσει, η θέση ανοίγει αμέσως.' },
      { lead: 'Απαντήσεις μόνες τους', text: 'τιμές και ωράριο σε δευτερόλεπτα.' },
    ],
    tools: { today: ['phone', 'instagram', 'excel'], after: ['instagram', 'viber', 'googlecalendar'] },
    stats: [
      { value: eur(8, true), label: 'αξία χρόνου / μήνα', estimate: true, marker: true },
      { value: '24 ώρ.', label: 'υπενθύμιση πριν το ραντεβού' },
      { value: '< 60″', label: 'απάντηση, 24/7' },
    ],
    formula: `≈ ${hoursValueFormula(8, true)}`,
  },
  {
    slug: 'logistika',
    tab: 'Λογιστικά',
    icon: 'calculator',
    title: 'Λογιστικό γραφείο με 60 πελάτες',
    sub: 'Τέλος στο μηνιαίο κυνηγητό για παραστατικά.',
    today: [
      { lead: 'Κυνηγητό', text: 'τηλέφωνα και emails σε κάθε πελάτη, κάθε μήνα.' },
      { lead: 'Χάος αρχείων', text: 'από Viber, email, WeTransfer, με τυχαία ονόματα.' },
      { lead: 'Προθεσμίες', text: '«πότε λήγει;», ξανά και ξανά.' },
    ],
    after: [
      { lead: 'Αυτόματη υπενθύμιση', text: 'Viber/email κάθε 48 ώρες μέχρι να ανέβουν.' },
      { lead: 'Τακτοποίηση', text: 'κάθε αρχείο μετονομάζεται και μπαίνει στον φάκελο του πελάτη.' },
      { lead: 'Ερωτήσεις προθεσμιών', text: 'απαντιούνται από το δικό σας ημερολόγιο.' },
    ],
    tools: { today: ['email', 'viber'], after: ['viber', 'gmail', 'googledrive'] },
    stats: [
      { value: eur(10, false), label: 'αξία χρόνου / μήνα', estimate: true, marker: true },
      { value: '48 ώρ.', label: 'κύκλος υπενθύμισης' },
      { value: '0', label: 'χειροκίνητες μετονομασίες' },
    ],
    // 60 πελάτες × 10′ = 10 ώρες τον μήνα → × 25 €/ώρα (ίδια σταθερά με τον calculator)
    formula: '≈ 60 πελάτες × 10′ × 25 €/ώρα',
  },
  {
    slug: 'gymnasthria',
    tab: 'Γυμναστήρια',
    icon: 'barbell',
    title: 'Studio με 200 μέλη',
    sub: 'Τα βραδινά DMs γίνονται δοκιμαστικά, και τα δοκιμαστικά συνδρομές.',
    today: [
      { lead: 'Αργές απαντήσεις', text: 'DM για τιμές το βράδυ, απάντηση την επόμενη μέρα.' },
      { lead: 'Χαμένα δοκιμαστικά', text: 'κανείς δεν επικοινωνεί μετά το πρώτο μάθημα.' },
      { lead: 'Ξεχασμένες ανανεώσεις', text: 'οι συνδρομές λήγουν σιωπηλά.' },
    ],
    after: [
      { lead: 'Κράτηση από το DM', text: 'τιμές και δοκιμαστικό σε ένα μήνυμα.' },
      { lead: 'Follow-up', text: 'την επόμενη μέρα, με πρόταση συνδρομής.' },
      { lead: 'Ανανεώσεις', text: 'υπενθύμιση 7 μέρες πριν τη λήξη.' },
    ],
    tools: { today: ['instagram', 'phone'], after: ['instagram', 'whatsapp', 'googlecalendar'] },
    stats: [
      { value: '< 60″', label: 'απάντηση σε DM, 24/7' },
      { value: '1 μέρα', label: 'follow-up μετά το δοκιμαστικό' },
      { value: '7 μέρες', label: 'υπενθύμιση πριν τη λήξη' },
    ],
  },
  {
    slug: 'katalymata',
    tab: 'Καταλύματα',
    icon: 'bed',
    title: 'Ενοικιαζόμενα με 8 δωμάτια',
    sub: 'Οι επισκέπτες παίρνουν απάντηση σε κάθε γλώσσα, κι εσείς κοιμάστε.',
    today: [
      { lead: 'Ερωτήσεις 24/7', text: 'στις 2 το πρωί, σε 4 γλώσσες.' },
      { lead: 'Check-in με το χέρι', text: 'οδηγίες και κωδικοί, ένας-ένας.' },
      { lead: 'Κριτικές', text: 'κανείς δεν τις ζητάει μετά την αναχώρηση.' },
    ],
    after: [
      { lead: 'Πολύγλωσσος agent', text: 'ελληνικά, αγγλικά, γερμανικά, ιταλικά.' },
      { lead: 'Check-in αυτόματα', text: 'οδηγίες την παραμονή της άφιξης.' },
      { lead: 'Αίτημα κριτικής', text: 'μετά το check-out, με link στο Google.' },
    ],
    tools: { today: ['email', 'whatsapp'], after: ['whatsapp', 'gmail', 'google'] },
    stats: [
      { value: eur(5, true), label: 'αξία χρόνου / μήνα, τη σεζόν', estimate: true, marker: true },
      { value: '4+', label: 'γλώσσες' },
      { value: '24/7', label: 'απαντήσεις χωρίς εσάς' },
    ],
    formula: `≈ ${hoursValueFormula(5, true)}`,
  },
  {
    slug: 'real-estate',
    tab: 'Real estate',
    icon: 'home',
    title: 'Μεσιτικό γραφείο με 3 συνεργάτες',
    sub: 'Κάθε lead από αγγελία παίρνει απάντηση πριν κρυώσει.',
    today: [
      { lead: 'Αργή απάντηση', text: 'leads από αγγελίες περιμένουν ώρες.' },
      { lead: 'Λάθος ραντεβού', text: 'υποδείξεις σε όσους δεν έχουν budget.' },
      { lead: 'Excel', text: 'επαφές σε λίστες που δεν ενημερώνει κανείς.' },
    ],
    after: [
      { lead: 'Απάντηση σε 60″', text: 'με ερωτήσεις budget, περιοχής και χρόνου.' },
      { lead: 'Φιλτράρισμα', text: 'υπόδειξη κλείνει μόνο όποιος ταιριάζει.' },
      { lead: 'CRM', text: 'κάθε lead με ιστορικό και επόμενο βήμα.' },
    ],
    tools: { today: ['email', 'excel'], after: ['gmail', 'hubspot', 'googlecalendar'] },
    stats: [
      { value: '< 60″', label: 'απάντηση σε νέο lead' },
      { value: '3', label: 'ερωτήσεις πριν την υπόδειξη' },
      { value: '100%', label: 'των leads στο CRM' },
    ],
  },
  {
    slug: 'eshop',
    tab: 'E-shops',
    icon: 'cart',
    title: 'E-shop με 300 παραγγελίες τον μήνα',
    sub: 'Το «πού είναι η παραγγελία μου;» απαντιέται μόνο του.',
    today: [
      { lead: 'Ερωτήσεις παραγγελιών', text: '«πού είναι;» 20 φορές τη μέρα.' },
      { lead: 'Χαμένα καλάθια', text: 'κανένα follow-up όταν φεύγει ο πελάτης.' },
      { lead: 'Επιστροφές', text: 'emails πάνω-κάτω για την καθεμία.' },
    ],
    after: [
      { lead: 'Tracking αυτόματα', text: 'ο agent απαντά με την κατάσταση της παραγγελίας.' },
      { lead: 'Υπενθύμιση καλαθιού', text: '2 ώρες αφού φύγει ο πελάτης.' },
      { lead: 'Φόρμα επιστροφής', text: 'ξεκινάει μόνη της, ενημερώνει την αποθήκη.' },
    ],
    tools: { today: ['email', 'phone'], after: ['shopify', 'woocommerce', 'viber'] },
    stats: [
      { value: eur(7, true), label: 'αξία χρόνου / μήνα', estimate: true, marker: true },
      { value: '2 ώρ.', label: 'υπενθύμιση καλαθιού' },
      { value: '24/7', label: 'απαντήσεις με tracking' },
    ],
    formula: `≈ ${hoursValueFormula(7, true)}`,
  },
];
