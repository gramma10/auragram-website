'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Τα events του spec §9. `booking_complete` είναι το Meta Custom Conversion. */
export type AuraEvent =
  | 'hero_cta_click'
  | 'agent_card_view'
  | 'calculator_used'
  | 'calculator_result_view'
  | 'pilot_section_view'
  | 'about_page_view'
  | 'form_start'
  | 'form_submit'
  | 'booking_complete'
  | 'scroll_75'
  | 'chat_opened'
  | 'chat_booked'
  | 'service_tab_view' // Round 3: tab στις Υπηρεσίες ({ tab })
  | 'industry_view'; // Round 3: κλάδος στο Industries ({ industry, via: 'tap' | 'swipe' | 'arrow' | 'deeplink' })

/** Στέλνει το ίδιο event σε GA4 και Meta. Ασφαλές αν λείπει το ένα ή και τα δύο. */
export function track(event: AuraEvent, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', event, params);
    window.fbq?.('trackCustom', event, params);
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
