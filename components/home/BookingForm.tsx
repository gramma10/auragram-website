'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { submitLead, type LeadState } from '@/app/actions';
import { formCopy } from '@/lib/content';
import { CTA } from '@/lib/config';
import { formatEUR } from '@/lib/format';
import { makeLeadSchema, type LeadFieldKey } from '@/lib/lead';
import { rememberSubmittedLead } from '@/lib/leadStore';
import { Reveal } from '@/components/ui/Reveal';
import { Frame } from '@/components/ui/Frame';
import { getIndustry, getIndustryServer, getRoi, getRoiServer, subscribeRoi } from '@/lib/roiStore';
import { track, trackOnce } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { useLazyReady } from '@/components/ui/LazyMount';

const initial: LeadState = { status: 'idle' };

// Η ΙΔΙΑ επικύρωση με τον server (lib/lead.ts) — εδώ μόνο για άμεσα inline errors· ο server ξαναελέγχει τα πάντα.
const clientSchema = makeLeadSchema({ reasons: formCopy.reasons, revenues: formCopy.revenues });
const FIELD_ORDER: LeadFieldKey[] = ['name', 'phone', 'email', 'business'];

type Errors = Partial<Record<LeadFieldKey, string>>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn('btn-cta w-full', 'disabled:cursor-wait disabled:opacity-60')}
    >
      {pending ? 'Στέλνουμε…' : CTA.label}
      {!pending && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="btn-arrow">
          <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
        </svg>
      )}
    </button>
  );
}

