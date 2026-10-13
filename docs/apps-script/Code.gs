/**
 * AURAGRAM — Lead CRM (Google Apps Script web app)
 *
 * Η φόρμα του site (server action) κάνει POST εδώ ένα JSON. Το script:
 *   1. ελέγχει το κοινό μυστικό (Script Property LEAD_SECRET — μέσα στο JSON, γιατί το Apps Script δεν διαβάζει headers),
 *   2. γράφει το lead στο φύλλο «Leads» (το πιο καινούριο ΠΑΝΩ, στη γραμμή 2),
 *   3. στέλνει email στους ιδρυτές (NOTIFY_EMAILS) και email επιβεβαίωσης στον επισκέπτη,
 *   4. απαντά JSON {ok:true} — ή {ok:false, error} και, αν κάτι χαλάσει μετά τον έλεγχο του μυστικού,
 *      στέλνει «⚠️ Αποτυχία lead» με ΟΛΟ το payload ώστε να μη χαθεί κανένα lead.
 *
 * Script Properties (Project Settings → Script properties):
 *   LEAD_SECRET   : το ίδιο με το LEAD_WEBHOOK_SECRET του Vercel
 *   NOTIFY_EMAILS : emails των ιδρυτών, χωρισμένα με κόμμα — το ΠΡΩΤΟ είναι και το reply-to του email επιβεβαίωσης
 * (Το SHEET_ID το γράφει μόνο του το setup().)
 *
 * Οδηγίες βήμα-βήμα: README.md
 */

var SHEET_NAME = 'Leads';
var TZ = 'Europe/Athens';

// Τα τηλέφωνα εμφανίζονται ΜΟΝΟ στο email επιβεβαίωσης προς τον επισκέπτη (και στη σελίδα /confirmation του site).
var CALLBACK_PHONES = ['698 171 8440', '694 323 2385'];

var STATUSES = ['Νέο', 'Κλήθηκε', 'Δεν σήκωσε', 'Qualified', 'Χάρτης AI κλείστηκε', 'Pilot', 'Δεν ταιριάζει'];
var ASSIGNEES = ['Παναγιώτης', 'Χρήστος'];

// Στήλες A…Q με αυτή τη σειρά (το brief).
var HEADERS = [
  'Ημερομηνία', // A
  'Status', // B
  'Ανάθεση', // C
  'Όνομα', // D
  'Κινητό', // E
  'Email', // F
  'Επιχείρηση / κλάδος', // G
  'Λόγοι', // H
  'Τζίρος', // I
  'Κλάδος που είδε', // J
  'Χαμένα €/μήνα (calculator)', // K
  'Ώρες/μήνα (calculator)', // L
  'Πηγή (utm_source)', // M
  'Καμπάνια (utm_campaign / Reel)', // N
  'Σελίδα', // O
  'Επόμενο βήμα', // P
  'Σημειώσεις', // Q
];

// Χρώματα γραμμής ανά Status
var STATUS_COLORS = [
  { status: 'Νέο', color: '#CFFAFE' }, // ανοιχτό cyan
  { status: 'Qualified', color: '#DCFCE7' }, // ανοιχτό πράσινο
  { status: 'Δεν ταιριάζει', color: '#E5E7EB' }, // γκρι
];

var LIMITS = { name: 80, phone: 32, email: 120, business: 120, short: 200, page: 300 };

/* ───────────────────────────── ΕΓΚΑΤΑΣΤΑΣΗ ───────────────────────────── */

