# Auragram — Round 2 Brief

## Context

Phases 1–5 of the design polish pass are complete. This round restructures a few sections based on a review of the live build at 375–390px. It also borrows two patterns from a reference agency site: **before → after workflow cards** and a **logo-pill tools marquee**.

Every constraint from the original brief still applies:
- no fabricated numbers, testimonials or client logos
- the CTA label stays byte-identical everywhere
- no changes to business logic, the calculator formula, the form/booking flow, or existing analytics event names
- the motion budget, `prefers-reduced-motion`, contrast ≥ 4.5:1, and tap targets ≥ 44px still apply
- mobile-first at 390px, with Instagram's in-app browser as the primary environment

All copy lives in `lib/content.ts`. Put new copy there too, never inline in components.

## Working method

- Work through the items **in order**.
- After **item 1** (both agent variants), stop and wait for approval. I'll compare the variants on a real phone before you continue.
- After that, stop at the end of the round with:
  - a changelog
  - the files touched
  - screenshots at 390px and 1440px for every changed section

---

## 1. AI Agents section — build TWO variants for comparison

### 1.0 Shared changes (apply to both variants)

**Rename the four agents to outcome names.** Update every reference across the site: `lib/content.ts`, hero chat metadata, FAQ, `/about`, form option chips, analytics payload labels, JSON-LD, and alt text. Grep for `Sales Agent`, `Support Agent`, `Operations Agent`, `Analyst Agent`, and the bare `Sales|Support|Operations|Analyst`. Keep the internal `id`s stable (`sales`, `support`, `operations`, `analyst`) so analytics continuity is preserved.

| id | New name (H3) | Capability pill |
|---|---|---|
| sales | «Απάντηση & ραντεβού» | «< 60″ · 24/7 · κατευθείαν στο ημερολόγιο» |
| support | «Εξυπηρέτηση 24/7» | «Μόνο το δύσκολο φτάνει σε άνθρωπο» |
| operations | «Γραφείο στον αυτόματο» | «Μηδέν αντιγραφή-επικόλληση» |
| analyst | «Αναφορές με μία ερώτηση» | «Απάντηση σε 5″» |

- Eyebrow above each name: `01 · AI AGENT`, `02 · AI AGENT`, etc. (mono).
- Hero chat metadata «Sales Agent · 21:47» becomes «AI Agent · 21:47».
- The pills describe **what the system does**, not client results. Do not add "hours saved" or any other outcome metric.

**Before / after content (replaces `desc`, `before`, `after`, `chips`):**

| id | «ΣΗΜΕΡΑ» text | «ΣΗΜΕΡΑ» tools | «ΜΕ ΤΟΝ AGENT» text | «ΜΕ ΤΟΝ AGENT» tools |
|---|---|---|---|---|
| sales | «Απαντάτε σε 4 ώρες — ή το πρωί. Τα μισά leads έχουν ήδη κλείσει αλλού.» | Instagram, Τηλέφωνο, Gmail | «Απάντηση σε **45″**, 24/7. Ρωτάει τι χρειάζεται και κλείνει ραντεβού στο ημερολόγιό σας.» | Instagram, WhatsApp, Google Calendar, CRM |
| support | «Οι ίδιες 10 ερωτήσεις, 40 φορές την εβδομάδα.» | Viber, Messenger, Email | «Απαντιούνται μόνες τους από τη δική σας γνώση. Στην ομάδα φτάνει μόνο το δύσκολο — με όλο το ιστορικό.» | WhatsApp, Viber, Google Docs |
| operations | «Αντιγραφή δεδομένων ανάμεσα σε 3 συστήματα, κάθε μέρα.» | Excel, Gmail | «Καταχωρίσεις, ειδοποιήσεις και αιτήματα για κριτική Google φεύγουν μόνα τους. Εσείς ελέγχετε.» | Google Sheets, CRM, Viber, Google |
| analyst | «Τρία Excel και μια εικασία στο τέλος του μήνα.» | Excel | «"Πώς πήγε ο μήνας;" — απάντηση με νούμερα σε **5″**.» | Google Sheets, CRM |

