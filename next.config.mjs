// Preview/development deployments (VERCEL_ENV) δεν ευρετηριάζονται: X-Robots-Tag σε ΚΑΘΕ response, επιπλέον του robots.txt
// και του <meta name="robots"> (βλ. BLOCK_INDEXING στο lib/config.ts — ίδια συνθήκη).
const blockIndexing =
  process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development' || process.env.NEXT_PUBLIC_NOINDEX === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return blockIndexing ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] : [];
  },
};

export default nextConfig;
