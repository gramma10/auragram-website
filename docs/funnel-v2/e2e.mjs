// End-to-end δοκιμή της φόρμας (390px, iPhone 12 emulation) απέναντι στο mock webhook.
//
//   1. next build + next start -p 3101   με LEAD_WEBHOOK_URL=http://127.0.0.1:4010/exec, LEAD_WEBHOOK_SECRET=test-secret-123
//   2. node docs/funnel-v2/mock-webhook.mjs 4010
//   3. PPT=<path προς puppeteer-core> node docs/funnel-v2/e2e.mjs
//
// Βγάζει screenshots στο docs/funnel-v2/screenshots και τυπώνει PASS/FAIL ανά έλεγχο.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(process.env.PPT ? path.join(process.env.PPT, 'x.js') : import.meta.url);
const puppeteer = require('puppeteer-core');

const SITE = process.env.SITE || 'http://127.0.0.1:3101';
const MOCK = process.env.MOCK || 'http://127.0.0.1:4010';
const OUTDIR = path.join(here, 'screenshots');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(OUTDIR, { recursive: true });

let failed = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mock = (p) => fetch(MOCK + p).then((r) => r.json());

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.emulate(puppeteer.KnownDevices['iPhone 12']);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

// analytics stubs: καταγράφουν ό,τι θα έφευγε προς GA4 / Meta Pixel
await page.evaluateOnNewDocument(() => {
  window.__events = [];
  window.gtag = (...a) => window.__events.push({ via: 'gtag', args: a });
  window.fbq = (...a) => window.__events.push({ via: 'fbq', args: a });
  try {
    localStorage.setItem('aura-consent', 'denied'); // κρύβει το cookie banner
  } catch {}
});
const events = () => page.evaluate(() => window.__events);

// τα fixed στοιχεία (nav, dock, progress) κρύβονται στα element screenshots — αλλιώς «κολλάνε» πάνω στη φόρμα
const hideFixed = (hide) =>
  page.evaluate((hide) => {
    document.querySelectorAll('body *').forEach((e) => {
      if (hide && getComputedStyle(e).position === 'fixed') {
        e.dataset.hid = e.style.visibility;
        e.style.visibility = 'hidden';
      } else if (!hide && e.dataset.hid !== undefined) {
        e.style.visibility = e.dataset.hid;
        delete e.dataset.hid;
      }
    });
  }, hide);
const shot = async (el, name) => {
  await hideFixed(true);
  await el.screenshot({ path: path.join(OUTDIR, name) });
  await hideFixed(false);
  console.log('      📸', name);
};

await mock('/__reset');

// ── 1. φόρτωση με UTM + deep link κλάδου + χρήση του calculator ─────────────
await page.goto(`${SITE}/?utm_source=instagram&utm_medium=reels&utm_campaign=reel-test&industry=iatreia`, { waitUntil: 'networkidle0' });
for (let i = 0; i < 4 && !(await page.$('#calc-grid input[type=range]')); i++) {
  // το calculator είναι lazy (IntersectionObserver): σκρολάρουμε σταδιακά ώσπου να φορτώσει
  await page.evaluate(() => window.scrollTo(0, (document.getElementById('calc-grid')?.getBoundingClientRect().top ?? 0) + scrollY - 100 + Math.random()));
  await sleep(1500);
}
await page.waitForSelector('#calc-grid input[type=range]', { timeout: 20000 });
const slider = await page.$('#calc-grid input[type=range]');
await slider.focus();
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');

await page.evaluate(() => document.getElementById('klisi')?.scrollIntoView());
await page.waitForSelector('#klisi form', { timeout: 15000 });
await sleep(800);
const form = await page.$('#klisi form');

// ── 2. κενή φόρμα ───────────────────────────────────────────────────────────
await shot(form, '01-form-empty.png');
check('CTA label (submit) byte-identical', (await page.$eval('#klisi form button[type=submit]', (b) => b.textContent.trim())) === 'Ζητήστε τον Χάρτη AI — 30′ δωρεάν');
check('form has no calendar copy', !/ημερολόγ|ΒΗΜΑ 01/.test(await page.$eval('#klisi form', (f) => f.textContent)));
check('consent line + link to /privacy', (await page.$eval('#klisi form a[href="/privacy"]', (a) => a.textContent)) === 'Πολιτική απορρήτου');
check('no pre-ticked checkbox', (await page.$$('#klisi form input[type=checkbox]')).length === 0);
check('call-promise text under the button', (await page.$eval('#klisi form', (f) => f.textContent)).includes('Θα σας καλέσουμε σήμερα ή την επόμενη εργάσιμη για να δούμε αν ταιριάζουμε. Χωρίς πωλήσεις.'));

