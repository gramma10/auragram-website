'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { LazyMount } from '@/components/ui/LazyMount';

// Ο selector (pills, panel, feed, RoiBlock) κατεβαίνει μόνο όταν το section πλησιάσει το viewport — ή αμέσως με deep link.
const IndustriesBody = dynamic(() => import('./IndustriesBody'), { ssr: false });

/**
 * Placeholder = μετρημένο ύψος του selector (390px / 768px / 1440px) → το mount δεν μετακινεί τίποτα (CLS ≈ 0).
 * Deep link `/?industry=<slug>`: mount αμέσως και «ξεκλείδωμα» των content-visibility sections (data-ready), ώστε το
 * scroll προς το #kladoi να προσγειώνεται σωστά — το scroll το κάνει το ίδιο το σώμα όταν γίνει mount.
 */
export function IndustriesLazy() {
  const [eager, setEager] = useState(false);

  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).has('industry')) {
        document.documentElement.setAttribute('data-ready', '');
        setEager(true);
      }
    } catch {
      /* ανύπαρκτο URLSearchParams: κανονικό lazy mount */
    }
  }, []);

  return (
    <LazyMount eager={eager} className="block min-h-[1500px] md:min-h-[1240px] lg:min-h-[1140px]">
      <IndustriesBody />
    </LazyMount>
  );
}
