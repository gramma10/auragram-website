/**
 * AURAGRAM — ΟΛΟ ΤΟ ΚΕΙΜΕΝΟ ΤΟΥ SITE
 * Ένα αρχείο, ώστε να αλλάζετε copy χωρίς να αγγίζετε components.
 */
import { METRICS, PRICING, PROMISES } from './config';
import {
  CALC_DEFAULTS,
  HOURLY_RATE,
  WEEKS_PER_MONTH,
  calcRoi,
  lostRevenueFormula,
  timeValueFormula,
} from './roi';

// Οι προεπιλογές των ROI προκύπτουν από τον ΙΔΙΟ τύπο με τον calculator (lib/roi.ts) — δεν είναι hard-coded.
const calcDefault = calcRoi(CALC_DEFAULTS);

/**
 * Κείμενο με markup στην πηγή: string = απλό, {s} = έμφαση (cyan <strong>), {m} = marker highlight (aura-line πίσω από ink κείμενο —
 * ΜΟΝΟ σε light sections). Όχι regex.
 */
export type Rich = (string | { s: string } | { m: string })[];

// ── HERO ───────────────────────────────────────────────────────────────────
export const hero = {
  eyebrow: 'AI συστήματα με μετρήσιμο ROI · Ελλάδα',
  h1: ['Η επιχείρησή σας χάνει 20+ ώρες τον μήνα', 'σε δουλειά που κάνει ήδη το AI.'],
  sub: 'Φτιάχνουμε AI agents που απαντούν στα leads, εξυπηρετούν πελάτες και κλείνουν ραντεβού — 24/7. Ξεκινάμε με pilot 2–4 εβδομάδων και μετράμε ένα νούμερο που συμφωνούμε από πριν.',
  ghost: 'Δείτε τους 4 AI Agents',
  // Αντικαθιστά το microcopy κάτω από το CTA του hero — 3 check items (το ✓ είναι εικονίδιο, όχι κείμενο)
  risk: ['Γραπτό πλάνο με εκτίμηση ROI', 'Χωρίς ετήσιο συμβόλαιο', 'Εγγύηση αποτελέσματος'],
  // Mobile (< 640px): η ίδια υπόσχεση σε ΜΙΑ γραμμή — κερδίζει ύψος ώστε το κινητό να φαίνεται από την πρώτη οθόνη
  checksShort: '✓ Πλάνο με ROI · ✓ Χωρίς συμβόλαιο · ✓ Εγγύηση',
};

// ── Τύποι για το chat scenario του hero ────────────────────────────────────
export type ChatMsg = { from: 'them' | 'agent'; text: string; meta: string };

export type Scenario = {
  id: string;
  /** Ώρα στο status bar του κινητού */
  time: string;
  /** Header εφαρμογής */
  app?: { title: string; sub: string };
  messages: ChatMsg[];
  /** Chip αποτελέσματος καρφωμένο κάτω. `icon`: δείχνει ✓ svg πριν το κείμενο. */
  status?: { text: string; meta?: string; icon?: boolean };
};

/** Η συνομιλία που τρέχει στο hero — πραγματικό δείγμα AI Agent. */
export const heroChat: ChatMsg[] = [
  { from: 'them', text: 'Γεια σας, ενδιαφέρομαι για τιμές. Είστε ανοιχτά;', meta: '21:47' },
  { from: 'agent', text: 'Καλησπέρα! Το γραφείο είναι κλειστό, αλλά μπορώ να βοηθήσω εγώ. Για πόσα άτομα το χρειάζεστε;', meta: 'AI Agent · 21:47' },
  { from: 'them', text: 'Για ομάδα 8 ατόμων.', meta: '21:48' },
  { from: 'agent', text: 'Τέλεια. Έχω αύριο 10:30 ή Πέμπτη 17:00 με τον Χρήστο. Τι σας βολεύει;', meta: 'AI Agent · 21:48' },
  { from: 'them', text: 'Αύριο 10:30.', meta: '21:48' },
];

/** Το κινητό του hero: ό,τι δεν είναι φούσκα συνομιλίας (header, chip αποτελέσματος, toast, λεζάντα). */
export const heroPhone = {
  scenario: {
    id: 'hero',
    time: '21:47',
    app: { title: 'Instagram · Direct', sub: 'Ενεργός τώρα' },
    messages: heroChat,
    status: { text: 'Ραντεβού κλείστηκε', meta: '47 δευτ.', icon: true },
  } as Scenario,
  toast: 'Νέο ραντεβού · Αύριο 10:30',
  caption: 'Πραγματική ροή AI Agent',
};

// ── ΓΡΑΜΜΗ ΑΠΟΔΕΙΞΕΩΝ ──────────────────────────────────────────────────────
/** Κάθε στατιστικό = prefix + ΑΡΙΘΜΟΣ (count-up) + suffix. */
export type ProofStat = { prefix: string; value: number; suffix: string; label: string };

// «12k» → { prefix:'', value:12, suffix:'k' }
const ig = METRICS.instagramFollowers?.match(/^(\D*)(\d+)(.*)$/);

export const proof: ProofStat[] = [
  ig
    ? {
        prefix: ig[1],
        value: Number(ig[2]),
        suffix: ig[3],
        label: 'άτομα μας ακολουθούν στο Instagram',
      }
    : null,
  {
    prefix: '< ',
    value: 60,
    suffix: '″',
    label: 'χρόνος απάντησης — δοκιμάστε το τώρα σε αυτή τη σελίδα',
  },
  {
    prefix: '2–',
    value: 4,
    suffix: ' εβδ.',
    label: 'από την πρώτη κλήση μέχρι ζωντανό agent',
  },
].filter(Boolean) as ProofStat[];

