import Image from 'next/image';
import { cn } from '@/lib/cn';
import lockup from '@/public/logo-lockup.png';
import mark from '@/public/logo-mark.png';

/**
 * Το επίσημο λογότυπο της Auragram — το ίδιο render που έδωσε ο πελάτης
 * (μεταλλικό σήμα + λεκτικό «AURAGRAM»). Τα assets έχουν feather-άρισμα στις
 * άκρες (scripts, sharp) ώστε το σκούρο φόντο του render να λιώνει μέσα στις
 * σκούρες επιφάνειες. `screen` blend για να σβήσει και το υπόλοιπο.
 * Χρήση ΜΟΝΟ πάνω σε σκούρο (nav, footer).
 */

const blend = { mixBlendMode: 'screen' as const };

/** Μόνο το σήμα (τρίγωνο). */
export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
  /** @deprecated κρατιέται για συμβατότητα με παλιές κλήσεις */
  id?: string;
  glow?: boolean;
}) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden
      priority={priority}
      sizes="48px"
      className={cn('block w-auto select-none', className || 'h-8')}
      style={blend}
    />
  );
}

/** Πλήρες lockup: σήμα + λεκτικό. */
export function Logo({
  className,
  markClassName,
  priority = false,
}: {
  /** @deprecated — το λογότυπο είναι πάντα για σκούρο φόντο */
  tone?: 'dark' | 'light';
  className?: string;
  markClassName?: string;
  priority?: boolean;
  id?: string;
}) {
  return (
    <span className={cn('inline-flex select-none items-center', className)}>
      <Image
        src={lockup}
        alt="Auragram"
        priority={priority}
        sizes="240px"
        className={cn('block w-auto', markClassName || 'h-9 sm:h-10')}
        style={blend}
      />
    </span>
  );
}
