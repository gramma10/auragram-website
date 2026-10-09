# Auragram — Round 4 Brief

All earlier constraints still apply:
- the CTA label is byte-identical everywhere
- no changes to business logic, calculator formulas, the form/booking flow, or existing event names
- motion budget and `prefers-reduced-motion`
- contrast ≥ 4.5:1 for text and ≥ 3:1 for UI graphics
- tap targets ≥ 44px
- mobile-first at 390px, with Instagram's in-app browser as the primary environment
- **performance must not regress**: lazy-load anything below the fold, and keep placeholders height-preserving

Copy lives in `lib/content.ts` (industry data in `lib/industries.ts`).

**Work order:** items 0 → 8. Stop once at the end with the usual report: changelog, files touched, 390/1440 screenshots of every changed section, Lighthouse mobile median, and the contrast report for every new colour pair.

---

## 0. Keep agent variant A, delete B

- Keep **A (cards)** as the only agents layout.
- Delete:
  - `AgentsSwitcher.tsx`
  - the `AgentsVariants.tsx` wrapper
  - the compare toggle
  - the `?agents=` / `?compare=` / `&tight=` handling
  - the min-height wrapper that held A's height for compare mode
- `ChatPlayer` stays (the hero uses it). Remove only switcher-specific code paths.
- **Analytics:**
  - `agent_card_view` keeps its `agents_variant` param, now always `'cards'`, so historical data stays comparable.
  - Remove `agent_switch` from `analytics.ts` (no more emitters).
- Remove the agent scenario data that only the switcher used.

## 1. Palette v4: one brand colour, taken from the logo (lime is retired)

The logo mark is **silver metal with a cyan → violet glow**. Lime appears nowhere in it, and next to cyan it made the site read as two brands. **Remove lime from the site entirely**, including the Problem section tags and callout, sliders, nodes, ✓ icons and the `volt` token. Replace it with this system:

| Token | Value | Use |
|---|---|---|
| `aura` | `#22D3EE` | **The brand colour.** Every CTA button on every surface (dark and light), highlights on dark |
| `aura-deep` | `#0E7490` | Cyan for graphics, links, labels and ✓ icons **on light surfaces** (≥ 4.5:1 on `#FAFAF7` and white) |
| `aura-tint` | `#ECFEFF` | Soft cyan box background on light |
| `aura-line` | `#A5F3FC` | Soft cyan borders and the **marker highlight** on light |
| `halo` | `#8B7CF6` (violet from the logo glow) | **Only** inside the moving aura background (item 5) and the logo. Never on buttons, text, borders, or as a section/gradient background |

**Buttons:**
- **One CTA colour everywhere: cyan fill, ink `#0A1020` label.** This restores the Round 2 rule.
- On light surfaces, add a 1px `rgba(14,116,144,0.35)` border so the button edge reads on `#FAFAF7`.
- The hover glow stays the same on both surfaces.
- **Focus ring:** cyan on dark, `aura-deep` 2px offset 3px on light.

**Calculator sliders:**
- filled track `aura-deep`, unfilled track `ink/15`
- **thumb `aura` (cyan) with a 2px ink ring**
- measure and report the filled/unfilled pair and the thumb/track pair (≥ 3:1)

**Problem section** (was lime):
- the time tags (`11:40`, `21:00`, `×30`, `.xlsx`) become `aura-tint` pills with an `aura-line` border and ink text
- the callout bar's left rule becomes `aura-deep`

**Eyebrow rules, dots and nodes on light:** `aura-deep`.

The nav and dock stay as they are (cyan on dark), so the CTA is now the same colour in every viewport.

