'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Τα events του site. Primary conversion = `lead_submit` (μόνο ΜΕΤΑ από επιτυχή απάντηση του server)· στο Meta Pixel
 * αντιστοιχεί στο standard event `Lead` (βλ. META_STANDARD). Κανένα event κράτησης ραντεβού δεν υπάρχει πια.
 */
export type AuraEvent =
  | 'hero_cta_click'
  | 'agent_card_view'
  | 'calculator_used'
  | 'calculator_result_view'
  | 'pilot_section_view'
  | 'about_page_view'
  | 'form_start'
  | 'lead_submit' // { industry, utm_source, utm_campaign, has_calculator }
  | 'scroll_75'
  | 'chat_opened'
  | 'chat_booked'
  | 'service_tab_view' // Round 3: tab στις Υπηρεσίες ({ tab })
  | 'industry_view'; // Round 3: κλάδος στο Industries ({ industry, via: 'tap' | 'swipe' | 'arrow' | 'deeplink' })

/** Events που στο Meta Pixel στέλνονται ως STANDARD event (`fbq('track', …)`) αντί για custom. */
const META_STANDARD: Partial<Record<AuraEvent, string>> = { lead_submit: 'Lead' };

/** Στέλνει το ίδιο event σε GA4 και Meta. Ασφαλές αν λείπει το ένα ή και τα δύο. */
export function track(event: AuraEvent, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', event, params);
    const standard = META_STANDARD[event];
    window.fbq?.(standard ? 'track' : 'trackCustom', standard ?? event, params);
  } catch {
    /* ποτέ να μη σπάει το UI για ένα analytics call */
  }
}

/** Στέλνεται μία φορά ανά session ανά κλειδί. */
const fired = new Set<string>();
export function trackOnce(
  event: AuraEvent,
  params: Record<string, unknown> = {},
  key: string = event
) {
  if (fired.has(key)) return;
  fired.add(key);
  track(event, params);
}
