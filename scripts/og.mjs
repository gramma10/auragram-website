/**
 * Παράγει το public/og.png (1200×630) από SVG.
 *   npm run og
 *
 * Στατικό αρχείο αντί για runtime generation: μηδέν κόστος, μηδέν εξάρτηση
 * από τρίτους στο production, και το preview δουλεύει ακόμα κι αν πέσει κάτι.
 * Το headline είναι τυπωμένο μεγάλο επειδή μοιράζεται σε DM του Instagram.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const W = 1200;
const H = 630;

// Γεωμετρικές γραμματοσειρές με ελληνικά glyphs, από το σύστημα.
const FONT = "'Manrope', 'Segoe UI', 'Noto Sans', 'DejaVu Sans', sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#0E1628"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F2F5F9"/>
      <stop offset="55%" stop-color="#8892A2"/>
      <stop offset="100%" stop-color="#C3CCD8"/>
    </linearGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <!-- σήμα (καθαρή απόδοση του λογοτύπου· το φωτορεαλιστικό render μπαίνει στο site) -->
  <g transform="translate(80,60) scale(0.44)">
    <path d="M60 8 L117 112 L93 112 L60 50 L27 112 L3 112 Z" fill="url(#chrome)"/>
    <path d="M60 40 L84 92 L69 92 L60 70 L51 92 L36 92 Z" fill="#22D3EE"/>
    <path d="M56.5 62 L63.5 62 L63.5 92 L56.5 92 Z" fill="#22D3EE"/>
  </g>
  <text x="144" y="108" font-family=${JSON.stringify(FONT)} font-size="28" font-weight="800"
        letter-spacing="5" fill="#FFFFFF">AURA<tspan fill="rgba(255,255,255,0.5)" font-weight="500">GRAM</tspan></text>

  <!-- headline -->
  <text x="80" y="300" font-family=${JSON.stringify(FONT)} font-size="66" font-weight="800"
        letter-spacing="-2" fill="#FFFFFF">AI agents που απαντούν,</text>
  <text x="80" y="378" font-family=${JSON.stringify(FONT)} font-size="66" font-weight="800"
        letter-spacing="-2" fill="rgba(255,255,255,0.45)">εξυπηρετούν και κλείνουν</text>
  <text x="80" y="456" font-family=${JSON.stringify(FONT)} font-size="66" font-weight="800"
        letter-spacing="-2" fill="rgba(255,255,255,0.45)">ραντεβού. 24/7.</text>

  <!-- footer badge -->
  <rect x="80" y="522" width="392" height="60" rx="4" fill="#22D3EE"/>
  <text x="106" y="561" font-family=${JSON.stringify(FONT)} font-size="26" font-weight="800"
        letter-spacing="-0.4" fill="#0A1020">Pilot 2–4 εβδομάδων</text>
  <text x="500" y="561" font-family=${JSON.stringify(FONT)} font-size="24"
        fill="rgba(255,255,255,0.5)">με μετρήσιμο αποτέλεσμα</text>
</svg>`;

mkdirSync('public', { recursive: true });
const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync('public/og.png', png);
console.log(`✓ public/og.png — ${W}×${H}, ${(png.length / 1024).toFixed(0)}KB`);
