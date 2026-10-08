import { process } from '@/lib/content';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { ProcessSteps } from './ProcessSteps';

export function Process() {
  return (
    <Section tone="dark" id="diadikasia">
      {/* Κεντραρισμένος τίτλος — σπάει τη μονοτονία των left-aligned headings */}
      <Reveal className="text-center">
        <Eyebrow tone="dark" className="justify-center">
          {process.eyebrow}
        </Eyebrow>
        <H2 tone="dark" className="mx-auto max-w-3xl pt-6">
          {process.h2}
        </H2>
      </Reveal>

      <ProcessSteps />
    </Section>
  );
}
