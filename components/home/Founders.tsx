import Link from 'next/link';
import Image from 'next/image';
import { founders, about } from '@/lib/content';
import { BRAND } from '@/lib/config';
import { Section, Eyebrow, H2 } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';

// Ο ρόλος (about.people[].role) και το handle (BRAND.instagram) έρχονται από υπάρχοντα δεδομένα.
const handles = [BRAND.instagram.christos.handle, BRAND.instagram.panagiotis.handle];
// Κάθετη θέση κάδρου ανά φωτογραφία: κρατά το πρόσωπο στο κέντρο του 4:5 crop.
const facePosition = ['50% 34%', '50% 30%'];

/** Placeholder αντί για stock ή AI-generated πρόσωπο. Το ένα ψεύτικο στοιχείο καίει τη σελίδα. */
function PhotoSlot({ name, src, position }: { name: string; src?: string; position: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${name}, συνιδρυτής Auragram`}
        fill
        sizes="(min-width: 1024px) 230px, (min-width: 640px) 40vw, 45vw"
        loading="lazy"
        // Ενιαία χρωματική μεταχείριση: οι δύο φωτογραφίες (δύο διαφορετικά περιβάλλοντα) κάθονται πιο κοντά.
        style={{ objectFit: 'cover', objectPosition: position, filter: 'saturate(0.9) contrast(1.02) sepia(0.06)' }}
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

          <Link
            href="/about"
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 border-b-2 border-ink font-display text-[16px] font-extrabold tracking-tight text-ink transition-colors hover:border-ink-soft"
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
                  <p className="pt-0.5 text-[14px] leading-snug text-ink-soft">{p.role}</p>
                  <a
                    href={p.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-[44px] items-center font-mono text-[12px] font-medium tracking-[0.02em] text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
                  >
                    {handles[i]} ↗
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
