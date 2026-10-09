'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useInView } from '@/lib/hooks';
import { CountUp } from '@/components/ui/CountUp';
import { Cta, CtaMicro } from '@/components/ui/Cta';
import { Frame } from '@/components/ui/Frame';
import { markRoiTouched, setRoi } from '@/lib/roiStore';
import { CALC_DEFAULTS, CLOSE_RATE, HOURLY_RATE, LEAD_LOSS_SHARE, calcRoi } from '@/lib/roi';
import { track, trackOnce } from '@/lib/analytics';
import { formatEUR } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useLazyReady } from '@/components/ui/LazyMount';

const eur = formatEUR;

// Palette v4: fill aura-deep #0E7490, κενό track ink/15, thumb cyan με 2px ink δακτύλιο (το thumb κουβαλά το 3:1 της κατάστασης).
// Οι τιμές των ζευγών μετρήθηκαν — βλ. scripts/contrast-report.mjs (docs/round4-contrast.md).
const FILL = '#0E7490';
const TRACK_GREY = 'rgba(15,23,32,0.15)';
const THUMB = 24; // px — το ίδιο με το .slider στο globals.css

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  // Το κέντρο του thumb κινείται σε (πλάτος − thumb): διορθώνουμε το σημείο όπου αλλάζει το χρώμα.
  const stop = `calc(${pct}% + ${(THUMB / 2 - (pct / 100) * THUMB).toFixed(2)}px)`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-[15px] leading-snug text-ink/75" htmlFor={label}>
          {label}
        </label>
        <span className="font-display text-[18px] font-extrabold tracking-tight text-ink tnum">
          {value.toLocaleString('el-GR')}
          {suffix}
        </span>
      </div>
      <input
        id={label}
        type="range"
        className="slider slider-light mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        // 6px track στο κέντρο των 44px hit area: (1) fill aura-deep μέχρι το thumb, (2) κενό track ink/15 σε όλο το πλάτος
        style={{
          backgroundImage: `linear-gradient(${FILL}, ${FILL}), linear-gradient(${TRACK_GREY}, ${TRACK_GREY})`,
          backgroundSize: `${stop} 6px, 100% 6px`,
          backgroundPosition: '0 50%, 0 50%',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}

/**
 * Το διαδραστικό κομμάτι του calculator (sliders + αποτέλεσμα + mini-bar). Φορτώνεται lazy (βλ. CalculatorLazy)·
 * επιστρέφει fragment: τα στοιχεία του είναι άμεσα grid items του `#calc-grid` που ζει στο server shell
 * (Calculator.tsx), μαζί με το στατικό heading.
 */
export default function CalculatorBody() {
  useLazyReady();
  const [leads, setLeadsRaw] = useState<number>(CALC_DEFAULTS.leads);
  const [responseRate, setResponseRateRaw] = useState<number>(CALC_DEFAULTS.responseRate);
  const [avgValue, setAvgValueRaw] = useState<number>(CALC_DEFAULTS.avgValue);
  const [hoursPerWeek, setHoursPerWeekRaw] = useState<number>(CALC_DEFAULTS.hoursPerWeek);
  // Τα RoiBlock των Services/Industries γίνονται «προσωπικά» ΜΟΝΟ όταν αλλάξει πραγματικά κάποια τιμή.
  const changed = (set: (v: number) => void) => (v: number) => {
    set(v);
    markRoiTouched();
  };
  const setLeads = changed(setLeadsRaw);
  const setResponseRate = changed(setResponseRateRaw);
  const setAvgValue = changed(setAvgValueRaw);
  const setHoursPerWeek = changed(setHoursPerWeekRaw);

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  // Live ορατότητα (όχι once) — για το mini-bar του mobile. Το grid ζει στο server shell → το βρίσκουμε
  // στο mount (αυτό το effect δηλώνεται ΠΡΙΝ το useInView, άρα τρέχει πρώτο).
  const gridRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    gridRef.current = document.getElementById('calc-grid');
  }, []);
  const sectionVisible = useInView(gridRef as MutableRefObject<Element>, { once: false, amount: 0.05 });
  const resultVisible = useInView(ref, { once: false, amount: 0.2 });

  // Συντηρητικά: 35% των αργών leads χάνονται, 20% close rate, €25/ώρα — ο τύπος ζει στο lib/roi.ts (κοινός με τα RoiBlock).
  const r = useMemo(
    () => calcRoi({ leads, responseRate, avgValue, hoursPerWeek }),
    [leads, responseRate, avgValue, hoursPerWeek]
  );

  // Τα νούμερα ταξιδεύουν στη φόρμα ως hidden fields — αλλά ΜΟΝΟ αν ο
  // επισκέπτης όντως χρησιμοποίησε τον υπολογιστή. Αλλιώς θα στέλναμε τις
  // προεπιλογές μας σαν να ήταν δικά του νούμερα.
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!touched) return;
    setRoi({ leads, responseRate, avgValue, hoursPerWeek, ...r });
  }, [touched, leads, responseRate, avgValue, hoursPerWeek, r]);

  useEffect(() => {
    if (inView) trackOnce('calculator_result_view');
  }, [inView]);

  const onTouch = () => {
    setTouched(true);
    trackOnce('calculator_used');
  };

  // Mini-bar (mobile): όσο ο χρήστης ρυθμίζει και το αποτέλεσμα είναι εκτός οθόνης.
  const showMini = touched && sectionVisible && !resultVisible;
  useEffect(() => {
    const el = document.documentElement;
    if (showMini) el.setAttribute('data-minibar', '');
    else el.removeAttribute('data-minibar');
    return () => el.removeAttribute('data-minibar');
  }, [showMini]);

  return (
    <>
      {/* Sliders — κάτω από το heading (στο lg: στήλη 1, γραμμή 2) */}
      <div
        className="mt-8 flex flex-col gap-5 lg:col-start-1 lg:row-start-2"
        onPointerDown={onTouch}
        onKeyDown={onTouch}
      >
        <Slider
          label="Νέα leads τον μήνα"
          value={leads}
          min={10}
          max={500}
          step={5}
          onChange={setLeads}
        />
        <Slider
          label="Ποσοστό που απαντάτε μέσα σε 1 ώρα"
          value={responseRate}
          min={0}
          max={100}
          step={5}
          suffix="%"
          onChange={setResponseRate}
        />
        <div>
          <label htmlFor="avgValue" className="block pb-2 text-[15px] leading-snug text-ink/75">
            Μέση αξία πελάτη
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-[18px] font-extrabold text-ink-soft"
            >
              €
            </span>
            <input
              id="avgValue"
              type="number"
              inputMode="numeric"
              min={0}
              max={1000000}
              value={avgValue}
              onChange={(e) => setAvgValue(Math.max(0, Number(e.target.value) || 0))}
              className="no-spin h-12 w-full rounded-xl border border-ink/15 bg-white pl-9 pr-4 font-display text-[18px] font-extrabold tracking-tight text-ink tnum outline-none transition-colors focus:border-ink focus-visible:ring-2 focus-visible:ring-aura-deep focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
            />
          </div>
        </div>
        <Slider
          label="Ώρες/εβδομάδα σε επαναλαμβανόμενα tasks"
          value={hoursPerWeek}
          min={1}
          max={40}
          onChange={setHoursPerWeek}
        />
      </div>

      {/* Αποτέλεσμα — στο mobile κάτω από τα sliders· στο lg δεξιά στήλη, καλύπτει και τις δύο γραμμές */}
      <div
        ref={ref}
        id="calc-result"
        className="mt-12 scroll-mt-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:pt-4"
      >
        <Frame
          tone="light"
          className="bg-white !shadow-[0_2px_6px_rgba(15,23,32,0.06),0_32px_64px_-28px_rgba(15,23,32,0.38)]"
        >
          <div className="p-6 sm:p-9">
            <p className="eyebrow text-ink-soft">ΧΑΝΕΤΕ ΚΑΤ’ ΕΚΤΙΜΗΣΗ</p>

            <p className="flex flex-wrap items-baseline gap-x-3 pt-5">
              <span className="font-display text-[clamp(3rem,2rem+4vw,4.5rem)] font-extrabold leading-none tracking-tightest text-ink tnum">
                <CountUp value={r.lostRevenue} live format={eur} />
              </span>
              <span className="font-mono text-[12px] font-medium text-ink-soft">/ μήνα</span>
            </p>
            <p className="pt-3 text-[17px] text-ink-soft tnum">
              ≈ <CountUp value={r.lostRevenue * 12} live format={eur} /> τον χρόνο
            </p>
            <p className="t-small pt-3 text-ink-soft">σε leads που δεν απαντήθηκαν έγκαιρα</p>

            <div className="mt-7 border-t border-ink/10 pt-7">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-[32px] font-extrabold leading-none tracking-tightest text-ink tnum sm:text-[40px]">
                  <CountUp value={r.hoursPerMonth} live />
                </span>
                <span className="font-mono text-[12px] font-medium text-ink-soft">ώρες / μήνα</span>
              </p>
              {/* Όλο το πλάτος της κάρτας — όχι στενή στήλη */}
              <p className="t-small pt-3 text-ink-soft">
                που θα μπορούσαν να είναι αυτοματοποιημένες — αξίας περίπου{' '}
                <span className="font-medium text-ink tnum">
                  <CountUp value={r.timeValue} live format={eur} />
                </span>
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3.5 border-t border-ink/10 pt-8">
              <Cta where="calculator" />
              <CtaMicro tone="light" />
            </div>

            <p className="pt-6 text-[13px] leading-relaxed text-ink-soft">
              Συντηρητική εκτίμηση: {Math.round(LEAD_LOSS_SHARE * 100)}% των αργών leads χάνονται, {Math.round(CLOSE_RATE * 100)}% ποσοστό κλεισίματος,{' '}
              {formatEUR(HOURLY_RATE)}/ώρα. Στην κλήση το υπολογίζουμε με τα πραγματικά σας νούμερα.
            </p>
          </div>
        </Frame>

        <button
          type="button"
          onClick={() => {
            track('calculator_used', { action: 'send_to_form' });
            document.documentElement.setAttribute('data-ready', ''); // βλ. content-visibility στο globals.css
            document.getElementById('klisi')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 border-b border-ink/20 text-[14px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          Στείλτε μου αυτό το νούμερο με το ραντεβού
          <span aria-hidden>↓</span>
        </button>
      </div>

      {/* Sticky mini-bar (mobile). Έχει προτεραιότητα επί του sticky CTA — βλ. html[data-minibar]. */}
      <div
        aria-hidden={!showMini}
        className={cn(
          'fixed inset-x-0 z-[45] border-t border-white/[0.08] bg-night-900 px-4 pt-3 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden',
          showMini ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        )}
        style={{ bottom: 'var(--cookie-h, 0px)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          tabIndex={showMini ? 0 : -1}
          onClick={() =>
            document.getElementById('calc-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-full border border-white/[0.14] px-5 text-left font-display text-[15px] font-bold text-white"
        >
          <span>
            Χάνετε ~<span className="text-aura tnum">{eur(r.lostRevenue)}</span> / μήνα
          </span>
          <span aria-hidden className="text-aura">
            ↓
          </span>
        </button>
      </div>
    </>
  );
}
