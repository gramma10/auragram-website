import type { ReactNode } from 'react';
import { LEGAL_LABELS, legalValue, type LegalKey } from '@/lib/legal';

/** Ορατό ΜΟΝΟ σε development: σαφές μπλοκ «εδώ λείπει στοιχείο», ώστε να μη χαθεί ποτέ. */
function TodoBlock({ field }: { field: LegalKey }) {
  return (
    <mark
      data-legal-todo={field}
      className="mx-0.5 rounded border border-dashed border-amber-500 bg-amber-100 px-1.5 py-0.5 font-mono text-[12px] font-medium text-amber-900"
    >
      TODO · {LEGAL_LABELS[field]}
    </mark>
  );
}

/**
 * Ένα νομικό στοιχείο (lib/config.ts → LEGAL / CONTACT) σε ένα σημείο του κειμένου.
 *  • συμπληρωμένο → η τιμή
 *  • ελλιπές, development → TODO block
 *  • ελλιπές, production → το build έχει ήδη αποτύχει (lib/legal.ts)· με LEGAL_TODO_OK=1 (preview) δεν βγαίνει τίποτα.
 */
export function LegalValue({
  field,
  before = '',
  after = '',
}: {
  field: LegalKey;
  /** κείμενο ΠΡΙΝ την τιμή — εμφανίζεται μόνο αν εμφανίζεται και η τιμή (π.χ. «Πόλη: ») */
  before?: string;
  /** κείμενο ΜΕΤΑ την τιμή (π.χ. «. ») */
  after?: string;
}): ReactNode {
  const v = legalValue(field);
  if (v) return <>{before}{v}{after}</>;
  return process.env.NODE_ENV === 'development' ? <>{before}<TodoBlock field={field} />{after}</> : null;
}
