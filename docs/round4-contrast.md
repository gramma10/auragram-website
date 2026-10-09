# Round 4 — Palette v4 contrast report

Text ≥ 4.5:1 · UI graphics ≥ 3:1. Alpha colours are composited on the real surface.


## CTA (cyan on every surface)

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| Label: ink #0A1020 on cyan #22D3EE | 10.49:1 | 4.5:1 | PASS |
| Label (hover): ink on #5EEAF7 | 13.17:1 | 4.5:1 | PASS |
| Light surface: cyan fill vs #FAFAF7 | 1.73:1 | 3:1 | FAIL — informational — the control is identified by its ink label (≥ 4.5:1) + the 1px border; fill alone is < 3:1 |
| Light surface: cyan fill vs white card | 1.81:1 | 3:1 | FAIL — informational — same as above |
| Light surface: border rgba(14,116,144,.35) over #FAFAF7 vs #FAFAF7 | 1.65:1 | 3:1 | FAIL — informational — brief-specified edge; it reinforces the cyan fill but does not reach 3:1 by itself |
| Light surface: border rgba(14,116,144,.35) over cyan fill vs cyan | 1.40:1 | 1:1 | PASS — informational (inner edge) |
| Focus ring on light: aura-deep vs #FAFAF7 | 5.12:1 | 3:1 | PASS |
| Focus ring on light: aura-deep vs white card | 5.36:1 | 3:1 | PASS |
| Focus ring on dark: cyan vs #0A1020 | 10.49:1 | 3:1 | PASS |

## aura-deep on light

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| aura-deep #0E7490 vs #FAFAF7 (text, links, labels, ✓) | 5.12:1 | 4.5:1 | PASS |
| aura-deep vs white | 5.36:1 | 4.5:1 | PASS |
| aura-deep vs #F3F3EE (calculator bg) | 4.81:1 | 4.5:1 | PASS |
| aura-deep vs #F4F4F0 (stats strip) | 4.86:1 | 4.5:1 | PASS |
| aura-deep vs aura-tint #ECFEFF | 5.15:1 | 4.5:1 | PASS |
| Eyebrow rule / dots / underlines: aura-deep vs #FAFAF7 (graphic ≥ 3) | 5.12:1 | 3:1 | PASS |
| Callout rule (Problem): aura-deep vs #FAFAF7 | 5.12:1 | 3:1 | PASS |
| Marker band: ink on aura-line #A5F3FC | 14.46:1 | 4.5:1 | PASS |
| Marker band: aura-line vs #FAFAF7 (decorative highlight) | 1.19:1 | 1:1 | PASS — decorative highlight — text on it is ink (above) |
| Problem tags: ink on aura-tint #ECFEFF | 17.35:1 | 4.5:1 | PASS |
| Problem tags: aura-line border vs #FAFAF7 | 1.19:1 | 1:1 | PASS — decorative pill border; text is ink on aura-tint |

## Slider

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| FILLED vs UNFILLED: aura-deep fill vs ink/15 track | 3.53:1 | 3:1 | PASS |
| Filled track vs section bg: aura-deep vs #F3F3EE | 4.81:1 | 3:1 | PASS |
| Unfilled track vs section bg: ink/15 vs #F3F3EE | 1.36:1 | 3:1 | FAIL — brief-specified ink/15 → informational: the thumb + the value carry the state, the unfilled run is not required to identify the control |
| THUMB vs TRACK: ink ring vs unfilled track | 11.88:1 | 3:1 | PASS |
| THUMB vs TRACK: ink ring vs filled track (aura-deep) | 3.37:1 | 3:1 | PASS |
| Thumb ring vs section bg: ink vs #F3F3EE | 16.21:1 | 3:1 | PASS |
| Thumb fill cyan vs its ink ring | 9.99:1 | 3:1 | PASS |
| Thumb fill cyan vs unfilled track (no ring) | 1.19:1 | 3:1 | FAIL — informational — the 2px ink ring is what carries the thumb |
| Thumb fill cyan vs filled track (no ring) | 2.96:1 | 1:1 | PASS — informational — the 2px ink ring is what carries the thumb |
| Focus ring: aura-deep vs #F3F3EE | 4.81:1 | 3:1 | PASS |

