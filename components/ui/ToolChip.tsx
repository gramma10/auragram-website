import {
  siGmail,
  siGoogle,
  siGooglecalendar,
  siGoogledocs,
  siGoogledrive,
  siGooglesheets,
  siHubspot,
  siInstagram,
  siMessenger,
  siShopify,
  siViber,
  siWhatsapp,
  siWoocommerce,
  type SimpleIcon,
} from 'simple-icons';
import { toolNames, type ToolId } from '@/lib/content';
import { iconColorOn, type IconSurface } from '@/lib/contrast';
import { cn } from '@/lib/cn';

/**
 * Chip εργαλείου: εικονίδιο + όνομα.
 *  • Brand icon από το simple-icons με το χρώμα της μάρκας (Round 4: αντικαθιστά το μονόχρωμο της Round 2)· αν το χρώμα έχει
 *    < 3:1 πάνω στο chip → fallback (λευκό σε dark, ink σε light).
 *  • Όπου δεν υπάρχει brand icon (Excel, Τηλέφωνο, Email, CRM): Tabler-style line icon σε currentColor.
 * ΔΕΝ υπάρχουν εργαλεία τιμολόγησης / ERP (myDATA, Elorus…): δεν υποστηρίζονται ακόμα.
 */
const brand: Partial<Record<ToolId, SimpleIcon>> = {
  instagram: siInstagram,
  whatsapp: siWhatsapp,
  viber: siViber,
  messenger: siMessenger,
  gmail: siGmail,
  googlecalendar: siGooglecalendar,
  googlesheets: siGooglesheets,
  googledocs: siGoogledocs,
  googledrive: siGoogledrive,
  google: siGoogle,
  hubspot: siHubspot,
  shopify: siShopify,
  woocommerce: siWoocommerce,
};

// Tabler-style (24×24, stroke 1.75, round caps/joins) — paths γραμμένα για αυτό το site
const line: Partial<Record<ToolId, string[]>> = {
  phone: [
    'M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2',
  ],
  email: ['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z', 'M3 7l9 6l9 -6'],
  excel: ['M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z', 'M3 10h18', 'M10 3v18'],
  crm: [
    'M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0',
    'M4 6v6a8 3 0 0 0 16 0v-6',
    'M4 12v6a8 3 0 0 0 16 0v-6',
  ],
};

export function ToolIcon({
  id,
  size = 14,
  surface = 'night',
}: {
  id: ToolId;
  size?: number;
  surface?: IconSurface;
}) {
  const b = brand[id];
  if (b) {
    const fallback = surface === 'lightChip' || surface === 'white' ? '#0F1720' : '#FFFFFF';
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={iconColorOn(b.hex, surface, fallback)} aria-hidden className="shrink-0">
        <path d={b.path} />
      </svg>
    );
  }
  const paths = line[id];
  if (!paths) return null;
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
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * surface 'dark'  : neutral (white/4%) ή cyan (το «ΜΕ ΤΟΝ AGENT»)
 * surface 'light' : λευκό chip, ink/10 border, ink όνομα (Industries)
 */
export function ToolChip({
  id,
  tone = 'neutral',
  surface = 'dark',
}: {
  id: ToolId;
  tone?: 'neutral' | 'cyan';
  surface?: 'dark' | 'light';
}) {
  const light = surface === 'light';
  const iconSurface: IconSurface = light ? 'lightChip' : tone === 'cyan' ? 'cyanChip' : 'darkPill';
  return (
    <li
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-medium leading-none',
        light
          ? 'border-ink/10 bg-white text-ink'
          : tone === 'cyan'
            ? 'border-aura/25 bg-aura/[0.07] text-white/90'
            : 'border-white/[0.1] bg-white/[0.05] text-fg'
      )}
    >
      <ToolIcon id={id} surface={iconSurface} />
      {toolNames[id]}
    </li>
  );
}

export function ToolChips({
  ids,
  tone,
  surface,
  nowrap = false,
}: {
  ids: ToolId[];
  tone?: 'neutral' | 'cyan';
  surface?: 'dark' | 'light';
  /** Μία σειρά (mobile) — μέσα σε <ChipRow> που κάνει οριζόντιο scroll· από sm+ τυλίγει κανονικά. */
  nowrap?: boolean;
}) {
  return (
    <ul className={nowrap ? 'flex flex-nowrap gap-1.5 sm:flex-wrap' : 'flex flex-wrap gap-1.5'}>
      {ids.map((id) => (
        <ToolChip key={id} id={id} tone={tone} surface={surface} />
      ))}
    </ul>
  );
}
