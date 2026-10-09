// Preview/development deployments (VERCEL_ENV) δεν ευρετηριάζονται: X-Robots-Tag σε ΚΑΘΕ response, επιπλέον του robots.txt
// και του <meta name="robots"> (βλ. BLOCK_INDEXING στο lib/config.ts — ίδια συνθήκη).
const blockIndexing =
  process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development' || process.env.NEXT_PUBLIC_NOINDEX === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Προαιρετικός ξεχωριστός φάκελος build (NEXT_DIST_DIR=.next-test): επιτρέπει build/start για δοκιμές ΧΩΡΙΣ να πειράξει το .next ενός
  // `next dev` που τρέχει ταυτόχρονα. Χωρίς την μεταβλητή → το default `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return blockIndexing ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] : [];
  },
};

export default nextConfig;
