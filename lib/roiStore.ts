'use client';

/**
 * Μικροσκοπικό store: ο ROI calculator γράφει, η φόρμα διαβάζει.
 * Τα αποτελέσματα ταξιδεύουν ως hidden fields στο booking, ώστε να μπαίνετε
 * στην κλήση ξέροντας ήδη το νούμερο του πελάτη.
 */
export type RoiSnapshot = {
  leads: number;
  responseRate: number;
  avgValue: number;
  hoursPerWeek: number;
  lostRevenue: number;
  hoursPerMonth: number;
  timeValue: number;
} | null;

let snapshot: RoiSnapshot = null;
/** Ο επισκέπτης άλλαξε ΠΡΑΓΜΑΤΙΚΑ κάποιο slider/input (όχι στο mount, όχι σε απλό tab). */
let touched = false;
/** Ο τελευταίος κλάδος που είδε στο Industries (slug) — ταξιδεύει στη φόρμα ως hidden field. */
let industry = '';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setRoi(next: NonNullable<RoiSnapshot>) {
  snapshot = next;
  emit();
}

export function markRoiTouched() {
  if (touched) return;
  touched = true;
  emit();
}

export const getRoiTouched = () => touched;
export const getRoiTouchedServer = () => false;

export function setIndustry(slug: string) {
  if (industry === slug) return;
  industry = slug;
  emit();
}

export const getIndustry = () => industry;
export const getIndustryServer = () => '';

export function subscribeRoi(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRoi(): RoiSnapshot {
  return snapshot;
}

/** Ο server δεν έχει ποτέ snapshot — αποφεύγει hydration mismatch. */
export function getRoiServer(): RoiSnapshot {
  return null;
}
