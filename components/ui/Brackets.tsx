import { cn } from '@/lib/cn';

/**
 * Το corner-bracket motif — η υπογραφή της μάρκας. ΕΝΑ component, δύο λειτουργίες:
 *
 *  • mode="hover"  (προεπιλογή) — κρυφά· στο :hover / :focus-within του γονέα
 *    εμφανίζονται με fade και «ανοίγουν» προς τα έξω (4px).
 *    Ο γονέας πρέπει να έχει την κλάση `group` (το <Frame> τη βάζει).
 *  • mode="always" — μόνιμα ορατά. Μόνο για το κουτί της εγγύησης (Pilot).
 *
 * Βάλτε το μέσα σε στοιχείο με `relative`.
 */
export function Brackets({
  tone = 'dark',
  mode = 'hover',
  className,
}: {
  tone?: 'dark' | 'light';
  mode?: 'hover' | 'always';
  className?: string;
}) {
  const color =
    mode === 'always'
      ? 'border-aura'
      : tone === 'dark'
        ? 'border-white/25 group-hover:border-aura group-focus-within:border-aura'
        : 'border-ink/25 group-hover:border-ink/70 group-focus-within:border-ink/70';

  const base = cn(
    'pointer-events-none absolute h-3 w-3 transition-[opacity,transform,border-color] duration-300 ease-out motion-reduce:transition-none',
    color,
    mode === 'hover' && 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
  );

  // Κάθε γωνία ξεκινά 4px προς τα μέσα και «πετάγεται» στη θέση της.
  const move = (dx: string, dy: string) =>
    mode === 'hover'
      ? `${dx} ${dy} group-hover:translate-x-0 group-hover:translate-y-0 group-focus-within:translate-x-0 group-focus-within:translate-y-0`
      : '';

  return (
    <span aria-hidden className={cn('contents', className)}>
      <span className={cn(base, 'left-2.5 top-2.5 border-l-[1.5px] border-t-[1.5px]', move('translate-x-1', 'translate-y-1'))} />
      <span className={cn(base, 'right-2.5 top-2.5 border-r-[1.5px] border-t-[1.5px]', move('-translate-x-1', 'translate-y-1'))} />
      <span className={cn(base, 'bottom-2.5 left-2.5 border-b-[1.5px] border-l-[1.5px]', move('translate-x-1', '-translate-y-1'))} />
      <span className={cn(base, 'bottom-2.5 right-2.5 border-b-[1.5px] border-r-[1.5px]', move('-translate-x-1', '-translate-y-1'))} />
    </span>
  );
}