function Field({
  label,
  name,
  type = 'text',
  error,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="block pb-2 text-[13px] font-medium text-ink/75">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-required
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        // 16px: κάτω από αυτό το iOS Safari / in-app browsers κάνουν zoom στο focus.
        className={cn(
          'min-h-[48px] w-full rounded-xl border bg-white px-4 py-3 text-[16px] text-ink outline-none transition-colors',
          'placeholder:text-ink-soft focus:border-ink',
          error ? 'border-red-600' : 'border-ink/15'
        )}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="pt-1.5 text-[13px] leading-snug text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Προαιρετικά chips (μονή επιλογή· δεύτερο tap στο ίδιο = αποεπιλογή). */
function Choice({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly string[];
}) {
  const [value, setValue] = useState('');
  return (
    <fieldset>
      <legend className="pb-2.5 text-[13px] font-medium text-ink/75">
        {label} <span className="font-normal text-ink-soft">(προαιρετικό)</span>
      </legend>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => setValue(on ? '' : o)}
              className={cn(
                'min-h-[44px] rounded-xl border px-3.5 py-2.5 text-[14px] transition-colors',
                on
                  ? 'border-ink bg-ink text-white'
                  : 'border-ink/15 bg-white text-ink/70 hover:border-ink/40'
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Η φόρμα — δεξιά στήλη του #klisi· φορτώνεται lazy (βλ. BookingLazy). Μονό βήμα: μετά την επιτυχία πάμε στο /confirmation. */
export default function BookingForm() {
  useLazyReady();
  const router = useRouter();
  const [state, formAction] = useFormState(submitLead, initial);
  const [utm, setUtm] = useState('');
  const [page, setPage] = useState('');
  // Inline errors: από τον client (άμεσα) ή από τον server (αν κάτι ξέφυγε)· καθαρίζουν πεδίο-πεδίο όταν ο επισκέπτης το διορθώσει.
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const elapsedRef = useRef<HTMLInputElement>(null);
  // Η στιγμή που η φόρμα έγινε ορατή (για τον έλεγχο «< 3″ = bot» — ο server το επιβάλλει).
  const shownAt = useRef<number | null>(null);
  const handled = useRef(false);

  const roi = useSyncExternalStore(subscribeRoi, getRoi, getRoiServer);
  const industry = useSyncExternalStore(subscribeRoi, getIndustry, getIndustryServer);

  // UTM από το link-in-bio, με μνήμη ώστε να επιβιώνει της περιήγησης. `page` = η σελίδα που προσγειώθηκε.
  useEffect(() => {
    let landing = window.location.pathname;
    try {
      const params = new URLSearchParams(window.location.search);
      const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      const found: Record<string, string> = {};
      keys.forEach((k) => {
        const v = params.get(k);
        if (v) found[k] = v;
      });
      if (Object.keys(found).length) {
        found.landing = window.location.pathname;
        localStorage.setItem('aura-utm', JSON.stringify(found));
        setUtm(JSON.stringify(found));
      } else {
        const stored = localStorage.getItem('aura-utm') || '';
        setUtm(stored);
        if (stored) landing = JSON.parse(stored).landing || landing;
      }
    } catch {
      /* ιδιωτική περιήγηση */
    }
    setPage(landing);
  }, []);

  // Χρονομέτρηση «φόρμα ορατή»: από την πρώτη φορά που φαίνεται στην οθόνη.
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      shownAt.current = Date.now();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          shownAt.current = Date.now();
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Επιτυχία (ΜΟΝΟ μετά από ok του server): conversion event + πάμε στη σελίδα επιβεβαίωσης.
  useEffect(() => {
    if (state.status !== 'ok' || handled.current) return;
    handled.current = true;
    if (state.lead?.firstName) {
      let source = '(none)';
      let campaign = '(none)';
      try {
        const u = utm ? JSON.parse(utm) : {};
        source = u.utm_source || source;
        campaign = u.utm_campaign || campaign;
      } catch {
        /* ignore */
      }
      track('lead_submit', {
        industry: industry || '(none)',
        utm_source: source,
        utm_campaign: campaign,
        has_calculator: !!roi,
      });
      rememberSubmittedLead({ firstName: state.lead.firstName, testMode: !!state.testMode });
    }
    router.push('/confirmation');
  }, [state, router, industry, roi, utm]);

  useEffect(() => {
    if (state.errors) setErrors(state.errors);
  }, [state]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (elapsedRef.current) {
      elapsedRef.current.value = String(shownAt.current ? Date.now() - shownAt.current : 0);
    }
    const result = clientSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (result.success) {
      setErrors({});
      return;
    }
    // Λάθη: σταματάμε εδώ (ο server δεν καλείται), δείχνουμε τα μηνύματα και πάμε στο πρώτο λάθος πεδίο.
    e.preventDefault();
    const found: Errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as LeadFieldKey;
      if (!found[key]) found[key] = issue.message;
    }
    setErrors(found);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) form.querySelector<HTMLInputElement>(`#${first}`)?.focus();
  };

  const clearError = (name: string) =>
    setErrors((prev) => {
      if (!prev[name as LeadFieldKey]) return prev;
      const next = { ...prev };
      delete next[name as LeadFieldKey];
      return next;
    });

  return (
    <div className="scroll-mt-24">
      <Reveal delay={0.06}>
        <Frame tone="light" className="on-light bg-white">
          <form
            ref={formRef}
            action={formAction}
            noValidate
            onSubmit={onSubmit}
            onChange={(e) => clearError((e.target as HTMLInputElement).name)}
            onFocus={() => trackOnce('form_start')}
            className="flex flex-col gap-5 p-6 sm:p-8"
          >
            <div>
              <p className="eyebrow text-ink-soft">ΑΙΤΗΜΑ ΓΙΑ ΤΟΝ ΧΑΡΤΗ AI</p>
              <p className="pt-3 font-display text-[18px] font-extrabold tracking-tight text-ink">
                Πείτε μας δυο πράγματα και σας καλούμε.
              </p>
            </div>

            {/* honeypot — κρυφό από ανθρώπους και screen readers */}
            <div className="absolute -left-[9999px]" aria-hidden>
              <label htmlFor="website">Μην το συμπληρώσετε</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {/* hidden fields: υπολογιστής ROI, κλάδος που είδε, UTM, σελίδα προσγείωσης, χρόνος από την εμφάνιση */}
            <input type="hidden" name="roi" value={roi ? JSON.stringify(roi) : ''} />
            <input type="hidden" name="industry" value={industry} />
            <input type="hidden" name="utm" value={utm} />
            <input type="hidden" name="page" value={page} />
            <input ref={elapsedRef} type="hidden" name="elapsedMs" defaultValue="0" />

            <Field
              label="Ονοματεπώνυμο"
              name="name"
              autoComplete="name"
              required
              error={errors.name}
              placeholder="Μαρία Παπαδοπούλου"
            />
            <Field
              label="Κινητό"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              error={errors.phone}
              placeholder="69X XXX XXXX"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              error={errors.email}
              placeholder="maria@company.gr"
            />
            <Field
              label="Επιχείρηση / κλάδος"
              name="business"
              autoComplete="organization"
              required
              error={errors.business}
              placeholder="Συνεργείο, 8 άτομα"
            />

            <Choice label="Τι σας κάνει να ψάχνετε τώρα;" name="reason" options={formCopy.reasons} />
            <Choice label="Τζίρος 12μήνου" name="revenue" options={formCopy.revenues} />

            {roi && (
              <p className="rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
                Στέλνουμε μαζί και τον υπολογισμό σας:{' '}
                <span className="font-medium text-ink tnum">{formatEUR(roi.lostRevenue)}/μήνα</span> και{' '}
                <span className="font-medium text-ink tnum">{Math.round(roi.hoursPerMonth)} ώρες/μήνα</span>. Θα μπούμε
                στην κλήση ξέροντας ήδη το νούμερο.
              </p>
            )}

            {state.status === 'error' && state.message && (
              <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[14px] leading-snug text-red-800">
                {state.message}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <SubmitButton />
              <p className="text-center text-[13px] leading-relaxed text-ink-soft">
                Θα σας καλέσουμε σήμερα ή την επόμενη εργάσιμη για να δούμε αν ταιριάζουμε. Χωρίς πωλήσεις.
              </p>
              <p className="text-center text-[12px] leading-relaxed text-ink-soft">
                Με την αποστολή συμφωνείτε με την{' '}
                <Link href="/privacy" className="border-b border-ink/40 text-ink hover:border-ink">
                  Πολιτική απορρήτου
                </Link>
                .
              </p>
            </div>
          </form>
        </Frame>
      </Reveal>
    </div>
  );
}
