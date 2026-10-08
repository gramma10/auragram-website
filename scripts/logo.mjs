/**
 * Παράγει τα logo assets από το render που έδωσε ο πελάτης (IMG_7161).
 *   npm run logo
 *
 * Το πρωτότυπο είναι φωτορεαλιστικό mockup σε σκούρο τοίχο. Εδώ βγάζουμε
 * το φόντο με luminance key (ο τοίχος έχει φωτεινότητα ~25, το λογότυπο
 * ~48–245) ώστε το σήμα + το λεκτικό να κάθονται καθαρά πάνω στις σκούρες
 * επιφάνειες του site (nav, footer). Το αποτέλεσμα κρατά τη μεταλλική
 * υφή και τη λάμψη — δεν είναι flat αναπαράσταση.
 *
 * Το source path δίνεται με env var ώστε το script να τρέχει και αλλού:
 *   LOGO_SRC="/path/to/IMG_7161.PNG" npm run logo
 */
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const SRC =
  process.env.LOGO_SRC || 'C:/Users/panagiotis/Downloads/IMG_7161.PNG';

if (!existsSync(SRC)) {
  console.error(
    `✗ Δεν βρέθηκε το πρωτότυπο: ${SRC}\n` +
      `  Δώσ' το με: LOGO_SRC="/path/IMG_7161.PNG" npm run logo\n` +
      `  (τα υπάρχοντα public/logo-*.png παραμένουν ως έχουν)`
  );
  process.exit(1);
}

/** Luminance key → alpha, χειροκίνητη σύνθεση RGBA (αξιόπιστο σε κάθε sharp). */
async function knockout(extract, outW, file, { thr = 46, m = 6, b = -140 } = {}) {
  const { data: rgb, info } = await sharp(SRC)
    .extract(extract)
    .resize(outW)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  const { data: alpha } = await sharp(SRC)
    .extract(extract)
    .resize(outW)
    .greyscale()
    .median(3) // καθαρίζει την υφή του τοίχου
    .threshold(thr) // τοίχος → 0, λογότυπο → 255
    .linear(m, b) // σκληραίνει τη σιλουέτα, σβήνει το glow-cloud
    .blur(1.3) // anti-alias
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(w * h * 4);
  for (let i = 0, p = 0; i < w * h; i++, p += 4) {
    out[p] = rgb[i * 3];
    out[p + 1] = rgb[i * 3 + 1];
    out[p + 2] = rgb[i * 3 + 2];
    out[p + 3] = alpha[i];
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(file);

  return { w, h };
}

// Πλήρες lockup: σήμα + «AURAGRAM»
const L = await knockout(
  { left: 118, top: 826, width: 726, height: 456 },
  760,
  'public/logo-lockup.png'
);

// Μόνο το σήμα
const M = await knockout(
  { left: 291, top: 830, width: 380, height: 316 },
  360,
  'public/logo-mark.png'
);

// Favicon + apple-icon: το σήμα knockout, κεντραρισμένο σε σκούρα πλάκα.
async function icon(size, pad, file) {
  const inner = size - pad * 2;
  const mark = await sharp('public/logo-mark.png')
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: '#0A1020' },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(file);
}

await icon(512, 40, 'app/icon.png');
await icon(180, 16, 'app/apple-icon.png');

console.log(
  `✓ public/logo-lockup.png ${L.w}×${L.h} · public/logo-mark.png ${M.w}×${M.h} · app/icon.png · app/apple-icon.png`
);
