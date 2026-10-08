'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { LazyMount } from '@/components/ui/LazyMount';

const FaqList = dynamic(() => import('./FaqList'), { ssr: false });

/** `placeholder` = στατική (server-rendered) λίστα ίδιου markup — μένει στο HTML για SEO/no-JS έως το mount. */
export function FaqLazy({ placeholder }: { placeholder: ReactNode }) {
  return (
    <LazyMount placeholder={placeholder}>
      <FaqList />
    </LazyMount>
  );
}
