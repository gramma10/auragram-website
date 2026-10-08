import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Frame } from '@/components/ui/Frame';
import { TrackView } from '@/components/ui/TrackView';
import { contactEmail } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Κλείστηκε',
  description: 'Το ραντεβού σας για τον Χάρτης AI κλείστηκε.',
  robots: { index: false, follow: false },
};

const flow = [
  { n: '01', label: 'Κράτηση', note: 'μόλις τώρα' },
  { n: '02', label: 'Εγγραφή στο CRM', note: 'αυτόματα' },
  { n: '03', label: 'SMS επιβεβαίωσης', note: '< 60 δευτ.' },
  { n: '04', label: 'Υπενθυμίσεις', note: '24ω & 1ω πριν' },
  { n: '05', label: 'Brief στους ιδρυτές', note: 'πριν την κλήση' },
];

export default function ConfirmationPage() {
  return (
    <>
      <TrackView event="booking_complete" />

      <section className="surface-dark grid-bg relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aura">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7.5 5.5 11 12 3.5" stroke="#0A1020" strokeWidth="2.4" strokeLinecap="square" />
              </svg>
            </span>
            <Eyebrow tone="dark">ΕΠΙΒΕΒΑΙΩΜΕΝΟ</Eyebrow>
          </div>

          <h1 className="pt-7 font-display text-[32px] font-extrabold leading-[1.05] tracking-tightest text-balance text-white sm:text-[46px]">
            Κλείστηκε. Δείτε το κινητό σας.
          </h1>
          <p className="pt-5 t-body text-fg">
            Μόλις σας έγραψε ένας από τους agents μας.{' '}
            <span className="text-white">Το μήνυμα δεν το έστειλε άνθρωπος.</span> Αυτό ακριβώς
            είναι που πουλάμε — και το είδατε πριν καν μιλήσουμε.
          </p>
        </div>
      </section>

      {/* Το automation που μόλις έτρεξε */}
      <Section tone="light">
        <Eyebrow tone="light">ΤΙ ΜΟΛΙΣ ΕΤΡΕΞΕ</Eyebrow>
        <H2 tone="light" className="max-w-2xl pt-6">
          Πέντε βήματα, μηδέν άνθρωποι.
        </H2>

        <ol className="grid gap-px pt-10 sm:grid-cols-2 lg:grid-cols-5">
          {flow.map((s, i) => (
            <li key={s.n} className="relative">
              <div className="flex h-full flex-col justify-between border border-ink/10 bg-white p-5">
                <span className="font-mono text-[12px] tabular-nums tracking-[0.1em] text-ink-soft">
                  {s.n}
                </span>
                <div className="pt-8">
                  <p className="font-display text-[15px] font-extrabold leading-snug tracking-tight text-ink">
                    {s.label}
                  </p>
                  <p className="pt-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                    {s.note}
                  </p>
                </div>
              </div>
              {i < flow.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-[13px] text-ink-soft lg:block"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* Τι να ετοιμάσετε + βίντεο */}
      <Section tone="dark">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
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
              Δεν χρειάζεται να ετοιμάσετε παρουσίαση, νούμερα ή πρόσβαση σε τίποτα.
            </p>
          </div>

          <div>
            <Frame tone="dark" className="bg-white/[0.02]">
              <div className="p-6 sm:p-7">
                <p className="eyebrow text-aura">90 ΔΕΥΤΕΡΟΛΕΠΤΑ</p>
                <p className="pt-4 font-display text-[18px] font-extrabold tracking-tight text-white">
                  Τι θα δούμε στην κλήση
                </p>

                <div className="mt-5 aspect-video w-full overflow-hidden bg-white/[0.03]">
                  {/* TODO: /demos/what-to-expect.mp4 — 90″ από τους ιδρυτές */}
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-dashed border-white/20 text-center">
                    <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg-dim">
                      βίντεο 90″
                    </span>
                    <span className="text-[12px] text-fg-dim">
                      οι ιδρυτές, χωρίς μοντάζ
                    </span>
                  </div>
                </div>

                <p className="pt-5 text-[13px] leading-relaxed text-fg-dim">
                  Αν σας βολεύει καλύτερα άλλη ώρα, απαντήστε απευθείας στο email επιβεβαίωσης —
                  το διαβάζουμε εμείς οι δύο.
                </p>
              </div>
            </Frame>
          </div>
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
              className="border-b-2 border-ink pb-1 font-display text-[15px] font-extrabold tracking-tight text-ink transition-colors hover:border-ink"
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
