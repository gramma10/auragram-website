/**
 * ΜΙΑ πηγή για τις υποθέσεις και τους τύπους του ROI. Τα χρησιμοποιούν ο calculator (CalculatorBody),
 * τα RoiBlock των Services/Industries και τα κείμενα των τύπων (formula footnotes) — ώστε τα νούμερα στη
 * σελίδα να μη διαφωνούν ποτέ μεταξύ τους. Καθαρές συναρτήσεις, χωρίς 'use client'.
 */

/** Αξία ώρας εργασίας (€/ώρα) — ίδια σταθερά για calculator και Industries. */
export const HOURLY_RATE = 25;
/** Εβδομάδες ανά μήνα που χρησιμοποιεί ο calculator για να μετατρέψει ώρες/εβδ. σε ώρες/μήνα. */
export const WEEKS_PER_MONTH = 4.33;
/** Συντηρητικά: ποσοστό των αργών leads που χάνονται. */
export const LEAD_LOSS_SHARE = 0.35;
/** Συντηρητικά: ποσοστό κλεισίματος. */
export const CLOSE_RATE = 0.2;

/** Οι προεπιλογές των sliders του calculator. */
export const CALC_DEFAULTS = { leads: 60, responseRate: 30, avgValue: 400, hoursPerWeek: 12 } as const;

export type CalcInputs = { leads: number; responseRate: number; avgValue: number; hoursPerWeek: number };

/** Ο τύπος του calculator — αυτούσιος, μόνο που οι σταθερές ζουν παραπάνω. */
export function calcRoi({ leads, responseRate, avgValue, hoursPerWeek }: CalcInputs) {
  const missedLeads = leads * (1 - responseRate / 100) * LEAD_LOSS_SHARE;
  const lostRevenue = missedLeads * avgValue * CLOSE_RATE;
  const hoursPerMonth = hoursPerWeek * WEEKS_PER_MONTH;
  const timeValue = hoursPerMonth * HOURLY_RATE;
  return { missedLeads, lostRevenue, hoursPerMonth, timeValue };
}

const nf = new Intl.NumberFormat('el-GR');
const pct = (share: number) => Math.round(share * 100);

/** «60 leads × 70% αργή απάντηση × 35% χάνονται × 20% κλείσιμο × 400 €» */
export const lostRevenueFormula = (i: CalcInputs) =>
  `${nf.format(i.leads)} leads × ${100 - i.responseRate}% αργή απάντηση × ${pct(LEAD_LOSS_SHARE)}% χάνονται × ${pct(CLOSE_RATE)}% κλείσιμο × ${nf.format(i.avgValue)} €`;

/** «12 ώρες/εβδ. × 4,33 × 25 €/ώρα» */
export const timeValueFormula = (i: CalcInputs) =>
  `${nf.format(i.hoursPerWeek)} ώρες/εβδ. × ${nf.format(WEEKS_PER_MONTH)} × ${HOURLY_RATE} €/ώρα`;

/** Αξία χρόνου των Industries, στρογγυλεμένη στα 10 €: ώρες (ανά εβδομάδα ή ανά μήνα) × 25 €. */
export const hoursValue = (hours: number, perWeek: boolean) =>
  Math.round((hours * (perWeek ? WEEKS_PER_MONTH : 1) * HOURLY_RATE) / 10) * 10;

/** «8 ώρ./εβδ. × 4,33 × 25 €» ή «10 ώρ. × 25 €» */
export const hoursValueFormula = (hours: number, perWeek: boolean) =>
  perWeek
    ? `${nf.format(hours)} ώρ./εβδ. × ${nf.format(WEEKS_PER_MONTH)} × ${HOURLY_RATE} €`
    : `${nf.format(hours)} ώρ. × ${HOURLY_RATE} €`;
