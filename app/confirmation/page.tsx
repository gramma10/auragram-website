import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { ConfirmationHero } from '@/components/home/ConfirmationHero';
import { contactEmail } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Λάβαμε το αίτημά σας',
  description: 'Το αίτημά σας για τον Χάρτη AI ελήφθη.',
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <>
      <section className="surface-dark grid-bg relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
        <div className="relative mx-auto w-full max-w-3xl">
          <ConfirmationHero />
        </div>
      </section>

      {/* Τι να ετοιμάσετε */}
      <Section tone="dark">
        <div className="mx-auto max-w-3xl">
          <Eyebrow tone="dark">ΠΡΙΝ ΤΗΝ ΚΛΗΣΗ</Eyebrow>
          <H2 tone="dark" className="pt-6 text-[26px] sm:text-[34px]">
            Δύο πράγματα, τίποτα άλλο.
          </H2>

          <ul className="flex flex-col pt-8">
            {[
              'Σκεφτείτε ποια δουλειά ρουτίνας σας τρώει τον περισσότερο χρόνο αυτή τη βδομάδα.',
              'Έχετε πρόχειρο ποια εργαλεία χρησιμοποιείτε (CRM, email, ταμείο, Excel) — έστω σε γενικές γραμμές.',
            ].map((x, i) => (
              <li key={x} className="flex items-start gap-4 border-t border-white/10 py-5">
                <span className="font-mono text-[12px] tabular-nums tracking-[0.1em] text-aura">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-relaxed text-fg">{x}</p>
              </li>
            ))}
          </ul>

          <p className="pt-6 text-[13px] leading-relaxed text-fg-dim">
            Δεν χρειάζεται να ετοιμάσετε παρουσίαση, νούμερα ή πρόσβαση σε τίποτα. Αν σας βολεύει καλύτερα άλλη ώρα,
            απαντήστε στο email επιβεβαίωσης.
          </p>
        </div>
      </Section>

      <Section tone="light">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-[19px] font-extrabold leading-snug tracking-tight text-ink sm:text-[22px]">
            Μέχρι τότε, ρίξτε μια ματιά στο πώς δουλεύουμε.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-7">
            <Link
              href="/about"
              className="border-b-2 border-aura-deep pb-1 font-display text-[15px] font-extrabold tracking-tight text-ink transition-colors hover:border-ink"
            >
              Ποιοι είμαστε →
            </Link>
            <a
              href={`mailto:${contactEmail()}`}
              className="text-[15px] text-ink-soft transition-colors hover:text-ink"
            >
              {contactEmail()}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
