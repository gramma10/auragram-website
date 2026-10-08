# Auragram — Round 3 Brief: Services (5 tabs) + Industry Selector

**Start only after Round 2 is approved and merged.**

The original constraints still apply:
- the CTA label is byte-identical everywhere
- no changes to business logic, the calculator formula, the form/booking flow, or existing event names
- the motion budget and `prefers-reduced-motion` are respected
- contrast ≥ 4.5:1, tap targets ≥ 44px
- mobile-first at 390px, with the Instagram in-app browser as the primary environment

All copy goes in `lib/content.ts`.

## Goal

Add an interactive **industry selector**. The visitor picks their industry («Ιατρεία», «Λογιστικά», …) and immediately sees, for a typical business in that industry:
1. three big numbers
2. what the day looks like today versus with Auragram
3. a live feed of the automation running («Ενώ κοιμόσασταν…»)

The pattern is inspired by aiautomationagency.com.au's "Select an industry" section, rebuilt in Auragram's visual language. A reference mockup was approved.

## Honesty rule for numbers (important)

Every number is one of two types, stored explicitly in the data:

- **`kind: 'spec'`:** describes what the system does by design (response time, reminder timing, number of languages). It renders in **cyan**, with no tag.
- **`kind: 'estimate'`:** an estimated saving. It renders in **white** with a small mono **«ΕΚΤΙΜΗΣΗ»** pill next to the number. The panel footnote shows the formula (provided below).

Never present any scenario as a real client:
- no business names
- no towns attached to results
- no "VERIFIED"
- no testimonials

The scenario title describes a **typical** business («Ιατρείο με 2 γιατρούς και μία γραμματεία»).

Leave a `realPilot?: { … }` slot in the data type. When a real pilot exists, that industry's panel can show a «ΠΡΑΓΜΑΤΙΚΟ PILOT» badge and real metrics. Don't build any UI for it yet beyond the type.

## Part A — Services section: keep it, expand to 5 services

The Services section stays as the general "what we do" overview. Keep its existing tab UI: the list/segmented control, the right-hand panel with «ΤΙ ΚΕΡΔΙΖΕΤΕ», the bullets, chips and the per-tab visual.

**Header:**
- Eyebrow: «ΟΙ ΥΠΗΡΕΣΙΕΣ ΜΑΣ» (was «ΤΙ ΚΑΝΟΥΜΕ»)
- H2: «Ό,τι χρειάζεται η επιχείρησή σας για να δουλεύει μόνη της.» (replaces «Τρία πράγματα. Τα κάνουμε καλά.»)
- Remove the footnote «Χτίζουμε επίσης custom εφαρμογές και ιστοσελίδες…». It is now covered by tabs 04–05.

**Tabs, in this order, in two visual groups:**
- **AI & αυτοματισμοί** (primary):
  - 01 AI Agents
  - 02 Αυτοματισμοί
  - 03 Analytics & AI
- A small mono divider label «ΧΤΙΖΟΥΜΕ ΕΠΙΣΗΣ» in the tab list (desktop list: a divider row; mobile pill row: a thin vertical separator before 04). It is not focusable and not a tab. Then:
  - 04 Custom software
  - 05 Ιστοσελίδες & e-shop

The positioning stays AI-first; web and custom work are offered but secondary.

**Tab 01 «AI Agents»:** keep the title and bullets. Replace the per-tab visual with a compact chat preview so it doesn't look like a copy of the Agents section above. Add a text link at the bottom of the panel: «Δείτε τους 4 agents ↑», which smooth-scrolls to `#agents`.

**Tab 04 «Custom software» (new):**
- title: «Εργαλεία φτιαγμένα για τη δική σας δουλειά»
- gain: «Όταν κανένα έτοιμο πρόγραμμα δεν ταιριάζει, φτιάχνουμε αυτό που χρειάζεστε — και το συνδέουμε με όσα ήδη έχετε.»
- bullets:
  - «Εσωτερικά εργαλεία και portals για τους πελάτες σας»
  - «Συνδέσεις ανάμεσα σε συστήματα που δεν "μιλάνε" μεταξύ τους»
  - «Εφαρμογές με AI μέσα τους, όχι δίπλα τους»
