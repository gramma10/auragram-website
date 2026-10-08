import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BRAND.siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BRAND.siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BRAND.siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BRAND.siteUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
