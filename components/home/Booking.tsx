import { offer, bookingNoscript } from '@/lib/content';
import { CAL_LINK, contactEmail } from '@/lib/config';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { BookingLazy } from './BookingLazy';

function bold(text: string) {
  // «**έντονα**» μέσα στο copy του offer
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-semibold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/** Server shell: το offer (στατικό copy, SSR). Η φόρμα/Cal.com στα δεξιά είναι lazy — βλ. BookingLazy / BookingForm. */
export function Booking() {
  return (
    <Section tone="dark" id="klisi" className="pb-sticky lg:pb-32">
      <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* Το offer */}
        <div>
          <Reveal>
            <Eyebrow tone="dark">{offer.eyebrow}</Eyebrow>
            <H2 tone="dark" className="pt-6">
              {offer.h2}
            </H2>
            <p className="pt-5 font-display text-[16px] font-extrabold leading-snug tracking-tight text-white sm:text-[18px]">
              {offer.sub}
            </p>

            <ol className="flex flex-col gap-4 pt-8">
              {offer.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-[2px] font-mono text-[12px] tabular-nums tracking-[0.1em] text-fg-dim">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[15px] leading-relaxed text-fg">{bold(s)}</p>
                </li>
              ))}
            </ol>

            <p className="mt-8 border-l-2 border-aura pl-5 text-[15px] leading-relaxed text-fg">
              {offer.delivery}
            </p>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8">
              <p className="text-[13px] leading-relaxed text-fg-dim">{offer.anchor}</p>
              <p className="flex items-center gap-2.5 font-display text-[15px] font-extrabold tracking-tight text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-aura animate-pulse-dot" aria-hidden />
                {offer.scarcity}
                {/* Για live «X θέσεις έμειναν»: τραβήξτε slots από το Cal.com API.
                    ΠΟΤΕ fake countdown. */}
              </p>
              <p className="text-[13px] leading-relaxed text-fg-dim">{offer.riskReversal}</p>
            </div>
          </Reveal>
        </div>

        <BookingLazy />

        {/* Χωρίς JS δεν υπάρχει φόρμα ούτε Cal.com embed: απλό link στη σελίδα κράτησης + email. */}
        <noscript>
          <div className="on-light rounded-[20px] border border-ink/15 bg-white p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-ink">{bookingNoscript.text}</p>
            {CAL_LINK && (
              <a
                href={`https://cal.com/${CAL_LINK}`}
                className="btn-cta mt-5 w-full sm:w-auto"
              >
                {bookingNoscript.calLabel}
              </a>
            )}
            <p className="pt-5 text-[15px] leading-relaxed text-ink-soft">
              {CAL_LINK ? bookingNoscript.emailLabel : bookingNoscript.emailOnly}{' '}
              <a
                href={`mailto:${contactEmail()}`}
                className="border-b-2 border-aura-deep font-display font-extrabold text-ink [overflow-wrap:anywhere]"
              >
                {contactEmail()}
              </a>
            </p>
          </div>
        </noscript>
      </div>
    </Section>
  );
}
