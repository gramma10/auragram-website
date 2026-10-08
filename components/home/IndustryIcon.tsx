import type { IndustryIcon as IconName } from '@/lib/industries';

/** Tabler-style line icons (24×24, stroke 1.75) για τα pills των κλάδων. */
const paths: Record<IconName, string[]> = {
  stethoscope: [
    'M6 4h-1a2 2 0 0 0 -2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1',
    'M8 15a6 6 0 1 0 12 0v-3',
    'M11 3v2',
    'M6 3v2',
    'M18 10a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  ],
  calculator: [
    'M4 5a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M8 8a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z',
    'M8 14v.01',
    'M12 14v.01',
    'M16 14v.01',
    'M8 17v.01',
    'M12 17v.01',
    'M16 17v.01',
  ],
  barbell: [
    'M2 12h1',
    'M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2',
    'M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z',
    'M9 12h6',
    'M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z',
    'M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2',
    'M22 12h-1',
  ],
  bed: ['M5 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M22 17v-3h-20', 'M2 8v9', 'M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z'],
  home: [
    'M5 12l-2 0l9 -9l9 9l-2 0',
    'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7',
    'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6',
  ],
  cart: [
    'M4 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M15 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M17 17h-11v-14h-2',
    'M6 5l14 1l-1 7h-13',
  ],
};

export function IndustryIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
