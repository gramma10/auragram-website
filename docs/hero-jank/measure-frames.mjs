// Frame times στο hero scroll (mobile, 390×664 & 390×844): ένα rAF loop κάνει scrollBy(10px) ανά frame (~600px/s στα 60Hz) από το 0 μέχρι το τέλος
// του pin + proof bar και καταγράφει τα διαστήματα ανάμεσα σε διαδοχικά frames.
//   engine=webkit   : Playwright WebKit, ΧΩΡΙΣ throttle (το WebKit του Playwright δεν έχει CPU throttling — υπάρχει μόνο στο CDP του Chromium)
//   engine=chromium : system Chrome με CDP Emulation.setCPUThrottlingRate(4)
// Χρήση: PW=<path> node docs/hero-jank/measure-frames.mjs <engine> <baseURL> <out.json> [runs=3]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PW + '/x.js');
const { webkit, chromium, devices } = require('playwright');
const [engine, BASE, OUT, RUNS = '3'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const dev = devices['iPhone 12'];
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const out = {};
for (const [w, h] of [[390, 664], [390, 844]]) {
  const runs = [];
  for (let r = 0; r < Number(RUNS); r++) {
    const ctx = await b.newContext({ ...dev, viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
    const page = await ctx.newPage();
    if (engine === 'chromium') { const c = await ctx.newCDPSession(page); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForFunction(() => document.querySelector('.hero-phone')?.dataset.armed !== undefined, null, { timeout: 90000 }); // hydration: το scroll handler του hero πρέπει να είναι οπλισμένος
    await page.evaluate(() => document.fonts.ready); await sleep(2500);
    const deltas = await page.evaluate(() => new Promise((resolve) => {
      const hero = document.querySelector('section.surface-dark');
      const end = hero.getBoundingClientRect().bottom + scrollY - innerHeight * 0.5;
      const d = []; let last = performance.now();
      const tick = (t) => { d.push(t - last); last = t; if (scrollY < end) { scrollBy(0, 10); requestAnimationFrame(tick); } else resolve(d); };
      requestAnimationFrame(tick);
    }));
    const d = deltas.slice(2);
    runs.push({ frames: d.length, p50: +pct(d, 0.5).toFixed(1), p95: +pct(d, 0.95).toFixed(1), max: +Math.max(...d).toFixed(1), over25ms: d.filter((x) => x > 25).length, over50ms: d.filter((x) => x > 50).length });
    await ctx.close();
  }
  const med = (k) => +pct(runs.map((r) => r[k]), 0.5).toFixed(1);
  out[`${w}x${h}`] = { runs, median: { p50: med('p50'), p95: med('p95'), max: med('max'), over25ms: med('over25ms'), over50ms: med('over50ms') } };
  console.log(`${engine} ${w}x${h}`, JSON.stringify(out[`${w}x${h}`].median), 'frames/run', runs[0].frames);
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
await b.close();