/**
 * Τρέξτε το ΜΙΑ φορά (Run → setup): δημιουργεί το φύλλο «Leads», τα dropdowns και τα χρώματα και ζητά τις άδειες.
 * Είναι ασφαλές να ξανατρέξει — δεν σβήνει δεδομένα.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone(TZ);
  var sheet = getLeadsSheet_(ss);
  applyFormatting_(sheet, true);
  // Ζητά και την άδεια αποστολής email ΤΩΡΑ (όχι στο πρώτο πραγματικό lead).
  Logger.log('Ημερήσια ποσόστωση email που απομένει: ' + MailApp.getRemainingDailyQuota());
  Logger.log('OK — το φύλλο «' + SHEET_NAME + '» είναι έτοιμο. Επόμενο βήμα: Deploy → New deployment → Web app.');
}

/** Πόσα email μπορούν ακόμα να σταλούν σήμερα (δείτε το στο Execution log). */
function quota() {
  Logger.log('Ημερήσια ποσόστωση email που απομένει: ' + MailApp.getRemainingDailyQuota());
}

/** Δοκιμή: ένα ψεύτικο lead «ΤΕΣΤ» στο φύλλο + και τα δύο email ΜΟΝΟ στους NOTIFY_EMAILS. */
function testLead() {
  var payload = {
    id: 'test-' + new Date().getTime(),
    submittedAt: new Date().toISOString(),
    name: 'ΤΕΣΤ Ονοματεπώνυμο',
    phone: '+306900000000',
    email: '',
    business: 'ΤΕΣΤ — επιχείρηση',
    reasons: ['Χάνω leads'],
    revenue: '50.000 – 150.000€',
    industryViewed: 'iatreia',
    calculator: { leads: 60, responseRate: 30, avgValue: 400, hoursPerWeek: 12, lostRevenue: 5880, hoursPerMonth: 52, timeValue: 1300 },
    utm: { utm_source: 'test', utm_campaign: 'testLead', landing: '/' },
    page: '/',
  };
  var res = processLead_(payload, true);
  Logger.log(JSON.stringify(res));
}

/* ───────────────────────────── WEB APP ───────────────────────────── */

/** Απλό «ζω» για όποιον ανοίξει το /exec στον browser. Δεν επιστρέφει δεδομένα. */
function doGet() {
  return json_({ ok: true, service: 'auragram-leads' });
}

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, error: 'bad request' }); // δεν είναι από το site μας — καμία ειδοποίηση
  }

  // 1. Μυστικό (ΠΟΤΕ hard-coded). Αν δεν ταιριάζει → απλά ok:false, χωρίς email (να μη μας spam-άρουν).
  var secret = PropertiesService.getScriptProperties().getProperty('LEAD_SECRET');
  if (!secret || !payload || payload.secret !== secret) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  delete payload.secret; // δεν γράφεται πουθενά (ούτε στα email αποτυχίας)

  try {
    return json_(processLead_(payload, false));
  } catch (err) {
    // 8. Δεν χάνεται ποτέ: ολόκληρο το payload στα email των ιδρυτών.
    notifyFailure_(err, payload);
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/* ───────────────────────────── ΚΥΡΙΑ ΛΟΓΙΚΗ ───────────────────────────── */

function processLead_(payload, isTest) {
  // 3. Επανεπικύρωση (defence in depth) — ο server του site έχει ήδη ελέγξει τα ίδια.
  var lead = validate_(payload);

  var props = PropertiesService.getScriptProperties();
  var notify = splitEmails_(props.getProperty('NOTIFY_EMAILS'));
  if (!notify.length) throw new Error('Λείπει το Script Property NOTIFY_EMAILS.');

  // 2. Lock γύρω από την εγγραφή στο φύλλο (και τον έλεγχο διπλού αιτήματος).
  var ss = getSpreadsheet_();
  var sheet = getLeadsSheet_(ss);
  var cache = CacheService.getScriptCache();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Ίδιο id = επανάληψη του site (timeout/5xx retry) → δεν ξαναγράφουμε και δεν ξαναστέλνουμε email.
    if (!isTest && lead.id && cache.get('lead:' + lead.id)) return { ok: true, duplicate: true };
    insertRow_(sheet, lead);
    if (lead.id) cache.put('lead:' + lead.id, '1', 6 * 60 * 60);
  } finally {
    lock.releaseLock();
  }

  // 5 & 6. Τα email μετά το lock. Το lead είναι ήδη στο φύλλο — ένα πρόβλημα email ΔΕΝ το κάνει αποτυχία.
  try {
    sendInternalEmail_(lead, notify, ss, isTest);
  } catch (err) {
    console.error('internal email: ' + err);
  }
  try {
    // Στο testLead() το «email επιβεβαίωσης» πάει στους ιδρυτές, όχι σε πελάτη.
    sendConfirmationEmail_(lead, isTest ? notify : [lead.email], notify[0], isTest);
  } catch (err) {
    console.error('confirmation email: ' + err);
    safeMail_(notify, '⚠️ Αποτυχία email επιβεβαίωσης: ' + oneLine_(lead.name), 'Το lead καταχωρήθηκε στο φύλλο, αλλά το email επιβεβαίωσης προς ' + lead.email + ' ΔΕΝ στάλθηκε.\n\n' + String(err));
  }
  return { ok: true };
}