// ── 3. validation errors (client, χωρίς κλήση στον server) ──────────────────
await page.click('#klisi form button[type=submit]');
await sleep(400);
check('empty submit → 4 inline errors', (await page.$$('#klisi form [id$="-error"]')).length === 4);
await shot(form, '02-form-errors-empty.png');
check('empty submit did NOT reach the webhook', (await mock('/__received')).hits === 0);

await page.type('#name', 'Μαρία');
await page.type('#phone', '12345');
await page.type('#email', 'maria@');
await page.click('#klisi form button[type=submit]');
await sleep(300);
const errTexts = await page.$$eval('#klisi form [id$="-error"]', (els) => els.map((e) => e.textContent));
console.log('      errors:', JSON.stringify(errTexts));
check('invalid phone & email & business errors in Greek', errTexts.length === 3 && errTexts.some((t) => t.startsWith('Γράψτε ένα ελληνικό κινητό')));
await shot(form, '03-form-errors-invalid.png');

// ── 4. έγκυρη φόρμα (με κενά στο κινητό, κεφαλαία στο email, 2 chips) ──────
await page.$eval('#phone', (e) => (e.value = ''));
await page.type('#phone', '691 234 5678'); // με κενά → +306912345678
await page.$eval('#email', (e) => (e.value = ''));
await page.type('#email', 'Maria@Example.gr');
await page.type('#business', 'Οδοντιατρείο, 5 άτομα');
const chips = await page.$$('#klisi form fieldset button');
await chips[0].click(); // «Χάνω leads»
await chips[6].click(); // τζίρος

// ── 5. «submitting» (αργό webhook) ─────────────────────────────────────────
await mock('/__mode?m=slow');
await sleep(3200); // > 3″ από την εμφάνιση
await page.click('#klisi form button[type=submit]');
await sleep(700);
check('button shows «Στέλνουμε…» and is disabled while sending', (await page.$eval('#klisi form button[type=submit]', (b) => b.textContent.trim() + '|' + b.disabled)) === 'Στέλνουμε…|true');
await shot(form, '04-form-submitting.png');

// ── 6. επιτυχία → /confirmation ────────────────────────────────────────────
await page.waitForFunction(() => location.pathname === '/confirmation', { timeout: 20000 });
await page.waitForSelector('h1');
await sleep(800);
const h1 = await page.$eval('h1', (h) => h.textContent);
const bodyText = await page.evaluate(() => document.body.innerText);
check('confirmation headline has first name', h1 === 'Λάβαμε το αίτημά σας, Μαρία.', h1);
check('confirmation message', bodyText.includes('Θα σας καλέσει ο Παναγιώτης ή ο Χρήστος σήμερα ή την επόμενη εργάσιμη. Σας στείλαμε και email επιβεβαίωσης.'));
check('confirmation shows both numbers', bodyText.includes('698 171 8440') && bodyText.includes('694 323 2385') && bodyText.includes('αποθηκεύστε τα για να σηκώσετε'));
await page.screenshot({ path: path.join(OUTDIR, '05-confirmation-success.png') });
console.log('      📸 05-confirmation-success.png');
await page.screenshot({ path: path.join(OUTDIR, '05b-confirmation-full.png'), fullPage: true });

const ev = (await events()).filter((e) => /lead_submit|Lead/.test(JSON.stringify(e.args)));
console.log('      events after success:', JSON.stringify(ev));
check('lead_submit fired exactly once via gtag', ev.filter((e) => e.via === 'gtag' && e.args[1] === 'lead_submit').length === 1);
check('Meta Pixel got standard Lead (track), not custom', ev.some((e) => e.via === 'fbq' && e.args[0] === 'track' && e.args[1] === 'Lead') && !ev.some((e) => e.via === 'fbq' && e.args[0] === 'trackCustom' && e.args[1] === 'lead_submit'));
const lp = ev.find((e) => e.via === 'gtag').args[2];
check('lead_submit params = industry, utm_source, utm_campaign, has_calculator', JSON.stringify(Object.keys(lp).sort()) === JSON.stringify(['has_calculator', 'industry', 'utm_campaign', 'utm_source']) && lp.has_calculator === true && lp.utm_source === 'instagram' && lp.industry === 'iatreia', JSON.stringify(lp));
check('no booking_complete / form_submit events anywhere', !(await events()).some((e) => /booking_complete|form_submit/.test(JSON.stringify(e.args))));

