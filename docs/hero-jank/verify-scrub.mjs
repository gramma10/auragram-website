// Έλεγχος της scrubbing συνομιλίας στο mobile hero (WebKit, iPhone 12): step ↔ θέση scroll, αντιστρεψιμότητα, past-the-pin, idle fallback, reduced motion.
// Χρήση: PW=<path προς playwright> node docs/hero-jank/verify-scrub.mjs <baseURL>
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW + '/x.js');
const { webkit, devices } = require('playwright');
const BASE = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, extra = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };

const state = (page) => page.evaluate(() => {
  const ph = document.querySelector('.hero-phone');
  const list = ph.querySelector('[aria-live="off"]');
  const msgs = [...list.children].filter((c) => c.firstElementChild.className.includes('opacity-100')).length;
  const chip = [...ph.querySelectorAll('div')].find((d) => d.className.includes('border-aura/30') && d.className.includes('shrink-0'));
  const toast = [...ph.querySelectorAll('div')].find((d) => d.className.includes('absolute') && d.textContent.includes('Νέο ραντεβού'));
  const c = chip.className.includes('opacity-100') ? 1 : 0, t = toast.className.includes('opacity-100') ? 1 : 0;
  return { n: msgs - 1 + c + t, msgs, chip: !!c, toast: !!t, y: Math.round(scrollY), y1: parseFloat(ph.style.getPropertyValue('--y1')) || 0, pinH: document.querySelector('.hero-pin').offsetHeight };
});

// Το headless WebKit σε αυτό το μηχάνημα είναι αργό (frames 0.3–0.7s): αντί για σταθερό sleep, περιμένουμε (έως 8s) να φτάσει το ΑΝΑΜΕΝΟΜΕΝΟ βήμα.
// Αν δεν φτάσει ποτέ, επιστρέφεται η τελευταία τιμή (→ FAIL).
const at = async (page, y, expected) => {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(y));
  const t0 = Date.now(); let n;
  do { await sleep(120); n = (await state(page)).n; } while (n !== expected && Date.now() - t0 < 8000);
  return n;
};