**Marker highlight** (new, light sections only):
- Words wrapped as `{ m: '…' }` in the copy source (same idea as `Rich` `{ s }`, never regex) render with an `aura-line` (#A5F3FC) band behind ink text.
- Styling: `background: linear-gradient(transparent 12%, #A5F3FC 12%, #A5F3FC 88%, transparent 88%)`, `padding: 0 .12em`, `box-decoration-break: clone`.
- Optional draw-in: the background-size animates from 0% to 100% width once on view, over 500ms. Under reduced motion it is static.
- **Apply to exactly these phrases:**
  - Problem H2 line 2: «Έχετε πρόβλημα με {m: τον χρόνο}.»
  - Calculator H2: «Πόσο σας {m: κοστίζει} που δεν το έχετε ήδη;»
  - Industries H2 line 2: «Δείτε τι θα δούλευε {m: μόνο του}.»

## 2. Tools marquee moves into the hero

- **Remove** the Tools band before Pilot (and its `contain-intrinsic-size` entry).
- **Add** a single-row marquee at the bottom of the hero, below the proof stats:
  - small mono label above: «ΔΟΥΛΕΥΕΙ ΜΕ Ο,ΤΙ ΗΔΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΕ»
  - dark-surface pills: `bg white/5`, `border white/8`
  - brand-coloured icons, falling back to white when the brand colour is < 3:1 on the pill
  - same 15 tools, ~45s loop, edge fade, pause on hover, static and wrapped under reduced motion
- It must be **server-rendered static HTML + CSS** (no client JS), so it costs nothing on the critical path and is never the LCP element.

**Section order and tones after removing the band.** Process (dark) would otherwise touch Pilot (dark). New order:

| # | Section | Tone |
|---|---|---|
| 1 | Hero (+ tools row) | dark |
| 2 | Problem | light |
| 3 | Agents | dark |
| 4 | Calculator | light |
| 5 | Services | dark |
| 6 | Industries | light |
| 7 | Process | dark |
| 8 | **Founders** (moved up from after Pilot) | light |
| 9 | Pilot | dark |
| 10 | FAQ | **light** (restyle if needed) |
| 11 | Booking | **dark**: the section background goes dark, and the form stays a **white card** (cyan submit button with the light-surface border) |

- Update nav order, anchors and `contain-intrinsic-size` estimates.
- No two adjacent sections may share a tone. Verify this programmatically.

## 3. Industries: redesign, lighter and clearer (Australian-style)

Feedback: the current panel is too much (five boxes in a heavy dark card) and unclear. Rebuild it on the **light** section with **no dark card**.

**Structure per industry:**
1. **Pills row** on the light background:
   - inactive: white bg, `ink/10` border, ink text
   - active: **ink `#0A1020` bg, white text** (like the reference's black pill)
   - icons in ink
   - ‹ › buttons and the «01 / 06» counter stay
2. **White panel card:** `#fff`, 1px `ink/8` border, soft shadow `0 1px 2px rgba(15,23,32,.04), 0 8px 24px rgba(15,23,32,.06)`, radius as other cards. It contains:
   - eyebrow «ΠΩΣ ΔΟΥΛΕΥΕΙ ΣΕ» (ink-soft, with an `aura-deep` rule)
   - title (H3) and subtitle (ink-soft)
3. **Two boxes, side by side** (stacked on mobile with a ↓ arrow between):
   - **«✕ ΣΗΜΕΡΑ»:**
     - bg `#FEF3F2`, border `#FECDCA`
     - label and ✕ in `#B42318`
     - bullets in ink with **bold lead:** text
     - tool chips at the bottom
   - **«✓ ΜΕ ΤΗΝ AURAGRAM»:**
     - bg `aura-tint` `#ECFEFF`, border `aura-line` `#A5F3FC`
     - label and ✓ in `aura-deep` `#0E7490`
     - bullets in ink with **bold lead:** text
     - tool chips at the bottom
   - Between them on desktop: a 40px circular arrow (white, `ink/10` border, ink arrow).
   - **Tool chips:** white pill, `ink/10` border, **brand-coloured icon** + ink name. Use a neutral line icon when there's no brand icon.
4. **Stats strip** under the boxes, Australian-style:
   - one rounded strip (bg `#F4F4F0`) with 3 equal columns and thin vertical dividers
   - big ink number (`clamp(28px, 5vw, 40px)`, tabular) with a small uppercase label under it
   - estimates carry the «ΕΚΤΙΜΗΣΗ» pill
   - the euro ROI stat gets the cyan marker highlight behind the number
   - one muted formula line under the strip (when an estimate exists)
5. Bottom line + the standard cyan CTA.

**Remove** the per-industry live feed and the separate RoiBlock from this section. The feed concept moves to the Agents section (item 4).

**New stats (3 per industry; replaces `metrics`):**

| slug | stat 1 | stat 2 | stat 3 | formula line |
|---|---|---|---|---|
| iatreia | «≈ 870 €» «αξία χρόνου / μήνα» (estimate) | «24 ώρ.» «υπενθύμιση πριν το ραντεβού» | «< 60″» «απάντηση, 24/7» | «≈ 8 ώρ./εβδ. × 4,33 × 25 €» |
| logistika | «≈ 250 €» «αξία χρόνου / μήνα» (estimate) | «48 ώρ.» «κύκλος υπενθύμισης» | «0» «χειροκίνητες μετονομασίες» | «≈ 60 πελάτες × 10′ × 25 €/ώρα» |
| gymnasthria | «< 60″» «απάντηση σε DM, 24/7» | «1 μέρα» «follow-up μετά το δοκιμαστικό» | «7 μέρες» «υπενθύμιση πριν τη λήξη» | none, and show the link «Υπολογίστε τι σας κοστίζει σήμερα ↑» |
| katalymata | «≈ 540 €» «αξία χρόνου / μήνα, τη σεζόν» (estimate) | «4+» «γλώσσες» | «24/7» «απαντήσεις χωρίς εσάς» | «≈ 5 ώρ./εβδ. × 4,33 × 25 €» |
| real-estate | «< 60″» «απάντηση σε νέο lead» | «3» «ερωτήσεις πριν την υπόδειξη» | «100%» «των leads στο CRM» | none, and show the calculator link |
| eshop | «≈ 760 €» «αξία χρόνου / μήνα» (estimate) | «2 ώρ.» «υπενθύμιση καλαθιού» | «24/7» «απαντήσεις με tracking» | «≈ 7 ώρ./εβδ. × 4,33 × 25 €» |

The euro values must be **computed** from the hours and the calculator's hourly-rate constant. Do not hard-code them.

**Tool chips per box (new data):**

| slug | ΣΗΜΕΡΑ tools | ΜΕ ΤΗΝ AURAGRAM tools |
|---|---|---|
| iatreia | Τηλέφωνο, Instagram, Excel | Instagram, Viber, Google Calendar |
| logistika | Email, Viber | Viber, Gmail, Google Drive |
| gymnasthria | Instagram, Τηλέφωνο | Instagram, WhatsApp, Google Calendar |
| katalymata | Email, WhatsApp | WhatsApp, Gmail, Google |
| real-estate | Email, Excel | Gmail, HubSpot, Google Calendar |
| eshop | Email, Τηλέφωνο | Shopify, WooCommerce, Viber |

- **Mobile target:** ≤ ~1.6 screens at 390×844. Keep the panel min-height lock (no CLS on tab change).
- **Fix the live-region duplication:** the visible title gets `aria-hidden="true"` only if an sr-only live element exists. Better: drop the sr-only duplicate and put `aria-live="polite"` on the visible title. Screen readers should hear the industry title once.
- Delete the feed data from `lib/industries.ts` (the «2άρι, Καλαμαριά» row goes with it).

## 4. Agents section: glow on scroll, colour, clearer gain, one shared night feed

**4a. Active-card glow:**
- One card at a time is "active": the card whose centre is closest to the viewport centre. Use an IntersectionObserver with `rootMargin: '-45% 0px -45% 0px'`. On desktop, hover/focus also activates.
- The active card gets an animated **cyan light sweeping once around its border**: a conic-gradient on a masked pseudo-element, rotating via a registered `@property --angle`, over ~2.4s. It then settles into a soft steady glow (`box-shadow 0 0 0 1px cyan/40, 0 0 24px cyan/12`).
- Inactive cards keep the normal border.
- **Reduced motion:** no sweep, just the steady glow on the active card.
- **Performance:**
  - animate only `--angle`/opacity on one element at a time
  - no layout properties
  - verify there is no scroll jank on a 4× CPU throttle

**4b. Colour inside the cards (dark surface):**
- **«ΣΗΜΕΡΑ» box:**
  - rose tint: bg `rgba(248,113,113,0.05)`, border `rgba(248,113,113,0.28)`
  - label and dot in `#FCA5A5` (check ≥ 4.5:1 on the card bg)
- **«ΜΕ ΤΟΝ AGENT»:** stays cyan.
- **Tool chips:** switch to **brand-coloured icons** (reverting the Round 2 monochrome decision), with a white fallback for brand colours < 3:1 on the chip.

**4c. Bigger gain pill with ROI** (replaces the capability pill):
- 15px, padding 8px 14px, ⚡ icon
- two parts separated by «·»: spec · ROI
- the ROI part has the «ΕΚΤΙΜΗΣΗ» mini-pill
- a muted 12px formula line directly under the pill

| id | spec part | ROI part | formula / source |
|---|---|---|---|
| sales | «Απάντηση < 60″» | «≈ {lostRevenue} €/μήνα λιγότερα χαμένα leads» | calculator `lostRevenue` (personalised when `touched`, as RoiBlock does). Formula text from the calculator defaults. |
| support | «24/7» | «≈ {x} €/μήνα σε χρόνο» | 40 ερωτήσεις/εβδ. × 3′ × 4,33 × 25 € (compute; ≈ 217 €) |
| operations | «Μηδέν αντιγραφή-επικόλληση» | «≈ {timeValue} €/μήνα σε χρόνο» | calculator `timeValue` (personalised when `touched`) |
| analyst | «Απάντηση σε 5″» | «≈ 6 ώρ./μήνα λιγότερα Excel» | 3 αναφορές × 2 ώρες |

**4d. One shared live feed: «Μια νύχτα με τους agents σας»:**

A single card below the four agent cards, above the section CTA.
- Header: the title, plus a pulsing cyan «LIVE» dot.
- Six rows. Each row has a mono time, a small agent tag pill (the agent's short name), the event text and a cyan ✓:
  - 21:14 · Απάντηση & ραντεβού · «Νέο ραντεβού από Instagram → ημερολόγιο»
  - 22:41 · Εξυπηρέτηση 24/7 · «"Μέχρι τι ώρα είστε ανοιχτά;" → απαντήθηκε»
  - 23:05 · Γραφείο στον αυτόματο · «Νέα φόρμα → CRM → email επιβεβαίωσης»
  - 02:13 · Εξυπηρέτηση 24/7 · «"Is there parking?" → απάντηση στα αγγλικά»
  - 07:30 · Γραφείο στον αυτόματο · «Αίτημα για κριτική Google σε χθεσινό πελάτη»
  - 08:00 · Αναφορές με μία ερώτηση · «Σύνοψη νύχτας στο Viber σας: 3 ραντεβού, 11 απαντήσεις»
- **Never show an empty box.** All six rows are always rendered: before they "arrive" they sit at 25% opacity, then each brightens in sequence (~500ms apart) when the card enters view, once.
- Reduced motion: all rows at full opacity, no pulse.
- Use «…» for inner quotes in the final Greek.
- **Mobile:** the agent tag pill wraps under the time if needed. No horizontal overflow.

## 5. Moving "aura" background (hero + agents only)

- Two or three large soft radial-gradient blobs behind the content, echoing the logo's glow: **cyan `#22D3EE`, deep cyan `#0E7490`, and one violet `halo` `#8B7CF6`** blob. Opacity 0.10–0.18 (violet ≤ 0.14). The violet appears only here, as a soft glow, never as a hard gradient or a section background.
- **Implementation:**
  - the blobs are `radial-gradient` backgrounds on absolutely positioned elements (not `filter: blur`)
  - animate only `transform` (translate + scale), 24–32s, ease-in-out, alternate, with different durations per blob so the motion never visibly loops
  - `pointer-events: none`, `aria-hidden`, `z-index` behind the content and the existing grid
  - pause the animation when the section is off-screen (IntersectionObserver toggling `animation-play-state`)
  - static under reduced motion
- **It must not affect LCP or CLS** (the hero H1 stays the LCP element). Verify scroll smoothness at 4× CPU throttle.
- Do not add it to any other section.

## 6. /about: «Με τι χτίζουμε» with logos

Replace the text-only stack list with a logo grid, grouped. Each item is a card or pill with a brand-coloured icon (simple-icons where available; white/ink fallback by contrast; a neutral icon if none), the name and the existing Greek note. Group headers in mono:

- **AI**
  - OpenAI: «μοντέλα AI»
  - Anthropic Claude: «μοντέλα AI»
- **ΑΥΤΟΜΑΤΙΣΜΟΙ**
  - n8n: «οι ροές που συνδέουν τα πάντα»
  - Make: «οι ροές που συνδέουν τα πάντα»
- **ΕΦΑΡΜΟΓΕΣ & ΔΕΔΟΜΕΝΑ**
  - Next.js: «γρήγορα sites και εφαρμογές»
  - Supabase: «τα δεδομένα σας, στον λογαριασμό σας»
  - Vercel: «ταχύτητα και σταθερότητα»
  - Tailwind CSS: «σύγχρονο design, γρήγορα»
- **ΚΑΝΑΛΙΑ & CRM**
  - WhatsApp Business API: «εκεί που είναι οι πελάτες σας»
  - HubSpot: «το CRM που ήδη έχετε»
  - Pipedrive: «το CRM που ήδη έχετε»
  - Cal.com: «κρατήσεις και ημερολόγια»

- Section title: «Με τι χτίζουμε». Sub: «Τα εργαλεία που χρησιμοποιούμε εμείς — στη δική σας υποδομή, στους δικούς σας λογαριασμούς.»
- Keep this list as **one editable array in `content.ts`**. The founders will review and add/remove items.
- Report which items had no simple-icons icon.

## 7. Small decisions from the Round 3 report

- `CTA.micro`: «Φεύγετε με γραπτό σχέδιο» → «Φεύγετε με γραπτό πλάνο και εκτίμηση ROI» (wherever CTA.micro renders).
- Footer: remove the paragraph «Χτίζουμε επίσης custom εφαρμογές…» (now covered by Services tabs 04–05).
- Industries pills inside the dark card: moot after item 3.

## 8. Vercel preview: prepare, don't publish

- Prepare the project for a Vercel preview deploy:
  - list every required env var, with which ones are optional
  - confirm the build passes with `LEGAL_TODO_OK=1` for the preview only
  - confirm `robots` blocks indexing on preview deployments
- **Do not deploy or push anything.** Give me the exact steps/commands and I'll run them.
- After I deploy, the follow-up check is PageSpeed Insights mobile on the preview URL, and verifying font preload links are present in the Linux build.

---

## Definition of done

- Typecheck and lint pass. Variant B and the compare code are fully gone, and no dead imports remain.
- Contrast report covers every new pair: cyan button/ink on light, the slider pairs, the rose and cyan box labels, the Problem tags, `#FCA5A5` on the card, and brand icons on pills.
- No adjacent sections share a tone (verified in code).
- No element overflows at 360/375/390/1440. CLS < 0.1 over a full read-through. Industries panel switching causes no shift.
- Mobile heights at 390: Industries ≤ ~1.6 screens. Report the Agents section height with the feed added.
- Reduced motion is verified for the marker draw-in, the card glow, the night feed, the aura and the hero marquee.
- Lighthouse mobile median is reported (same caveats about machine load). No new client JS above the fold except what the aura needs; ideally zero, with CSS only plus one tiny IntersectionObserver.