function validate_(p) {
  if (!p || typeof p !== 'object') throw new Error('validation: empty payload');
  var out = {
    id: str_(p.id, 64),
    submittedAt: str_(p.submittedAt, 40),
    name: str_(p.name, LIMITS.name),
    phone: str_(p.phone, LIMITS.phone),
    email: str_(p.email, LIMITS.email),
    business: str_(p.business, LIMITS.business),
    reasons: [],
    revenue: str_(p.revenue, LIMITS.short),
    industryViewed: str_(p.industryViewed, 40),
    calculator: null,
    utm: {},
    page: str_(p.page, LIMITS.page),
  };
  if (out.name.length < 2) throw new Error('validation: name');
  // το site στέλνει πάντα κανονικοποιημένο ελληνικό κινητό: +3069XXXXXXXX
  if (!/^\+3069\d{8}$/.test(out.phone)) throw new Error('validation: phone');
  // Το testLead() δεν έχει email πελάτη.
  if (out.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new Error('validation: email');
  if (!out.email && !/^ΤΕΣΤ/.test(out.name)) throw new Error('validation: email');
  if (out.business.length < 2) throw new Error('validation: business');
  var when = new Date(out.submittedAt);
  out.submittedAt = (isNaN(when.getTime()) ? new Date() : when).toISOString();

  if (Object.prototype.toString.call(p.reasons) === '[object Array]') {
    for (var i = 0; i < p.reasons.length && i < 10; i++) out.reasons.push(str_(p.reasons[i], LIMITS.short));
  }
  if (p.calculator && typeof p.calculator === 'object') {
    var lost = Number(p.calculator.lostRevenue);
    var hours = Number(p.calculator.hoursPerMonth);
    if (isFinite(lost) && isFinite(hours)) out.calculator = { lostRevenue: Math.round(lost), hoursPerMonth: Math.round(hours) };
    // τα υπόλοιπα (leads, responseRate…) κρατιούνται για τα email
    if (out.calculator) {
      ['leads', 'responseRate', 'avgValue', 'hoursPerWeek', 'timeValue'].forEach(function (k) {
        var v = Number(p.calculator[k]);
        if (isFinite(v)) out.calculator[k] = v;
      });
    }
  }
  if (p.utm && typeof p.utm === 'object') {
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing'].forEach(function (k) {
      if (p.utm[k]) out.utm[k] = str_(p.utm[k], LIMITS.short);
    });
  }
  return out;
}

/* ───────────────────────────── ΦΥΛΛΟ ───────────────────────────── */

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

/** Το φύλλο «Leads» — δημιουργείται αν λείπει (επικεφαλίδες + πάγωμα 1ης γραμμής). */
function getLeadsSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    var first = ss.getSheets()[0];
    // Αν το αρχικό «Sheet1»/«Φύλλο1» είναι κενό, το μετονομάζουμε αντί να αφήσουμε ένα άδειο φύλλο.
    if (ss.getSheets().length === 1 && first.getLastRow() === 0) {
      sheet = first.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }
  var head = sheet.getRange(1, 1, 1, HEADERS.length);
  head.setValues([HEADERS]).setFontWeight('bold').setBackground('#0A1020').setFontColor('#FFFFFF').setWrap(true).setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  return sheet;
}