// ── 7. τι έφτασε στο webhook ───────────────────────────────────────────────
const got = await mock('/__received');
check('webhook got exactly 1 lead', got.hits === 1 && got.received.length === 1, `hits=${got.hits}`);
const r = got.received[0];
check('Content-Type text/plain', /^text\/plain/.test(r.contentType), r.contentType);
check('no x-auragram-secret header', r.hasSecretHeader === false);
const p = r.payload;
check('phone normalised', p.phone === '+306912345678', p.phone);
check('email lower-cased', p.email === 'maria@example.gr');
check('submittedAt ISO Europe/Athens', /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+0[23]:00$/.test(p.submittedAt), p.submittedAt);
check('reasons array + revenue + industryViewed + page', Array.isArray(p.reasons) && p.reasons[0] === 'Χάνω leads' && p.revenue && p.industryViewed === 'iatreia' && p.page === '/', JSON.stringify([p.reasons, p.revenue, p.industryViewed, p.page]));
check('calculator object', p.calculator && typeof p.calculator.lostRevenue === 'number');
check('utm object', p.utm.utm_source === 'instagram' && p.utm.utm_medium === 'reels' && p.utm.utm_campaign === 'reel-test' && p.utm.landing === '/');
fs.writeFileSync(path.join(here, 'payload-example.json'), JSON.stringify({ secret: '«REDACTED»', ...p }, null, 2));

// ── 8. δεύτερο αίτημα με το ίδιο κινητό → όριο 1/24ω ───────────────────────
await mock('/__mode?m=ok');
await page.goto(`${SITE}/`, { waitUntil: 'networkidle0' });
async function fillAndSubmit(phone, { wait = 3300 } = {}) {
  await page.evaluate(() => document.getElementById('klisi')?.scrollIntoView());
  await page.waitForSelector('#klisi form', { timeout: 15000 });
  await page.$eval('#klisi form', (f) => f.reset());
  await page.type('#name', 'Γιώργος Νικολάου');
  await page.type('#phone', phone);
  await page.type('#email', 'giorgos@example.gr');
  await page.type('#business', 'Συνεργείο');
  await sleep(wait);
  await page.click('#klisi form button[type=submit]');
}
await fillAndSubmit('6912345678');
await page.waitForSelector('#klisi form [role=alert]', { timeout: 15000 });
const dup = await page.$eval('#klisi form [role=alert]', (a) => a.textContent);
check('same phone again within 24h → polite refusal', dup.startsWith('Έχουμε ήδη το αίτημά σας'), dup);
check('…and it did not reach the webhook', (await mock('/__received')).hits === 1);

// ── 9. αποτυχία παράδοσης → error state, ΟΧΙ success, ΟΧΙ lead_submit ──────
await mock('/__mode?m=fail500');
const before = (await mock('/__received')).hits;
await page.goto(`${SITE}/`, { waitUntil: 'networkidle0' });
await fillAndSubmit('6987654321');
await page.waitForSelector('#klisi form [role=alert]', { timeout: 30000 });
const errMsg = await page.$eval('#klisi form [role=alert]', (a) => a.textContent);
await sleep(300);
check('delivery failure shows the Greek error', errMsg === 'Κάτι πήγε στραβά στην αποστολή. Δοκιμάστε ξανά σε λίγο.', errMsg);
check('still on the form page (no success)', new URL(page.url()).pathname === '/');
check('retry: webhook hit twice on 5xx', (await mock('/__received')).hits - before === 2, `hits +${(await mock('/__received')).hits - before}`);
check('NO lead_submit after failure', !(await events()).some((e) => /lead_submit/.test(JSON.stringify(e.args))));
await shot(await page.$('#klisi form'), '06-form-error-state.png');