## Industries

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| ✓ ΜΕ ΤΗΝ AURAGRAM label: aura-deep on aura-tint | 5.15:1 | 4.5:1 | PASS |
| ✕ ΣΗΜΕΡΑ label #B42318 on #FEF3F2 | 6.05:1 | 4.5:1 | PASS |
| Bullets: ink on aura-tint | 17.35:1 | 4.5:1 | PASS |
| Bullets: ink on #FEF3F2 | 16.60:1 | 4.5:1 | PASS |
| Active pill: white on ink #0A1020 | 18.96:1 | 4.5:1 | PASS |
| Inactive pill: ink on white | 18.05:1 | 4.5:1 | PASS |
| Stat label: ink-soft on #F4F4F0 strip | 5.58:1 | 4.5:1 | PASS |
| Stat number: ink on #F4F4F0 strip | 16.37:1 | 4.5:1 | PASS |
| Subtitle / formula: ink-soft on white panel | 6.15:1 | 4.5:1 | PASS |
| ΕΚΤΙΜΗΣΗ pill (light): ink-soft on #F4F4F0 | 5.58:1 | 4.5:1 | PASS |
| aura-line border of the ✓ box vs aura-tint | 1.20:1 | 1:1 | PASS — decorative box border; text inside is aura-deep / ink |

## Halo (violet) behind dark content

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| Body text fg on night + violet 14% glow | 7.91:1 | 4.5:1 | PASS — worst case: full-strength blob centre |
| Muted fg-dim #8C96A8 on night + violet 14% glow | 5.03:1 | 4.5:1 | PASS |
| Cyan text on night + violet 14% glow | 8.29:1 | 4.5:1 | PASS |
| White H1 on night + violet 14% glow | 14.99:1 | 4.5:1 | PASS |

## Grid behind text (text-safe canvas)

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| ink-soft on plain #FAFAF7 (nominal) | 5.88:1 | 4.5:1 | PASS |
| ink-soft directly under a NODE dot (α 0.0675 after text-safe) | 5.13:1 | 4.5:1 | PASS |
| ink-soft under node + link overlapping (worst case) | 4.64:1 | 4.5:1 | PASS |
| ink-soft on white panel under node + link overlapping | 4.84:1 | 4.5:1 | PASS |
| ink body text under node + link overlapping | 13.61:1 | 4.5:1 | PASS |
| Spotlight centre over text: no tint (spotMask = 0) → ink-soft on #FAFAF7 + node α | 5.13:1 | 4.5:1 | PASS — tint is suppressed over text blocks; only the faded node remains |
| Signal trail/head over text: suppressed (0) → same as node only | 5.13:1 | 4.5:1 | PASS |
| REFERENCE (rejected): stacked trail aura-deep 0.18 + node under text | 4.06:1 | 4.5:1 | FAIL — EXPECTED FAIL — the reason trails vanish entirely over text |
| REFERENCE (before text-safe): ink-soft under a node at α 0.225 | 3.62:1 | 4.5:1 | FAIL — EXPECTED FAIL — what text-safe fixes |
| Signal head cyan vs #FAFAF7 in the open (decorative) | 1.73:1 | 1:1 | PASS — decorative — carries no information |

