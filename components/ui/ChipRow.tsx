'use client';

import { useRef } from 'react';
import { useEdgeFade } from '@/lib/hooks';
import { ToolChips } from './ToolChip';

type Props = Parameters<typeof ToolChips>[0];

/**
 * Tool chips σε ΜΙΑ οριζόντια γραμμή με scroll (mobile), fade στην άκρη ΜΟΝΟ όταν υπάρχει κι άλλο περιεχόμενο (useEdgeFade).
 * Από sm+ τα chips τυλίγουν κανονικά και δεν υπάρχει mask. Έτσι οι agent cards κρατούν σταθερό ύψος σε στενές οθόνες.
 * tabIndex=-1: το Chrome κάνει τα scrollable containers tab stops· εδώ τα chips είναι μόνο πληροφορία (όλα στο DOM για screen readers),
 * οπότε δεν θέλουμε 2 έξτρα tab stops ανά κάρτα ανάμεσα στις κάρτες του stack.
 */
export function ChipRow(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEdgeFade(ref, 20);
  return (
    <div ref={ref} tabIndex={-1} className="fade-x fade-x-sm no-scrollbar -mx-0.5 overflow-x-auto px-0.5 sm:overflow-visible">
      <ToolChips {...props} nowrap />
    </div>
  );
}
