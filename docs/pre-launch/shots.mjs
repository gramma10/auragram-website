// Screenshots 390px (και 360px για τα labels) + μέτρηση: callout φόρμας → πόσο κατεβαίνει το κουμπί υποβολής.
// Χρήση: PW=<path προς playwright> node docs/pre-launch/shots.mjs <baseURL>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PW + '/x.js');
const { chromium } = require('playwright');
const BASE = process.argv[2]; const OUT = 'docs/pre-launch/screenshots'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hideFixed = (page, hide) => page.evaluate((hide) => document.querySelectorAll('body *').forEach((e) => {
  if (hide && getComputedStyle(e).position === 'fixed') { e.dataset.hid = e.style.visibility; e.style.visibility = 'hidden'; }
  else if (!hide && e.dataset.hid !== undefined) { e.style.visibility = e.dataset.hid; delete e.dataset.hid; }
}), hide);
const shot = async (page, loc, name) => { await hideFixed(page, true); await loc.screenshot({ path: `${OUT}/${name}` }); await hideFixed(page, false); console.log('📸', name); };
for (const w of [390, 360]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 90000 });
  // lazy sections: σκρολάρουμε μέχρι να φορτώσουν
  for (const sel of ['#pilot', '#idrytes', '#klisi']) { await page.evaluate((s) => document.querySelector(s).scrollIntoView(), sel); await sleep(1500); }
  await page.waitForSelector('#klisi form', { timeout: 30000 });
  await page.evaluate(() => document.documentElement.setAttribute('data-ready', ''));
  await sleep(800);
  await page.locator('#idrytes').scrollIntoViewIfNeeded(); await sleep(1200);
  await shot(page, page.locator('#idrytes'), `founders-${w}.png`);
  if (w === 390) {
    await page.locator('#pilot').scrollIntoViewIfNeeded(); await sleep(1200);
    await shot(page, page.locator('#pilot > div, #pilot').first(), 'pilot-390.png');
    await page.locator('#klisi').scrollIntoViewIfNeeded(); await sleep(1200);
    await shot(page, page.locator('#klisi'), 'booking-390.png');
    // μέτρηση callout
    const m = await page.evaluate(() => {
      const form = document.querySelector('#klisi form'); const btn = form.querySelector('button[type=submit]'); const c = form.querySelector('[data-live-proof]');
      // «μετά»: eyebrow κρυμμένο (mobile) + callout· «πριν»: eyebrow ορατό, χωρίς callout (η προηγούμενη διάταξη)
      const eyebrow = form.querySelector('.eyebrow');
      const withIt = btn.getBoundingClientRect().top - form.getBoundingClientRect().top;
      const h = c.getBoundingClientRect().height + parseFloat(getComputedStyle(c).marginTop);
      c.style.display = 'none'; eyebrow.style.display = 'block'; eyebrow.style.paddingBottom = '12px';
      const without = btn.getBoundingClientRect().top - form.getBoundingClientRect().top;
      c.style.display = ''; eyebrow.style.display = ''; eyebrow.style.paddingBottom = '';
      return { submitTopWith: Math.round(withIt), submitTopWithout: Math.round(without), pushPx: Math.round(withIt - without), calloutHeight: Math.round(h) };
    });
    console.log('callout push @390:', JSON.stringify(m));
    const pilotStats = await page.evaluate(() => [...document.querySelectorAll('#pilot p')].filter((p) => /1 KPI|γραμμένο|2–4 εβδομάδες|μέχρι ζωντανό/.test(p.textContent)).map((p) => p.textContent.trim()));
    console.log('pilot stats text:', JSON.stringify(pilotStats));
  }
  await ctx.close();
}
for (const w of [390, 360]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(BASE + '/about', { waitUntil: 'networkidle', timeout: 90000 });
  await sleep(1500);
  await page.evaluate(() => document.documentElement.setAttribute('data-ready', ''));
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
  await sleep(800);
  await hideFixed(page, true);
  await page.screenshot({ path: `${OUT}/about-${w}-top.png`, clip: { x: 0, y: 0, width: w, height: 2600 }, fullPage: true });
  await hideFixed(page, false);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(`📸 about-${w}-top.png  horizontal overflow: ${overflow}`);
  await ctx.close();
}
await b.close();
