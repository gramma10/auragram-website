// Contrast report για κάθε ζεύγος χρωμάτων — Round 4 + Palette v4 (cyan / aura-deep / aura-tint / aura-line / halo).  Τρέξτε:  node scripts/contrast-report.mjs
// Κανόνας: κείμενο ≥ 4.5:1 · γραφικά UI / ενδείξεις κατάστασης ≥ 3:1. Τα alpha χρώματα υπολογίζονται πάνω στην πραγματική επιφάνεια.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const si = require('simple-icons');

const hex = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = (fg, a, bg) => fg.map((c, i) => c + (bg[i] - c) * (1 - a));

const INK = hex('0F1720'), INK_SOFT = hex('5A6270'), NIGHT_INK = hex('0A1020');
const BONE = hex('FAFAF7'), BONE2 = hex('F3F3EE'), WHITE = hex('FFFFFF'), STRIP = hex('F4F4F0');
const NIGHT = hex('0A1020'), NIGHT2 = hex('0E1628'), CYAN = hex('22D3EE'), CYAN_HOVER = hex('5EEAF7'), FG = hex('B4BDCB'), FGDIM = hex('8C96A8');
const DEEP = hex('0E7490'), TINT = hex('ECFEFF'), LINE = hex('A5F3FC'), HALO = hex('8B7CF6');
const ROSE = hex('FCA5A5'), ROSE_RGB = [248, 113, 113];

const rows = [];
const add = (group, pair, fg, bg, min, note = '') => {
  const r = ratio(fg, bg);
  rows.push({ group, pair, ratio: r, min, ok: r >= min, note });
};

// ── 1. CTA (cyan everywhere) ──
add('CTA (cyan on every surface)', 'Label: ink #0A1020 on cyan #22D3EE', NIGHT_INK, CYAN, 4.5);
add('CTA (cyan on every surface)', 'Label (hover): ink on #5EEAF7', NIGHT_INK, CYAN_HOVER, 4.5);
add('CTA (cyan on every surface)', 'Light surface: cyan fill vs #FAFAF7', CYAN, BONE, 3, 'informational — the control is identified by its ink label (≥ 4.5:1) + the 1px border; fill alone is < 3:1');
add('CTA (cyan on every surface)', 'Light surface: cyan fill vs white card', CYAN, WHITE, 3, 'informational — same as above');
add('CTA (cyan on every surface)', 'Light surface: border rgba(14,116,144,.35) over #FAFAF7 vs #FAFAF7', over(DEEP, 0.35, BONE), BONE, 3, 'informational — brief-specified edge; it reinforces the cyan fill but does not reach 3:1 by itself');
add('CTA (cyan on every surface)', 'Light surface: border rgba(14,116,144,.35) over cyan fill vs cyan', over(DEEP, 0.35, CYAN), CYAN, 1.0, 'informational (inner edge)');
add('CTA (cyan on every surface)', 'Focus ring on light: aura-deep vs #FAFAF7', DEEP, BONE, 3);
add('CTA (cyan on every surface)', 'Focus ring on light: aura-deep vs white card', DEEP, WHITE, 3);
add('CTA (cyan on every surface)', 'Focus ring on dark: cyan vs #0A1020', CYAN, NIGHT, 3);

// ── 2. aura-deep on light ──
add('aura-deep on light', 'aura-deep #0E7490 vs #FAFAF7 (text, links, labels, ✓)', DEEP, BONE, 4.5);
add('aura-deep on light', 'aura-deep vs white', DEEP, WHITE, 4.5);
add('aura-deep on light', 'aura-deep vs #F3F3EE (calculator bg)', DEEP, BONE2, 4.5);
add('aura-deep on light', 'aura-deep vs #F4F4F0 (stats strip)', DEEP, STRIP, 4.5);
add('aura-deep on light', 'aura-deep vs aura-tint #ECFEFF', DEEP, TINT, 4.5);
add('aura-deep on light', 'Eyebrow rule / dots / underlines: aura-deep vs #FAFAF7 (graphic ≥ 3)', DEEP, BONE, 3);
add('aura-deep on light', 'Callout rule (Problem): aura-deep vs #FAFAF7', DEEP, BONE, 3);
add('aura-deep on light', 'Marker band: ink on aura-line #A5F3FC', INK, LINE, 4.5);
add('aura-deep on light', 'Marker band: aura-line vs #FAFAF7 (decorative highlight)', LINE, BONE, 1.0, 'decorative highlight — text on it is ink (above)');
add('aura-deep on light', 'Problem tags: ink on aura-tint #ECFEFF', INK, TINT, 4.5);
add('aura-deep on light', 'Problem tags: aura-line border vs #FAFAF7', LINE, BONE, 1.0, 'decorative pill border; text is ink on aura-tint');

