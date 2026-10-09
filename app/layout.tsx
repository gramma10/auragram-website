import type { Metadata, Viewport } from 'next';
import './globals.css';
import { display, body, mono } from './fonts';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { StickyCta } from '@/components/StickyCta';
import { Analytics } from '@/components/Analytics';
import { CookieBanner } from '@/components/CookieBanner';
import { AnchorReady } from '@/components/AnchorReady';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MobileChromeProvider } from '@/components/chrome/MobileChrome';
import { BLOCK_INDEXING, BRAND, contactEmail } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: 'Auragram — AI Agents & Αυτοματισμοί για Ελληνικές Επιχειρήσεις',
    template: '%s · Auragram',
  },
  description:
    'AI agents που απαντούν σε leads, εξυπηρετούν πελάτες και κλείνουν ραντεβού 24/7. Pilot 2–4 εβδομάδων με μετρήσιμο αποτέλεσμα.',
  keywords: [
    'AI agents',
    'αυτοματισμοί',
    'τεχνητή νοημοσύνη επιχειρήσεις',
    'AI agency Ελλάδα',
    'chatbot ελληνικά',
    'automation',
  ],
  authors: [{ name: BRAND.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'el_GR',
    url: BRAND.siteUrl,
    siteName: BRAND.name,
    title: 'Auragram — AI Agents & Αυτοματισμοί για Ελληνικές Επιχειρήσεις',
    description:
      'AI agents που απαντούν σε leads, εξυπηρετούν πελάτες και κλείνουν ραντεβού 24/7. Pilot 2–4 εβδομάδων με μετρήσιμο αποτέλεσμα.',
    // Παράγεται με `npm run og` (scripts/og.mjs) → public/og.png
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Auragram — AI Agents' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auragram — AI Agents & Αυτοματισμοί',
    description: 'Pilot 2–4 εβδομάδων με μετρήσιμο αποτέλεσμα.',
    images: ['/og.png'],
  },
  robots: { index: !BLOCK_INDEXING, follow: !BLOCK_INDEXING },
};

export const viewport: Viewport = {
  themeColor: '#0A1020',
  width: 'device-width',
  initialScale: 1,
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND.name,
  url: BRAND.siteUrl,
  email: contactEmail(),
  description:
    'Ελληνική AI agency δύο ιδρυτών. Χτίζουμε AI agents και αυτοματισμούς για μικρομεσαίες επιχειρήσεις.',
  areaServed: { '@type': 'Country', name: 'Ελλάδα' },
  founder: [
    { '@type': 'Person', name: 'Χρήστος' },
    { '@type': 'Person', name: 'Παναγιώτης' },
  ],
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI Agents & Αυτοματισμοί',
  provider: { '@type': 'Organization', name: BRAND.name, url: BRAND.siteUrl },
  areaServed: { '@type': 'Country', name: 'Ελλάδα' },
  description:
    'AI agents για πωλήσεις, εξυπηρέτηση και operations. Ξεκινάμε με pilot 2–4 εβδομάδων με συμφωνημένο KPI.',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'EUR',
    price: '1200',
    description: 'Pilot 2–4 εβδομάδων, ένας agent ζωντανός, ένα μετρήσιμο KPI.',
  },
};

// suppressHydrationWarning στο <html>: το inline script στο <head> βάζει data-js / data-ready ΠΡΙΝ το hydration — αλλιώς το React (dev) τα
// αναφέρει ως «Extra attributes from the server» (αυτό ήταν το «1 error» του Next dev overlay).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Σηματοδοτεί ότι τρέχει JavaScript, πριν το πρώτο paint.
          Μόνο τότε ενεργοποιείται το fade-up (globals.css) — χωρίς JS
          η σελίδα εμφανίζεται ολόκληρη αντί για κενή.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-js','');if(location.hash)document.documentElement.setAttribute('data-ready','')`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-aura focus:px-4 focus:py-2 focus:text-night-900"
        >
          Μετάβαση στο περιεχόμενο
        </a>
        <ScrollProgress />
        {/* Κοινή κατάσταση top bar / dock / bottom sheet (mobile) */}
        <MobileChromeProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <StickyCta />
        </MobileChromeProvider>
        <CookieBanner />
        <AnchorReady />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
      </body>
    </html>
  );
}
