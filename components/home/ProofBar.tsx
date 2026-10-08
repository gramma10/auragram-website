import { proof } from '@/lib/content';
import { CountUp } from '@/components/ui/CountUp';
import { cn } from '@/lib/cn';

/**
 * Γραμμή αποδείξεων — trust σε 3 δευτερόλεπτα.
 * 3 ίσες στήλες με λεπτά διαχωριστικά· αν λείπει το νούμερο του Instagram
 * (METRICS.instagramFollowers = null) πέφτει σε 2 κεντραρισμένες στήλες.
 * Mobile: 3 στατιστικά στοιβάζονται με οριζόντια διαχωριστικά (οι ετικέτες
 * δεν χωράνε σε 3 στήλες των ~110px)· 2 στατιστικά μένουν σε 2 στήλες.
 */
export function ProofBar() {
  const three = proof.length >= 3;

  return (
    <dl
      className={cn(
        'grid divide-white/[0.08] text-center',
        three
          ? 'grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0'
          : 'mx-auto max-w-3xl grid-cols-2 divide-x'
      )}
    >
      {proof.map((p) => (
        <div
          key={p.label}
          className={cn(
            'flex flex-col items-center gap-2',
            three ? 'px-4 py-6 sm:px-8 sm:py-1' : 'px-3 py-1 sm:px-8'
          )}
        >
          <dt className="font-display text-[34px] font-extrabold leading-none tracking-tightest text-white tnum sm:text-[44px]">
            {p.prefix}
            <CountUp value={p.value} />
            {p.suffix}
          </dt>
          <dd className="max-w-[30ch] text-[13px] leading-snug text-fg-dim sm:text-[14px]">
            {p.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
