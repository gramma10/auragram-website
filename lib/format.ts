/**
 * Ο ΕΝΑΣ τρόπος που γράφουμε χρήματα στο site: «1.103 €»
 * (el-GR, χωρίς δεκαδικά, με non-breaking space ώστε το « €» να μην
 * μένει ποτέ μόνο του στο τέλος γραμμής).
 */
const eur = new Intl.NumberFormat('el-GR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const formatEUR = (n: number) => eur.format(Math.round(n));

/** Εύρος τιμών: «1.200–1.900 €» (το σύμβολο μία φορά, στο τέλος). */
export const formatEURRange = (from: number, to: number) => {
  const end = formatEUR(to);
  const start = formatEUR(from).replace(/[\s ]*€$/, '');
  return `${start}–${end}`;
};
