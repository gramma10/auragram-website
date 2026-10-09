import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark surface
        night: {
          DEFAULT: '#0A1020',
          900: '#0A1020',
          800: '#0E1628',
          700: '#141F35',
          600: '#1B2942',
        },
        // Light surface
        bone: '#FAFAF7',
        'bone-2': '#F3F3EE', // tool band / process background
        line: '#E6E7E2', // hairline on light
        ink: {
          DEFAULT: '#0F1720',
          soft: '#5A6270', // secondary text on light — 5.5–6.2:1
        },
        // Κείμενο πάνω σε dark. Όλα ≥ 4.5:1 σε #0A1020 / #0E1628.
        fg: '#B4BDCB', // body — 10:1
        'fg-dim': '#8C96A8', // labels, microcopy — 6:1
        // Accent: cyan (aura) = ΟΛΑ τα κουμπιά & η έμφαση σε dark.
        aura: '#22D3EE',
        // Palette v4 — ΕΝΑ χρώμα μάρκας, παρμένο από το logo (ασημί μέταλλο με cyan → violet λάμψη).
        'aura-deep': '#0E7490', // cyan για γραφικά, links, labels, ✓ πάνω σε ΑΝΟΙΧΤΕΣ επιφάνειες (≥ 4.5:1 σε #FAFAF7 και λευκό)
        'aura-tint': '#ECFEFF', // απαλό cyan φόντο κουτιού σε light
        'aura-line': '#A5F3FC', // απαλό cyan περίγραμμα + marker highlight σε light
        halo: '#8B7CF6', // violet από τη λάμψη του logo — ΜΟΝΟ μέσα στο κινούμενο aura background (hero + agents). Ποτέ σε κουμπί/κείμενο/περίγραμμα/φόντο section.
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      maxWidth: {
        prose: '62ch',
        // Το ΕΝΑ πλάτος container για όλα τα sections (nav, hero, sections, footer).
        page: '72rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.85)' },
        },
        // μία φορά, 6px κατά μήκος του βέλους (το parent περιστρέφεται στο mobile → κάθετα)
        'arrow-nudge': {
          '0%, 100%': { transform: 'translateX(0)' },
          '45%': { transform: 'translateX(6px)' },
        },
        'msg-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        'arrow-nudge': 'arrow-nudge 900ms ease-in-out 1 both',
      },
    },
  },
  plugins: [],
};

export default config;
