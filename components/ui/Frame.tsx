import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Brackets } from './Brackets';

/**
 * Κάρτα: μεγάλη ακτίνα, hairline περίγραμμα, διακριτική σκιά.
 * `interactive` → τα corner brackets (βλ. <Brackets />) εμφανίζονται σε
 * :hover / :focus-within. Στις απλές κάρτες η επιφάνεια μένει καθαρή.
 */
export function Frame({
  children,
  tone = 'dark',
  className,
  interactive = false,
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[20px]',
        tone === 'dark'
          ? 'border border-white/[0.08]'
          : 'border border-line shadow-[0_1px_2px_rgba(15,23,32,0.04),0_14px_32px_-20px_rgba(15,23,32,0.22)]',
        className
      )}
    >
      {interactive && <Brackets tone={tone} />}
      {children}
    </div>
  );
}
