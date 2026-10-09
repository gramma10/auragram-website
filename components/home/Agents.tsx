import { agentsSection } from '@/lib/content';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Cta } from '@/components/ui/Cta';
import { Aura } from '@/components/ui/Aura';
import { AgentsCards } from './AgentsCards';
import { AgentsFeed } from './AgentsFeed';

export function Agents() {
  return (
    <Section tone="dark" id="agents" grid clip className="isolate" before={<Aura tall />}>
      <Reveal>
        <Eyebrow tone="dark">{agentsSection.eyebrow}</Eyebrow>
        <H2 tone="dark" className="max-w-3xl pt-6">
          {agentsSection.h2}
        </H2>
        <p className="pt-5 t-body text-fg">{agentsSection.sub}</p>
      </Reveal>

      <div className="pt-12">
        <AgentsCards />
        <AgentsFeed />
      </div>

      <Reveal delay={0.1}>
        <div className="mt-14 flex flex-col items-start gap-3.5 border-t border-white/[0.08] pt-10">
          <Cta tone="dark" where="agents" />
          <p className="max-w-md text-[13px] leading-relaxed text-fg-dim">{agentsSection.ctaSub}</p>
        </div>
      </Reveal>
    </Section>
  );
}
