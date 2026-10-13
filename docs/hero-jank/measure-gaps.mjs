// Κενά στο hero (mobile WebKit): σε κάθε θέση scroll μετράει ποιο ποσοστό του «ωφέλιμου» ύψους (ανάμεσα στο top bar και το dock)
// καλύπτεται από ορατό περιεχόμενο του hero (κείμενο με effective opacity ≥ .15, το κινητό, proof bar, marquee).
// Χρήση: PW=<path προς playwright> node docs/hero-jank/measure-gaps.mjs <baseURL> <out.json>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PW + '/x.js');
const { webkit, devices } = require('playwright');
const BASE = process.argv[2]; const OUT = process.argv[3];
const NAV_B = 72, THRESH = 0.25, STEP = 10;
const b = await webkit.launch(); const dev = devices['iPhone 12'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const result = {};
for (const [w, h] of [[390, 664], [390, 844]]) {
  const ctx = await b.newContext({ ...dev, viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => document.querySelector('.hero-phone')?.dataset.armed !== undefined, null, { timeout: 90000 }); // hydration: το scroll handler του hero πρέπει να είναι οπλισμένος
  await page.evaluate(() => document.fonts.ready); await sleep(1500);
  const info = await page.evaluate(() => {
    const hero = document.querySelector('section.surface-dark');
    const r = hero.getBoundingClientRect();
    const proof = hero.querySelector(':scope > div.border-t');
    return { heroBottom: r.bottom + scrollY, proofBottom: proof.getBoundingClientRect().bottom + scrollY, vh: innerHeight };
  });
  const samples = [];
  const maxY = Math.round(info.heroBottom - info.vh * 0.1);
  for (let y = 0; y <= maxY; y += STEP) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const s = await page.evaluate(({ NAV_B }) => {
      const hero = document.querySelector('section.surface-dark');
      const vh = innerHeight;
      const dock = document.querySelector('.sticky-cta');
      const dr = dock ? dock.getBoundingClientRect() : null;
      const top = NAV_B, bottom = dr && dr.top < vh ? dr.top : vh;
      const eff = (el) => { let o = 1; for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= parseFloat(cs.opacity); } return o; };
      const rects = [];
      const add = (el) => { if (eff(el) < 0.15) return; const r = el.getBoundingClientRect(); const t = Math.max(r.top, top), b2 = Math.min(r.bottom, bottom); if (b2 > t && r.width > 0) rects.push([t, b2]); };
      // το hero ΚΑΙ τα επόμενα sections που φαίνονται στο viewport (αλλιώς το τέλος του hero θα μετρούσε «κενό» ενώ από κάτω ανεβαίνει το Problem)
      const roots = [hero];
      for (let sib = hero.nextElementSibling; sib && sib.getBoundingClientRect().top < vh; sib = sib.nextElementSibling) roots.push(sib);
      for (const root of roots) {
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          const el = n; if (el.closest('.aura') || el.closest('.hero-phone') || el.tagName === 'CANVAS') continue;
          const own = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
          if (own) add(el);
        }
      }
      const ph = hero.querySelector('.hero-phone'); if (ph) add(ph);
      rects.sort((a, c) => a[0] - c[0]);
      let covered = 0, cur = null;
      for (const [t, b2] of rects) { if (!cur) cur = [t, b2]; else if (t <= cur[1]) cur[1] = Math.max(cur[1], b2); else { covered += cur[1] - cur[0]; cur = [t, b2]; } }
      if (cur) covered += cur[1] - cur[0];
      const phr = ph.getBoundingClientRect();
      const proof = hero.querySelector(':scope > div.border-t');
      let pt = null; const tw2 = document.createTreeWalker(proof, NodeFilter.SHOW_ELEMENT);
      for (let n = tw2.nextNode(); n && pt === null; n = tw2.nextNode()) if ([...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) pt = n.getBoundingClientRect().top;
      return { cov: covered / Math.max(1, bottom - top), phoneBottom: phr.bottom, proofTextTop: pt };
    }, { NAV_B });
    samples.push({ y, ...s });
  }
  // intervals below threshold
  const low = []; let cur = null;
  for (const s of samples) { if (s.cov < THRESH) { if (!cur) cur = { from: s.y, to: s.y, min: s.cov }; else { cur.to = s.y; cur.min = Math.min(cur.min, s.cov); } } else if (cur) { low.push(cur); cur = null; } }
  if (cur) low.push(cur);
  // gap between the phone's visual bottom and the first proof text (stable once the pin has released: phone bottom in view, proof text below it)
  const gapRows = samples.filter((s) => s.phoneBottom > 120 && s.phoneBottom < h - 80 && s.proofTextTop > s.phoneBottom);
  const gap = gapRows.length ? Math.round(gapRows[gapRows.length - 1].proofTextTop - gapRows[gapRows.length - 1].phoneBottom) : null;
  result[`${w}x${h}`] = { samples: samples.length, step: STEP, lowCoverageRanges: low.map((r) => ({ fromY: r.from, toY: r.to, minCoverage: +r.min.toFixed(2) })), phoneToProofGapPx: gap, samplesDump: process.env.DUMP ? samples.map((x) => [x.y, +x.cov.toFixed(2)]) : undefined, minCoverageOverall: +Math.min(...samples.map((s) => s.cov)).toFixed(2) };
  console.log(`${w}x${h}: ${low.length} low-coverage range(s)`, JSON.stringify(result[`${w}x${h}`].lowCoverageRanges), 'phone→proof gap', gap, 'min', result[`${w}x${h}`].minCoverageOverall);
  await ctx.close();
}
fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
await b.close();
