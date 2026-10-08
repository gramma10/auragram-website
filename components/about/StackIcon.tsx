import {
  siAnthropic,
  siCaldotcom,
  siClaude,
  siHubspot,
  siMake,
  siN8n,
  siNextdotjs,
  siSupabase,
  siTailwindcss,
  siVercel,
  siWhatsapp,
  type SimpleIcon,
} from 'simple-icons';
import { iconColorOn } from '@/lib/contrast';

/**
 * Εικονίδια για το «Με τι χτίζουμε» (/about). Το `icon` κλειδί έρχεται από το content.ts (about.stack).
 *  • brand icon από το simple-icons με το χρώμα της μάρκας όταν έχει ≥ 3:1 πάνω στην κάρτα, αλλιώς λευκό
 *  • ΧΩΡΙΣ simple-icons icon: OpenAI (αφαιρέθηκε από τη βιβλιοθήκη) και Pipedrive → ουδέτερο line icon
 */
const brand: Record<string, SimpleIcon> = {
  claude: siClaude,
  anthropic: siAnthropic,
  n8n: siN8n,
  make: siMake,
  nextjs: siNextdotjs,
  supabase: siSupabase,
  vercel: siVercel,
  tailwind: siTailwindcss,
  whatsapp: siWhatsapp,
  hubspot: siHubspot,
  caldotcom: siCaldotcom,
};

// Tabler-style, ουδέτερα (24×24, stroke 1.75)
const neutral: Record<string, string[]> = {
  // OpenAI: «sparkles» (AI)
  openai: [
    'M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z',
    'M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z',
    'M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z',
  ],
  // Pipedrive: βάση δεδομένων (CRM)
  pipedrive: ['M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0', 'M4 6v6a8 3 0 0 0 16 0v-6', 'M4 12v6a8 3 0 0 0 16 0v-6'],
};


export function StackIcon({ name, size = 22 }: { name: string; size?: number }) {
  const b = brand[name];
  if (b) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill={iconColorOn(b.hex, 'darkPill', '#FFFFFF')} className="shrink-0">
        <path d={b.path} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {(neutral[name] ?? neutral.openai).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
