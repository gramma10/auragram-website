import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { RichText } from '@/components/ui/RichText';
import { calculatorH2 } from '@/lib/content';
import { CalculatorLazy } from './CalculatorLazy';

/**
 * Server shell: section + στατικό heading (SSR, μπαίνει στο HTML). Το διαδραστικό κομμάτι (sliders, αποτέλεσμα,
 * mini-bar) είναι lazy — βλ. CalculatorLazy / CalculatorBody. Η διάταξη (grid στήλες/γραμμές) ορίζεται εδώ και
 * στο body ώστε να είναι πανομοιότυπη με πριν.
 */
export function Calculator() {
  return (
    <Section tone="light" id="ypologismos" mesh={false} className="!bg-bone-2">
      <div
        id="calc-grid"
        className="grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16"
      >
        <div className="lg:col-start-1 lg:row-start-1">
          <Reveal>
            <Eyebrow tone="light">ΤΟ ΚΟΣΤΟΣ ΤΗΣ ΑΝΑΜΟΝΗΣ</Eyebrow>
            <H2 tone="light" className="pt-6">
              <RichText parts={calculatorH2} />
            </H2>
            <p className="t-body pt-5 text-ink-soft">
              Τέσσερα νούμερα που τα ξέρετε ήδη. Το υπόλοιπο το κάνει ο υπολογισμός.
            </p>
          </Reveal>
        </div>
        <CalculatorLazy />
      </div>
    </Section>
  );
}
