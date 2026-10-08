import { Manrope, Inter, JetBrains_Mono } from 'next/font/google';

/**
 * Και οι τρεις γραμματοσειρές φορτώνονται με ΕΛΛΗΝΙΚΟ glyph coverage
 * (`subsets: ['greek', 'latin']`) και `display: 'swap'`.
 * Το next/font τις κάνει self-host + preload αυτόματα → μηδέν layout shift.
 */

export const display = Manrope({
  subsets: ['greek', 'latin'],
  weight: ['500', '700', '800'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
});

export const body = Inter({
  subsets: ['greek', 'latin'],
  display: 'swap',
  variable: '--font-body',
  preload: true,
});

export const mono = JetBrains_Mono({
  subsets: ['greek', 'latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,
});