// ── ΤΟ ΠΡΟΒΛΗΜΑ ────────────────────────────────────────────────────────────
export const problem = {
  h2: [['Δεν έχετε πρόβλημα με το AI.'], ['Έχετε πρόβλημα με ', { m: 'τον χρόνο' }, '.']] as [Rich, Rich],
  // Κάθε γραμμή = μια «σκηνή»: mono tag αριστερά, το αρχικό copy δεξιά (αμετάβλητο).
  bullets: [
    { tag: '11:40', text: 'Χτυπάει το τηλέφωνο ενώ εξυπηρετείτε. Δεν το σηκώνει κανείς. Ο πελάτης καλεί τον επόμενο.' },
    { tag: '21:00', text: 'Ένα lead γράφει στο Instagram στις 9 το βράδυ. Απαντάτε το πρωί. Έχει ήδη κλείσει αλλού.' },
    { tag: '×30', text: 'Στέλνετε τις ίδιες 4 απαντήσεις 30 φορές την εβδομάδα.' },
    { tag: '.xlsx', text: 'Το πελατολόγιό σας κάθεται σε ένα Excel και δεν του μιλάει κανείς.' },
  ],
  close: ['Δεν χρειάζεστε άλλο άτομο.', 'Χρειάζεστε σύστημα που δουλεύει όταν εσείς δεν μπορείτε.'],
};

/** Calculator H2 — το marker highlight ζει στην πηγή του copy. */
export const calculatorH2: Rich = ['Πόσο σας ', { m: 'κοστίζει' }, ' που δεν το έχετε ήδη;'];

// ── ΟΙ 4 AGENTS ────────────────────────────────────────────────────────────
// Τα `id` μένουν σταθερά (analytics continuity)· τα ονόματα είναι ονόματα αποτελέσματος.
export type AgentId = 'sales' | 'support' | 'operations' | 'analyst';

/** Εργαλεία που εμφανίζονται ως chips. Τα εικονίδια ζουν στο components/ui/ToolChip.tsx. */
export type ToolId =
  | 'instagram'
  | 'whatsapp'
  | 'viber'
  | 'messenger'
  | 'gmail'
  | 'email'
  | 'phone'
  | 'googlecalendar'
  | 'googlesheets'
  | 'googledocs'
  | 'google'
  | 'googledrive'
  | 'hubspot'
  | 'shopify'
  | 'woocommerce'
  | 'excel'
  | 'crm';

export const toolNames: Record<ToolId, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  messenger: 'Messenger',
  gmail: 'Gmail',
  email: 'Email',
  phone: 'Τηλέφωνο',
  googlecalendar: 'Google Calendar',
  googlesheets: 'Google Sheets',
  googledocs: 'Google Docs',
  google: 'Google',
  googledrive: 'Google Drive',
  hubspot: 'HubSpot',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  excel: 'Excel',
  crm: 'CRM',
};

export type AgentSide = { text: Rich; tools: ToolId[] };

/**
 * Το «gain pill» κάθε agent: spec · ROI. Το ROI είναι ΠΑΝΤΑ εκτίμηση (pill «ΕΚΤΙΜΗΣΗ» + τύπος από κάτω).
 * `personal`: αντιστοιχεί σε έξοδο του calculator → δείχνει τα νούμερα του επισκέπτη όταν τα έχει αλλάξει (όπως το RoiBlock).
 */
export type AgentGain = {
  spec: string;
  roi: {
    value: number;
    format: 'eur' | 'hours';
    /** μετά το νούμερο: «/μήνα λιγότερα χαμένα leads» */
    suffix: string;
    formula: string;
    personal?: 'lostRevenue' | 'timeValue';
  };
};

// Support: 40 ερωτήσεις/εβδ. × 3′ → ώρες/εβδ. → × 4,33 εβδ. × 25 €/ώρα (≈ 217 €) — υπολογίζεται, δεν είναι hard-coded.
const supportHoursPerWeek = (40 * 3) / 60;

export const agents: {
  id: AgentId;
  n: string;
  name: string;
  gain: AgentGain;
  today: AgentSide;
  withAgent: AgentSide;
  /** Προαιρετική γραμμή αποτελέσματος (METRICS.agentResults) — κρυφή όσο είναι null. */
  result: string | null;
}[] = [
  {
    id: 'sales',
    n: '01',
    name: 'Απάντηση & ραντεβού',
    gain: {
      spec: 'Απάντηση < 60″',
      roi: {
        value: calcDefault.lostRevenue,
        format: 'eur',
        suffix: '/μήνα λιγότερα χαμένα leads',
        formula: lostRevenueFormula(CALC_DEFAULTS),
        personal: 'lostRevenue',
      },
    },
    today: {
      text: ['Απαντάτε σε 4 ώρες — ή το πρωί. Τα μισά leads έχουν ήδη κλείσει αλλού.'],
      tools: ['instagram', 'phone', 'gmail'],
    },
    withAgent: {
      text: ['Απάντηση σε ', { s: '45″' }, ', 24/7. Ρωτάει τι χρειάζεται και κλείνει ραντεβού στο ημερολόγιό σας.'],
      tools: ['instagram', 'whatsapp', 'googlecalendar', 'crm'],
    },
    result: METRICS.agentResults.sales,
  },
  {
    id: 'support',
    n: '02',
    name: 'Εξυπηρέτηση 24/7',
    gain: {
      spec: '24/7',
      roi: {
        value: supportHoursPerWeek * WEEKS_PER_MONTH * HOURLY_RATE,
        format: 'eur',
        suffix: '/μήνα σε χρόνο',
        formula: `40 ερωτήσεις/εβδ. × 3′ ÷ 60 × ${String(WEEKS_PER_MONTH).replace('.', ',')} × ${HOURLY_RATE} €/ώρα`,
      },
    },
    today: {
      text: ['Οι ίδιες 10 ερωτήσεις, 40 φορές την εβδομάδα.'],
      tools: ['viber', 'messenger', 'email'],
    },
    withAgent: {
      text: ['Απαντιούνται μόνες τους από τη δική σας γνώση. Στην ομάδα φτάνει μόνο το δύσκολο — με όλο το ιστορικό.'],
      tools: ['whatsapp', 'viber', 'googledocs'],
    },
    result: METRICS.agentResults.support,
  },
  {
    id: 'operations',
    n: '03',
    name: 'Γραφείο στον αυτόματο',
    gain: {
      spec: 'Μηδέν αντιγραφή-επικόλληση',
      roi: {
        value: calcDefault.timeValue,
        format: 'eur',
        suffix: '/μήνα σε χρόνο',
        formula: timeValueFormula(CALC_DEFAULTS),
        personal: 'timeValue',
      },
    },
    today: {
      text: ['Αντιγραφή δεδομένων ανάμεσα σε 3 συστήματα, κάθε μέρα.'],
      tools: ['excel', 'gmail'],
    },
    withAgent: {
      text: ['Καταχωρίσεις, ειδοποιήσεις και αιτήματα για κριτική Google φεύγουν μόνα τους. Εσείς ελέγχετε.'],
      tools: ['googlesheets', 'crm', 'viber', 'google'],
    },
    result: METRICS.agentResults.operations,
  },
  {
    id: 'analyst',
    n: '04',
    name: 'Αναφορές με μία ερώτηση',
    gain: {
      spec: 'Απάντηση σε 5″',
      roi: {
        value: 3 * 2,
        format: 'hours',
        suffix: '/μήνα λιγότερα Excel',
        formula: '3 αναφορές τον μήνα × 2 ώρες',
      },
    },
    today: {
      text: ['Τρία Excel και μια εικασία στο τέλος του μήνα.'],
      tools: ['excel'],
    },
    withAgent: {
      text: ['"Πώς πήγε ο μήνας;" — απάντηση με νούμερα σε ', { s: '5″' }, '.'],
      tools: ['googlesheets', 'crm'],
    },
    result: METRICS.agentResults.analyst,
  },
];

