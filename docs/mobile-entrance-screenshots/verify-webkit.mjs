// WebKit (Playwright) iPhone 12 hero check: wheel-scroll, screenshots, overlap + frame sampling
import { webkit, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const URL = process.argv[3] || 'http://localhost:3011/';
const SIZES = (process.argv[4] || '390x664,390x844,375x635,390x724').split(',').map((s) => s.split('x').map(Number));
const CONSENT = process.argv[5] || 'denied'; // 'denied' | 'none'
fs.mkdirSync(OUT, { recursive: true });
const dev = devices['iPhone 12'];
const browser = await webkit.launch();
const MOBILE = process.env.NOMOBILE ? false : true;
const scrollBy = async (page, w, h, dy) => {
  if (MOBILE) { const n = Math.max(1, Math.round(dy / 40)); for (let k = 0; k < n; k++) await page.keyboard.press('ArrowDown'); }
  else { await page.mouse.move(w / 2, h / 2); await page.mouse.wheel(0, dy); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [w, h] of SIZES) {
  const tag = `${w}x${h}${CONSENT === 'none' ? '-banner' : ''}`;
  const ctx = await browser.newContext({ ...dev, isMobile: MOBILE, viewport: { width: w, height: h }, screen: { width: w, height: h } });
  if (CONSENT !== 'none') await ctx.addInitScript(() => { try { localStorage.setItem('aura-consent', 'denied'); } catch {} });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  pageerror', e.message));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('html[data-js]');
  await sleep(2500);

  const geo = () => page.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), left: +b.left.toFixed(1), right: +b.right.toFixed(1) }; };
    const sec = document.querySelector('section');
    const phone = document.querySelector('.hero-phone');
    const cap = document.querySelector('.hero-caption');
    const proof = sec.querySelector('dl');
    const cta = document.querySelector('[data-cta="hero"]');
    const h1 = document.querySelector('h1');
    const banner = document.querySelector('[role="dialog"], [data-cookie]');
    const cs = getComputedStyle(phone);
    return {
      vh: innerHeight, vw: innerWidth, sy: Math.round(scrollY), h1fs: getComputedStyle(h1).fontSize,
      cta: r(cta), phone: r(phone), cap: r(cap), proof: r(proof), h1: r(h1), banner: r(banner),
      phoneOpacity: cs.opacity, phoneTransform: cs.transform,
      entered: phone.hasAttribute('data-entered'), settled: phone.hasAttribute('data-settled'),
      docW: document.documentElement.scrollWidth,
      heroTextOpacity: getComputedStyle(h1.parentElement).opacity,
    };
  });

  const g0 = await geo();
  console.log(`\n=== ${tag} ===`);
  console.log('TOP: h1 font', g0.h1fs, 'CTA', JSON.stringify(g0.cta), 'vh', g0.vh, 'CTA bottom margin to fold =', (g0.vh - g0.cta.bottom).toFixed(1), 'banner', JSON.stringify(g0.banner), 'phone.top', g0.phone.top, 'docW', g0.docW);
  await page.screenshot({ path: path.join(OUT, `${tag}-1-top.png`) });

  // Real wheel scrolling in small steps until the phone is entered
  const entry = { shot: false };
  let frames = [];
  let shotEntered = false;
  for (let i = 0; i < 80; i++) {
    await scrollBy(page, w, h, 40);
    await sleep(60);
    const g = await geo();
    frames.push({ sy: g.sy, ph: g.phone.top, op: g.phoneOpacity, h1o: g.heroTextOpacity });
    if (g.entered && !shotEntered) {
      shotEntered = true;
      await page.screenshot({ path: path.join(OUT, `${tag}-2-enter.png`) });
      console.log('ENTER at scrollY', g.sy, 'phone.top', g.phone.top, 'phone.bottom', g.phone.bottom, 'vh', g.vh, 'visible frac', (Math.min(g.vh, g.phone.bottom) - Math.max(0, g.phone.top)) / (g.phone.bottom - g.phone.top));
      break;
    }
  }
  if (!shotEntered) console.log('!! never entered');
  // transition end
  await sleep(1000);
  const gs = await geo();
  console.log('SETTLED?', gs.settled, 'phoneOpacity', gs.phoneOpacity, 'transform', gs.phoneTransform);
  // bring the phone fully into view: scroll so phone is vertically centred
  const delta = gs.phone.top - 100;
  await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'instant' }), delta);
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, `${tag}-3-entrance-end.png`) });
  // wait for the conversation to end (toast visible)
  await page.waitForFunction(() => {
    const t = [...document.querySelectorAll('.hero-phone div')].find((d) => d.textContent?.includes('Νέο ραντεβού') && d.className.includes('absolute'));
    return t && getComputedStyle(t).opacity === '1';
  }, null, { timeout: 15000 }).catch(() => console.log('!! toast never shown'));
  await sleep(700);
  const ge = await geo();
  await page.screenshot({ path: path.join(OUT, `${tag}-4-conversation-end.png`) });
  const msgs = await page.evaluate(() => {
    const ph = document.querySelector('.hero-phone');
    const toast = [...ph.querySelectorAll('div')].find((d) => d.textContent?.includes('Νέο ραντεβού') && d.className.includes('absolute'));
    const tb = toast.getBoundingClientRect();
    const screenEl = ph.querySelector('[aria-live="off"]');
    const sb = screenEl.getBoundingClientRect();
    const bubbles = [...screenEl.querySelectorAll('div.max-w-\\[86\\%\\]')].filter((b) => getComputedStyle(b).opacity === '1').map((b) => b.getBoundingClientRect());
    const overlap = bubbles.filter((b) => !(b.right < tb.left || b.left > tb.right || b.bottom < tb.top || b.top > tb.bottom)).length;
    return { shown: bubbles.length, listScrollable: screenEl.scrollHeight - screenEl.clientHeight, toast: { top: tb.top, bottom: tb.bottom, left: tb.left, right: tb.right }, listTop: sb.top, bubblesOverlappingToast: overlap, vwRight: innerWidth };
  });
  console.log('END: ', JSON.stringify(msgs));
  // bring caption + proof bar into view
  await page.evaluate(() => document.querySelector('.hero-caption').scrollIntoView({ block: 'center' }));
  await sleep(400);
  const gc = await geo();
  await page.screenshot({ path: path.join(OUT, `${tag}-5-caption-proof.png`) });
  console.log('CAPTION bottom', gc.cap.bottom, 'PROOF top', gc.proof.top, 'clearance', (gc.proof.top - gc.cap.bottom).toFixed(1), '| docW', gc.docW, 'vw', gc.vw);
  // text opacity always 1 during scroll
  console.log('hero text opacity min over scroll:', Math.min(...frames.map((f) => +f.h1o)));
  await ctx.close();
}
await browser.close();
