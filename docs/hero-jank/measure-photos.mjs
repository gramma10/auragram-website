// Ανάλυση φωτογραφιών ιδρυτών: πηγή, rendered μέγεθος (CSS px) και pixels που ζητά η συσκευή, για 390px (DPR 3) και 1440px (DPR 1 & 2).
// Χρήση: PW=<path προς playwright> node docs/hero-jank/measure-photos.mjs <baseURL>
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW + '/x.js');
const { webkit, chromium } = require('playwright');
const BASE = process.argv[2];
const cases = [
  { name: '390px / DPR 3 (iPhone)', w: 390, h: 844, dpr: 3, engine: 'webkit', mobile: true },
  { name: '1440px / DPR 1', w: 1440, h: 900, dpr: 1, engine: 'chromium' },
  { name: '1440px / DPR 2 (retina)', w: 1440, h: 900, dpr: 2, engine: 'chromium' },
];
for (const c of cases) {
  const b = c.engine === 'webkit' ? await webkit.launch() : await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: c.dpr, isMobile: !!c.mobile, hasTouch: !!c.mobile });
  await ctx.addInitScript(() => localStorage.setItem('aura-consent', 'denied'));
  for (const path of ['/', '/about']) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 90000 });
    await page.evaluate(() => { document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.scrollIntoView()); });
    await page.evaluate(() => { const i = document.querySelector('img[src*="founders"], img[srcset*="founders"], img[src*="christos"], img[srcset*="christos"]'); i?.scrollIntoView({ block: 'center' }); });
    await new Promise((r) => setTimeout(r, 6000));
    const rows = await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => /Χρήστος|Παναγιώτης/.test(i.alt)).map((i) => {
      const box = i.parentElement.getBoundingClientRect();
      const nw = i.naturalWidth, nh = i.naturalHeight; const dpr = devicePixelRatio;
      const scale = Math.max(box.width / nw, box.height / nh) * 1; // cover scale (CSS px per source px, when rendered at natural size)
      const dispW = nw * scale, dispH = nh * scale; // painted image size in CSS px (cover)
      const u = new URL(i.currentSrc || i.src);
      return { who: i.alt.startsWith('Χρ') ? 'Χρήστος' : 'Παναγιώτης', box: `${Math.round(box.width)}×${Math.round(box.height)}`, painted: `${Math.round(dispW)}×${Math.round(dispH)}`, needDevicePx: `${Math.round(dispW * dpr)}×${Math.round(dispH * dpr)}`, served: `w=${u.searchParams.get('w')} q=${u.searchParams.get('q')}`, servedNatural: `${nw}×${nh}`, filter: getComputedStyle(i).filter, transform: getComputedStyle(i).transform };
    }));
    console.log(`${c.name}  ${path}`); rows.forEach((r) => console.log('   ', JSON.stringify(r)));
    await page.close();
  }
  await b.close();
}
