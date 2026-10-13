'use client';

import dynamic from 'next/dynamic';
import { LazyMount } from '@/components/ui/LazyMount';

// Φόρμα + server action: μόνο όταν το #klisi πλησιάσει το viewport (ή γίνει anchor scroll προς αυτό).
const BookingForm = dynamic(() => import('./BookingForm'), { ssr: false });

/** Placeholder = μετρημένο ύψος της φόρμας (390px: 1196, 768px: 893, 1280px: 966 — Funnel v2, φόρμα 1 βήματος). Χωρίς JS κρύβεται (βλ. <noscript> στο Booking). */
export function BookingLazy() {
  return (
    <LazyMount className="min-h-[1196px] md:min-h-[893px] lg:min-h-[966px] [html:not([data-js])_&]:hidden">
      <BookingForm />
    </LazyMount>
  );
}