/** Dropdowns, χρώματα ανά Status (+ πλάτη στηλών στο setup). Ξανατρέχει σε κάθε νέο lead (η εισαγωγή γραμμής στη θέση 2 μετατοπίζει τα ranges). */
function applyFormatting_(sheet, withWidths) {
  var rows = Math.max(sheet.getMaxRows() - 1, 1);

  sheet.getRange(2, 2, rows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build()
  );
  sheet.getRange(2, 3, rows, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(ASSIGNEES, true).setAllowInvalid(false).build()
  );

  var range = sheet.getRange(2, 1, rows, HEADERS.length);
  var rules = STATUS_COLORS.map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$B2="' + s.status + '"')
      .setBackground(s.color)
      .setRanges([range])
      .build();
  });
  sheet.setConditionalFormatRules(rules);

  // μορφές ημερομηνιών (το κινητό δεν χρειάζεται: το HYPERLINK επιστρέφει κείμενο)
  sheet.getRange(2, 1, rows, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.getRange(2, 16, rows, 1).setNumberFormat('dd/MM/yyyy');

  if (withWidths) {
    var widths = [130, 150, 100, 160, 130, 200, 200, 200, 140, 120, 120, 110, 120, 180, 120, 110, 260];
    widths.forEach(function (w, i) {
      sheet.setColumnWidth(i + 1, w);
    });
    sheet.setRowHeight(1, 44);
  }
}

/** Εισάγει το lead στη γραμμή 2 (το καινούριο ΠΑΝΩ). */
function insertRow_(sheet, lead) {
  sheet.insertRowBefore(2); // κληρονομεί τη μορφή της κεφαλίδας → την καθαρίζουμε και ξαναβάζουμε μορφές/dropdowns
  sheet.getRange(2, 1, 1, HEADERS.length).clearFormat();
  applyFormatting_(sheet);

  var when = new Date(lead.submittedAt);

  var phoneCell = sheet.getRange(2, 5);
  var row = [
    when, // A (αποθηκεύεται ως ημερομηνία· εμφανίζεται dd/MM/yyyy HH:mm ώρα Ελλάδας)
    'Νέο', // B default
    '', // C
    safe_(lead.name), // D
    '', // E — μπαίνει παρακάτω ως HYPERLINK
    safe_(lead.email), // F
    safe_(lead.business), // G
    safe_(lead.reasons.join(', ')), // H
    safe_(lead.revenue), // I
    safe_(lead.industryViewed), // J
    lead.calculator ? lead.calculator.lostRevenue : '', // K
    lead.calculator ? lead.calculator.hoursPerMonth : '', // L
    safe_(lead.utm.utm_source || ''), // M
    safe_(lead.utm.utm_campaign || lead.utm.utm_content || ''), // N
    safe_(lead.page || lead.utm.landing || ''), // O
    '', // P
    '', // Q
  ];
  sheet.getRange(2, 1, 1, HEADERS.length).setValues([row]);
  // Κινητό: εμφανίζεται ως κείμενο, κλικ = tel: (το lead.phone έχει ήδη επικυρωθεί: μόνο +30 και ψηφία)
  phoneCell.setFormula('=HYPERLINK("tel:' + lead.phone + '","' + lead.phone + '")');
}

/* ───────────────────────────── EMAIL ───────────────────────────── */

