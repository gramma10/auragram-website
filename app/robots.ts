import type { MetadataRoute } from 'next';
import { BLOCK_INDEXING, BRAND } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments: απαγόρευση ΟΛΩΝ των crawlers, χωρίς sitemap (βλ. και το X-Robots-Tag στο next.config.mjs).
  if (BLOCK_INDEXING) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/confirmation'] }],
    sitemap: `${BRAND.siteUrl}/sitemap.xml`,
  };
}
