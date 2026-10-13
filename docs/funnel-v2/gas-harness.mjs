// Offline harness για το docs/apps-script/Code.gs: τρέχει τον ΠΡΑΓΜΑΤΙΚΟ κώδικα μέσα σε node:vm με mock των υπηρεσιών Google
// (SpreadsheetApp, MailApp, LockService, CacheService, PropertiesService, ContentService, Utilities).
// ΔΕΝ αντικαθιστά τη δοκιμή `testLead()` μέσα στο Apps Script — ελέγχει μόνο τη λογική (secret, validation, σειρά στηλών,
// γραμμή 2, emails, dedupe, ⚠️ Αποτυχία lead).  Χρήση: node docs/funnel-v2/gas-harness.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(here, '..', 'apps-script', 'Code.gs'), 'utf8');

let failed = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
};

function makeEnv({ failMail = false } = {}) {
  const props = { LEAD_SECRET: 's3cret', NOTIFY_EMAILS: 'pan@example.com, chr@example.com' };
  const mails = [];
  const cacheData = {};
  // φύλλο: rows[0] = γραμμή 1 (headers) …
  const sheet = {
    rows: [],
    frozen: 0,
    validations: [],
    formulas: {},
    rules: null,
    maxRows: 1000,
    getMaxRows() { return this.maxRows; },
    getLastRow() { return this.rows.length; },
    setFrozenRows(n) { this.frozen = n; },
    insertRowBefore(n) { this.rows.splice(n - 1, 0, new Array(17).fill('')); },
    setColumnWidth() {}, setRowHeight() {},
    setConditionalFormatRules(r) { this.rules = r; },
    setName(n) { this.name = n; return this; },
    getRange(r, c, nr = 1, nc = 1) {
      const s = this;
      const api = new Proxy({}, {
        get(_t, prop) {
          if (prop === 'setValues') return (v) => { while (s.rows.length < r + nr - 1) s.rows.push(new Array(17).fill('')); v.forEach((row, i) => row.forEach((x, j) => (s.rows[r - 1 + i][c - 1 + j] = x))); return api; };
          if (prop === 'setFormula') return (f) => { s.formulas[`${r},${c}`] = f; return api; };
          if (prop === 'setDataValidation') return (v) => { s.validations.push({ r, c, v }); return api; };
          return () => api; // setFontWeight, setNumberFormat, clearFormat, setBackground, …
        },
      });
      return api;
    },
  };
  const ss = { getId: () => 'SSID', getUrl: () => 'https://docs.google.com/spreadsheets/d/SSID', setSpreadsheetTimeZone() {}, getSheets: () => [sheet], getSheetByName: (n) => (sheet.name === n ? sheet : null), insertSheet: (n) => { sheet.name = n; return sheet; } };
  const chain = () => { const o = { requireValueInList: () => o, setAllowInvalid: () => o, build: () => ({ list: true }), whenFormulaSatisfied: (f) => { o.f = f; return o; }, setBackground: () => o, setRanges: () => o, build2: null }; o.build = () => ({ f: o.f }); return o; };
  const ctx = {
    console, Logger: { log() {} },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, newDataValidation: chain, newConditionalFormatRule: chain },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null, setProperty: (k, v) => (props[k] = v) }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cacheData[k] ?? null, put: (k, v) => (cacheData[k] = v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    MailApp: { getRemainingDailyQuota: () => 100, sendEmail: (m) => { if (failMail) throw new Error('quota'); mails.push(m); } },
    ContentService: { MimeType: { JSON: 'JSON' }, createTextOutput: (t) => ({ t, setMimeType() { return this; }, getContent: () => t }) },
    Utilities: { formatDate: (d, tz, f) => `${d.toISOString()}|${tz}|${f}` },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { ctx, sheet, mails, props };
}