/** Ετικέτες του section των agents (mono labels, eyebrow). */
export const agentsCopy = {
  eyebrow: 'AI AGENT', // → «01 · AI AGENT»
  today: 'ΣΗΜΕΡΑ',
  withAgent: 'ΜΕ ΤΟΝ AGENT',
  estimate: 'ΕΚΤΙΜΗΣΗ',
};

/** Ένα κοινό live feed κάτω από τις 4 κάρτες: «Μια νύχτα με τους agents σας». Τα tags παίρνουν το όνομα του agent. */
export const agentsFeed = {
  title: 'Μια νύχτα με τους agents σας',
  live: 'LIVE',
  rows: [
    { time: '21:14', agent: 'sales', text: 'Νέο ραντεβού από Instagram → ημερολόγιο' },
    { time: '22:41', agent: 'support', text: '«Μέχρι τι ώρα είστε ανοιχτά;» → απαντήθηκε' },
    { time: '23:05', agent: 'operations', text: 'Νέα φόρμα → CRM → email επιβεβαίωσης' },
    { time: '02:13', agent: 'support', text: '«Is there parking?» → απάντηση στα αγγλικά' },
    { time: '07:30', agent: 'operations', text: 'Αίτημα για κριτική Google σε χθεσινό πελάτη' },
    { time: '08:00', agent: 'analyst', text: 'Σύνοψη νύχτας στο Viber σας: 3 ραντεβού, 11 απαντήσεις' },
  ] as { time: string; agent: AgentId; text: string }[],
};

export const agentsSection = {
  eyebrow: 'Η ΚΟΡΥΦΑΙΑ ΜΑΣ ΥΠΗΡΕΣΙΑ',
  h2: 'AI agents που δουλεύουν σαν ψηφιακοί συνεργάτες',
  sub: 'Αναλαμβάνουν πωλήσεις, εξυπηρέτηση, εργασίες ρουτίνας και αναφορές — 24/7, με ανθρώπινο έλεγχο όπου χρειάζεται. Ξεκινάμε με pilot 2–4 εβδομάδων και μετράμε ένα νούμερο που το συμφωνούμε από πριν.',
  ctaSub: `Καταλήγει σε pilot 2–4 εβδομάδων από ${PRICING.pilotFrom}, με KPI που συμφωνούμε πριν ξεκινήσουμε.`,
};

// ── ROI (κοινό RoiBlock: Services + Industries) ───────────────────────────
/**
 * Κανόνας ειλικρίνειας: `spec` = τι κάνει το σύστημα εξ ορισμού (cyan, χωρίς tag)·
 * `estimate` = εκτιμώμενο όφελος (λευκό + pill «ΕΚΤΙΜΗΣΗ» + ορατός τύπος). Ποτέ πραγματικός πελάτης.
 */
export type RoiSpec = {
  kind: 'estimate' | 'spec';
  /** Αριθμός με count-up. Λείπει στα text-only (π.χ. υπόσχεση διαδικασίας). */
  value?: number;
  format?: 'eur' | 'hours';
  /** Text-only αντί για αριθμό. */
  text?: string;
  unit?: string;
  label: string;
  /** Ο τύπος υπολογισμού (footnote). */
  formula?: string;
  /** Αντιστοιχεί σε έξοδο του calculator → δείχνει τα νούμερα του επισκέπτη αν τα έχει αλλάξει. */
  personal?: 'lostRevenue' | 'timeValue';
  /** Εμφάνιση του link «Υπολογίστε το δικό σας ↑» προς το calculator. */
  calcLink?: boolean;
  /** Εμφάνιση μόνο όταν το αντίστοιχο PROMISES flag είναι true. */
  gate?: keyof typeof PROMISES;
};

