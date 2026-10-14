/**
 * «Συνιδρυτής · AI Solutions Architect» → δύο μη-σπάσιμα κομμάτια: σε στενό κάδρο η γραμμή σπάει ΜΟΝΟ στο «·»,
 * ποτέ μέσα σε όνομα ρόλου («Full-Stack & AI / Engineer»).
 */
export function Role({ text, className }: { text: string; className?: string }) {
  const [a, b] = text.split(' · ');
  return (
    <p className={className}>
      <span className="whitespace-nowrap">{a}</span>
      {b && (
        <>
          {' '}
          <span aria-hidden>·</span> <span className="whitespace-nowrap">{b}</span>
        </>
      )}
    </p>
  );
}