// ── 9b. λάθος secret (ok:false από το Apps Script) και HTML αντί για JSON → error state, χωρίς retry ──
for (const m of ['reject', 'badjson']) {
  await mock(`/__mode?m=${m}`);
  const h = (await mock('/__received')).hits;
  await page.click('#klisi form button[type=submit]');
  await page.waitForFunction(() => document.querySelector('#klisi form button[type=submit]')?.textContent.includes('Ζητήστε') && !document.querySelector('#klisi form button[type=submit]').disabled);
  await sleep(1200);
  const msg = await page.$eval('#klisi form [role=alert]', (a) => a.textContent);
  check(`webhook "${m}" → error state, no success`, msg.startsWith('Κάτι πήγε στραβά') && new URL(page.url()).pathname === '/', msg);
  void h;
}

// ── 10. η αποτυχία δεν «έκαψε» το όριο: ξανά με ok → περνά ─────────────────
await mock('/__mode?m=ok');
await page.click('#klisi form button[type=submit]');
await page.waitForFunction(() => location.pathname === '/confirmation', { timeout: 20000 });
const got2 = await mock('/__received');
check('after recovery the same phone is accepted (slot was released)', got2.received.some((x, i) => i > 0 && x.payload.phone === '+306987654321'));
check('lead_submit fires only now', (await events()).filter((e) => e.via === 'gtag' && e.args[1] === 'lead_submit').length === 1);

// ── 10b. υποβολή < 3″ από την εμφάνιση → απορρίπτεται, δεν φτάνει στο webhook ─
await page.goto(`${SITE}/`, { waitUntil: 'networkidle0' });
{
  const h = (await mock('/__received')).hits;
  await fillAndSubmit('6922222222', { wait: 0 });
  await page.waitForSelector('#klisi form [role=alert]', { timeout: 15000 });
  const fast = await page.$eval('#klisi form [role=alert]', (a) => a.textContent);
  check('submit < 3s after the form became visible is rejected (soft message)', fast === 'Δοκιμάστε ξανά σε λίγο.', fast);
  check('…and never reaches the webhook', (await mock('/__received')).hits === h);
  await sleep(3300);
  await page.click('#klisi form button[type=submit]'); // ο ίδιος άνθρωπος ξαναπατά → περνά
  await page.waitForFunction(() => location.pathname === '/confirmation', { timeout: 20000 });
  check('pressing again after 3s succeeds', (await mock('/__received')).hits === h + 1);
}

// ── 11. honeypot ───────────────────────────────────────────────────────────
await page.goto(`${SITE}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.getElementById('klisi')?.scrollIntoView());
await page.waitForSelector('#klisi form');
const hits0 = (await mock('/__received')).hits;
await page.type('#name', 'Bot Botsakis');
await page.type('#phone', '6900000001');
await page.type('#email', 'bot@example.gr');
await page.type('#business', 'spam');
await page.$eval('#website', (e) => (e.value = 'http://spam.example'));
await sleep(3300);
await page.click('#klisi form button[type=submit]');
await sleep(2500);
check('honeypot: nothing forwarded to the webhook', (await mock('/__received')).hits === hits0);

// ── 12. /confirmation χωρίς υποβολή: ΧΩΡΙΣ τηλέφωνα ───────────────────────
const ctx = await browser.createBrowserContext();
const fresh = await ctx.newPage();
await fresh.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await fresh.goto(`${SITE}/confirmation`, { waitUntil: 'networkidle0' });
await sleep(500);
const freshText = await fresh.evaluate(() => document.body.innerText);
check('/confirmation visited directly shows NO phone numbers', !/698 171 8440|694 323 2385/.test(freshText));
await fresh.close();

// ── 13. /privacy @390 ──────────────────────────────────────────────────────
await page.goto(`${SITE}/privacy`, { waitUntil: 'networkidle0' });
await page.screenshot({ path: path.join(OUTDIR, '07-privacy-390.png'), fullPage: true });
console.log('      📸 07-privacy-390.png');
const priv = await page.evaluate(() => document.body.innerText);
check('/privacy has both controller names, e-mail, no phones, no literal {{', priv.includes('Παναγιώτης Γραμματικού') && priv.includes('Χρήστος Αβραμίδης') && priv.includes('auragram.web@gmail.com') && !/698 171|694 323|\{\{/.test(priv));

await browser.close();
console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);
