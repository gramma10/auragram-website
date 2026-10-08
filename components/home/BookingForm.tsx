'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitLead, type LeadState } from '@/app/actions';
import { formCopy } from '@/lib/content';
import { CTA, PRICING } from '@/lib/config';
import { formatEUR } from '@/lib/format';
import { Reveal } from '@/components/ui/Reveal';
import { Frame } from '@/components/ui/Frame';
import { CalEmbed } from './CalEmbed';
import { getIndustry, getIndustryServer, getRoi, getRoiServer, subscribeRoi } from '@/lib/roiStore';
import { track, trackOnce } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { useLazyReady } from '@/components/ui/LazyMount';

const initial: LeadState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
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
      <label htmlFor={name} className="block pb-2 text-[12.5px] font-medium text-ink/75">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors',
          'placeholder:text-ink-soft focus:border-ink',
          error ? 'border-red-500' : 'border-ink/15'
        )}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="pt-1.5 text-[12px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Choice({
  label,
  name,
  options,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  error?: string;
}) {
  const [value, setValue] = useState('');
  return (
    <fieldset>
      <legend className="pb-2.5 text-[12.5px] font-medium text-ink/75">{label}</legend>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => setValue(o)}
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
      {error && <p className="pt-1.5 text-[12px] text-red-600">{error}</p>}
    </fieldset>
  );
}

/** Η φόρμα (και μετά το Cal.com) — δεξιά στήλη του #klisi· φορτώνεται lazy (βλ. BookingLazy). */
export default function BookingForm() {
  useLazyReady();
  const [state, formAction] = useFormState(submitLead, initial);
  const [utm, setUtm] = useState('');
  const calRef = useRef<HTMLDivElement>(null);

  const roi = useSyncExternalStore(subscribeRoi, getRoi, getRoiServer);
  const industry = useSyncExternalStore(subscribeRoi, getIndustry, getIndustryServer);

  // UTM από το link-in-bio, με μνήμη ώστε να επιβιώνει της περιήγησης.
  useEffect(() => {
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
        setUtm(localStorage.getItem('aura-utm') || '');
      }
    } catch {
      /* ιδιωτική περιήγηση */
    }
  }, []);

  useEffect(() => {
    if (state.status === 'ok') {
      track('form_submit');
      calRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.status]);

  const booked = state.status === 'ok' && state.lead;

  return (
    <div ref={calRef} className="scroll-mt-24">
      {!booked ? (
        <Reveal delay={0.06}>
          <Frame tone="light" className="on-light bg-white">
            <form action={formAction} onFocus={() => trackOnce('form_start')} className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <p className="eyebrow text-ink-soft">ΒΗΜΑ 01 / 02</p>
                <p className="pt-3 font-display text-[18px] font-extrabold tracking-tight text-ink">
                  Πείτε μας δυο πράγματα και ανοίγει το ημερολόγιο.
                </p>
              </div>

              {/* honeypot — κρυφό από ανθρώπους και screen readers */}
              <div className="absolute -left-[9999px]" aria-hidden>
                <label htmlFor="website">Μην το συμπληρώσετε</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <input type="hidden" name="roi" value={roi ? JSON.stringify(roi) : ''} />
              <input type="hidden" name="industry" value={industry} />
              <input type="hidden" name="utm" value={utm} />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Όνομα" name="name" autoComplete="name" required error={state.errors?.name} placeholder="Μαρία Π." />
                <Field label="Email" name="email" type="email" autoComplete="email" required error={state.errors?.email} placeholder="maria@company.gr" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Κινητό" name="phone" type="tel" autoComplete="tel" required error={state.errors?.phone} placeholder="69…" />
                <Field label="Επιχείρηση / κλάδος" name="business" required error={state.errors?.business} placeholder="Συνεργείο, 8 άτομα" />
              </div>

              <Choice label="Τι σας κάνει να ψάχνετε τώρα;" name="reason" options={formCopy.reasons} error={state.errors?.reason} />
              <Choice label="Τζίρος 12μήνου" name="revenue" options={formCopy.revenues} error={state.errors?.revenue} />

              {roi && (
                <p className="rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
                  Στέλνουμε μαζί και τον υπολογισμό σας:{' '}
                  <span className="font-medium text-ink tnum">
                    {formatEUR(roi.lostRevenue)}/μήνα
                  </span>{' '}
                  και{' '}
                  <span className="font-medium text-ink tnum">
                    {Math.round(roi.hoursPerMonth)} ώρες/μήνα
                  </span>
                  . Θα μπούμε στην κλήση ξέροντας ήδη το νούμερο.
                </p>
              )}

              {state.status === 'error' && state.message && (
                <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {state.message}
                </p>
              )}

              <SubmitButton />

              <p className="text-center text-[12px] leading-relaxed text-ink-soft">
                {CTA.micro} Τα στοιχεία σας μένουν σε εμάς — καμία διαφημιστική λίστα.
              </p>
            </form>
          </Frame>
        </Reveal>
      ) : (
        <div>
          <div className="flex items-center gap-3 pb-5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aura">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7.5 5.5 11 12 3.5" stroke="#0A1020" strokeWidth="2.2" strokeLinecap="square" />
              </svg>
            </span>
            <div>
              <p className="eyebrow text-fg-dim">ΒΗΜΑ 02 / 02</p>
              <p className="pt-1 font-display text-[17px] font-extrabold tracking-tight text-white">
                {state.lead?.name}, διαλέξτε ώρα.
              </p>
            </div>
          </div>
          <Frame tone="light" className="on-light overflow-hidden bg-white">
            <CalEmbed prefill={state.lead!} />
          </Frame>
          <p className="pt-4 text-[12.5px] leading-relaxed text-fg-dim">
            Το pilot που ακολουθεί ξεκινά από {PRICING.pilotFrom} — αλλά αυτά τα 30 λεπτά δεν
            σας δεσμεύουν σε τίποτα.
          </p>
        </div>
      )}
    </div>
  );
}
