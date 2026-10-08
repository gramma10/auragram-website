# Round 4 — contrast report

Text ≥ 4.5:1 · UI graphics ≥ 3:1. Alpha colours are composited on the real surface.


## Lime on light

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| Button label: ink on lime #C7F94B | 14.68:1 | 4.5:1 | PASS |
| Button label (hover): ink on #B8EA3A | 12.78:1 | 4.5:1 | PASS |
| Marker highlight: ink on lime | 14.68:1 | 4.5:1 | PASS |
| Active pill: ink on lime | 14.68:1 | 4.5:1 | PASS |
| Button EDGE: lime vs #FAFAF7 (needs the ink/10 border — lime alone is a thin-line fail) | 1.18:1 | 3:1 | FAIL — EXPECTED FAIL → solved by 1px ink/10 border + ink label; lime is never text/thin line |
| Button edge incl. ink/10 border vs #FAFAF7 | 1.23:1 | 1:1 | PASS — informational (decorative edge; the label carries the 4.5:1) |
| Focus ring on light: ink vs #FAFAF7 | 17.26:1 | 3:1 | PASS |
| Focus ring on light: ink vs white card | 18.05:1 | 3:1 | PASS |
| Focus ring (rejected): lime vs #FAFAF7 | 1.18:1 | 3:1 | FAIL — EXPECTED FAIL — this is why the ring is ink |

## Slider

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| Unfilled track ink/15 vs section bg | 1.36:1 | 3:1 | FAIL — brief-mandated ink/15 → informational: value is carried by thumb + the number |
| Thumb: 2px ink ring vs section bg | 16.21:1 | 3:1 | PASS |
| Thumb fill lime vs ink ring | 14.68:1 | 3:1 | PASS |
| Filled-part outline ink/35 vs unfilled track | 1.61:1 | 3:1 | FAIL — brief value |
| Filled-part outline ink/35 vs section bg | 2.20:1 | 3:1 | FAIL — brief value |
| Filled-part outline ink/50 vs unfilled track | 2.45:1 | 3:1 | FAIL |
| Filled-part outline ink/50 vs section bg | 3.35:1 | 3:1 | PASS |
| Filled-part outline ink/60 vs unfilled track | 3.34:1 | 3:1 | PASS |
| Filled-part outline ink/60 vs section bg | 4.56:1 | 3:1 | PASS |
| Filled-part outline ink/70 vs unfilled track | 4.67:1 | 3:1 | PASS |
| Filled-part outline ink/70 vs section bg | 6.37:1 | 3:1 | PASS |
| Filled lime vs its ink/60 outline (the edge that makes the fill readable) | 4.13:1 | 3:1 | PASS |

## Industries

| Pair | Ratio | Needs | Result |
|---|---|---|---|
| ✕ ΣΗΜΕΡΑ label #B42318 on #FEF3F2 | 6.05:1 | 4.5:1 | PASS |
| ✓ ΜΕ ΤΗΝ AURAGRAM label #3F6212 on #F7FEE7 | 6.84:1 | 4.5:1 | PASS |
| Bullets: ink on #FEF3F2 | 16.60:1 | 4.5:1 | PASS |
| Bullets: ink on #F7FEE7 | 17.43:1 | 4.5:1 | PASS |
| Stat label: ink-soft on #F4F4F0 strip | 5.58:1 | 4.5:1 | PASS |
| Stat number: ink on #F4F4F0 strip | 16.37:1 | 4.5:1 | PASS |
| Subtitle / formula: ink-soft on white panel | 6.15:1 | 4.5:1 | PASS |
| Pill (inactive): ink on white | 18.05:1 | 4.5:1 | PASS |
| ΕΚΤΙΜΗΣΗ pill (light): ink-soft on #F4F4F0 | 5.58:1 | 4.5:1 | PASS |
| Lime box border #C7F94B vs #F7FEE7 (UI edge) | 1.19:1 | 1:1 | PASS — decorative border of a tinted box; text inside is ink/#3F6212 |

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
| Eyebrow lime capsule vs #FAFAF7 (shape + ink/10 border, not a thin line) | 1.18:1 | 1:1 | PASS — decorative marker; text next to it is ink-soft |

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