- chips: «Web apps», «Portals πελατών», «Integrations»
- visual: a mini app window (sidebar + header + 3 table rows with status pills), HTML/CSS only, in the existing preview style

**Tab 05 «Ιστοσελίδες & e-shop» (new):**
- title: «Sites και e-shop που δουλεύουν μόνα τους»
- gain: «Σύγχρονα, γρήγορα, με τον AI agent ενσωματωμένο από την πρώτη μέρα — όχι άλλη μια βιτρίνα.»
- bullets:
  - «Κάθε επισκέπτης παίρνει απάντηση σε < 60″, μέσα από το site»
  - «Φόρμες που πάνε κατευθείαν στο CRM και στο ημερολόγιο»
  - «E-shop με tracking, υπενθύμιση καλαθιού και επιστροφές στον αυτόματο»
- chips: «Ιστοσελίδες», «Shopify / WooCommerce», «AI agent ενσωματωμένος»
- visual: a mini browser frame (URL bar + hero block + product grid) with a small chat bubble in the bottom-right corner
- price line under the chips, **only if** `PRICING.websiteFrom` is set: «Από {PRICING.websiteFrom}». Add `websiteFrom: null` to `lib/config.ts` with a `{{TODO}}` comment. Render nothing while it is null.

**Responsive:**
- **Mobile:** the 5 tabs become a horizontally scrollable pill row (scroll-snap, edge fade, active pill scrolled into view). A segmented control doesn't fit 5 items at 390px.
- **Desktop:** the left list with the divider row.
- Lock the panel min-height to the tallest tab, so switching causes no layout shift.

**Analytics:** if Services already fires a tab event, extend it to the new tabs. Otherwise add `service_tab_view { tab }`.

Do **not** create the `/eshop` or `/custom-software` pages in this round. The tabs don't navigate away.

## Part B — Industry selector: placement and section order

The industry selector is a **new section**, placed **after Services**. The narrative becomes: services (what we do) → industries (what it looks like in your business) → process → pilot.

Keep strict dark/light alternation. The new order and tones:

