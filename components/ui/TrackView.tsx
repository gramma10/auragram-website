'use client';

import { useEffect } from 'react';
import { trackOnce, type AuraEvent } from '@/lib/analytics';

/** Στέλνει ένα event μία φορά, όταν φορτώσει η σελίδα. */
export function TrackView({ event }: { event: AuraEvent }) {
  useEffect(() => {
    trackOnce(event);
  }, [event]);
  return null;
}