- Bold segments use the existing `Rich` markup (`{ s: '…' }`, rendered as cyan `<strong>`).
- Tool chips are small pills with the brand icon from `simple-icons` plus the name. If an icon isn't available (e.g., Excel, "Τηλέφωνο", "CRM"), use a neutral Tabler-style line icon or text only. **Do not add any Greek invoicing or ERP tools** (myDATA, Elorus, etc.); they are not supported yet.
- Keep the `result` row and `METRICS.agentResults` plumbing working, so a real metric can be added later.

**Selecting the variant:**
- The query param `?agents=cards` selects variant A and `?agents=switcher` selects variant B. With no param, the default is **A**.
- Read the param on the client so the page stays statically renderable. The server renders A and swaps after hydration only if the param says B. Avoid layout shift: both variants render inside the same min-height wrapper.
- Add a small floating "A | B" toggle, bottom-left, that is visible **only** when `?compare=1` is present or `NODE_ENV === 'development'`. It never ships visibly to normal visitors.
- Add an `agents_variant: 'cards' | 'switcher'` param to the existing `agent_card_view` event. Variant B also emits a new `agent_switch` event `{ agent, via: 'tap' | 'auto' }`. Do not rename existing events.
- Implement the variants as two sibling components (`AgentsCards.tsx`, `AgentsSwitcher.tsx`) reading the **same** data from `content.ts`, so deleting the losing variant later is a one-file removal.
- Remove the old `AgentPreviews.tsx` animated previews only if neither variant uses them.

### 1A. Variant A — before → after cards («cards»)

Each agent is one card. Structure, top to bottom:
1. **Header (centered):**
   - eyebrow `01 · AI AGENT` (mono, cyan)
   - H3 name
   - capability pill: cyan border at 35% opacity, cyan background at 8%, lightning icon, cyan text
2. **Body:** a three-column grid `minmax(0,1fr) 40px minmax(0,1fr)`:
   - **Left box «ΣΗΜΕΡΑ»:**
     - neutral border `rgba(255,255,255,0.08)` and background `rgba(255,255,255,0.02)`
     - mono label with a small grey dot
     - text in secondary color, weight 500
     - tool chips
   - **Middle:** a 40px circular arrow button. It is decorative, cyan stroke, `aria-hidden`.
   - **Right box «ΜΕ ΤΟΝ AGENT»:**
     - cyan border at 35%, cyan background at 6%
     - mono label in cyan with a cyan dot
     - text in white, weight 500
     - tool chips

Layout:
- **Desktop (≥ 1024px):** a single column of 4 full-width cards stacked vertically (container max ~920px, centered). Do **not** use a 2×2 grid; each card needs the width for its two boxes.
- **Mobile:** the two boxes stack vertically and the arrow rotates to ↓. Target card height ≤ ~400px at 390px wide.
- **Grid sizing:** use `grid-cols-1` / `minmax(0,1fr)` everywhere so nothing can overflow. That was the cause of the earlier 472px bug.
- **Hover:** corner brackets (existing motif) plus a subtle border brighten.
- **Motion:** stagger fade-up per card (60–80ms). The arrow does a single 6px nudge when the card enters the viewport. Nothing else.

### 1B. Variant B — agent switcher («switcher»)

One interactive stage instead of four cards.

- **Agent pills** (ARIA tabs pattern: `role="tablist"`, arrow keys, `aria-selected`):
  - four pills showing the short name and number
  - the active pill shows a thin progress bar filling during autoplay
  - **mobile:** one horizontally scrollable row (fade on the right edge, no visible scrollbar)
  - **desktop:** a row above the stage
