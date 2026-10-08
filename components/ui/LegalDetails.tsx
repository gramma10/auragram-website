import type { ReactNode } from 'react';
import { LEGAL } from '@/lib/config';
import { LEGAL_LABELS, type LegalKey } from '@/lib/legal';

const prefix: Partial<Record<LegalKey, string>> = { afm: 'ΑΦΜ ', doy: 'ΔΟΥ ', seat: 'έδρα ' };

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
 * Τα νομικά στοιχεία του LEGAL (lib/config.ts) σε ένα σημείο του κειμένου.
 *  • συμπληρωμένα → «πλήρης επωνυμία, ΑΦΜ …, ΔΟΥ …, έδρα …»
 *  • ελλιπή, development → TODO block ανά πεδίο
 *  • ελλιπή, production → το build έχει ήδη αποτύχει (lib/legal.ts)· με LEGAL_TODO_OK=1 παραλείπονται.
 * `bare`: μόνο οι τιμές, χωρίς πρόθεμα (π.χ. η πόλη των δικαστηρίων).
 */
export function LegalDetails({ fields, bare = false }: { fields: LegalKey[]; bare?: boolean }) {
  const dev = process.env.NODE_ENV === 'development';
  const parts: ReactNode[] = [];
  fields.forEach((k) => {
    const v = LEGAL[k] && String(LEGAL[k]).trim();
    if (v) parts.push(<span key={k}>{bare ? v : `${prefix[k] ?? ''}${v}`}</span>);
    else if (dev) parts.push(<TodoBlock key={k} field={k} />);
  });
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && ', '}
          {p}
        </span>
      ))}
    </>
  );
}