function sendInternalEmail_(lead, notify, ss, isTest) {
  var subject = (isTest ? '[ΤΕΣΤ] ' : '') + '🔔 Νέο lead: ' + oneLine_(lead.name) + ' · ' + oneLine_(lead.business);
  var digits = lead.phone.replace(/\D/g, ''); // 30 69…
  var tel = 'tel:' + lead.phone;
  var wa = 'https://wa.me/' + digits;
  var viber = 'viber://chat?number=' + encodeURIComponent(lead.phone);
  var sheetUrl = ss.getUrl();
  var when = Utilities.formatDate(new Date(lead.submittedAt), TZ, 'dd/MM/yyyy HH:mm');
  var calc = lead.calculator;

  var rows = [
    ['Ημερομηνία', when],
    ['Όνομα', lead.name],
    ['Κινητό', lead.phone],
    ['Email', lead.email || '—'],
    ['Επιχείρηση / κλάδος', lead.business],
    ['Λόγοι', lead.reasons.join(', ') || '—'],
    ['Τζίρος', lead.revenue || '—'],
    ['Κλάδος που είδε', lead.industryViewed || '—'],
    ['Calculator', calc ? 'Χάνει ~' + calc.lostRevenue + ' €/μήνα · ' + calc.hoursPerMonth + ' ώρες/μήνα' + (calc.leads != null ? ' (leads ' + calc.leads + ', απάντηση ' + calc.responseRate + '%, αξία ' + calc.avgValue + ' €, ' + calc.hoursPerWeek + ' ώρ./βδ.)' : '') : 'δεν χρησιμοποίησε'],
    ['UTM', objToText_(lead.utm) || '—'],
    ['Σελίδα', lead.page || '—'],
  ];

  var text =
    rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
    '\n\nΚλήση: ' + tel + '\nWhatsApp: ' + wa + '\nViber: ' + viber + '\n\nCRM: ' + sheetUrl + '\n';

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#0A1020">' +
    '<p style="margin:0 0 12px"><strong style="font-size:17px">' + esc_(lead.name) + '</strong> · ' + esc_(lead.business) + '</p>' +
    '<p style="margin:0 0 16px">' +
    btn_(tel, '📞 Κλήση ' + esc_(lead.phone), '#22D3EE', '#0A1020') + ' ' +
    btn_(wa, 'WhatsApp', '#E5E7EB', '#0A1020') + ' ' +
    btn_(viber, 'Viber', '#E5E7EB', '#0A1020') +
    '</p>' +
    '<table role="presentation" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">' +
    rows.map(function (r) {
      return '<tr><td style="border-top:1px solid #E5E7EB;color:#4B5563;width:150px;vertical-align:top">' + esc_(r[0]) + '</td><td style="border-top:1px solid #E5E7EB">' + esc_(String(r[1])) + '</td></tr>';
    }).join('') +
    '</table>' +
    '<p style="margin:16px 0 0"><a href="' + esc_(sheetUrl) + '" style="color:#0E7490">Άνοιγμα CRM →</a></p>' +
    '</div>';

  MailApp.sendEmail({ to: notify.join(','), subject: subject, body: text, htmlBody: html, name: 'Auragram leads' });
}

