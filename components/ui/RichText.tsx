import type { Rich } from '@/lib/content';

/**
 * Rich = string | { s } | { m } — markup στην πηγή του copy (όχι regex):
 *  • { s } → cyan <strong> (dark surface)
 *  • { m } → marker highlight: aura-line (#A5F3FC) πίσω από ink κείμενο (ΜΟΝΟ σε light sections — βλ. .marker στο globals.css)
 */
export function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : 'm' in p ? (
          <span key={i} className="marker">
            {p.m}
          </span>
        ) : (
          <strong key={i} className="font-extrabold text-aura">
            {p.s}
          </strong>
        )
      )}
    </>
  );
}

/** Headline από γραμμές Rich: <br /> ανάμεσα στις γραμμές. */
export function RichLines({ lines }: { lines: Rich[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          <RichText parts={l} />
        </span>
      ))}
    </>
  );
}
