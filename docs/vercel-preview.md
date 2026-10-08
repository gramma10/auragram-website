# Vercel preview — προετοιμασία (τίποτα δεν έχει γίνει deploy / push)

## 1. Environment variables

| Μεταβλητή | Scope | Υποχρεωτική; | Τι κάνει |
|---|---|---|---|
| `LEGAL_TODO_OK` | **Preview ΜΟΝΟ** (`1`) | **Ναι, για το preview** | Παρακάμπτει το build-gate των νομικών στοιχείων (`lib/legal.ts`). Χωρίς αυτό το build αποτυγχάνει όσο τα 5 πεδία `LEGAL` είναι null. **ΠΟΤΕ στο Production scope.** |
| `NEXT_PUBLIC_CAL_LINK` | Preview + Production | Προαιρετική | π.χ. `auragram/xartis-ai`. Χωρίς αυτό: η φόρμα δουλεύει, δείχνει fallback αντί για ημερολόγιο, και το `<noscript>` έχει μόνο το email. |
| `LEAD_WEBHOOK_URL` | Preview + Production | Προαιρετική (απαραίτητη στο production) | Πού πάνε τα leads (n8n/Make). Στο preview **άφησέ την κενή** (το lead καταγράφεται στα logs) ή βάλε δοκιμαστικό webhook — όχι το production. |
| `LEAD_WEBHOOK_SECRET` | Preview + Production | Προαιρετική | Στέλνεται ως header `x-auragram-secret`. |
| `NEXT_PUBLIC_SITE_URL` | Production | Προαιρετική | Default `https://auragram.gr`. Στο preview **άφησέ την κενή** (το preview δεν ευρετηριάζεται). |
| `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_CLARITY_ID` | Production | Προαιρετικές | Analytics (φορτώνουν μόνο μετά τη συγκατάθεση cookies). **Άφησέ τα κενά στο Preview** ώστε να μη «λερώνουν» τα production δεδομένα. |
| `NEXT_PUBLIC_NOINDEX` | οποιοδήποτε | Προαιρετική | `1` = μπλοκάρει το indexing χειροκίνητα (έξτρα ασφάλεια). |
| `VERCEL_ENV`, `VERCEL_URL`, `NODE_ENV` | αυτόματα | — | Τα ορίζει το Vercel. Το `VERCEL_ENV` (`production` / `preview` / `development`) κρίνει το indexing. |

Δεν είναι env του site: `LOGO_SRC` (μόνο το `npm run logo`), `NEXT_PHASE` (εσωτερικό του Next).

## 2. Έλεγχοι που έγιναν τοπικά

- `npx next build` **χωρίς** `LEGAL_TODO_OK` → αποτυγχάνει με `[legal] Λείπουν νομικά στοιχεία…` (σωστό: προστατεύει το production).
- `VERCEL_ENV=preview LEGAL_TODO_OK=1 npx next build` → περνά.
- Σε preview build:
  - `/robots.txt` → `User-Agent: *` / `Disallow: /` (χωρίς sitemap)
  - κάθε response έχει `X-Robots-Tag: noindex, nofollow` (`next.config.mjs`)
  - `<meta name="robots" content="noindex, nofollow">`
  - Όλα στηρίζονται στο ίδιο `BLOCK_INDEXING` (`lib/config.ts`): `VERCEL_ENV` = preview ή development.
- Production (`VERCEL_ENV=production` ή εκτός Vercel) → indexable όπως πριν.

## 3. Βήματα deploy (τρέξτε εσείς)

Το project δεν είναι git repo, οπότε το πιο απλό είναι το Vercel CLI (ανεβάζει τον τοπικό φάκελο· τα `node_modules`, `.next`, `.env*.local` εξαιρούνται από το `.gitignore`).

```powershell
# μία φορά
npm i -g vercel
cd "C:\Users\panagiotis\Desktop\funnel auragram"
vercel login
vercel link                      # δημιουργεί/συνδέει project (το .vercel είναι στο .gitignore)

# env vars — ΜΟΝΟ Preview scope για το LEGAL_TODO_OK
vercel env add LEGAL_TODO_OK preview          # τιμή: 1
vercel env add NEXT_PUBLIC_CAL_LINK preview   # προαιρετικό, π.χ. auragram/xartis-ai

# PREVIEW deploy (ΧΩΡΙΣ --prod)
vercel deploy
```

Η εντολή τυπώνει το preview URL (`https://<project>-<hash>.vercel.app`).

⚠️ **Deployment Protection:** τα preview του Vercel προστατεύονται by default (Vercel Authentication) και το PageSpeed Insights δεν μπορεί να τα ανοίξει. Για το τεστ: *Project → Settings → Deployment Protection → Vercel Authentication → Disabled* (για Preview), και ξανά-ενεργοποίησέ το μετά. Το `noindex` συνεχίζει να προστατεύει από indexing ακόμα κι έτσι.

## 4. Μετά το deploy — τι ελέγχουμε

1. **PageSpeed Insights (mobile)** στο preview URL: https://pagespeed.web.dev/ → Mobile → Performance. Στείλε μου score, LCP, TBT, CLS.
2. **Font preload στο Linux build** (το τοπικό Windows build δεν έχει preloads — bug του Next 14.2.x στα Windows paths):
   ```bash
   curl -s https://<preview-url>/ | grep -o '<link rel="preload"[^>]*as="font"[^>]*>'
   ```
   Περιμένουμε `woff2` preload για Manrope και Inter (greek + latin). Αν λείπουν, το φέρνουμε.
3. **Indexing:**
   ```bash
   curl -s https://<preview-url>/robots.txt
   curl -sI https://<preview-url>/ | grep -i x-robots-tag
   ```
4. Έλεγχος σε κινητό (Instagram in-app browser): `?industry=iatreia` deep link, φόρμα → hidden `industry` field, dock/menu sheet.

## 5. Πριν το production (δεν είναι μέρος του preview)

- Συμπλήρωση των 5 πεδίων `LEGAL` και του `CONTACT.email` στο `lib/config.ts`.
- Το `LEGAL_TODO_OK` **δεν** μπαίνει στο Production scope.
- `NEXT_PUBLIC_SITE_URL`, `LEAD_WEBHOOK_URL` (+secret), analytics IDs στο Production scope.
