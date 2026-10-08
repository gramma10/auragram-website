import { Hero } from '@/components/home/Hero';
import { Problem } from '@/components/home/Problem';
import { Agents } from '@/components/home/Agents';
import { Calculator } from '@/components/home/Calculator';
import { Services } from '@/components/home/Services';
import { Industries } from '@/components/home/Industries';
import { Process } from '@/components/home/Process';
import { Pilot } from '@/components/home/Pilot';
import { Founders } from '@/components/home/Founders';
import { Faq } from '@/components/home/Faq';
import { Booking } from '@/components/home/Booking';
import { faq } from '@/lib/content';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      {/* Εναλλαγή dark/light ανά section (Round 4): D L D L D L D L D L D — ποτέ δύο γειτονικά με τον ίδιο τόνο.
          Hero (+tools) D · Problem L · Agents D · Calculator L · Services D · Industries L · Process D · Founders L ·
          Pilot D · FAQ L · Booking D. Το accent ακολουθεί την επιφάνεια (cyan σε dark, lime σε light). */}
      <Hero />
      <Problem />
      <Agents />
      <Calculator />
      <Services />
      <Industries />
      <Process />
      <Founders />
      <Pilot />
      <Faq />
      <Booking />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