## Agents (dark)

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| #FCA5A5 label on rose box (rgba(248,113,113,.05) over #0E1628) | 8.98:1 | 4.5:1 | PASS |
| #FCA5A5 label on rose box over #0A1020 | 9.49:1 | 4.5:1 | PASS |
| Body text fg #B4BDCB on rose box | 9.00:1 | 4.5:1 | PASS |
| Gain pill text cyan on aura/8 over #0E1628 | 8.64:1 | 4.5:1 | PASS |
| Formula line fg-dim #8C96A8 on #0E1628 | 6.05:1 | 4.5:1 | PASS |
| Feed time fg-dim on card (white/2% over #0E1628) | 5.78:1 | 4.5:1 | PASS |
| Feed tag cyan on aura/8 | 8.64:1 | 4.5:1 | PASS |
| Feed text fg on card | 9.10:1 | 4.5:1 | PASS |
| Card glow ring cyan/40 vs #0E1628 (decorative) | 2.61:1 | 1:1 | PASS — decorative |

## Light misc

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| Eyebrow ink-soft on #FAFAF7 | 5.88:1 | 4.5:1 | PASS |
| Counter ink-soft on #FAFAF7 | 5.88:1 | 4.5:1 | PASS |
| FAQ answer ink/75 on #FAFAF7 | 7.84:1 | 4.5:1 | PASS |
| FAQ question (closed) ink/70 on #FAFAF7 | 6.56:1 | 4.5:1 | PASS |
| Eyebrow rule: aura-deep vs #FAFAF7 (graphic) | 5.12:1 | 3:1 | PASS |

## Brand icons on pills/chips (≥ 3:1 or fallback)

| Brand | Hex | hero marquee pill (white/5 over #0E1628) | agent chip (white/5 over #0E1628) | agent cyan chip (aura/7 over #0E1628) | light chip (white, Industries) |
|---|---|---|---|---|---|
| Instagram | #FF0069 | 4.15:1 | 4.15:1 | 4.14:1 | 3.85:1 |
| WhatsApp | #25D366 | 8.04:1 | 8.04:1 | 8.04:1 | 1.98:1 → #0F1720 |
| Viber | #7360F2 | 3.56:1 | 3.56:1 | 3.56:1 | 4.48:1 |
| Messenger | #0866FF | 3.31:1 | 3.31:1 | 3.31:1 | 4.82:1 |
| Gmail | #EA4335 | 4.07:1 | 4.07:1 | 4.06:1 | 3.92:1 |
| Google Calendar | #4285F4 | 4.48:1 | 4.48:1 | 4.47:1 | 3.56:1 |
| Google Sheets | #34A853 | 5.22:1 | 5.22:1 | 5.22:1 | 3.06:1 |
| Google Docs | #4285F4 | 4.48:1 | 4.48:1 | 4.47:1 | 3.56:1 |
| Google Drive | #4285F4 | 4.48:1 | 4.48:1 | 4.47:1 | 3.56:1 |
| Google | #4285F4 | 4.48:1 | 4.48:1 | 4.47:1 | 3.56:1 |
| HubSpot | #FF7A59 | 6.21:1 | 6.21:1 | 6.21:1 | 2.57:1 → #0F1720 |
| Shopify | #7AB55C | 6.53:1 | 6.53:1 | 6.52:1 | 2.44:1 → #0F1720 |
| WooCommerce | #96588A | 3.08:1 | 3.08:1 | 3.08:1 | 5.17:1 |
| Notion | #000000 | 1.32:1 → #FFFFFF | 1.32:1 → #FFFFFF | 1.32:1 → #FFFFFF | 21.00:1 |
| Stripe | #635BFF | 3.40:1 | 3.40:1 | 3.39:1 | 4.70:1 |
| Claude (about) | #D97757 | 5.11:1 | 5.11:1 | 5.11:1 | 3.12:1 |
| n8n | #EA4B71 | 4.36:1 | 4.36:1 | 4.36:1 | 3.66:1 |
| Make | #6D00CC | 1.92:1 → #FFFFFF | 1.92:1 → #FFFFFF | 1.91:1 → #FFFFFF | 8.33:1 |
| Next.js (about) | #000000 | 1.32:1 → #FFFFFF | 1.32:1 → #FFFFFF | 1.32:1 → #FFFFFF | 21.00:1 |
| Supabase | #3FCF8E | 8.00:1 | 8.00:1 | 7.99:1 | 1.99:1 → #0F1720 |
| Vercel | #000000 | 1.32:1 → #FFFFFF | 1.32:1 → #FFFFFF | 1.32:1 → #FFFFFF | 21.00:1 |
| Tailwind | #06B6D4 | 6.57:1 | 6.57:1 | 6.57:1 | 2.43:1 → #0F1720 |
| Cal.com | #292929 | 1.10:1 → #FFFFFF | 1.10:1 → #FFFFFF | 1.10:1 → #FFFFFF | 14.55:1 |

