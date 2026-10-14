import Link from 'next/link';
import Image from 'next/image';
import { founders, about } from '@/lib/content';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Role } from '@/components/ui/Role';

// Θέση κάδρου: οι πηγές είναι τετράγωνες και το κάδρο 4:5 κόβει μόνο στο πλάτος — το πρόσωπο βρίσκεται στο ~51% του πλάτους.
const facePosition = ['51% 50%', '51% 50%'];

/** Placeholder αντί για stock ή AI-generated πρόσωπο. Το ένα ψεύτικο στοιχείο καίει τη σελίδα. */
function PhotoSlot({ name, src, position }: { name: string; src?: string; position: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name}, συνιδρυτής Auragram`}
        fill
        // sizes = πλάτος που πραγματικά ζωγραφίζεται η εικόνα (όχι του κάδρου): με object-fit: cover σε 4:5 κάδρο η τετράγωνη πηγή
        // σκαλώνει στο ύψος → πλάτος εικόνας = 1.25 × πλάτος κάδρου (βλ. docs/funnel-v2/REPORT-hero-photos.md για τις μετρήσεις).
        sizes="(min-width: 1024px) 360px, (min-width: 640px) 52vw, 56vw"
        quality={90}
        loading="lazy"
        // Χωρίς CSS filter/transform πάνω στην εικόνα: το φίλτρο ξαναζωγράφιζε τα pixel και μαλάκωνε το πρόσωπο.
        style={{ objectFit: 'cover', objectPosition: position }}
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-ink/[0.03] p-4 text-center">
      <span className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-ink-soft">
        φωτογραφία
      </span>
      <span className="text-[12px] leading-snug text-ink-soft">{name} — πραγματική, όχι stock</span>
    </div>
  );
}

export function Founders() {
  return (
    <Section tone="light" id="idrytes">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
        <Reveal>
          <Eyebrow tone="light">{founders.eyebrow}</Eyebrow>
          <H2 tone="light" className="pt-6">
            {founders.h2}
          </H2>
          <p className="t-body pt-6 text-ink/70">{founders.body}</p>

          <ul className="flex flex-wrap gap-2 pt-6">
            {founders.chips.map((c) => (
              <li key={c} className="chip-light whitespace-nowrap !text-[13px]">
                {c}
              </li>
            ))}
          </ul>

          <Link
            href="/about"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 border-b-2 border-aura-deep font-display text-[16px] font-extrabold tracking-tight text-ink transition-colors hover:border-ink"
          >
            {founders.link}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid grid-cols-2 gap-4">
            {about.people.map((p, i) => (
              <figure key={p.name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-white">
                  <PhotoSlot name={p.name} src={p.photo || undefined} position={facePosition[i] ?? '50% 35%'} />
                </div>
                <figcaption className="pt-3">
                  <p className="font-display text-[16px] font-semibold tracking-tight text-ink">{p.name}</p>
                  <Role text={p.role} className="pt-0.5 text-[14px] leading-snug text-ink-soft" />
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
