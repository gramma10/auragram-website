# AURAGRAM — website

Next.js 14 (App Router) · TypeScript · Tailwind · Vercel. Όλο το περιεχόμενο στα ελληνικά.

**Μοναδικός στόχος:** αίτημα για τη δωρεάν 30λεπτη κλήση «Ο Χάρτης AI της Επιχείρησής σας» — τους καλούμε εμείς, δεν υπάρχει ημερολόγιο.
Κάθε CTA στο site λέει το **ίδιο ακριβώς** πράγμα: `Ζητήστε τον Χάρτη AI — 30′ δωρεάν`.

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
| Λογική φόρμας, webhook | `app/actions.ts` (+ `lib/lead.ts` επικύρωση, `lib/rateLimit.ts`) |
| CRM / email (Google Sheet) | `docs/apps-script/` (οδηγίες: `docs/apps-script/README.md`) |
| OG image | `scripts/og.mjs` → `npm run og` |

Τα components δεν περιέχουν κείμενο — μόνο δομή. Αλλάζετε copy χωρίς να ανοίξετε React.

---

## Δομή

```
/                → Hero · Αποδείξεις · Πρόβλημα · 4 AI Agents · ROI calculator ·
                   Υπηρεσίες (3) · Πώς δουλεύει · Το Pilot · Ιδρυτές · FAQ · Φόρμα
/about           → Ιστορία · 2 ιδρυτές · 5 αρχές · Stack ·
                   Σε ποιους δεν κάνουμε · Τιμές · CTA
/confirmation    → «Λάβαμε το αίτημά σας» + τα τηλέφωνα από τα οποία καλούμε · τι να ετοιμάσετε  (noindex)
/privacy /terms  → νομικά
```

**Ροή μετατροπής:** φόρμα (1 βήμα) → server action (zod, honeypot, χρόνος, rate limit) →
POST στο Google Apps Script (`LEAD_WEBHOOK_URL`) → γραμμή στο Google Sheet «Leads» + email στους
ιδρυτές + email επιβεβαίωσης στον επισκέπτη → `/confirmation` → **τηλεφωνική κλήση** από εμάς.
Το `lead_submit` στέλνεται μόνο μετά από επιτυχή απάντηση του server.

---

## ⚠️ ΠΡΙΝ ΒΓΕΙ ΣΤΟΝ ΑΕΡΑ

Το site δεν περιέχει **ούτε ένα** εφευρεμένο νούμερο, testimonial ή λογότυπο πελάτη —
όπως ζητούσε το spec. Ό,τι λείπει είναι `null` ή `{{TODO}}` και **δεν εμφανίζεται**.

### Απαραίτητα
- [ ] `LEAD_WEBHOOK_URL` + `LEAD_WEBHOOK_SECRET` (Vercel, Production **και** Preview): βλ. `docs/apps-script/README.md`.
      Χωρίς αυτά το lead μένει μόνο στα logs.
- [ ] `NEXT_PUBLIC_SITE_URL` = το πραγματικό domain
- [x] `about.story` + `about.people` (bios, ρόλοι, IG): συμπληρωμένα
- [ ] `LEGAL.city` στο `lib/config.ts` (η πόλη στο /privacy και /terms) — το production build αποτυγχάνει χωρίς αυτήν
- [ ] Φωτογραφίες ιδρυτών: αποθηκεύστε `public/founders/christos.jpg` και
      `public/founders/panagiotis.jpg` (τα paths είναι ήδη συνδεδεμένα στο content.ts)

### Μόλις υπάρχουν πραγματικά δεδομένα
- [ ] `METRICS.agentResults.*` → εμφανίζεται η γραμμή «→ αποτέλεσμα» σε κάθε κάρτα agent.
      **Μόνο μετά το πρώτο pilot.** Εφευρεμένο νούμερο = καμένη κλήση όταν σας το ρωτήσουν.
- [ ] `about.built.items` → screen recordings 30–60″ σε `public/demos/`

### Πέρα από το site
Δεν χρησιμοποιούμε n8n/Make. Το CRM και τα email τα κάνει το Google Apps Script στο
`docs/apps-script/` (Sheet «Leads», email προς εσάς, email επιβεβαίωσης προς τον επισκέπτη).
Το webhook λαμβάνει (JSON, με το `secret` μέσα στο σώμα): `name`, `phone` (+3069…), `email`, `business`,
`reasons`, `revenue`, `industryViewed`, `calculator`, `utm`, `page`, `submittedAt`, `id`.

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
`pilot_section_view` · `about_page_view` · `form_start` · `scroll_75` · `service_tab_view` · `industry_view` ·
**`lead_submit`** ← η primary conversion, μόνο μετά από επιτυχή απάντηση του server
(`industry`, `utm_source`, `utm_campaign`, `has_calculator`). Στο Meta Pixel στέλνεται ως standard event **`Lead`**.

UTM: κάθε link-in-bio με `?utm_source=instagram&utm_medium=reels&utm_campaign=<handle>`.
Περνάνε κρυφά στη φόρμα → ξέρετε ποιανού το Reel φέρνει **πελάτες**, όχι views.