// ── 3. Sliders (calculator section bg = #F3F3EE) ──
const track = over(INK, 0.15, BONE2);
add('Slider', 'FILLED vs UNFILLED: aura-deep fill vs ink/15 track', DEEP, track, 3);
add('Slider', 'Filled track vs section bg: aura-deep vs #F3F3EE', DEEP, BONE2, 3);
add('Slider', 'Unfilled track vs section bg: ink/15 vs #F3F3EE', track, BONE2, 3, 'brief-specified ink/15 → informational: the thumb + the value carry the state, the unfilled run is not required to identify the control');
add('Slider', 'THUMB vs TRACK: ink ring vs unfilled track', INK, track, 3);
add('Slider', 'THUMB vs TRACK: ink ring vs filled track (aura-deep)', INK, DEEP, 3);
add('Slider', 'Thumb ring vs section bg: ink vs #F3F3EE', INK, BONE2, 3);
add('Slider', 'Thumb fill cyan vs its ink ring', CYAN, INK, 3);
add('Slider', 'Thumb fill cyan vs unfilled track (no ring)', CYAN, track, 3, 'informational — the 2px ink ring is what carries the thumb');
add('Slider', 'Thumb fill cyan vs filled track (no ring)', CYAN, DEEP, 1.0, 'informational — the 2px ink ring is what carries the thumb');
add('Slider', 'Focus ring: aura-deep vs #F3F3EE', DEEP, BONE2, 3);

// ── 3b. Industries ──
add('Industries', '✓ ΜΕ ΤΗΝ AURAGRAM label: aura-deep on aura-tint', DEEP, TINT, 4.5);
add('Industries', '✕ ΣΗΜΕΡΑ label #B42318 on #FEF3F2', hex('B42318'), hex('FEF3F2'), 4.5);
add('Industries', 'Bullets: ink on aura-tint', INK, TINT, 4.5);
add('Industries', 'Bullets: ink on #FEF3F2', INK, hex('FEF3F2'), 4.5);
add('Industries', 'Active pill: white on ink #0A1020', WHITE, NIGHT_INK, 4.5);
add('Industries', 'Inactive pill: ink on white', INK, WHITE, 4.5);
add('Industries', 'Stat label: ink-soft on #F4F4F0 strip', INK_SOFT, STRIP, 4.5);
add('Industries', 'Stat number: ink on #F4F4F0 strip', INK, STRIP, 4.5);
add('Industries', 'Subtitle / formula: ink-soft on white panel', INK_SOFT, WHITE, 4.5);
add('Industries', 'ΕΚΤΙΜΗΣΗ pill (light): ink-soft on #F4F4F0', INK_SOFT, STRIP, 4.5);
add('Industries', 'aura-line border of the ✓ box vs aura-tint', LINE, TINT, 1.0, 'decorative box border; text inside is aura-deep / ink');

// ── 3c. Violet halo (aura background): text on top of the glow ──
const halo = (a) => over(HALO, a, NIGHT2);
add('Halo (violet) behind dark content', 'Body text fg on night + violet 14% glow', FG, halo(0.14), 4.5, 'worst case: full-strength blob centre');
add('Halo (violet) behind dark content', 'Muted fg-dim #8C96A8 on night + violet 14% glow', FGDIM, halo(0.14), 4.5);
add('Halo (violet) behind dark content', 'Cyan text on night + violet 14% glow', CYAN, halo(0.14), 4.5);
add('Halo (violet) behind dark content', 'White H1 on night + violet 14% glow', WHITE, halo(0.14), 4.5);

