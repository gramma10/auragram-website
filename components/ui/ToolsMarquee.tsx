import {
  siGmail,
  siGooglecalendar,
  siGoogledocs,
  siGooglesheets,
  siHubspot,
  siInstagram,
  siMessenger,
  siNotion,
  siShopify,
  siStripe,
  siViber,
  siWhatsapp,
  siWoocommerce,
  type SimpleIcon,
} from 'simple-icons';
import { iconColorOn } from '@/lib/contrast';
import { cn } from '@/lib/cn';

/**
 * Marquee εργαλείων στο κάτω μέρος του hero: ΜΙΑ γραμμή, 15 εργαλεία, ~45s loop. Server component — στατικό HTML + CSS,
 * μηδέν client JS (δεν κοστίζει στο critical path και δεν μπορεί να είναι το LCP). Pause στο hover· fade στις άκρες με mask·
 * reduced motion → στατικό, τυλιγμένο σε γραμμές (βλ. globals.css).
 * Εργαλεία που ξέρει ο ιδιοκτήτης μιας ελληνικής μικρομεσαίας — ΚΑΜΙΑ εφαρμογή τιμολόγησης/ERP, καμία «9.000+ integrations».
 * `icon: null` = δεν υπάρχει brand icon στο simple-icons (Excel, Pipedrive) → μόνο το όνομα.
 */
type Tool = { name: string; icon: SimpleIcon | null };

const tools: Tool[] = [
  { name: 'WhatsApp', icon: siWhatsapp },
  { name: 'Viber', icon: siViber },
  { name: 'Instagram', icon: siInstagram },
  { name: 'Messenger', icon: siMessenger },
  { name: 'Gmail', icon: siGmail },
  { name: 'Google Calendar', icon: siGooglecalendar },
  { name: 'Google Sheets', icon: siGooglesheets },
  { name: 'Google Docs', icon: siGoogledocs },
  { name: 'Excel', icon: null },
  { name: 'HubSpot', icon: siHubspot },
  { name: 'Pipedrive', icon: null },
  { name: 'Shopify', icon: siShopify },
  { name: 'WooCommerce', icon: siWoocommerce },
  { name: 'Notion', icon: siNotion },
  { name: 'Stripe', icon: siStripe },
];

function Pill({ tool }: { tool: Tool }) {
  return (
    <li className="mr-3 inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2.5">
      {tool.icon && (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden className="shrink-0" fill={iconColorOn(tool.icon.hex, 'darkPill', '#FFFFFF')}>
          <path d={tool.icon.path} />
        </svg>
      )}
      <span className="font-display text-[15px] font-bold leading-none tracking-tight text-white">{tool.name}</span>
    </li>
  );
}

/**
 * Δύο ίδια tracks → seamless loop (το καθένα ολισθαίνει κατά το πλάτος του· ένα αντίγραφο των 15 pills ≥ 2200px,
 * αρκετά για κάθε οθόνη έως το max-w του container). Το δεύτερο track είναι aria-hidden.
 */
export function ToolsMarquee({ className, label = 'Εργαλεία' }: { className?: string; label?: string }) {
  const track = (hidden?: boolean) => (
    <ul className="marquee-track flex w-max" aria-hidden={hidden || undefined} aria-label={hidden ? undefined : label}>
      {tools.map((t) => (
        <Pill key={t.name} tool={t} />
      ))}
    </ul>
  );
  return (
    <div className={cn('marquee overflow-hidden', className)} style={{ ['--marquee-dur' as string]: '45s' }}>
      {track()}
      {track(true)}
    </div>
  );
}