- **Stage:** reuse the hero phone frame and generalize `HeroChat` into a reusable `ChatPlayer` component. Same bubbles, timestamps, and typing indicator. The four scenarios are below.
- **Next to the phone** (desktop: left column; mobile: below the phone):
  - the active agent's H3 name and capability pill
  - a compact «ΣΗΜΕΡΑ → ΜΕ ΤΟΝ AGENT» block with the same data as variant A, stacked vertically
- **Autoplay:**
  - Advance to the next agent 2.5s after the current scenario finishes.
  - Pause when the stage is off-screen (IntersectionObserver).
  - **Stop permanently** after any user interaction with the pills.
  - Under `prefers-reduced-motion`: no autoplay and no typing animation. Each tab shows its full final conversation statically.
- **Mobile:** the phone frame is capped at `max-height: 60svh`. Target section height ≈ 1.2–1.5 screens at 390×844.
- **Accessibility:** the chat is `aria-live="off"`. Each tab panel includes a visually hidden text summary of the scenario.

**Scenarios** (illustrative UI, not performance claims; keep in `content.ts`):

*sales — Instagram Direct*
- them 23:12: «Γεια σας, έχετε διαθεσιμότητα Σάββατο;»
- agent 23:12: «Καλησπέρα! Ναι — Σάββατο έχω 11:00 ή 13:00. Για τι θα ήταν;»
- them 23:13: «Για πρώτη γνωριμία. 11:00.»
- agent 23:13: «Έκλεισε ✓ Σάββατο 11:00. Σας έστειλα επιβεβαίωση με SMS.»
- status chip: «✓ Ραντεβού στο ημερολόγιο · 45″»

*support — WhatsApp*
- them 18:40: «Μέχρι τι ώρα είστε ανοιχτά σήμερα;»
- agent 18:40: «Σήμερα μέχρι τις 21:00. Θέλετε να σας κρατήσω θέση;»
- them 18:41: «Όχι, έχω θέμα με μια παραγγελία — ήρθε λάθος προϊόν.»
- agent 18:41: «Λυπάμαι γι' αυτό. Το προωθώ τώρα στην ομάδα με όλα τα στοιχεία, θα σας καλέσουν μέσα στη μέρα.»
- status chip: «→ Προωθήθηκε σε άνθρωπο · με όλο το ιστορικό»

*operations — lock-screen notification stack* (no chat bubbles; notifications slide in one by one, each with a ✓):
- «Νέα φόρμα · Γ. Παπαδόπουλος»
- «✓ Καταχωρήθηκε στο CRM»
- «✓ Email επιβεβαίωσης στάλθηκε»
- «✓ Ειδοποίηση στην ομάδα (Viber)»
- «✓ Αίτημα για κριτική Google · σε 3 μέρες»
- footer chip: «0 χειροκίνητα βήματα»

*analyst — chat*
- you 09:05: «Πώς πήγε ο Σεπτέμβριος σε σχέση με τον Αύγουστο;»
- agent 09:05: «142 leads (+18%) και 38 ραντεβού. Τα περισσότερα ήρθαν από Instagram. Η Τρίτη είναι η πιο αδύναμη μέρα — να δούμε γιατί;»
- below the answer: a mini bar chart (6 bars, inline SVG, cyan, last bar highlighted) with a «+18%» chip

### 1C. Comparison handoff (stop here)

Deliver:
- screenshots of both variants at 390×844 and 1440×900
- section height in px for each variant at 390px
- any accessibility caveats
- the exact URLs to open on a phone (`/?agents=cards&compare=1`, `/?agents=switcher&compare=1`)

---

## 2. Hero additions

- **Risk-reversal row:** replace the microcopy under the hero CTA («Χωρίς πωλήσεις. Φεύγετε με γραπτό σχέδιο.») with three inline check items:
  «✓ Φεύγετε με γραπτό σχέδιο · ✓ Χωρίς ετήσιο συμβόλαιο · ✓ Εγγύηση αποτελέσματος»
  - 14px, secondary color, cyan check icons
  - wraps cleanly onto two lines on mobile (flex-wrap, no orphaned separator)