// ── 3d. Grid behind text (light sections) — TEXT-SAFE: κάτω από μπλοκ κειμένου nodes/links ≤ 30% alpha, trails/heads/spotlight = 0 ──
// nodes: 0.225 (max, με flicker) × 0.30 = 0.0675 · links: 0.17 × 0.30 = 0.051 (πριν το distance falloff) · το spotlight ΔΕΝ βάφει πάνω σε κείμενο
const nodeT = 0.225 * 0.3, linkT = 0.17 * 0.3;
const gNode = over(INK, nodeT, BONE), gNodeLink = over(INK, linkT, over(INK, nodeT, BONE)), gNodeW = over(INK, nodeT, WHITE), gNodeLinkW = over(INK, linkT, over(INK, nodeT, WHITE));
add('Grid behind text (text-safe canvas)', 'ink-soft on plain #FAFAF7 (nominal)', INK_SOFT, BONE, 4.5);
add('Grid behind text (text-safe canvas)', 'ink-soft directly under a NODE dot (α 0.0675 after text-safe)', INK_SOFT, gNode, 4.5);
add('Grid behind text (text-safe canvas)', 'ink-soft under node + link overlapping (worst case)', INK_SOFT, gNodeLink, 4.5);
add('Grid behind text (text-safe canvas)', 'ink-soft on white panel under node + link overlapping', INK_SOFT, gNodeLinkW, 4.5);
add('Grid behind text (text-safe canvas)', 'ink body text under node + link overlapping', INK, gNodeLink, 4.5);
add('Grid behind text (text-safe canvas)', 'Spotlight centre over text: no tint (spotMask = 0) → ink-soft on #FAFAF7 + node α', INK_SOFT, gNode, 4.5, 'tint is suppressed over text blocks; only the faded node remains');
add('Grid behind text (text-safe canvas)', 'Signal trail/head over text: suppressed (0) → same as node only', INK_SOFT, gNode, 4.5);
add('Grid behind text (text-safe canvas)', 'REFERENCE (rejected): stacked trail aura-deep 0.18 + node under text', INK_SOFT, over(DEEP, 0.6 * 0.3, gNode), 4.5, 'EXPECTED FAIL — the reason trails vanish entirely over text');
add('Grid behind text (text-safe canvas)', 'REFERENCE (before text-safe): ink-soft under a node at α 0.225', INK_SOFT, over(INK, 0.225, BONE), 4.5, 'EXPECTED FAIL — what text-safe fixes');
add('Grid behind text (text-safe canvas)', 'Signal head cyan vs #FAFAF7 in the open (decorative)', CYAN, BONE, 1.0, 'decorative — carries no information');

// ── 4. Agents (dark surface) ──
const cardBg = (rgb, a) => over(rgb, a, NIGHT2);
add('Agents (dark)', '#FCA5A5 label on rose box (rgba(248,113,113,.05) over #0E1628)', ROSE, cardBg(ROSE_RGB, 0.05), 4.5);
add('Agents (dark)', '#FCA5A5 label on rose box over #0A1020', ROSE, over(ROSE_RGB, 0.05, NIGHT), 4.5);
add('Agents (dark)', 'Body text fg #B4BDCB on rose box', FG, cardBg(ROSE_RGB, 0.05), 4.5);
add('Agents (dark)', 'Gain pill text cyan on aura/8 over #0E1628', CYAN, over(CYAN, 0.08, NIGHT2), 4.5);
add('Agents (dark)', 'Formula line fg-dim #8C96A8 on #0E1628', FGDIM, NIGHT2, 4.5);
add('Agents (dark)', 'Feed time fg-dim on card (white/2% over #0E1628)', FGDIM, over(WHITE, 0.02, NIGHT2), 4.5);
add('Agents (dark)', 'Feed tag cyan on aura/8', CYAN, over(CYAN, 0.08, NIGHT2), 4.5);
add('Agents (dark)', 'Feed text fg on card', FG, over(WHITE, 0.02, NIGHT2), 4.5);
add('Agents (dark)', 'Card glow ring cyan/40 vs #0E1628 (decorative)', over(CYAN, 0.4, NIGHT2), NIGHT2, 1.0, 'decorative');