export const roiCopy = {
  label: 'ROI',
  estimate: 'ΕΚΤΙΜΗΣΗ',
  personalLabel: 'Με τα νούμερα που βάλατε',
  calcLink: 'Υπολογίστε το δικό σας ↑',
  /** Industries χωρίς RoiBlock (μόνο spec metrics): κλείνουν με αυτό το link. */
  calcLinkIndustry: 'Υπολογίστε τι σας κοστίζει σήμερα ↑',
};

// ── ΥΠΗΡΕΣΙΕΣ (5 tabs) ─────────────────────────────────────────────────────
export type ServiceItem = {
  id: 'agents' | 'automations' | 'analytics' | 'custom' | 'web';
  n: string;
  tab: string;
  /** Δεύτερη ομάδα («ΧΤΙΖΟΥΜΕ ΕΠΙΣΗΣ»). */
  secondary?: boolean;
  title: string;
  gain: string;
  bullets: string[];
  chips: string[];
  roi: RoiSpec;
  link?: { label: string; href: string };
  /** Γραμμή «Από …» κάτω από τα chips — μόνο όταν υπάρχει τιμή. */
  priceFrom?: string | null;
};

export const services: ServiceItem[] = [
  {
    id: 'agents',
    n: '01',
    tab: 'AI Agents',
    title: 'Πράκτορες για πωλήσεις, εξυπηρέτηση και operations',
    gain: 'Δουλειά που γινόταν από άνθρωπο σε ώρες, γίνεται από agent σε δευτερόλεπτα — με τον έλεγχο να μένει σε εσάς.',
    bullets: [
      'Απάντηση σε κάθε lead μέσα σε δευτερόλεπτα, όλο το 24ωρο',
      'Εξυπηρέτηση από τη δική σας γνώση, όχι από γενικές απαντήσεις',
      'Παράδοση στον άνθρωπο τη στιγμή που χρειάζεται άνθρωπος',
    ],
    chips: ['WhatsApp & Instagram', 'Τηλέφωνο', 'Ελληνικά, φωνή & κείμενο'],
    roi: {
      kind: 'estimate',
      value: calcDefault.lostRevenue,
      format: 'eur',
      unit: '/ μήνα',
      label: 'σε leads που σήμερα χάνονται',
      formula: lostRevenueFormula(CALC_DEFAULTS),
      personal: 'lostRevenue',
      calcLink: true,
    },
    link: { label: 'Δείτε τους 4 agents ↑', href: '#agents' },
  },
  {
    id: 'automations',
    n: '02',
    tab: 'Αυτοματισμοί',
    title: 'Αυτοματοποιούμε επαναλαμβανόμενες εργασίες',
    gain: 'Τα εργαλεία που ήδη χρησιμοποιείτε αρχίζουν να μιλάνε μεταξύ τους. Καμία αλλαγή συστήματος.',
    bullets: [
      'Τέλος στην αντιγραφή δεδομένων από σύστημα σε σύστημα',
      'Προσφορές, τιμολόγια και follow-up που φεύγουν μόνα τους',
      'Ειδοποίηση στη σωστή ομάδα, τη σωστή στιγμή',
    ],
    chips: ['CRM', 'Email & SMS', 'Έγγραφα', 'Λογιστικά'],
    roi: {
      kind: 'estimate',
      value: calcDefault.timeValue,
      format: 'eur',
      unit: '/ μήνα',
      label: 'σε ώρες που κάνει πλέον το σύστημα',
      formula: timeValueFormula(CALC_DEFAULTS),
      personal: 'timeValue',
      calcLink: true,
    },
  },
  {
    id: 'analytics',
    n: '03',
    tab: 'Analytics & AI',
    title: 'Dashboards και προβλέψεις πάνω στα δεδομένα σας',
    gain: 'Σταματάτε να αποφασίζετε με το ένστικτο στο τέλος του μήνα. Βλέπετε τι συμβαίνει σήμερα.',
    bullets: [
      'Ένα dashboard με τα νούμερα που πραγματικά μετράνε',
      'Ερωτήσεις σε απλά ελληνικά, απαντήσεις με νούμερα',
      'Προβλέψεις ζήτησης και εντοπισμός διαρροών',
    ],
    chips: ['Dashboards', 'Αναφορές', 'Προβλέψεις'],
    roi: {
      kind: 'estimate',
      value: 3 * 2,
      format: 'hours',
      unit: '/ μήνα',
      label: 'λιγότερες ώρες σε Excel και αναφορές',
      formula: '3 αναφορές τον μήνα × 2 ώρες',
    },
  },
  {
    id: 'custom',
    n: '04',
    tab: 'Custom software',
    secondary: true,
    title: 'Εργαλεία φτιαγμένα για τη δική σας δουλειά',
    gain: 'Όταν κανένα έτοιμο πρόγραμμα δεν ταιριάζει, φτιάχνουμε αυτό που χρειάζεστε — και το συνδέουμε με όσα ήδη έχετε.',
    bullets: [
      'Εσωτερικά εργαλεία και portals για τους πελάτες σας',
      'Συνδέσεις ανάμεσα σε συστήματα που δεν «μιλάνε» μεταξύ τους',
      'Εφαρμογές με AI μέσα τους, όχι δίπλα τους',
    ],
    chips: ['Web apps', 'Portals πελατών', 'Integrations'],
    // Υπόσχεση διαδικασίας (spec), όχι αριθμός. {{TODO: confirm with founders}} — εμφανίζεται μόνο με PROMISES.customRoiFirst.
    roi: {
      kind: 'spec',
      text: 'ROI πριν τον κώδικα',
      label: 'Κάθε έργο ξεκινά με γραπτή εκτίμηση ROI και χρόνο αποπληρωμής — αλλιώς δεν το φτιάχνουμε.',
      gate: 'customRoiFirst',
    },
  },
  {
    id: 'web',
    n: '05',
    tab: 'Ιστοσελίδες & e-shop',
    secondary: true,
    title: 'Sites και e-shop που δουλεύουν μόνα τους',
    gain: 'Σύγχρονα, γρήγορα, με τον AI agent ενσωματωμένο από την πρώτη μέρα — όχι άλλη μια βιτρίνα.',
    bullets: [
      'Κάθε επισκέπτης παίρνει απάντηση σε < 60″, μέσα από το site',
      'Φόρμες που πάνε κατευθείαν στο CRM και στο ημερολόγιο',
      'E-shop με tracking, υπενθύμιση καλαθιού και επιστροφές στον αυτόματο',
    ],
    chips: ['Ιστοσελίδες', 'Shopify / WooCommerce', 'AI agent ενσωματωμένος'],
    roi: {
      kind: 'estimate',
      value: 100 * 0.05 * 60,
      format: 'eur',
      unit: '/ μήνα',
      label: 'από καλάθια που επιστρέφουν με υπενθύμιση',
      formula: '100 εγκαταλελειμμένα καλάθια × 5% επιστροφή × 60 €',
    },
    priceFrom: PRICING.websiteFrom,
  },
];

