'use client';

import dynamic from 'next/dynamic';
import { LazyMount } from '@/components/ui/LazyMount';

// Φόρμα + server action + Cal.com embed: μόνο όταν το #klisi πλησιάσει το viewport (ή γίνει anchor scroll προς αυτό).
const BookingForm = dynamic(() => import('./BookingForm'), { ssr: false });

/** Placeholder = μετρημένο ύψος της φόρμας (390px: 1136, 768px: 665, lg: ~740). Χωρίς JS κρύβεται (βλ. <noscript> στο Booking). */
export function BookingLazy() {
  return (
    <LazyMount className="min-h-[1136px] md:min-h-[665px] lg:min-h-[740px] [html:not([data-js])_&]:hidden">
      <BookingForm />
    </LazyMount>
  );
}
