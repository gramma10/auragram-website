// Mock του Google Apps Script web app — μόνο για τοπικές δοκιμές (ΔΕΝ είναι μέρος του site).
//
// Συμπεριφορά όπως του πραγματικού /exec:
//   POST /exec  → 302 προς /echo/<id>  (το Apps Script ΠΑΝΤΑ ανακατευθύνει)
//   GET  /echo/<id> → το JSON του doPost ({ok:true} ή {ok:false,error})
// και ελέγχει το secret ΜΕΣΑ στο JSON σώμα (το Apps Script δεν διαβάζει headers).
//
// Χρήση:  node docs/funnel-v2/mock-webhook.mjs [port=4010]
//   SECRET=...                       το αναμενόμενο secret (default test-secret-123)
//   GET /__mode?m=ok|slow|fail500|badjson|reject   αλλάζει τη συμπεριφορά του ΕΠΟΜΕΝΟΥ POST ... (sticky)
//   GET /__received                  τα payloads που έγιναν δεκτά (JSON array, το secret αφαιρείται)
//   GET /__reset                     καθαρίζει
import http from 'node:http';
import fs from 'node:fs';

const port = Number(process.argv[2] || 4010);
const SECRET = process.env.SECRET || 'test-secret-123';
const OUT = process.env.OUT || '';
let mode = 'ok';
let hits = 0;
const received = [];
const results = new Map();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  const send = (code, obj, headers = {}) => {
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', ...headers });
    res.end(typeof obj === 'string' ? obj : JSON.stringify(obj));
  };

  if (url.pathname === '/__mode') {
    mode = url.searchParams.get('m') || 'ok';
    return send(200, { mode });
  }
  if (url.pathname === '/__received') return send(200, { hits, received });
  if (url.pathname === '/__reset') {
    received.length = 0;
    hits = 0;
    mode = 'ok';
    return send(200, { ok: true });
  }

  if (req.method === 'POST' && url.pathname === '/exec') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      hits++;
      const ct = req.headers['content-type'] || '';
      const reply = () => {
        if (mode === 'fail500') return send(500, { ok: false, error: 'boom' });
        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          results.set(String(hits), { ok: false, error: 'bad request' });
        }
        if (payload) {
          if (payload.secret !== SECRET || mode === 'reject') {
            results.set(String(hits), { ok: false, error: 'unauthorized' });
          } else {
            const { secret, ...rest } = payload; // secret NEVER stored
            received.push({ contentType: ct, hasSecretHeader: !!req.headers['x-auragram-secret'], payload: rest });
            if (OUT) fs.writeFileSync(OUT, JSON.stringify({ ...rest, secret: '«REDACTED»' }, null, 2));
            results.set(String(hits), { ok: true });
          }
        }
        // όπως το Apps Script: 302 προς ένα «echo» URL· ο client το ακολουθεί ως GET
        res.writeHead(302, { location: `/echo/${hits}` });
        res.end();
      };
      if (mode === 'slow') setTimeout(reply, 2500);
      else reply();
    });
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/echo/')) {
    const id = url.pathname.slice(6);
    if (mode === 'badjson') return send(200, '<html>Σφάλμα Google</html>', { 'content-type': 'text/html' });
    return send(200, results.get(id) ?? { ok: false, error: 'unknown' });
  }

  send(404, { ok: false });
});

server.listen(port, '127.0.0.1', () => console.log(`mock webhook on http://127.0.0.1:${port}/exec`));
