# AURAGRAM — website

Next.js 14 (App Router) · TypeScript · Tailwind · Vercel. Όλο το περιεχόμενο στα ελληνικά.

**Μοναδικός στόχος:** κράτηση δωρεάν 30λεπτης κλήσης «Ο Χάρτης AI της Επιχείρησής σας».
Κάθε CTA στο site λέει το **ίδιο ακριβώς** πράγμα: `Κλείστε τον Χάρτη AI — 30′ δωρεάν`.

---

## Ξεκίνημα

```bash
npm install
cp .env.example .env.local     # συμπληρώστε τα κλειδιά
npm run dev                    # http://localhost:3000
```

| Εντολή | Τι κάνει |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build |
| `npm run og` | ξαναφτιάχνει το `public/og.png` (1200×630) |
| `npm run logo` | ξαναβγάζει τα logo assets από το render (`LOGO_SRC=...`) |
| `npm run lint` | ESLint |

---

## Πού αγγίζετε τι

| Θέλω να αλλάξω… | Αρχείο |
|---|---|
| CTA, τιμές, links, νούμερα που λείπουν | `lib/config.ts` |
| **Όλο το κείμενο** του site | `lib/content.ts` |
| Χρώματα / τυπογραφία | `tailwind.config.ts` + `app/globals.css` |
| Λογική φόρμας, scoring, webhook | `app/actions.ts` |
| OG image | `scripts/og.mjs` → `npm run og` |

Τα components δεν περιέχουν κείμενο — μόνο δομή. Αλλάζετε copy χωρίς να ανοίξετε React.

---

## Δομή

```
/                → Hero · Αποδείξεις · Πρόβλημα · 4 AI Agents · ROI calculator ·
                   Υπηρεσίες (3) · Πώς δουλεύει · Το Pilot · Ιδρυτές · FAQ · Φόρμα + Cal.com
/about           → Ιστορία · 2 ιδρυτές · 5 αρχές · Stack ·
                   Σε ποιους δεν κάνουμε · Τιμές · CTA
/confirmation    → Τι μόλις έτρεξε (5 βήματα) · τι να ετοιμάσετε · βίντεο 90″  (noindex)
/privacy /terms  → νομικά
```

**Ροή μετατροπής:** φόρμα 6 πεδίων → server action → webhook → inline Cal.com →
`bookingSuccessful` → `/confirmation`. Η φόρμα προηγείται του ημερολογίου **επίτηδες**:
έτσι έχετε το email ακόμα κι αν εγκαταλείψει στο ημερολόγιο.

---

## ⚠️ ΠΡΙΝ ΒΓΕΙ ΣΤΟΝ ΑΕΡΑ

Το site δεν περιέχει **ούτε ένα** εφευρεμένο νούμερο, testimonial ή λογότυπο πελάτη —
όπως ζητούσε το spec. Ό,τι λείπει είναι `null` ή `{{TODO}}` και **δεν εμφανίζεται**.

### Απαραίτητα
- [ ] `.env.local`: `NEXT_PUBLIC_CAL_LINK` και `LEAD_WEBHOOK_URL` (χωρίς αυτά δεν
      κλείνει ραντεβού και το lead μένει μόνο στα logs)
- [ ] `NEXT_PUBLIC_SITE_URL` = το πραγματικό domain
- [x] `lib/config.ts` → `BRAND.instagram`: αληθινά handles (@xrhstos.auramidis, @panagiotis.gramma)
- [x] `about.story` + `about.people` (bios, ρόλοι, IG): συμπληρωμένα
- [ ] `/privacy` και `/terms`: εταιρική επωνυμία, ΑΦΜ, έδρα, πόλη δικαστηρίων
- [ ] Φωτογραφίες ιδρυτών: αποθηκεύστε `public/founders/christos.jpg` και
      `public/founders/panagiotis.jpg` (τα paths είναι ήδη συνδεδεμένα στο content.ts)

