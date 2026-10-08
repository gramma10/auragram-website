'use client';

import dynamic from 'next/dynamic';
import { LazyMount } from '@/components/ui/LazyMount';

// Το module του calculator κατεβαίνει μόνο όταν το LazyMount το κάνει render (≈700px πριν το viewport).
const CalculatorBody = dynamic(() => import('./CalculatorBody'), { ssr: false });

/** Ύψη placeholder = μετρημένα ύψη sliders + αποτελέσματος (390–1440px), ώστε το mount να μη μετακινεί τίποτα. */
export function CalculatorLazy() {
  return (
    <LazyMount className="min-h-[1220px] md:min-h-[1140px] lg:col-span-2 lg:min-h-[480px]">
      <CalculatorBody />
    </LazyMount>
  );
}
