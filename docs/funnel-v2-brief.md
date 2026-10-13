# Auragram — Funnel v2 Brief: Form → Google Sheet CRM + Emails (no calendar, no company yet)

**Work on a separate branch (`funnel-v2`), not `main`.** The founders will test the branch's Vercel preview before merging. This brief replaces any earlier message about "form only / no calendar / no company". Everything is here.

Constraints as before:
- no fabricated data
- reduced motion, contrast and 44px targets
- mobile-first, Instagram in-app browser first
- never ship a literal `{{TODO}}`

---

## A. Funnel: form only, then a phone qualification call

**1. Remove Cal.com completely:**
- the embed and `NEXT_PUBLIC_CAL_LINK`
- form step 2 («…ανοίγει το ημερολόγιο»)
- the `<noscript>` Cal link

Grep the booking, FAQ, confirmation, process, hero and `/about` copy for «ημερολόγ», «Cal», «κλείσ», «ραντεβού». Change only copy that promises **us** booking a slot in a calendar. Agent scenarios about clients' businesses stay. **List every copy change in the report.**

**2. CTA label** everywhere, byte-identical: «Ζητήστε τον Χάρτη AI — 30′ δωρεάν». Update the label constant and the CTA tests.

**3. Single-step form:**

| Field | Rules |
|---|---|
| Ονοματεπώνυμο | required |
| Κινητό | required. Greek mobile: `69XXXXXXXX`, optional `+30`/`0030` prefix, spaces allowed. Normalise to `+3069XXXXXXXX`. Clear inline error in Greek. |
| Email | **required**, because the visitor receives a confirmation email. Validate it, but no MX lookups. |
| Επιχείρηση / κλάδος | required |
| «Τι σας κάνει να ψάχνετε τώρα;» chips | keep (optional) |
| «Τζίρος 12μήνου» chips | keep (optional) |

- **Hidden fields (as now):** calculator snapshot, industry viewed, UTM source/medium/campaign/content, landing page path.
- **Under the submit button:** «Θα σας καλέσουμε σήμερα ή την επόμενη εργάσιμη για να δούμε αν ταιριάζουμε. Χωρίς πωλήσεις.»
- **Consent line:** «Με την αποστολή συμφωνείτε με την [Πολιτική απορρήτου](/privacy).» No pre-ticked boxes.

**4. Success state / confirmation page:**
- Message: «Λάβαμε το αίτημά σας, {first name}. Θα σας καλέσει ο Παναγιώτης ή ο Χρήστος σήμερα ή την επόμενη εργάσιμη. Σας στείλαμε και email επιβεβαίωσης.»
- Below it, in smaller text: «Θα σας καλέσουμε από το 698 171 8440 ή το 694 323 2385 — αποθηκεύστε τα για να σηκώσετε.»
- **These phone numbers appear ONLY on the confirmation page and in the confirmation email.** Never in the footer, JSON-LD, or anywhere public (spam/scraping).

**5. Spam protection:**
- keep the honeypot
- reject submissions made < 3s after the form became visible
- server-side rate limit: max 3 per IP per hour, max 1 per normalised phone per 24h. On Vercel use an in-memory map plus a best-effort note; don't add paid services.
- zod validation on the server for every field
- no captcha

**6. Analytics:**
- The primary conversion becomes `lead_submit`. It fires **only after a successful server response**, with params: `industry`, `utm_source`, `utm_campaign`, and `has_calculator`.
- Map the Meta Pixel to the standard **`Lead`** event.
- Remove `booking_complete`.
- Report the final event list.

## B. Lead delivery: Google Apps Script web app → Google Sheet CRM + emails

We don't use n8n or Make. Build it with Google Apps Script, owned by the founders' Google account.

### B1. Site side (server action)
- POST JSON to `LEAD_WEBHOOK_URL` (an Apps Script `/exec` URL).
- **Apps Script cannot read custom request headers**, so send the shared secret **inside the JSON body** as `secret` (from `LEAD_WEBHOOK_SECRET`). Remove the `x-auragram-secret` header.
- Body fields:
  - `secret`, `submittedAt` (ISO, Europe/Athens), `name`, `phone` (normalised), `email`, `business`
  - `reasons` (array), `revenue`, `industryViewed`
  - `calculator` (object or null)
  - `utm` (object), `page`
- Apps Script web apps respond with a 302 redirect. Use `fetch(url, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(...) })`. Use the `text/plain` content type to avoid preflight issues, and parse the JSON response.
- Timeout 10s, plus one retry on network error or 5xx.
- **If delivery still fails:**
  - log the full lead server-side (Vercel logs) so it isn't lost
  - show the visitor an error state: «Κάτι πήγε στραβά στην αποστολή. Δοκιμάστε ξανά σε λίγο.»
  - do NOT show success, and do NOT fire `lead_submit`
- **Without `LEAD_WEBHOOK_URL`** (local/preview): log the lead and show success, labelled as test mode in dev only.

### B2. Apps Script project (deliver as files in `docs/apps-script/`, plus setup steps)

**Files:**
- `Code.gs`
- `appsscript.json` (timeZone `Europe/Athens`)
- `README.md` with click-by-click setup in Greek

**Sheet «Leads»** (create it on first run if missing; freeze the header row). Columns, in order:

| # | Column | Content |
|---|---|---|
| A | Ημερομηνία | Athens time, `dd/MM/yyyy HH:mm` |
| B | Status | dropdown: `Νέο`, `Κλήθηκε`, `Δεν σήκωσε`, `Qualified`, `Χάρτης AI κλείστηκε`, `Pilot`, `Δεν ταιριάζει` (default `Νέο`) |
| C | Ανάθεση | dropdown: `Παναγιώτης`, `Χρήστος` (empty by default) |
| D | Όνομα | |
| E | Κινητό | stored as text, with a `tel:` HYPERLINK |
| F | Email | |
| G | Επιχείρηση / κλάδος | |
| H | Λόγοι | |
| I | Τζίρος | |
| J | Κλάδος που είδε | |
| K | Χαμένα €/μήνα (calculator) | |
| L | Ώρες/μήνα (calculator) | |
| M | Πηγή (utm_source) | |
| N | Καμπάνια (utm_campaign / Reel) | |
| O | Σελίδα | |
| P | Επόμενο βήμα | date, empty |
| Q | Σημειώσεις | empty |

**Formatting:**
- conditional formatting by Status (`Νέο` = light cyan, `Qualified` = light green, `Δεν ταιριάζει` = grey)
- the newest lead at the **top**: insert at row 2, don't append at the bottom

**`doPost(e)`:**
1. Parse `e.postData.contents`. Reject with `{ok:false}` if the secret doesn't match. Store the secret in Script Properties `LEAD_SECRET`, never hard-coded.
2. Use `LockService.getScriptLock()` (wait up to 10s) around the sheet write.
3. Re-validate the required fields and length limits (defence in depth).
4. Insert the row.
5. Send the **internal email** to both founders:
   - recipients from the Script Property `NOTIFY_EMAILS`
   - subject: «🔔 Νέο lead: {name} · {business}»
   - body (HTML + plain): all fields; click-to-call links for the lead's phone (`tel:`) plus `https://wa.me/` and `viber://chat?number=` links; the calculator numbers; the UTM; a link to the sheet
6. Send the **confirmation email** to the lead (`MailApp`):
   - sender name «Auragram»
   - reply-to = the first founder email
   - subject: «Λάβαμε το αίτημά σας — Auragram»
   - body in Greek, short and warm. It says:
     - we received the request
     - Παναγιώτης or Χρήστος will call today or the next working day
     - from 698 171 8440 or 694 323 2385
     - what the 30′ Χάρτης AI is (one line)
     - «Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το email.»
   - plain HTML, no images, readable on mobile
7. Return `ContentService` JSON `{ok:true}`.
8. Wrap everything in try/catch. On failure, still return `{ok:false, error}`, and email the founders a «⚠️ Αποτυχία lead» message containing the raw payload so nothing is lost.

**Quota note in README:** consumer Gmail sends ~100 emails/day via Apps Script. That is enough for now. Write it down so we know the limit.

**README setup steps (Greek, numbered, beginner-level):**
1. Create a Google Sheet «Auragram CRM» with the account that will send the emails.
2. Extensions → Apps Script, then paste `Code.gs` and `appsscript.json`.
3. Set the Script Properties `LEAD_SECRET` and `NOTIFY_EMAILS`.
4. Run `setup()` once to create the sheet, dropdowns and formatting, and authorise.
5. Deploy → New deployment → Web app: Execute as **Me**, Who has access **Anyone**. Copy the `/exec` URL.
6. Put the URL and secret in Vercel as `LEAD_WEBHOOK_URL` / `LEAD_WEBHOOK_SECRET`, in the Preview and Production scopes.
7. How to redeploy after editing the code: Manage deployments → Edit → New version, so the URL stays the same.

Include a `testLead()` function that inserts a fake lead marked «ΤΕΣΤ» and sends both emails to `NOTIFY_EMAILS` only.

## C. No company yet: the founders as individual data controllers

- Replace the LEGAL company fields with an "individuals" mode:
  - controllers «Παναγιώτης Γραμματικού» and «Χρήστος Αβραμίδης»
  - city «{{TODO: πόλη}}»
  - contact email = the current `CONTACT.email` fallback (the existing Gmail), for now
- No ΑΦΜ, ΓΕΜΗ or street address.
- **The founders' phone numbers do NOT go on /privacy.**
- **Rewrite /privacy in plain Greek:**
  - who we are (the two names, city, email)
  - what we collect (the form fields, the qualifying answers, calculator values, source/UTM, page)
  - why (to call you back about your request, and to send the confirmation email)
  - legal basis (your request, plus consent for analytics cookies)
  - where it's stored and who processes it: Vercel (hosting), Google (Sheets/Gmail, which hold the lead), and analytics only after consent
  - retention (12 months if we don't start working together, then deleted)
  - your rights (access, correction, deletion, objection) via email
  - the right to complain to the Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα
- **Simplify /terms** to site-usage terms only (no service/contract terms yet).
- **The build gate** now requires only: both names, the city and `CONTACT.email`.

---

## Report

- every copy change (old → new)
- the final analytics event list
- screenshots at 390px of: the form (empty, with validation errors, submitting), the success state, the error state, and /privacy
- the `docs/apps-script/` files and README
- a local end-to-end test against a mock webhook. Show the exact JSON payload sent (with the secret redacted).
