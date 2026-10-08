import { industriesSection } from '@/lib/content';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { RichLines } from '@/components/ui/RichText';
import { IndustriesLazy } from './IndustriesLazy';

/**
 * Server shell: το section (ανοιχτόχρωμο) + στατικό heading στο HTML. Ο selector (pills + λευκό panel) είναι lazy —
 * βλ. IndustriesLazy / IndustriesBody.
 */
export function Industries() {
  return (
    <Section tone="light" id="kladoi" className="!py-14 md:!py-24 lg:!py-32">
      <Reveal>
        <Eyebrow tone="light">{industriesSection.eyebrow}</Eyebrow>
        <H2 tone="light" className="max-w-3xl pt-6">
          <RichLines lines={industriesSection.h2} />
        </H2>
        <p className="t-body pt-5 text-ink-soft">{industriesSection.sub}</p>
      </Reveal>

      <div className="pt-6 lg:pt-12">
        <IndustriesLazy />
      </div>
    </Section>
  );
}