/** Illustrative UI στα visuals των tabs — κανένα εφευρεμένο νούμερο ή claim απόδοσης. */
export const servicePreviews = {
  /** Illustrative UI (ταιριάζει με το σενάριο του Analyst agent: «142 leads», «38 ραντεβού») — όχι claim απόδοσης. */
  dashboardTiles: [
    { label: 'Leads', value: '142', delta: '+12%' },
    { label: 'Ραντεβού', value: '38', delta: '+12%' },
  ],
  flow: ['Νέα φόρμα', 'CRM', 'Email πελάτη', 'Ειδοποίηση ομάδας'],
  /** Tab 01 — compact chat (διαφορετικό σενάριο από τα cards των agents). */
  chat: {
    app: 'WhatsApp Business',
    them: 'Ποιες μέρες μπορώ να έρθω για δοκιμαστικό;',
    agent: 'Έχω Τρίτη και Πέμπτη βράδυ. Σας κλείνω;',
    handoff: 'Παράδοση σε άνθρωπο όταν χρειάζεται',
  },
  /** Tab 04 — mini app window. */
  app: {
    title: 'Portal πελατών',
    rows: [
      { name: 'Αίτημα πελάτη', status: 'Νέο', done: false },
      { name: 'Έγκριση', status: 'Σε εξέλιξη', done: false },
      { name: 'Παράδοση', status: 'Ολοκληρώθηκε', done: true },
    ],
  },
  /** Tab 05 — mini browser. */
  browser: {
    url: 'yoursite.gr',
    chat: 'Πώς μπορώ να βοηθήσω;',
  },
};

export const servicesSection = {
  eyebrow: 'ΟΙ ΥΠΗΡΕΣΙΕΣ ΜΑΣ',
  h2: 'Ό,τι χρειάζεται η επιχείρησή σας για να δουλεύει μόνη της.',
  tabsLabel: 'Υπηρεσίες',
  /** Ετικέτα-διαχωριστικό στη λίστα tabs (δεν είναι tab, δεν παίρνει focus). */
  divider: 'ΧΤΙΖΟΥΜΕ ΕΠΙΣΗΣ',
  priceFrom: 'Από',
};

// ── ΚΛΑΔΟΙ (Industry selector) — τα σενάρια ζουν στο lib/industries.ts ──────
export const industriesSection = {
  eyebrow: 'ΣΤΗ ΔΙΚΗ ΣΑΣ ΕΠΙΧΕΙΡΗΣΗ',
  h2: [['Διαλέξτε τον κλάδο σας.'], ['Δείτε τι θα δούλευε ', { m: 'μόνο του' }, '.']] as [Rich, Rich],
  sub: 'Έξι τυπικά σενάρια — με τα νούμερα που αλλάζουν. Στον Χάρτη AI τα μετράμε με τα δικά σας.',
  tabsLabel: 'Κλάδοι',
  panelEyebrow: 'ΠΩΣ ΔΟΥΛΕΥΕΙ ΣΕ',
  today: 'ΣΗΜΕΡΑ',
  after: 'ΜΕ ΤΗΝ AURAGRAM',
  estimate: 'ΕΚΤΙΜΗΣΗ',
  prev: 'Προηγούμενος κλάδος',
  next: 'Επόμενος κλάδος',
  bottom: 'Το βλέπετε στη δική σας επιχείρηση; Στον Χάρτη AI το στήνουμε πάνω στα δικά σας νούμερα.',
};

// ── ΠΩΣ ΔΟΥΛΕΥΕΙ ───────────────────────────────────────────────────────────
export const process = {
  eyebrow: 'Η ΔΙΑΔΙΚΑΣΙΑ',
  h2: 'Τέσσερα βήματα. Ξέρετε τον στόχο πριν πληρώσετε ευρώ.',
  takeLabel: 'Τι παίρνετε',
  // Το βήμα 04 πρέπει να μένει συνεπές με το pilot.guarantee — αν αλλάξει το ένα, αλλάζει και το άλλο.
  steps: [
    {
      n: '01',
      title: 'Χάρτης AI',
      meta: '30′ · δωρεάν',
      body: 'Μας δείχνετε πώς δουλεύετε σήμερα. Σας δείχνουμε τι αυτοματοποιείται πρώτα — και τι αξίζει.',
      take: 'Γραπτό πλάνο με εκτίμηση ROI',
    },
    {
      n: '02',
      title: 'Συμφωνούμε το νούμερο',
      meta: '1–2 μέρες',
      body: 'Διαλέγουμε έναν agent και γράφουμε το KPI που πρέπει να πιάσει. Υπογράφεται πριν ξεκινήσουμε.',
      take: 'Υπογεγραμμένος στόχος',
    },
    {
      n: '03',
      title: 'Pilot',
      meta: '2–4 εβδομάδες',
      body: 'Ο agent δουλεύει ζωντανά, πάνω στα εργαλεία που ήδη έχετε. Βλέπετε τα νούμερα κάθε εβδομάδα.',
      take: 'Εβδομαδιαία νούμερα',
    },
    {
      n: '04',
      title: 'Αποτέλεσμα',
      meta: 'στο τέλος του pilot',
      body: 'Πιάσαμε τον στόχο; Επεκτείνουμε. Δεν τον πιάσαμε; Δουλεύουμε δωρεάν μέχρι να τον πιάσει — ή σας επιστρέφουμε τα χρήματα.',
      take: 'Τελική αναφορά ROI',
    },
  ],
};

