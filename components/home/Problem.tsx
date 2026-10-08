import { problem } from '@/lib/content';
import { Section, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { RichText } from '@/components/ui/RichText';

export function Problem() {
  return (
    <Section tone="light" id="provlima">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <H2 tone="light">
            <RichText parts={problem.h2[0]} />
            <br />
            <span className="text-ink-soft">
              <RichText parts={problem.h2[1]} />
            </span>
          </H2>
        </Reveal>

        <div>
          {/* Τέσσερις «σκηνές»: το mono tag (ώρα / πλήθος / αρχείο) απηχεί το chat του hero. */}
          <ul className="flex flex-col">
            {problem.bullets.map((b, i) => (
              <Reveal as="li" key={b.tag} delay={i * 0.07}>
                <div className="flex items-start gap-4 border-t border-ink/10 py-5 sm:gap-5">
                  <span
                    className="mt-[2px] inline-flex h-7 w-[68px] shrink-0 items-center justify-center rounded-full bg-volt font-mono text-[12px] font-medium tracking-[0.04em] text-ink tnum"
                    aria-hidden
                  >
                    {b.tag}
                  </span>
                  <p className="t-body text-ink/80">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <div className="mt-8 border-l-2 border-volt pl-5">
              <p className="font-display text-[19px] font-extrabold leading-snug tracking-tight text-ink sm:text-[22px]">
                {problem.close[0]}
              </p>
              <p className="pt-1 font-display text-[19px] font-extrabold leading-snug tracking-tight text-ink-soft sm:text-[22px]">
                {problem.close[1]}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