- **Scroll progress bar:**
  - a 2px cyan bar fixed at the very top of the viewport, above the nav, whose width = scroll progress
  - `aria-hidden`, pointer-events none
  - driven by a single rAF scroll listener, or a CSS scroll-driven animation with a fallback
- **Notification toast bug:** on desktop, the «Νέο ραντεβού · Αύριο 10:30» toast tucks under the fixed nav and gets clipped. Keep it fully inside the hero, below the nav (top offset ≥ nav height + 12px), at every breakpoint.

## 3. Tools marquee — redesign and move

- **Placement:** move it from under the proof bar to **directly before the Pilot section**, as its own slim band (dark).
- **Label:** «Δουλεύει με ό,τι ήδη χρησιμοποιείτε»
  - one line under it, in secondary color: «Χωρίς αλλαγή συστημάτων. Συνδέουμε τα εργαλεία που έχετε ήδη.»
- **Pills:**
  - rounded-full, background `rgba(255,255,255,0.06)`, 1px border `rgba(255,255,255,0.08)`, padding 10px 16px
  - **brand-colored icon** (from `simple-icons` hex) plus the tool name in white at 15px
  - If a brand color has < 3:1 contrast against the pill background (e.g., Notion's black), render that icon white.
  - If no icon exists, show the name only.
- **Two rows**, scrolling in opposite directions at different speeds (~40s and ~55s per loop).
  - edge fade mask
  - pause on hover
  - static and wrapped under reduced motion
- **Tools:** WhatsApp, Viber, Instagram, Messenger, Gmail, Google Calendar, Google Sheets, Google Docs, Excel, HubSpot, Pipedrive, Shopify, WooCommerce, Notion, Stripe.
  - **No** invoicing or ERP tools.
  - **No** "9,000+ integrations"-style claims.
- The proof bar stays where it is, now without the marquee under it. Rebalance its bottom spacing.

## 4. Process — four steps with a scroll-linked progress line

**Copy** (replaces `process` in `content.ts`):
- Eyebrow: «Η ΔΙΑΔΙΚΑΣΙΑ»
- H2: «Τέσσερα βήματα. Ξέρετε τον στόχο πριν πληρώσετε ευρώ.»

| n | title | meta | body | «Τι παίρνετε» line |
|---|---|---|---|---|
| 01 | «Χάρτης AI» | «30′ · δωρεάν» | «Μας δείχνετε πώς δουλεύετε σήμερα. Σας δείχνουμε τι αυτοματοποιείται πρώτα — και τι αξίζει.» | «Γραπτό πλάνο» |
| 02 | «Συμφωνούμε το νούμερο» | «1–2 μέρες» | «Διαλέγουμε έναν agent και γράφουμε το KPI που πρέπει να πιάσει. Υπογράφεται πριν ξεκινήσουμε.» | «Υπογεγραμμένος στόχος» |
| 03 | «Pilot» | «2–4 εβδομάδες» | «Ο agent δουλεύει ζωντανά, πάνω στα εργαλεία που ήδη έχετε. Βλέπετε τα νούμερα κάθε εβδομάδα.» | «Εβδομαδιαία νούμερα» |
| 04 | «Αποτέλεσμα» | «στο τέλος του pilot» | «Πιάσαμε τον στόχο; Επεκτείνουμε. Δεν τον πιάσαμε; Δουλεύουμε δωρεάν μέχρι να τον πιάσει — ή σας επιστρέφουμε τα χρήματα.» | «Τελική αναφορά» |

- Step 04's guarantee wording must stay consistent with `pilot.guarantee`. If you change one, change both.
- Title case: use the casing shown above, not ALL CAPS.

**Layout:**
- **≥ 1024px:** 4 columns with a horizontal line behind them.
- **< 1024px:** a vertical timeline with a line on the left, including tablet. A horizontal line across a 2×2 grid doesn't read as a path.

**Scroll-linked progress:**
- **Track:** 1px line in `ink/20`.
- **Fill:** 2px line in **dark cyan `#0891B2`** (light section; must meet 3:1 against `#FAFAF7`).
- **Fill mapping:** 0% when the section's top reaches 70% of the viewport; 100% when the last card's center reaches 50%.
- **Node activation:** each node fills cyan when the line reaches it.
  - The card's numeral turns from ink at 35% to full ink.
  - The card border strengthens.
  - **Do not fade body text via opacity**; body text keeps full contrast at all times.
- **Implementation:** CSS scroll-driven animations (`animation-timeline: view()`) with an rAF/IntersectionObserver fallback. Verify in WebKit (iOS / Instagram in-app).
- **Reduced motion:** the line and all nodes render fully filled.
- The nodes change from lime to cyan (see item 5).

## 5. Accent unification on light sections

- **Calculator sliders:**
  - filled track in dark cyan `#0891B2`, unfilled track in `ink/15`
  - thumb in cyan `#22D3EE` with the existing dark ring
  - focus ring in cyan
- **«Μέση αξία πελάτη» input:** hide the native number spinners (webkit and firefox) and keep `inputmode="numeric"`.
- Lime now survives **only** in the Problem section (the time tags and the callout bar). Everywhere else on light sections uses the cyan family.
- Add every new cyan-on-light pair to the contrast report.

## 6. Mobile bottom dock (replaces the current mobile sticky CTA)

- **Dock contents:**
  ```
  [ ☰ ]  [ Κλείστε τον Χάρτη AI — 30′ δωρεάν → ]
  ```
  - a 48px square menu button plus the full-label CTA filling the rest
  - solid `#0A1020` background at ~96%, top border `rgba(255,255,255,0.08)`, `padding-bottom: env(safe-area-inset-bottom)`
- **Dock visibility:**
  - It appears and hides under exactly the same rules as the current sticky CTA: after the hero CTA leaves the viewport, hidden near the booking section, stacked above the cookie banner, and yielding to the calculator mini-bar.
  - Keep all the logic from Phase 4.
- **Top bar on mobile:**
  - logo + ☰ while at the top of the page
  - once the dock is visible, the top bar hides on scroll down and reappears on scroll up (logo only)
  - there is never more than one ☰ visible at a time
- **☰ opens a bottom sheet** (not a full-screen overlay):
  - section anchor links, «Η ιστορία μας» (`/about`), and the CTA
  - `role="dialog"`, `aria-modal`, focus trap
  - closes on Esc, backdrop tap, and link tap
  - restores focus to the trigger
  - 44px rows
- **Desktop is unchanged.**

## 7. Small fixes

- **Services → «Analytics & AI» preview:** the KPI tiles show grey skeleton bars. Use illustrative values that match the analyst scenario: «Leads 142» and «Ραντεβού 38», each with a small «+12%» delta chip. Make the sparkline span the **full** width of the preview.
- **Support preview skeleton bubble:** irrelevant if `AgentPreviews` is removed in item 1. Otherwise, use the scenario copy above.
- **Footer email:** move it to a single constant `CONTACT.email` in `lib/config.ts`, set to `{{TODO: hello@<domain>}}`. Render the current Gmail address only as a fallback while the TODO is unset, and list it in the TODO inventory.

---

## Definition of done (end of round)

- Typecheck and lint pass.
- No element's bounding box exceeds its section's content box at 360, 375, 390, and 1440px. Check element boxes, not only `document.scrollWidth`.
- No new CLS: < 0.1 on a full-page scroll.
- Lighthouse mobile on a production build: Performance ≥ 90, Accessibility ≥ 95.
- Reduced motion verified for: the agent variants, the process line, the marquee, and the progress bar.
- The CTA label is byte-identical everywhere. No existing analytics events were renamed; new params and events are listed.
- The updated TODO inventory is delivered.