// ── ΤΑ ΕΡΓΑΛΕΙΑ (marquee στο κάτω μέρος του hero) ──────────────────────────
export const heroTools = {
  label: 'ΔΟΥΛΕΥΕΙ ΜΕ Ο,ΤΙ ΗΔΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΕ',
};

// ── MENU (bottom sheet, mobile) ────────────────────────────────────────────
export const menuSheet = {
  open: 'Άνοιγμα μενού',
  close: 'Κλείσιμο μενού',
  title: 'Μενού',
  links: [
    { href: '/#agents', label: 'AI Agents' },
    { href: '/#ypiresies', label: 'Υπηρεσίες' },
    { href: '/#kladoi', label: 'Κλάδοι' },
    { href: '/#pilot', label: 'Το pilot' },
    { href: '/about', label: 'Η ιστορία μας' },
  ],
};

// ── ΤΟ PILOT ───────────────────────────────────────────────────────────────
export const pilot = {
  eyebrow: 'ΠΩΣ ΞΕΚΙΝΑΜΕ',
  h2: 'Ένα pilot 2–4 εβδομάδων. Ένα νούμερο. Καμία δέσμευση μετά.',
  body: 'Δεν ζητάμε ετήσιο συμβόλαιο για κάτι που δεν έχετε δει να δουλεύει. Διαλέγουμε μαζί έναν agent, τον στήνουμε ζωντανά στην επιχείρησή σας και μετράμε ένα συμφωνημένο νούμερο.',
  includes: [
    'Ένας agent, ζωντανός',
    'Σύνδεση με τα εργαλεία που ήδη έχετε',
    'Ένα μετρήσιμο KPI',
    'Εκπαίδευση της ομάδας',
    'Αναφορά ROI στο τέλος',
  ],
  excludes: ['Ετήσιο συμβόλαιο', 'Αλλαγή των συστημάτων σας', 'Κρυφές χρεώσεις'],
  price: `Από ${PRICING.pilotFrom}`,
  /** Το «Από» χωρίς το νούμερο — το νούμερο κάνει count-up (PRICING.pilotFromValue). */
  pricePrefix: 'Από',
  duration: '2–4 εβδομάδες',
  guarantee:
    'Αν ο agent δεν πιάσει το KPI που συμφωνήσαμε, δουλεύουμε δωρεάν μέχρι να το πιάσει — ή σας επιστρέφουμε τα χρήματα. Το KPI γράφεται πριν ξεκινήσουμε, όχι μετά.',
};

// ── ΟΙ ΙΔΡΥΤΕΣ ─────────────────────────────────────────────────────────────
export const founders = {
  eyebrow: 'ΠΟΙΟΙ ΕΙΜΑΣΤΕ',
  h2: 'Χρήστος & Παναγιώτης',
  body: 'Μας ξέρετε πιθανότατα από τα Reels. Είμαστε δύο άτομα, όχι agency με 30 λογαριασμούς. Γι’ αυτό δουλεύουμε με περιορισμένο αριθμό επιχειρήσεων — και γι’ αυτό μιλάτε κατευθείαν μαζί μας, όχι με account manager.',
  link: 'Η ιστορία μας',
};

// ── FAQ ────────────────────────────────────────────────────────────────────
export const faq = [
  {
    q: 'Δεν είμαι τεχνικός. Θα μπορώ να το χρησιμοποιήσω;',
    a: 'Αν στέλνετε email, μπορείτε. Εμείς το στήνουμε, το εκπαιδεύουμε και σας το παραδίδουμε με οδηγίες στα ελληνικά.',
  },
  {
    q: 'Θα χάσω την προσωπική επαφή με τους πελάτες μου;',
    a: 'Το αντίθετο. Ο agent καλύπτει τα ρουτινιάρικα, εσείς μιλάτε στους πελάτες που είναι έτοιμοι να αγοράσουν.',
  },
  {
    q: 'Πόσο κοστίζει πραγματικά;',
    a: `Το pilot ξεκινά από ${PRICING.pilotFrom}. Στην κλήση υπολογίζουμε την απόσβεση με τα δικά σας νούμερα, πριν αποφασίσετε οτιδήποτε.`,
  },
  {
    q: 'Δουλεύουν στα ελληνικά;',
    a: 'Ναι, φωνή και κείμενο. Τα δοκιμάζουμε ζωντανά μπροστά σας μέσα στην κλήση.',
  },
  {
    q: 'Πόσο θα πάρει;',
    a: 'Ο πρώτος agent είναι ζωντανός σε 2–4 εβδομάδες από τη στιγμή που ξεκινάμε.',
  },
  {
    q: 'Τι χρειάζεται από εμένα;',
    a: 'Μία κλήση 30 λεπτών, πρόσβαση στα εργαλεία σας και περίπου 1 ώρα τη βδομάδα feedback όσο τρέχει το pilot.',
  },
  {
    q: 'Είστε δύο άτομα. Θα προλάβετε;',
    a: 'Γι’ αυτό παίρνουμε περιορισμένο αριθμό έργων. Αν δεν προλαβαίνουμε, σας το λέμε — δεν σας βάζουμε σε λίστα αναμονής χωρίς να το ξέρετε.',
  },
  {
    q: 'Τι γίνεται με τα δεδομένα μου;',
    a: 'Μένουν δικά σας, σε δικούς σας λογαριασμούς. Συμμόρφωση με GDPR και NDA αν το θέλετε.',
  },
];

