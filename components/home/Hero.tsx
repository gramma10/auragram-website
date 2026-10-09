import { hero, heroTools } from '@/lib/content';
import { Cta } from '@/components/ui/Cta';
import { Aura } from '@/components/ui/Aura';
import { ToolsMarquee } from '@/components/ui/ToolsMarquee';
import { HeroChat } from './HeroChat';
import { ProofBar } from './ProofBar';

export function Hero() {
  return (
    <section className="surface-dark grid-bg relative isolate overflow-x-clip px-4 pb-14 pt-28 max-sm:pt-[88px] sm:px-6 sm:pb-16 sm:pt-36 lg:pb-20 lg:pt-40">
      <Aura />
      {/* Mobile: headline → subhead → CTA → risk row → phone. Desktop: 2 στήλες, phone κεντραρισμένο. */}
      {/* Mobile (< 640px): κενά 12px ανάμεσα στα blocks ώστε το κινητό (hero-stage) να φαίνεται από την πρώτη οθόνη. */}
      <div className="relative mx-auto grid w-full max-w-page gap-12 max-sm:gap-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        {/* data-hero-text: στο mobile (< 640px) το HeroChat το σβήνει/ανεβάζει σε συνάρτηση με το settle του κινητού. */}
        <div data-hero-text>
          {/* Το eyebrow είναι μακρύ («AI συστήματα με μετρήσιμο ROI · Ελλάδα»): σε mobile στενό tracking ώστε να μένει σε ΜΙΑ γραμμή και με
            το fallback και με το JetBrains Mono — αλλιώς το font swap το κατεβάζει από 2 σε 1 γραμμή και σπρώχνει όλο το hero (CLS). */}
          <p className="eyebrow flex items-center gap-2.5 whitespace-nowrap tracking-[0.04em] text-aura sm:tracking-[0.12em]">
            <span className="h-1.5 w-1.5 rounded-full bg-aura animate-pulse-dot" aria-hidden />
            {hero.eyebrow}
          </p>

          <h1 className="h1 h1-hero pt-5 text-white max-sm:pt-3 sm:pt-6">
            {hero.h1[0]}
            <br />
            {/* Η ουσία της υπόσχεσης — cyan, όχι γκρι */}
            <span className="text-aura">{hero.h1[1]}</span>
          </h1>

          <p className="t-body pt-5 text-fg max-sm:pt-3 sm:pt-6">{hero.sub}</p>

          <div className="flex flex-col items-start gap-3.5 pt-7 max-sm:gap-3 max-sm:pt-4 sm:pt-9">
            <Cta tone="dark" where="hero" />
            {/* Risk-reversal: 3 check items. Κάθε item έχει δικό του ✓ — δεν υπάρχουν διαχωριστικά «·» που θα
                μπορούσαν να μείνουν ορφανά όταν τυλίγει. Σε κινητό (< 640px) στοιβάζονται σε 3 γραμμές: δύο
                items μαζί χρειάζονται ≥ 372px, ενώ το διαθέσιμο πλάτος στα 390px είναι 358px. */}
            <p className="text-[13px] leading-snug text-fg-dim sm:hidden">{hero.checksShort}</p>
            <ul className="hidden flex-col items-start gap-y-2 text-[14px] leading-snug text-fg-dim sm:flex sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              {hero.risk.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
                    <path d="M2.5 7.4 5.6 10.5 11.5 3.8" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="#agents"
            className="mt-4 hidden min-h-[44px] items-center gap-2 border-b border-white/15 text-[14px] text-fg-dim transition-colors hover:border-aura hover:text-white sm:mt-6 sm:inline-flex"
          >
            {hero.ghost}
            <span aria-hidden>↓</span>
          </a>
        </div>

        <HeroChat />
      </div>

      <div className="relative mx-auto mt-14 w-full max-w-page border-t border-white/[0.08] pt-8 sm:mt-16 sm:pt-10">
        <ProofBar />
      </div>

      {/* Marquee εργαλείων: μία γραμμή κάτω από τα proof stats. Server-rendered στατικό HTML+CSS (χωρίς client JS). */}
      <div className="relative mx-auto mt-10 w-full max-w-page sm:mt-12">
        <p className="text-center font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-fg-dim">{heroTools.label}</p>
        <ToolsMarquee label={heroTools.label} className="mx-auto mt-4 w-full max-w-[1500px]" />
      </div>
    </section>
  );
}
