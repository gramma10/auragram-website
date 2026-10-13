// One fresh page per threshold: jump to just BELOW then just ABOVE y1 + p·pin (instant scrollTo), read what is revealed. Whole probe < 1.1s after settle → timer cannot interfere.
import { webkit, devices } from 'playwright';
import fs from 'node:fs';
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const b = await webkit.launch(); const dev = devices['iPhone 12'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PP = [0.15, 0.35, 0.55, 0.72, 0.85, 0.95]; const NAME = ['msg 2', 'msg 3', 'msg 4', 'msg 5', 'chip «Ραντεβού κλείστηκε»', 'toast'];
const state = (page) => page.evaluate(() => {
  const ph = document.querySelector('.hero-phone'); const list = ph.querySelector('[aria-live="off"]');
  const msgs = [...list.children].filter((c) => c.firstElementChild.className.includes('opacity-100')).length;
  const chip = [...ph.querySelectorAll('div')].find((d) => d.className.includes('border-aura/30') && d.className.includes('shrink-0'));
  const toast = [...ph.querySelectorAll('div')].find((d) => d.className.includes('absolute') && d.textContent.includes('Νέο ραντεβού'));
  return { y: Math.round(scrollY), n: msgs - 1 + (chip.className.includes('opacity-100') ? 1 : 0) + (toast.className.includes('opacity-100') ? 1 : 0), msgs, chip: chip.className.includes('opacity-100'), toast: toast.className.includes('opacity-100'), y1: parseFloat(ph.style.getPropertyValue('--y1')) || 0, pinH: document.querySelector('.hero-pin').offsetHeight, top: Math.round(ph.getBoundingClientRect().top) };
});
for (const [w, h] of [[390, 664], [390, 844]]) {
  console.log(`\n=== ${w}x${h} ===`); let meta;
  for (let k = 0; k < 6; k++) {
    const ctx = await b.newContext({ ...dev, viewport: { width: w, height: h } }); await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
    const page = await ctx.newPage(); await page.goto('http://127.0.0.1:3011/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await sleep(3500);
    const s0 = await state(page); const { y1, pinH } = s0; meta = { y1, pinH };
    const yT = y1 + PP[k] * pinH;
    const jump = async (y) => { await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y); await sleep(450); return state(page); };
    // get to the pin start first (so that earlier steps are not what we measure): pre-position at y1 − 1 is "before settle"; below-threshold probe is yT − 8
    const below = await jump(Math.max(y1 + 1, yT - 8)); const above = await jump(yT + 8);
    await page.screenshot({ path: `${OUT}/${w}x${h}-step${k + 1}-${['msg2', 'msg3', 'msg4', 'msg5', 'chip', 'toast'][k]}.png` });
    console.log(`${NAME[k].padEnd(26)} p=${PP[k]}  scrollY ${Math.round(yT)} (y1+${Math.round(PP[k] * pinH)})  | at ${below.y}: ${below.msgs} msgs chip=${+below.chip} toast=${+below.toast}  → at ${above.y}: ${above.msgs} msgs chip=${+above.chip} toast=${+above.toast}  | phone top ${below.top}→${above.top}`);
    await ctx.close();
  }
  console.log(`y1 ${meta.y1}, pin ${meta.pinH}px (${(meta.pinH / h).toFixed(3)}vh), pinEnd ${meta.y1 + meta.pinH}`);
  const ys = [0, ...PP].map((p) => p * meta.pinH).concat(meta.pinH); const gaps = ys.slice(1).map((v, i) => Math.round(v - ys[i]));
  console.log('scroll px between visible changes during the pin (start→msg2→…→toast→pin end):', gaps.join(', '), '| max', Math.max(...gaps));
}
await b.close();