// ── ΤΟ OFFER ───────────────────────────────────────────────────────────────
export const offer = {
  eyebrow: 'ΤΟ ΕΠΟΜΕΝΟ ΒΗΜΑ',
  h2: 'Ο Χάρτης AI της Επιχείρησής σας',
  sub: '30 λεπτά. Χωρίς κόστος. Φεύγετε με σχέδιο, όχι με προσφορά.',
  steps: [
    'Χαρτογραφούμε τις **3 πιο ακριβές χειροκίνητες διαδικασίες** σας.',
    'Σας δείχνουμε **ζωντανά** ποιος agent τις αναλαμβάνει και πώς.',
    'Υπολογίζουμε **πόσες ώρες και πόσα ευρώ** τον μήνα, με τα δικά σας νούμερα.',
  ],
  delivery: 'Το roadmap έρχεται γραπτώς στο email σας — είτε δουλέψουμε μαζί είτε όχι.',
  anchor: `Αξίας ${PRICING.mapValue}. Δωρεάν, γιατί είμαστε δύο άτομα και προτιμούμε να δούμε αν ταιριάζουμε πριν χρεώσουμε οτιδήποτε.`,
  scarcity: `${PRICING.callsPerWeek} κλήσεις την εβδομάδα.`,
  riskReversal:
    'Αν στο τέλος των 30 λεπτών δεν υπάρχει τουλάχιστον ένα automation που αξίζει να φτιαχτεί, θα το πούμε εμείς πρώτοι — και θα σας στείλουμε το roadmap δωρεάν να το κάνετε μόνοι σας.',
};

/** Fallback χωρίς JavaScript (<noscript> στο booking): η φόρμα και το ημερολόγιο χρειάζονται JS. */
export const bookingNoscript = {
  text: 'Η φόρμα κράτησης χρειάζεται JavaScript. Κλείστε ραντεβού απευθείας:',
  calLabel: 'Κλείστε ραντεβού στο Cal.com',
  emailLabel: 'ή γράψτε μας στο',
  emailOnly: 'Γράψτε μας στο',
};

// ── FOOTER ─────────────────────────────────────────────────────────────────
export const footer = {
  tagline:
    'AI agents και αυτοματισμοί για ελληνικές επιχειρήσεις. Δύο άτομα, περιορισμένος αριθμός έργων, ένα pilot πριν από κάθε δέσμευση.',
  roiLine: 'Συστήματα που δουλεύουν μόνα τους — με μετρήσιμο ROI.',
};