| # | Section | Tone |
|---|---|---|
| 1 | Hero | dark |
| 2 | Problem | light |
| 3 | Agents | dark |
| 4 | Calculator | light |
| 5 | Services | dark |
| 6 | **Industries (new)** | **light**: the industry *panel itself* is a dark card (`#0A1020`, rounded, permanent corner brackets) sitting on the light section, a "window into the system" |
| 7 | Process | **dark** (flip from light; the progress line becomes standard cyan `#22D3EE`, and the cards become dark cards) |
| 8 | Tools marquee band | **light** (flip from Round 2's dark band; brand-coloured logo pills on light read well) |
| 9 | Pilot | dark |
| 10 | Founders, FAQ, Booking | keep alternating; check the current tones and flip only if two neighbours match |

- On the light Industries section, the eyebrow, H2 and sub use light-section ink colours. The pills and everything inside the dark panel use the dark-panel styles described below.
- Section `id="kladoi"`. Add «Κλάδοι» to the nav (desktop) and to the mobile bottom sheet, between «Υπηρεσίες» and «Το pilot».

## Part C — Positioning: "it works by itself, and it pays for itself"

Two ideas now run through the whole site:
1. **Everything we build works by itself** (AI built in, not bolted on). This includes websites and custom software.
2. **Everything shows its ROI.** No service appears without the number it moves.

The honesty rule above applies everywhere:
- spec numbers are shown plainly
- estimates carry «ΕΚΤΙΜΗΣΗ» and a visible formula
- no fabricated clients

### C1. Reusable `RoiBlock` component
Build one component used by Services tabs and Industries panels (and reusable later). It contains:
- mono label «ROI»
- one big number + unit (e.g. «≈ 1.100 €» «/ μήνα»)
- one-line label
- the «ΕΚΤΙΜΗΣΗ» pill when `kind === 'estimate'`
- a formula footnote
- optional link «Υπολογίστε το δικό σας ↑», which smooth-scrolls to the calculator (`#ypologismos`)

Visual:
- on dark: cyan border at 35%, background at 6%
- on light: ink border, dark-cyan `#0891B2` number
- the number counts up when it enters view; static under reduced motion

### C2. Personalised ROI from the calculator (important)
`lib/roiStore.ts` already holds the visitor's calculator snapshot.
- Add a `touched: boolean` flag. It is set only when the visitor actually moves a slider or edits an input, not on mount.
- **If `touched`:** RoiBlocks that map to calculator outputs show the visitor's own numbers. The label becomes «Με τα νούμερα που βάλατε». The «ΕΚΤΙΜΗΣΗ» pill stays.
- **If not touched:** show the default estimate below, with its formula.
- No layout shift when switching between the two states (reserve the width with tabular numerals and a min-width).

### C3. ROI per Services tab (add a RoiBlock above the chips in each tab)

| Tab | Number | Label | Kind | Formula / source |
|---|---|---|---|---|
| 01 AI Agents | `lostRevenue` (current calculator default «≈ 1.176 €» / μήνα) | «σε leads που σήμερα χάνονται» | estimate | calculator. Default formula: «60 leads × 70% αργή απάντηση × 35% χάνονται × 20% κλείσιμο × 400 €» |
| 02 Αυτοματισμοί | `timeValue` (current calculator default «≈ 1.299 €» / μήνα) | «σε ώρες που κάνει πλέον το σύστημα» | estimate | calculator. Default formula: «12 ώρες/εβδ. × 4,33 × 25 €/ώρα» |
| 03 Analytics & AI | «≈ 6 ώρ.» / μήνα | «λιγότερες ώρες σε Excel και αναφορές» | estimate | «3 αναφορές τον μήνα × 2 ώρες» |
| 04 Custom software | «ROI πριν τον κώδικα» (text, not a number) | «Κάθε έργο ξεκινά με γραπτή εκτίμηση ROI και χρόνο αποπληρωμής — αλλιώς δεν το φτιάχνουμε.» | spec (a process promise) | `{{TODO: confirm with founders}}`; render only if `PROMISES.customRoiFirst === true` in `lib/config.ts` (default `false`) |
| 05 Ιστοσελίδες & e-shop | «≈ 300 €» / μήνα | «από καλάθια που επιστρέφουν με υπενθύμιση» | estimate | «100 εγκαταλελειμμένα καλάθια × 5% επιστροφή × 60 €» |

- Tabs 01 and 02 use C2 personalisation.
- Make sure the default numbers equal what the calculator shows on load. Compute them from the same functions, don't hard-code. If the calculator defaults differ from the formulas above, use the calculator's defaults and update the formula text to match.

### C4. ROI in the Industry panels
Each industry already has three metrics. Add a RoiBlock under the metric tiles that converts the industry's estimated hours into euros, labelled «αξία χρόνου»:
- **iatreia:** «≈ 870 € / μήνα» (8 ώρ./εβδ. × 4,33 × 25 €)
- **logistika:** «≈ 250 € / μήνα» (10 ώρ. × 25 €)
- **katalymata:** «≈ 540 € / μήνα, τη σεζόν» (5 ώρ./εβδ. × 4,33 × 25 €)
- **eshop:** «≈ 760 € / μήνα» (7 ώρ./εβδ. × 4,33 × 25 €)
- **gymnasthria** and **real-estate** have only spec metrics. Give them **no** RoiBlock rather than inventing a conversion-rate claim. Their panel ends with the link «Υπολογίστε τι σας κοστίζει σήμερα ↑» to the calculator instead.

The 25 €/ώρα rate must come from the same constant the calculator uses.

### C5. ROI language elsewhere (copy changes)
- **Hero eyebrow:** «AI Agency · Ελλάδα» → «AI συστήματα με μετρήσιμο ROI · Ελλάδα»
- **Hero risk-reversal row (from Round 2):** the first item «Φεύγετε με γραπτό σχέδιο» → «Γραπτό πλάνο με εκτίμηση ROI»
- **Process step 01 «Χάρτης AI»:** the «Τι παίρνετε» line → «Γραπτό πλάνο με εκτίμηση ROI»
- **Process step 04 «Αποτέλεσμα»:** the «Τι παίρνετε» line → «Τελική αναφορά ROI»
- **Pilot `includes`:** «Αναφορά στο τέλος» → «Αναφορά ROI στο τέλος»
- **Footer tagline:** append «Συστήματα που δουλεύουν μόνα τους — με μετρήσιμο ROI.»

Do not use "pays for itself" / «αποπληρώνεται» as an unconditional claim anywhere. ROI is always either estimated (and labelled) or measured in the pilot.

## Section copy

- Eyebrow: «ΣΤΗ ΔΙΚΗ ΣΑΣ ΕΠΙΧΕΙΡΗΣΗ»
- H2: «Διαλέξτε τον κλάδο σας. Δείτε τι θα δούλευε μόνο του.»
- Sub: «Έξι τυπικά σενάρια — με τα νούμερα που αλλάζουν. Στον Χάρτη AI τα μετράμε με τα δικά σας.»
- Bottom of the panel, above the CTA: «Το βλέπετε στη δική σας επιχείρηση; Στον Χάρτη AI το στήνουμε πάνω στα δικά σας νούμερα.» followed by the standard `<Cta />`.

## Layout & visual design (make it feel alive, not like a table)

### Industry pills
- Six pills, each with an icon and a label, in a horizontally scrollable row (scroll-snap, edge fade, no visible scrollbar on mobile; wrapped/centered on desktop).
- **Active pill:** solid cyan with dark text. **Inactive:** `rgba(255,255,255,0.03)` with a white/10 border.
- Prev/next circular buttons (‹ ›) top-right, cycling through industries.
- Use the ARIA tabs pattern: `role="tablist"`, arrow keys, Home/End, `aria-selected`, `aria-controls`.
- On mobile, **horizontal swipe on the panel** also switches industry (threshold ~50px, ignore vertical scrolls).

### Panel (top to bottom)
1. **Header:**
   - mono eyebrow «ΠΩΣ ΔΟΥΛΕΥΕΙ ΣΕ»
   - scenario title (H3, ~22px)
   - one-line subtitle in secondary color
2. **Three metric tiles** in a row (3 columns on mobile too; shrink the number size on mobile rather than stacking):
   - big number: `clamp(26px, 5vw, 40px)`, tabular numerals
   - small label underneath
   - spec numbers in cyan; estimates in white with the «ΕΚΤΙΜΗΣΗ» pill
   - count-up on tab change for numeric parts (400ms; static under reduced motion)
3. **«✕ ΣΗΜΕΡΑ» | «✓ ΜΕ ΤΗΝ AURAGRAM»:**
   - two boxes side by side on desktop, stacked on mobile
   - each holds 3 bullets formatted as **bold lead:** + text (like the reference)
   - left box is neutral and muted; right box has a cyan border at 35% and cyan background at 6%
   - on desktop, a small circular arrow sits between them, the same as the Round 2 agent cards
4. **Live feed card:**
   - title from the data (e.g. «Ενώ κοιμόσασταν»), plus a pulsing cyan «LIVE» dot on the right
   - 4 rows: mono timestamp, event text, cyan ✓
   - rows fade/slide in one by one (≈550ms apart) each time the panel is shown or enters the viewport
   - under reduced motion: all rows are visible immediately and the dot doesn't pulse
5. **Footnote** (only if the industry has an estimate): the formula line, 12px, muted.
6. The bottom line + CTA (see Section copy).

### Other behaviour
- **Transitions:** crossfade the panel on industry change (~180ms out / in). Lock the panel's min-height to the tallest industry to avoid layout shift and CLS. Measure it, don't guess.
- **Corner-bracket motif:** permanent on the panel container. This is the section's hero element.
- **Mobile target:** the whole section ≤ ~2 screens at 390×844. Keep bullet text tight.

### Deep links (important for Reels)
- `/?industry=iatreia` (and the other slugs) preselects that tab and scrolls to the section after load. Each industry Reel can link straight to its tab.
- Slugs: `iatreia`, `logistika`, `gymnasthria`, `katalymata`, `real-estate`, `eshop`.
- Unknown slugs fall back to the first tab, silently.

### Analytics
- New event `industry_view` `{ industry: slug, via: 'tap' | 'swipe' | 'arrow' | 'deeplink' }`.
- **Booking form:** pass the last viewed industry as a hidden field `industry`, the same way the calculator results are passed. Don't change any visible form fields.

## Content (paste into `lib/content.ts`)

Each industry: `slug`, `tab`, `icon`, `title`, `sub`, `metrics[3] {value, label, kind}`, `today[3] {lead, text}`, `after[3] {lead, text}`, `feedTitle`, `feed[4] {time, text}`, `estimateNote?`.

**1. iatreia: «Ιατρεία» (icon: stethoscope)**
- title «Ιατρείο με 2 γιατρούς και μία γραμματεία»
- sub «Η γραμματεία σταματά να ζει στο τηλέφωνο, και τα κενά ραντεβού ξαναγεμίζουν.»
- metrics:
  - «≈ 8 ώρ.», «χρόνος γραμματείας την εβδομάδα» (estimate)
  - «24 ώρ.», «υπενθύμιση πριν από κάθε ραντεβού» (spec)
  - «< 60″», «απάντηση σε μήνυμα, 24/7» (spec)
- today:
  - «Χαμένες κλήσεις»: «το τηλέφωνο χτυπάει όσο εξυπηρετείτε κόσμο.»
  - «Ραντεβού που χάνονται»: «κανείς δεν τα θυμίζει, ο ασθενής απλώς δεν έρχεται.»
  - «Ίδιες ερωτήσεις»: «τιμές, ωράριο, διεύθυνση, 30 φορές τη μέρα.»
- after:
  - «Κλείσιμο 24/7»: «από Instagram, Viber και site, κατευθείαν στο ημερολόγιο.»
  - «Υπενθύμιση με επιβεβαίωση»: «αν ακυρώσει, η θέση ανοίγει αμέσως.»
  - «Απαντήσεις μόνες τους»: «τιμές και ωράριο σε δευτερόλεπτα.»
- feedTitle «Ενώ κοιμόσασταν»
- feed:
  - 21:14 «Νέο ραντεβού από Instagram → ημερολόγιο»
  - 21:15 «Επιβεβαίωση στάλθηκε στον ασθενή»
  - 09:00 «Υπενθύμιση για τα 12 αυριανά ραντεβού»
  - 09:40 «Ακύρωση → η θέση 11:30 άνοιξε ξανά»
- estimateNote «≈ εκτίμηση: 25 κλήσεις/μηνύματα τη μέρα × 4′ × 5 μέρες.»

**2. logistika: «Λογιστικά» (icon: calculator)**
- title «Λογιστικό γραφείο με 60 πελάτες»
- sub «Τέλος στο μηνιαίο κυνηγητό για παραστατικά.»
- metrics:
  - «≈ 10 ώρ.», «λιγότερο κυνηγητό τον μήνα» (estimate)
  - «48 ώρ.», «κύκλος υπενθύμισης μέχρι να ανέβουν» (spec)
  - «0», «χειροκίνητες μετονομασίες αρχείων» (spec)
- today:
  - «Κυνηγητό»: «τηλέφωνα και emails σε κάθε πελάτη, κάθε μήνα.»
  - «Χάος αρχείων»: «από Viber, email, WeTransfer, με τυχαία ονόματα.»
  - «Προθεσμίες»: «"πότε λήγει;", ξανά και ξανά.»
- after:
  - «Αυτόματη υπενθύμιση»: «Viber/email κάθε 48 ώρες μέχρι να ανέβουν.»
  - «Τακτοποίηση»: «κάθε αρχείο μετονομάζεται και μπαίνει στον φάκελο του πελάτη.»
  - «Ερωτήσεις προθεσμιών»: «απαντιούνται από το δικό σας ημερολόγιο.»
- feedTitle «Ενώ ήσασταν σε ραντεβού»
- feed:
  - 10:00 «Υπενθύμιση σε 23 πελάτες που δεν έστειλαν»
  - 13:22 «Ανέβηκαν 14 παραστατικά από πελάτη»
  - 13:22 «Αρχειοθετήθηκαν στον φάκελο "2026-10"»
  - 18:05 «Ερώτηση για προθεσμία → απαντήθηκε»
- estimateNote «≈ εκτίμηση: 60 πελάτες × 10′ κυνηγητού τον μήνα.»

**3. gymnasthria: «Γυμναστήρια» (icon: barbell)**
- title «Studio με 200 μέλη»
- sub «Τα βραδινά DMs γίνονται δοκιμαστικά, και τα δοκιμαστικά συνδρομές.»
- metrics:
  - «< 60″», «απάντηση σε DM, 24/7» (spec)
  - «1 μέρα», «follow-up μετά το δοκιμαστικό» (spec)
  - «7 μέρες», «υπενθύμιση πριν λήξει η συνδρομή» (spec)
- today:
  - «Αργές απαντήσεις»: «DM για τιμές το βράδυ, απάντηση την επόμενη μέρα.»
  - «Χαμένα δοκιμαστικά»: «κανείς δεν επικοινωνεί μετά το πρώτο μάθημα.»
  - «Ξεχασμένες ανανεώσεις»: «οι συνδρομές λήγουν σιωπηλά.»
- after:
  - «Κράτηση από το DM»: «τιμές και δοκιμαστικό σε ένα μήνυμα.»
  - «Follow-up»: «την επόμενη μέρα, με πρόταση συνδρομής.»
  - «Ανανεώσεις»: «υπενθύμιση 7 μέρες πριν τη λήξη.»
- feedTitle «Ενώ κοιμόσασταν»
- feed:
  - 22:41 «DM "πόσο κάνει ο μήνας;" → απαντήθηκε»
  - 22:42 «Δοκιμαστικό κλείστηκε για Πέμπτη 19:00»
  - «Παρ 12:00» «Follow-up μετά το δοκιμαστικό»
  - «Δευ 09:00» «5 υπενθυμίσεις ανανέωσης στάλθηκαν»

**4. katalymata: «Καταλύματα» (icon: bed)**
- title «Ενοικιαζόμενα με 8 δωμάτια»
- sub «Οι επισκέπτες παίρνουν απάντηση σε κάθε γλώσσα, κι εσείς κοιμάστε.»
- metrics:
  - «≈ 5 ώρ.», «μηνύματα την εβδομάδα, τη σεζόν» (estimate)
  - «4+», «γλώσσες απαντήσεων» (spec)
  - «24/7», «απαντήσεις χωρίς εσάς» (spec)
- today:
  - «Ερωτήσεις 24/7»: «στις 2 το πρωί, σε 4 γλώσσες.»
  - «Check-in με το χέρι»: «οδηγίες και κωδικοί, ένας-ένας.»
  - «Κριτικές»: «κανείς δεν τις ζητάει μετά την αναχώρηση.»
- after:
  - «Πολύγλωσσος agent»: «ελληνικά, αγγλικά, γερμανικά, ιταλικά.»
  - «Check-in αυτόματα»: «οδηγίες την παραμονή της άφιξης.»
  - «Αίτημα κριτικής»: «μετά το check-out, με link στο Google.»
- feedTitle «Ενώ κοιμόσασταν»
- feed:
  - 02:13 «"Is there parking?" → απάντηση στα αγγλικά»
  - 02:20 «"Gibt es Frühstück?" → απάντηση στα γερμανικά»
  - 18:00 «Οδηγίες check-in σε 3 επισκέπτες»
  - 11:05 «Check-out → αίτημα κριτικής Google»
- estimateNote «≈ εκτίμηση: 15 μηνύματα τη μέρα × 3′ × 7 μέρες.»

**5. real-estate: «Real estate» (icon: home)**
- title «Μεσιτικό γραφείο με 3 συνεργάτες»
- sub «Κάθε lead από αγγελία παίρνει απάντηση πριν κρυώσει.»
- metrics:
  - «< 60″», «απάντηση σε νέο lead» (spec)
  - «3», «ερωτήσεις καταλληλότητας πριν την υπόδειξη» (spec)
  - «100%», «των leads στο CRM, με ιστορικό» (spec)
- today:
  - «Αργή απάντηση»: «leads από αγγελίες περιμένουν ώρες.»
  - «Λάθος ραντεβού»: «υποδείξεις σε όσους δεν έχουν budget.»
  - «Excel»: «επαφές σε λίστες που δεν ενημερώνει κανείς.»
- after:
  - «Απάντηση σε 60″»: «με ερωτήσεις budget, περιοχής και χρόνου.»
  - «Φιλτράρισμα»: «υπόδειξη κλείνει μόνο όποιος ταιριάζει.»
  - «CRM»: «κάθε lead με ιστορικό και επόμενο βήμα.»
- feedTitle «Ενώ ήσασταν σε υπόδειξη»
- feed:
  - 20:31 «Lead από αγγελία: 2άρι, Καλαμαριά»
  - 20:32 «Budget και χρονοδιάγραμμα επιβεβαιώθηκαν»
  - 20:35 «Υπόδειξη κλείστηκε: Σάββατο 11:00»
  - 20:35 «Καταχωρήθηκε στο CRM»

**6. eshop: «E-shops» (icon: shopping cart)**
- title «E-shop με 300 παραγγελίες τον μήνα»
- sub «Το "πού είναι η παραγγελία μου;" απαντιέται μόνο του.»
- metrics:
  - «≈ 7 ώρ.», «υποστήριξης την εβδομάδα» (estimate)
  - «2 ώρ.», «υπενθύμιση εγκαταλελειμμένου καλαθιού» (spec)
  - «24/7», «απαντήσεις με tracking» (spec)
- today:
  - «Ερωτήσεις παραγγελιών»: «"πού είναι;" 20 φορές τη μέρα.»
  - «Χαμένα καλάθια»: «κανένα follow-up όταν φεύγει ο πελάτης.»
  - «Επιστροφές»: «emails πάνω-κάτω για την καθεμία.»
- after:
  - «Tracking αυτόματα»: «ο agent απαντά με την κατάσταση της παραγγελίας.»
  - «Υπενθύμιση καλαθιού»: «2 ώρες αφού φύγει ο πελάτης.»
  - «Φόρμα επιστροφής»: «ξεκινάει μόνη της, ενημερώνει την αποθήκη.»
- feedTitle «Ενώ κοιμόσασταν»
- feed:
  - 23:50 «"Πού είναι η #4821;" → στάλθηκε tracking»
  - 01:12 «Καλάθι 86 € → υπενθύμιση»
  - 07:30 «Επιστροφή ξεκίνησε, ενημερώθηκε η αποθήκη»
  - 08:00 «Σύνοψη νύχτας στο Viber σας»
- estimateNote «≈ εκτίμηση: 20 ερωτήσεις τη μέρα × 3′ × 7 μέρες.»

Use quotes «» in the final copy where the brief shows "…" inside Greek strings.

## Definition of done

- Typecheck and lint pass.
- No element overflows its section at 360, 375, 390, or 1440px (check bounding boxes).
- CLS < 0.1, including while switching industries. Verify the panel min-height lock.
- Reduced motion: no count-up, no feed animation, no pulse, instant tab switch.
- Keyboard: full tab/arrow navigation, visible focus, `aria-live="polite"` on the panel title only (announce the industry change, not every feed row).
- The `?industry=` deep link works for all six slugs. `industry_view` fires and the hidden `industry` field reaches the form payload.
- Services: all 5 tabs work by keyboard and touch. The «ΧΤΙΖΟΥΜΕ ΕΠΙΣΗΣ» divider is skipped by focus. No layout shift between tabs. The `websiteFrom` price line is hidden while null.
- Section order and tones match the Part B table, with no two adjacent sections in the same tone.
- Deliver screenshots at 390 and 1440 for two industries and for Services tabs 04 and 05, plus a list of any copy you had to shorten to fit.