const lead = (o = {}) => ({
  secret: 's3cret',
  id: 'abc-1',
  submittedAt: '2026-10-13T14:05:09+03:00',
  name: 'Μαρία Παπαδοπούλου',
  phone: '+306912345678',
  email: 'maria@example.gr',
  business: 'Οδοντιατρείο, 5 άτομα',
  reasons: ['Χάνω leads'],
  revenue: '50.000 – 150.000€',
  industryViewed: 'iatreia',
  calculator: { leads: 60, responseRate: 30, avgValue: 400, hoursPerWeek: 12, lostRevenue: 5880.4, hoursPerMonth: 52.2, timeValue: 1300 },
  utm: { utm_source: 'instagram', utm_medium: 'reels', utm_campaign: 'reel-test', landing: '/' },
  page: '/',
  ...o,
});
const post = (env, payload) => JSON.parse(env.ctx.doPost({ postData: { contents: typeof payload === 'string' ? payload : JSON.stringify(payload) } }).getContent());

// 1. wrong / missing secret, bad JSON → ok:false, no row, NO email
{
  const e = makeEnv();
  check('wrong secret → {ok:false}', post(e, lead({ secret: 'nope' })).ok === false);
  check('missing secret → {ok:false}', post(e, (({ secret, ...r }) => r)(lead())).ok === false);
  check('bad JSON → {ok:false}', post(e, 'not json').ok === false);
  check('…no rows written, no emails sent', e.sheet.rows.length === 0 && e.mails.length === 0);
}

// 2. happy path
{
  const e = makeEnv();
  e.ctx.setup();
  check('setup: header row A–Q in order', e.sheet.rows[0].join('|') === 'Ημερομηνία|Status|Ανάθεση|Όνομα|Κινητό|Email|Επιχείρηση / κλάδος|Λόγοι|Τζίρος|Κλάδος που είδε|Χαμένα €/μήνα (calculator)|Ώρες/μήνα (calculator)|Πηγή (utm_source)|Καμπάνια (utm_campaign / Reel)|Σελίδα|Επόμενο βήμα|Σημειώσεις');
  check('setup: header frozen', e.sheet.frozen === 1);
  check('setup: Status dropdown has the 7 values (validation on col B) + Ανάθεση (col C)', e.sheet.validations.some((v) => v.c === 2) && e.sheet.validations.some((v) => v.c === 3));
  check('setup: conditional formatting for Νέο / Qualified / Δεν ταιριάζει', e.sheet.rules?.length === 3 && e.sheet.rules.map((r) => r.f).join(',') === '=$B2="Νέο",=$B2="Qualified",=$B2="Δεν ταιριάζει"', JSON.stringify(e.sheet.rules?.map((r) => r.f)));

  const r1 = post(e, lead());
  check('valid lead → {ok:true}', r1.ok === true, JSON.stringify(r1));
  const r2 = post(e, lead({ id: 'abc-2', name: 'Δεύτερος Λέων', phone: '+306987654321' }));
  check('second lead goes to row 2 (newest on top)', e.sheet.rows[1][3] === 'Δεύτερος Λέων' && e.sheet.rows[2][3] === 'Μαρία Παπαδοπούλου', e.sheet.rows.map((r) => r[3]).join(' / '));
  const row = e.sheet.rows[2];
  check('row columns A–Q', row[1] === 'Νέο' && row[2] === '' && row[5] === 'maria@example.gr' && row[6] === 'Οδοντιατρείο, 5 άτομα' && row[7] === 'Χάνω leads' && row[8] === '50.000 – 150.000€' && row[9] === 'iatreia' && row[10] === 5880 && row[11] === 52 && row[12] === 'instagram' && row[13] === 'reel-test' && row[14] === '/' && row[15] === '' && row[16] === '', JSON.stringify(row));
  check('date column is a real Date', row[0] instanceof Date || Object.prototype.toString.call(row[0]) === '[object Date]');
  check('phone cell = HYPERLINK tel:', Object.values(e.sheet.formulas).some((f) => f === '=HYPERLINK("tel:+306987654321","+306987654321")'), JSON.stringify(e.sheet.formulas));
  check('2 leads → 2 internal + 2 confirmation emails', e.mails.length === 4, String(e.mails.length));

  const internal = e.mails[0];
  check('internal: recipients from NOTIFY_EMAILS', internal.to === 'pan@example.com,chr@example.com');
  check('internal: subject «🔔 Νέο lead: {name} · {business}»', internal.subject === '🔔 Νέο lead: Μαρία Παπαδοπούλου · Οδοντιατρείο, 5 άτομα', internal.subject);
  check('internal: tel: / wa.me / viber links + sheet link + calculator + UTM', ['tel:+306912345678', 'https://wa.me/306912345678', 'viber://chat?number=%2B306912345678', 'docs.google.com/spreadsheets/d/SSID', '5880', 'utm_campaign=reel-test'].every((s) => internal.htmlBody.includes(s) && internal.body.includes(s.replace('&', '&'))), '');
  const conf = e.mails[1];
  check('confirmation: to the lead, sender «Auragram», reply-to = first founder', conf.to === 'maria@example.gr' && conf.name === 'Auragram' && conf.replyTo === 'pan@example.com');
  check('confirmation: subject', conf.subject === 'Λάβαμε το αίτημά σας — Auragram');
  check('confirmation: both phone numbers + ignore line + no images', ['698 171 8440', '694 323 2385', 'Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το email.', 'Παναγιώτης ή ο Χρήστος'].every((s) => conf.body.includes(s)) && !/<img/i.test(conf.htmlBody));
  check('internal email does NOT contain founders\' callback numbers', !/698 171 8440|694 323 2385/.test(internal.body + internal.htmlBody));

  // dedupe (retry του site με το ίδιο id)
  const before = e.mails.length;
  const dup = post(e, lead());
  check('same id again → ok:true, duplicate, no new row/email', dup.ok && dup.duplicate && e.sheet.rows.length === 3 && e.mails.length === before);
}