// ── 5. Light surface misc ──
add('Light misc', 'Eyebrow ink-soft on #FAFAF7', INK_SOFT, BONE, 4.5);
add('Light misc', 'Counter ink-soft on #FAFAF7', INK_SOFT, BONE, 4.5);
add('Light misc', 'FAQ answer ink/75 on #FAFAF7', over(INK, 0.75, BONE), BONE, 4.5);
add('Light misc', 'FAQ question (closed) ink/70 on #FAFAF7', over(INK, 0.7, BONE), BONE, 4.5);
add('Light misc', 'Eyebrow rule: aura-deep vs #FAFAF7 (graphic)', DEEP, BONE, 3);

// ── 6. Brand icons on pills ──
const surfaces = {
  'hero marquee pill (white/5 over #0E1628)': { bg: over(WHITE, 0.05, NIGHT2), fb: '#FFFFFF' },
  'agent chip (white/5 over #0E1628)': { bg: over(WHITE, 0.05, NIGHT2), fb: '#FFFFFF' },
  'agent cyan chip (aura/7 over #0E1628)': { bg: over(CYAN, 0.07, NIGHT2), fb: '#FFFFFF' },
  'light chip (white, Industries)': { bg: WHITE, fb: '#0F1720' },
};
const icons = {
  Instagram: 'siInstagram', WhatsApp: 'siWhatsapp', Viber: 'siViber', Messenger: 'siMessenger', Gmail: 'siGmail',
  'Google Calendar': 'siGooglecalendar', 'Google Sheets': 'siGooglesheets', 'Google Docs': 'siGoogledocs', 'Google Drive': 'siGoogledrive',
  Google: 'siGoogle', HubSpot: 'siHubspot', Shopify: 'siShopify', WooCommerce: 'siWoocommerce', Notion: 'siNotion', Stripe: 'siStripe',
  'Claude (about)': 'siClaude', n8n: 'siN8n', Make: 'siMake', 'Next.js (about)': 'siNextdotjs', Supabase: 'siSupabase', Vercel: 'siVercel',
  Tailwind: 'siTailwindcss', 'Cal.com': 'siCaldotcom',
};
const iconRows = [];
for (const [name, key] of Object.entries(icons)) {
  const icon = si[key];
  if (!icon) continue;
  const out = { name, hex: '#' + icon.hex };
  for (const [sName, s] of Object.entries(surfaces)) {
    const r = ratio(hex(icon.hex), s.bg);
    out[sName] = { r, fallback: r < 3 ? s.fb : null };
  }
  iconRows.push(out);
}

// ── output ──
const fmt = (n) => n.toFixed(2) + ':1';
let md = '# Round 4 — Palette v4 contrast report\n\nText ≥ 4.5:1 · UI graphics ≥ 3:1. Alpha colours are composited on the real surface.\n\n';
let group = '';
for (const r of rows) {
  if (r.group !== group) {
    group = r.group;
    md += `\n## ${group}\n\n| Pair | Ratio | Needs | Result |\n|---|---|---|---|\n`;
  }
  md += `| ${r.pair} | ${fmt(r.ratio)} | ${r.min}:1 | ${r.ok ? 'PASS' : 'FAIL'}${r.note ? ' — ' + r.note : ''} |\n`;
}
md += '\n## Brand icons on pills/chips (≥ 3:1 or fallback)\n\n| Brand | Hex | ' + Object.keys(surfaces).join(' | ') + ' |\n|---|---|' + Object.keys(surfaces).map(() => '---|').join('') + '\n';
for (const o of iconRows) {
  md += `| ${o.name} | ${o.hex} | ` + Object.keys(surfaces).map((s) => `${fmt(o[s].r)}${o[s].fallback ? ' → ' + o[s].fallback : ''}`).join(' | ') + ' |\n';
}
console.log(md);