// ── /ABOUT ─────────────────────────────────────────────────────────────────
export const about = {
  hero: {
    eyebrow: 'ΠΟΙΟΙ ΕΙΜΑΣΤΕ',
    h1: 'Δύο άτομα. Κανένα τμήμα πωλήσεων.',
    sub: 'Το άτομο που θα σας απαντήσει είναι το ίδιο που θα φτιάξει τον agent σας. Δεν υπάρχει ενδιάμεσος, γιατί δεν υπάρχει κανείς άλλος.',
  },
  story: {
    eyebrow: 'Η ΙΣΤΟΡΙΑ',
    h2: 'Γιατί ξεκινήσαμε',
    paragraphs: [
      'Ξεκινήσαμε την Auragram από μια απλή παρατήρηση: οι περισσότερες επιχειρήσεις δεν χρειάζονται περισσότερα εργαλεία — χρειάζονται συστήματα που πραγματικά δουλεύουν.',
      'Παντού βλέπαμε το ίδιο μοτίβο. Ομάδες να πνίγονται σε χειροκίνητη δουλειά. Leads που έμεναν αναπάντητα για ώρες. Δεκάδες ασύνδετα SaaS. Και υποσχέσεις για «μαγικό AI» που στην πράξη δεν έλυναν τίποτα.',
      'Αποφασίσαμε να το κάνουμε αλλιώς. Είμαστε δύο operators, ο Χρήστος και ο Παναγιώτης — καμία αλυσίδα από πωλητές και account managers που απλώς μεταφέρουν μηνύματα. Δουλεύουμε μαζί σε κάθε έργο, από την πρώτη κλήση και τη στρατηγική διάγνωση μέχρι την τελευταία γραμμή κώδικα και τη ρύθμιση του server.',
      'Δεν πουλάμε γενικές ιδέες περί τεχνητής νοημοσύνης. Χαρτογραφούμε πού ακριβώς χάνει χρόνο ή έσοδα η επιχείρησή σας, διαλέγουμε ένα συγκεκριμένο πρόβλημα και χτίζουμε custom AI agents και automations που το αναλαμβάνουν από άκρη σε άκρη — πάνω στις δικές σας υποδομές, με μετρήσιμο αποτέλεσμα από την πρώτη μέρα.',
      'Λίγα έργα τη φορά. Πάντα ένα στοχευμένο pilot πριν από κάθε δέσμευση. Και συστήματα που δουλεύουν αθόρυβα, 24/7.',
    ],
  },
  people: [
    {
      n: '01',
      name: 'Χρήστος',
      title: 'CO-FOUNDER',
      role: 'Στρατηγική & πωλήσεις',
      body: 'Του αρέσει να παίρνει πρωτοβουλίες, να κατευθύνει καταστάσεις και να λέει τα πράγματα ωμά και ξεκάθαρα, χωρίς περιττά λόγια. Αντιμετωπίζει κάθε project όπως το γήπεδο: με ξεκάθαρη στρατηγική, ηγετική νοοτροπία και απόλυτη εστίαση στο αποτέλεσμα.',
      detail: 'Fitness, βιβλία, πολεμικές τέχνες, anime και μουσική.',
      instagram: 'https://www.instagram.com/xrhstos.auramidis/',
      linkedin: '',
      photo: '/founders/christos.jpg',
    },
    {
      n: '02',
      name: 'Παναγιώτης',
      title: 'CO-FOUNDER',
      role: 'Ανάπτυξη & συστήματα',
      body: 'Στο λεξιλόγιό του δεν υπάρχει το «δεν γίνεται». Προσεγγίζει κάθε σύστημα με την πειθαρχία που μαθαίνεις στο γήπεδο και στο γυμναστήριο: όποιο κι αν είναι το πρόβλημα, θα βρει τον τρόπο, θα γράψει τη λύση και θα την κάνει να δουλέψει στην πράξη.',
      detail: 'Ποδόσφαιρο, fitness, βιβλία, κιθάρα και μουσική.',
      instagram: 'https://www.instagram.com/panagiotis.gramma/',
      linkedin: '',
      photo: '/founders/panagiotis.jpg',
    },
  ],
  principles: [
    {
      n: '01',
      title: 'Ξεκινάμε με pilot, όχι με συμβόλαιο.',
      body: 'Δεν ζητάμε δέσμευση για κάτι που δεν έχετε δει να δουλεύει.',
    },
    {
      n: '02',
      title: 'Ένα νούμερο, συμφωνημένο πριν.',
      body: 'Αν δεν μπορούμε να μετρήσουμε τι πέτυχε ο agent, δεν το χτίζουμε.',
    },
    {
      n: '03',
      title: 'Δεν παραδίδουμε κάτι που δεν καταλαβαίνετε.',
      body: 'Κάθε automation παραδίδεται με εκπαίδευση και τεκμηρίωση στα ελληνικά.',
    },
    {
      n: '04',
      title: 'Τα δεδομένα και οι λογαριασμοί μένουν δικά σας.',
      body: 'Χτίζουμε πάνω στη δική σας υποδομή. Αν φύγουμε, όλα δουλεύουν.',
    },
    {
      n: '05',
      title: 'Αν δεν σας κάνει, το λέμε εμείς πρώτοι.',
      body: 'Έχουμε πει «όχι» και θα το ξανακάνουμε. Δεν έχουμε τμήμα πωλήσεων να ταΐσουμε.',
    },
  ],
  // ΜΙΑ editable λίστα: οι ιδρυτές προσθέτουν/αφαιρούν items εδώ. `icon` = κλειδί στο components/about/StackIcons.
  stackSection: {
    eyebrow: 'ΤΟ STACK ΜΑΣ',
    h2: 'Με τι χτίζουμε',
    sub: 'Τα εργαλεία που χρησιμοποιούμε εμείς — στη δική σας υποδομή, στους δικούς σας λογαριασμούς.',
  },
  stack: [
    {
      group: 'AI',
      items: [
        { icon: 'openai', name: 'OpenAI', note: 'μοντέλα AI' },
        { icon: 'claude', name: 'Anthropic Claude', note: 'μοντέλα AI' },
      ],
    },
    {
      group: 'ΑΥΤΟΜΑΤΙΣΜΟΙ',
      items: [
        { icon: 'n8n', name: 'n8n', note: 'οι ροές που συνδέουν τα πάντα' },
        { icon: 'make', name: 'Make', note: 'οι ροές που συνδέουν τα πάντα' },
      ],
    },
    {
      group: 'ΕΦΑΡΜΟΓΕΣ & ΔΕΔΟΜΕΝΑ',
      items: [
        { icon: 'nextjs', name: 'Next.js', note: 'γρήγορα sites και εφαρμογές' },
        { icon: 'supabase', name: 'Supabase', note: 'τα δεδομένα σας, στον λογαριασμό σας' },
        { icon: 'vercel', name: 'Vercel', note: 'ταχύτητα και σταθερότητα' },
        { icon: 'tailwind', name: 'Tailwind CSS', note: 'σύγχρονο design, γρήγορα' },
      ],
    },
    {
      group: 'ΚΑΝΑΛΙΑ & CRM',
      items: [
        { icon: 'whatsapp', name: 'WhatsApp Business API', note: 'εκεί που είναι οι πελάτες σας' },
        { icon: 'hubspot', name: 'HubSpot', note: 'το CRM που ήδη έχετε' },
        { icon: 'pipedrive', name: 'Pipedrive', note: 'το CRM που ήδη έχετε' },
        { icon: 'caldotcom', name: 'Cal.com', note: 'κρατήσεις και ημερολόγια' },
      ],
    },
  ] as { group: string; items: { icon: string; name: string; note: string }[] }[],
  notFor: {
    h2: 'Σε ποιους δεν κάνουμε',
    items: [
      'Ψάχνετε το φθηνότερο. Δεν είμαστε.',
      'Θέλετε να αντικαταστήσετε την ομάδα σας με AI. Δεν το κάνουμε αυτό.',
      'Δεν έχετε κανέναν να δώσει 1 ώρα τη βδομάδα στο pilot. Θα αποτύχει.',
      'Θέλετε «κάτι με AI» χωρίς συγκεκριμένο πρόβλημα. Ξεκινήστε από το πρόβλημα και ελάτε ξανά — θα σας βοηθήσουμε να το βρείτε στα 30′.',
    ],
  },
  pricingLine: `Pilot από ${PRICING.pilotFrom}. Rollout ανά agent. Retainer από ${PRICING.retainerFrom}/μήνα. Θα ξέρετε την τιμή πριν την τρίτη κουβέντα.`,
};

// ── ΦΟΡΜΑ ──────────────────────────────────────────────────────────────────
export const formCopy = {
  reasons: [
    'Χάνω leads',
    'Πνίγομαι σε χειροκίνητη δουλειά',
    'Θέλω ανάπτυξη χωρίς προσλήψεις',
    'Περιέργεια',
  ],
  revenues: ['< 50.000€', '50.000 – 150.000€', '150.000 – 500.000€', '500.000€ +', 'Δεν λέω'],
};