const b = await webkit.launch();
const dev = devices['iPhone 12'];
for (const [w, h] of [[390, 664], [390, 844]]) {
  console.log(`\n=== ${w}x${h} ===`);
  const ctx = await b.newContext({ ...dev, viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => document.querySelector('.hero-phone')?.dataset.armed !== undefined, null, { timeout: 90000 }); // hydration
  await page.evaluate(() => document.fonts.ready); await sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 5)); await sleep(300);
  const s0 = await state(page);
  const { y1, pinH } = s0;
  check('pin spacer = 540px', pinH === 540, `pinH=${pinH}`);
  check('at the top only message 1 is visible', s0.n === 0, JSON.stringify(s0));

  // forward: step n at y1 + 90n (middle of its 90px band)
  const fwd = [];
  for (let n = 0; n <= 6; n++) fwd.push(await at(page, y1 + 90 * n, n));
  check('scrolling DOWN reveals steps 0..6 in order (one per 90px)', fwd.join() === '0,1,2,3,4,5,6', fwd.join());
  // reverse
  const rev = [];
  for (let n = 6; n >= 0; n--) rev.push(await at(page, y1 + 90 * n, n));
  check('scrolling UP hides them again (6..0) — reversible', rev.join() === '6,5,4,3,2,1,0', rev.join());
  // band edges: thresholds at (n-½)·90
  const edge = [];
  for (const [off, exp] of [[44, 0], [46, 1], [134, 1], [136, 2], [494, 5], [496, 6]]) edge.push(await at(page, y1 + off, exp));
  check('step thresholds at 45 / 135 / … / 495px into the pin', edge.join() === '0,1,1,2,5,6', edge.join());
  // transition: 200ms opacity + translateY
  const tr = await page.evaluate(() => { const el = document.querySelector('.hero-phone [aria-live="off"] > div > div'); const cs = getComputedStyle(el); return { dur: cs.transitionDuration, props: cs.transitionProperty }; });
  check('bubble transition is 200ms (opacity/transform/max-height/padding)', /^0\.2s/.test(tr.dur) && /opacity/.test(tr.props) && /transform/.test(tr.props), JSON.stringify(tr));
  // scroll past the pin → complete
  await at(page, y1 + pinH + 400, 6);
  const past = await state(page);
  check('past the pin → completed conversation (6 steps, toast shown)', past.n === 6 && past.toast, JSON.stringify(past));
  // back to the top → collapses again
  check('back at the top → only message 1', (await at(page, 3, 0)) === 0);

  // idle fallback: stay inside the pin. Οι χρόνοι μετριούνται ΜΕΣΑ στη σελίδα (MutationObserver + performance.now) — το headless WebKit εδώ είναι αργό
  // και τα polling από έξω θα μετρούσαν την καθυστέρηση του ίδιου του test.
  await at(page, y1 + 20, 0);
  await sleep(500);
  await page.evaluate(() => {
    window.__tl = [];
    const ph = document.querySelector('.hero-phone');
    const count = () => {
      const list = ph.querySelector('[aria-live="off"]');
      const msgs = [...list.children].filter((c) => c.firstElementChild.className.includes('opacity-100')).length;
      const chip = [...ph.querySelectorAll('div')].find((d) => d.className.includes('border-aura/30') && d.className.includes('shrink-0'));
      const toast = [...ph.querySelectorAll('div')].find((d) => d.className.includes('absolute') && d.textContent.includes('Νέο ραντεβού'));
      return msgs - 1 + (chip.className.includes('opacity-100') ? 1 : 0) + (toast.className.includes('opacity-100') ? 1 : 0);
    };
    window.__t0 = performance.now(); let last = count(); window.__tl.push([0, last]);
    new MutationObserver(() => { const n = count(); if (n !== last) { last = n; window.__tl.push([Math.round((performance.now() - window.__t0) / 100) / 10, n]); } })
      .observe(ph, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  await sleep(12500);
  const seen = await page.evaluate(() => window.__tl);
  console.log('      idle timeline [t(s), step]:', JSON.stringify(seen));
  const firstAdv = seen.find((x) => x[1] === 1);
  const gaps = seen.slice(1).map((x, i) => +(x[0] - (seen[i][0])).toFixed(1));
  check('idle: first auto-step ≈3s after the last scroll, then +1 step/s up to the full conversation',
    firstAdv && firstAdv[0] >= 2.2 && firstAdv[0] <= 4.2 && seen[seen.length - 1][1] === 6 && gaps.slice(1).every((g) => g >= 0.9 && g <= 1.3), JSON.stringify({ first: firstAdv, gaps }));
  // any scroll cancels the auto-advance and position defines the state again
  const back = await at(page, y1 + 26, 0); // (θέση διαφορετική από πριν → υπάρχει πραγματικό scroll event)
  await sleep(1500);
  const stillZero = (await state(page)).n;
  check('after a scroll: state = scroll position again (step 0) and no auto-advance for the next 3s', back === 0 && stillZero === 0, `${back},${stillZero}`);
  await ctx.close();
}

// reduced motion: final static state, no pin
{
  const ctx = await b.newContext({ ...dev, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => document.querySelectorAll('.hero-phone [aria-live="off"] > div > div.opacity-100').length >= 5, null, { timeout: 30000 }).catch(() => {}); // hydration
  const s = await state(page);
  const pos = await page.evaluate(() => getComputedStyle(document.querySelector('.hero-phone')).position + '|' + document.querySelector('.hero-pin').offsetHeight);
  check('reduced motion: full conversation shown statically, no sticky/pin', s.n === 6 && pos === 'relative|0', JSON.stringify(s) + ' ' + pos);
  await ctx.close();
}
await b.close();
console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);
