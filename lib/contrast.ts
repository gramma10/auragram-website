/**
 * WCAG contrast helpers — ΜΙΑ υλοποίηση για όλα τα brand icons (chips, marquee, /about).
 * Κανόνας: brand χρώμα εικονιδίου μόνο αν έχει ≥ 3:1 πάνω στην επιφάνεια του chip, αλλιώς fallback (λευκό σε dark, ink σε light).
 */
export type RGB = [number, number, number];

export const hexRgb = (hex: string): RGB => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};

const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

export const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

/** fg με alpha πάνω σε bg (αδιαφανές αποτέλεσμα). */
export const over = (fg: RGB, alpha: number, bg: RGB): RGB =>
  fg.map((c, i) => c + (bg[i] - c) * (1 - alpha)) as RGB;

/** Επιφάνειες των chips/pills. Το dark surface = το πιο φωτεινό άκρο του gradient (#0E1628). */
export const SURFACE = {
  night: [14, 22, 40] as RGB,
  white: [255, 255, 255] as RGB,
  /** white/5 πάνω στο σκούρο surface (hero marquee pills) */
  darkPill: over([255, 255, 255], 0.05, [14, 22, 40]),
  /** cyan 7% πάνω στο σκούρο surface (chips «ΜΕ ΤΟΝ AGENT») */
  cyanChip: over([34, 211, 238], 0.07, [14, 22, 40]),
  /** λευκό chip (light surface) */
  lightChip: [255, 255, 255] as RGB,
};

export type IconSurface = keyof typeof SURFACE;

/** Brand χρώμα (hex χωρίς #) ή fallback όταν δεν περνά 3:1 πάνω στην επιφάνεια. */
export const iconColorOn = (hex: string, surface: IconSurface, fallback: string) =>
  contrast(hexRgb(hex), SURFACE[surface]) >= 3 ? `#${hex}` : fallback;