// 3. validation (defence in depth) → ok:false + «⚠️ Αποτυχία lead» με raw payload (χωρίς secret)
{
  const e = makeEnv();
  e.ctx.setup();
  const bad = post(e, lead({ phone: '6912345678' }));
  check('invalid phone → {ok:false,error}', bad.ok === false && /phone/.test(bad.error), JSON.stringify(bad));
  const alert = e.mails.find((m) => m.subject === '⚠️ Αποτυχία lead');
  check('failure email «⚠️ Αποτυχία lead» sent to founders with the raw payload', !!alert && alert.body.includes('Μαρία Παπαδοπούλου') && alert.body.includes('6912345678'));
  check('…and the secret is NOT in it', !alert.body.includes('s3cret'));
  check('no row written on validation failure', e.sheet.rows.length === 1);
  check('missing email → rejected', post(e, lead({ email: '' })).ok === false);
  check('name too short → rejected', post(e, lead({ id: 'x', name: 'A' })).ok === false);
}

// 4. formula injection
{
  const e = makeEnv();
  e.ctx.setup();
  post(e, lead({ id: 'inj', name: '=IMPORTXML("http://evil")', business: '+cmd|calc' }));
  check('formula injection neutralised (leading \' )', e.sheet.rows[1][3].startsWith("'=") && e.sheet.rows[1][6].startsWith("'+"));
}

// 5. email trouble never loses the lead
{
  const e = makeEnv({ failMail: true });
  e.ctx.setup();
  const r = post(e, lead());
  check('mail quota exhausted → lead still stored and {ok:true}', r.ok === true && e.sheet.rows.length === 2);
}

// 6. testLead(): ΤΕΣΤ row, both emails ONLY to NOTIFY_EMAILS
{
  const e = makeEnv();
  e.ctx.setup();
  e.ctx.testLead();
  check('testLead: «ΤΕΣΤ» row inserted', /^ΤΕΣΤ/.test(e.sheet.rows[1][3]));
  check('testLead: both emails go ONLY to the founders', e.mails.length === 2 && e.mails.every((m) => m.to === 'pan@example.com,chr@example.com'), e.mails.map((m) => m.to).join(' | '));
}

console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);