function sendConfirmationEmail_(lead, to, replyTo, isTest) {
  var first = firstName_(lead.name);
  var subject = 'Λάβαμε το αίτημά σας — Auragram';

  var text =
    'Γεια σας ' + first + ',\n\n' +
    'Λάβαμε το αίτημά σας — ευχαριστούμε!\n\n' +
    'Θα σας καλέσει ο Παναγιώτης ή ο Χρήστος σήμερα ή την επόμενη εργάσιμη, από το ' + CALLBACK_PHONES[0] + ' ή το ' + CALLBACK_PHONES[1] + '. Αποθηκεύστε τα για να σηκώσετε.\n\n' +
    'Ο Χάρτης AI είναι μια δωρεάν κλήση 30 λεπτών: σας δείχνουμε ποια δουλειά της επιχείρησής σας αυτοματοποιείται πρώτη και πόσο αξίζει — χωρίς πωλήσεις.\n\n' +
    'Αν σας βολεύει καλύτερα άλλη ώρα, απαντήστε σε αυτό το email.\n\n' +
    'Παναγιώτης & Χρήστος\nAuragram\n\n' +
    'Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το email.\n';

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#0A1020;max-width:520px">' +
    '<p style="margin:0 0 14px">Γεια σας ' + esc_(first) + ',</p>' +
    '<p style="margin:0 0 14px"><strong>Λάβαμε το αίτημά σας — ευχαριστούμε!</strong></p>' +
    '<p style="margin:0 0 14px">Θα σας καλέσει ο Παναγιώτης ή ο Χρήστος <strong>σήμερα ή την επόμενη εργάσιμη</strong>, από το <strong style="white-space:nowrap">' + esc_(CALLBACK_PHONES[0]) + '</strong> ή το <strong style="white-space:nowrap">' + esc_(CALLBACK_PHONES[1]) + '</strong>. Αποθηκεύστε τα για να σηκώσετε.</p>' +
    '<p style="margin:0 0 14px">Ο Χάρτης AI είναι μια δωρεάν κλήση 30 λεπτών: σας δείχνουμε ποια δουλειά της επιχείρησής σας αυτοματοποιείται πρώτη και πόσο αξίζει — χωρίς πωλήσεις.</p>' +
    '<p style="margin:0 0 14px">Αν σας βολεύει καλύτερα άλλη ώρα, απαντήστε σε αυτό το email.</p>' +
    '<p style="margin:0 0 22px">Παναγιώτης &amp; Χρήστος<br>Auragram</p>' +
    '<p style="margin:0;font-size:13px;color:#4B5563">Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το email.</p>' +
    '</div>';

  MailApp.sendEmail({
    to: to.join(','),
    subject: (isTest ? '[ΤΕΣΤ] ' : '') + subject,
    body: text,
    htmlBody: html,
    name: 'Auragram',
    replyTo: replyTo,
  });
}

/** Αποτυχία: ολόκληρο το payload (χωρίς το secret) στους ιδρυτές. */
function notifyFailure_(err, payload) {
  var notify = splitEmails_(PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAILS'));
  if (!notify.length) return;
  var raw = '';
  try {
    raw = JSON.stringify(payload, null, 2);
  } catch (e) {
    raw = String(payload);
  }
  safeMail_(
    notify,
    '⚠️ Αποτυχία lead',
    'Ένα lead ΔΕΝ καταχωρήθηκε αυτόματα. Περάστε το χειροκίνητα στο CRM και καλέστε τον επισκέπτη.\n\nΣφάλμα: ' + String(err && err.message ? err.message : err) + '\n\nPayload:\n' + raw
  );
}

function safeMail_(to, subject, body) {
  try {
    MailApp.sendEmail({ to: to.join(','), subject: subject, body: body, name: 'Auragram leads' });
  } catch (e) {
    console.error('safeMail_: ' + e);
  }
}

/* ───────────────────────────── ΒΟΗΘΗΤΙΚΑ ───────────────────────────── */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function str_(v, max) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/** Προστασία από formula injection στο φύλλο: κείμενο που ξεκινά με = + - @ γίνεται απλό κείμενο. */
function safe_(v) {
  var s = String(v === null || v === undefined ? '' : v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function oneLine_(v) {
  return String(v).replace(/[\r\n]+/g, ' ');
}

function esc_(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function btn_(href, label, bg, color) {
  return '<a href="' + esc_(href) + '" style="display:inline-block;padding:10px 16px;border-radius:999px;background:' + bg + ';color:' + color + ';text-decoration:none;font-weight:bold;margin:0 6px 6px 0">' + label + '</a>';
}

function splitEmails_(s) {
  return String(s || '')
    .split(',')
    .map(function (x) { return x.trim(); })
    .filter(function (x) { return x; });
}

function firstName_(full) {
  return String(full).trim().split(/\s+/)[0] || '';
}

function objToText_(o) {
  return Object.keys(o || {})
    .map(function (k) { return k + '=' + o[k]; })
    .join(', ');
}
