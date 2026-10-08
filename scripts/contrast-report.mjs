// Contrast report για κάθε ζεύγος χρωμάτων του Round 4.  Τρέξτε:  node scripts/contrast-report.mjs
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

const INK = hex('0F1720'), INK_SOFT = hex('5A6270'), LIME = hex('C7F94B'), LIME_HOVER = hex('B8EA3A');
const BONE = hex('FAFAF7'), BONE2 = hex('F3F3EE'), WHITE = hex('FFFFFF'), STRIP = hex('F4F4F0');
const NIGHT = hex('0A1020'), NIGHT2 = hex('0E1628'), CYAN = hex('22D3EE'), FG = hex('B4BDCB'), FGDIM = hex('8C96A8');
const ROSE = hex('FCA5A5'), ROSE_RGB = [248, 113, 113];

const rows = [];
const add = (group, pair, fg, bg, min, note = '') => {
  const r = ratio(fg, bg);
  rows.push({ group, pair, ratio: r, min, ok: r >= min, note });
};

// ── 1. Lime button / marker ──
add('Lime on light', 'Button label: ink on lime #C7F94B', INK, LIME, 4.5);
add('Lime on light', 'Button label (hover): ink on #B8EA3A', INK, LIME_HOVER, 4.5);
add('Lime on light', 'Marker highlight: ink on lime', INK, LIME, 4.5);
add('Lime on light', 'Active pill: ink on lime', INK, LIME, 4.5);
add('Lime on light', 'Button EDGE: lime vs #FAFAF7 (needs the ink/10 border — lime alone is a thin-line fail)', LIME, BONE, 3, 'EXPECTED FAIL → solved by 1px ink/10 border + ink label; lime is never text/thin line');
add('Lime on light', 'Button edge incl. ink/10 border vs #FAFAF7', over(INK, 0.1, BONE), BONE, 1.0, 'informational (decorative edge; the label carries the 4.5:1)');
add('Lime on light', 'Focus ring on light: ink vs #FAFAF7', INK, BONE, 3);
add('Lime on light', 'Focus ring on light: ink vs white card', INK, WHITE, 3);
add('Lime on light', 'Focus ring (rejected): lime vs #FAFAF7', LIME, BONE, 3, 'EXPECTED FAIL — this is why the ring is ink');

// ── 2. Sliders (calculator section bg = #F3F3EE) ──
const track = over(INK, 0.15, BONE2);
add('Slider', 'Unfilled track ink/15 vs section bg', track, BONE2, 3, 'brief-mandated ink/15 → informational: value is carried by thumb + the number');
add('Slider', 'Thumb: 2px ink ring vs section bg', INK, BONE2, 3);
add('Slider', 'Thumb fill lime vs ink ring', LIME, INK, 3);
for (const a of [0.35, 0.5, 0.6, 0.7]) {
  const outline = over(INK, a, BONE2);
  add('Slider', `Filled-part outline ink/${Math.round(a * 100)} vs unfilled track`, outline, track, 3, a === 0.35 ? 'brief value' : '');
  add('Slider', `Filled-part outline ink/${Math.round(a * 100)} vs section bg`, outline, BONE2, 3, a === 0.35 ? 'brief value' : '');
}
add('Slider', 'Filled lime vs its ink/60 outline (the edge that makes the fill readable)', LIME, over(INK, 0.6, BONE2), 3);

// ── 3. Industries boxes ──
add('Industries', '✕ ΣΗΜΕΡΑ label #B42318 on #FEF3F2', hex('B42318'), hex('FEF3F2'), 4.5);
add('Industries', '✓ ΜΕ ΤΗΝ AURAGRAM label #3F6212 on #F7FEE7', hex('3F6212'), hex('F7FEE7'), 4.5);
add('Industries', 'Bullets: ink on #FEF3F2', INK, hex('FEF3F2'), 4.5);
add('Industries', 'Bullets: ink on #F7FEE7', INK, hex('F7FEE7'), 4.5);
add('Industries', 'Stat label: ink-soft on #F4F4F0 strip', INK_SOFT, STRIP, 4.5);
add('Industries', 'Stat number: ink on #F4F4F0 strip', INK, STRIP, 4.5);
add('Industries', 'Subtitle / formula: ink-soft on white panel', INK_SOFT, WHITE, 4.5);
add('Industries', 'Pill (inactive): ink on white', INK, WHITE, 4.5);
add('Industries', 'ΕΚΤΙΜΗΣΗ pill (light): ink-soft on #F4F4F0', INK_SOFT, STRIP, 4.5);
add('Industries', 'Lime box border #C7F94B vs #F7FEE7 (UI edge)', LIME, hex('F7FEE7'), 1.0, 'decorative border of a tinted box; text inside is ink/#3F6212');

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
add('Light misc', 'Eyebrow lime capsule vs #FAFAF7 (shape + ink/10 border, not a thin line)', LIME, BONE, 1.0, 'decorative marker; text next to it is ink-soft');

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
let md = '# Round 4 — contrast report\n\nText ≥ 4.5:1 · UI graphics ≥ 3:1. Alpha colours are composited on the real surface.\n\n';
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