### Μόλις υπάρχουν πραγματικά δεδομένα
- [ ] `METRICS.instagramFollowers` → εμφανίζεται 3ο στατιστικό στη γραμμή αποδείξεων
- [ ] `METRICS.agentResults.*` → εμφανίζεται η γραμμή «→ αποτέλεσμα» σε κάθε κάρτα agent.
      **Μόνο μετά το πρώτο pilot.** Εφευρεμένο νούμερο = καμένη κλήση όταν σας το ρωτήσουν.
- [ ] `about.built.items` → screen recordings 30–60″ σε `public/demos/`
- [ ] `/confirmation` → βίντεο 90″ «τι θα δούμε στην κλήση»

### Automations εκτός site (n8n / Make)
Το site στέλνει το lead· τα υπόλοιπα τα στήνετε εσείς:
1. **SMS/WhatsApp σε < 60″** από την υποβολή — αυτό είναι η απόδειξη του προϊόντος
2. Email επιβεβαίωσης · υπενθύμιση 24ω πριν · υπενθύμιση 1ω πριν με link
3. No-show → αυτόματο «να το ξαναβάλουμε;» σε 15 λεπτά
4. Brief στους δύο σας πριν την κλήση, με τα πεδία της φόρμας + το ROI

Το webhook λαμβάνει: τα 6 πεδία, `score`/`tier` (αόρατο φιλτράρισμα — **ποτέ σκληρή
απόρριψη**), τον υπολογισμό ROI και τα UTM του Reel που το έφερε.

---

## Αποφάσεις που αξίζει να ξέρετε

- **Καμία εξάρτηση animation library.** Το fade-up είναι CSS + IntersectionObserver.
  Το περιεχόμενο είναι ορατό *by default* και κρύβεται μόνο όταν τρέχει JS
  (`html[data-js]`) — αν σπάσει το JS, η σελίδα δεν αδειάζει.
- **Λογότυπο = το render του πελάτη**, με το σκούρο φόντο βγαλμένο μέσω
  luminance key (`scripts/logo.mjs`). Στο nav: σήμα + καθαρό λεκτικό. Στο
  footer: ολόκληρο το lockup. Χρήση μόνο πάνω σε σκούρο.
- **Constellation mesh** (`components/ui/constellation-grid.tsx`): ήσυχο πλέγμα
  κόμβων στο φόντο κάθε ανοιχτόχρωμου section. Τρέχει μόνο όσο είναι ορατό,
  παγώνει με `prefers-reduced-motion`, καμία αλληλεπίδραση σε κινητό.
  Απενεργοποίηση ανά section: `<Section mesh={false} …>`.
- **Analytics με συγκατάθεση.** Χωρίς αποδοχή cookies δεν φορτώνεται κανένα script
  GA4/Meta/Clarity.
- **Ένα accent ανά section.** Cyan στα σκούρα, lime στα ανοιχτά, ποτέ μαζί.
- **`Ιστοσελίδες & e-shops` και `Custom εφαρμογές` δεν είναι στο μενού** — μία γραμμή
  στο footer. Στενότερο μενού = υψηλότερη τιμή.
- **Το «απαντάμε εντός μίας εργάσιμης» έχει αφαιρεθεί παντού.** Αντέφασκε με το προϊόν.

## Events (GA4 + Meta)

`hero_cta_click` · `agent_card_view` · `calculator_used` · `calculator_result_view` ·
`pilot_section_view` · `about_page_view` · `form_start` · `form_submit` ·
**`booking_complete`** ← το Custom Conversion που βελτιστοποιείτε · `scroll_75`

UTM: κάθε link-in-bio με `?utm_source=instagram&utm_medium=reels&utm_campaign=<handle>`.
Περνάνε κρυφά στη φόρμα → ξέρετε ποιανού το Reel φέρνει **πελάτες**, όχι views.
