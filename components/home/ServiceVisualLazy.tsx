'use client';

import dynamic from 'next/dynamic';
import { LazyMount, useLazyReady } from '@/components/ui/LazyMount';
import { ServiceVisual as Visual } from './ServiceVisuals';

type Props = { n: string; play: boolean };

// Τα visuals των υπηρεσιών (διακοσμητικά, aria-hidden) κατεβαίνουν μόνο όταν πλησιάσει το section.
// Το import του module γίνεται ΜΟΝΟ μέσα στο dynamic → το Visual του πάνω import χρησιμοποιείται μόνο ως τύπος.
const ServiceVisual = dynamic<Props>(
  () =>
    import('./ServiceVisuals').then((m) => {
      const V = m.ServiceVisual as typeof Visual;
      return function ServiceVisualReady(props: Props) {
        useLazyReady();
        return <V {...props} />;
      };
    }),
  { ssr: false }
);

/** Το placeholder έχει το ΙΔΙΟ ύψος με το visual (216px / 200px στο sm+) → κανένα layout shift στο mount. */
export function ServiceVisualLazy({ n, play }: Props) {
  return (
    <LazyMount className="block h-[216px] sm:h-[200px]">
      <ServiceVisual n={n} play={play} />
    </LazyMount>
  );
}
