import { webkit, devices } from 'playwright';
const b = await webkit.launch(); const dev = devices['iPhone 12']; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const st = (p) => p.evaluate(() => { const ph = document.querySelector('.hero-phone'); const list = ph.querySelector('[aria-live="off"]'); const chip = [...ph.querySelectorAll('div')].find((d) => d.className.includes('border-aura/30') && d.className.includes('shrink-0')); const toast = [...ph.querySelectorAll('div')].find((d) => d.className.includes('absolute') && d.textContent.includes('Νέο ραντεβού')); return { y: Math.round(scrollY), msgs: [...list.children].filter((c) => c.firstElementChild.className.includes('opacity-100')).length, chip: chip.className.includes('opacity-100'), toast: toast.className.includes('opacity-100'), y1: parseFloat(ph.style.getPropertyValue('--y1')), pinH: document.querySelector('.hero-pin').offsetHeight }; });
for (const [w, h] of [[390, 664], [390, 844]]) {
  const ctx = await b.newContext({ ...dev, viewport: { width: w, height: h } }); await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:3011/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500);
  const s0 = await st(p); const t0 = Date.now(); await p.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), s0.y1 + 2); // enter pin, then STOP scrolling
  const log = []; let last = ''; let toastAt = null;
  while (Date.now() - t0 < 10000) { const s = await st(p); const k = `${s.msgs}/${+s.chip}/${+s.toast}`; if (k !== last) { log.push(`${Date.now() - t0}ms→${k}`); last = k; } if (s.toast) { toastAt = Date.now() - t0; break; } await sleep(80); }
  console.log(`${w}x${h} FALLBACK (stopped at pin start): ${log.join('  ')}  | complete at ${toastAt}ms`);
  // latch: scroll into pin at 60%, then back to top → nothing hides
  const c2 = await b.newContext({ ...dev, viewport: { width: w, height: h } }); await c2.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const q = await c2.newPage(); await q.goto('http://127.0.0.1:3011/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500);
  const m = await st(q); await q.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), m.y1 + 0.6 * m.pinH); await sleep(500); const a = await st(q);
  await q.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await sleep(500); const z = await st(q);
  await q.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), m.y1 + 0.2 * m.pinH); await sleep(500); const r = await st(q);
  console.log(`   LATCH: at pin 60% → ${a.msgs} msgs chip=${+a.chip}; back to top → ${z.msgs} msgs chip=${+z.chip}; down again to 20% → ${r.msgs} msgs chip=${+r.chip} (never fewer)`);
  await ctx.close(); await c2.close();
}
await b.close();
