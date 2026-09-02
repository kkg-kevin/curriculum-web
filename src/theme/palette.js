/**
 * Colour tokens for light and dark mode.
 *
 * This is the ONLY place raw hex values live. Components must reference semantic
 * theme paths — `background.default`, `background.paper`, `divider`,
 * `primary.main`, `text.secondary`, and the custom `surface.*` / `brand.*` keys
 * added here — never a hex literal in a component. That keeps every current and
 * future screen theme-correct for free.
 *
 * Placeholder brand: blue primary, orange secondary, warm neutrals. When the
 * real brand lands, edit the scales below and nothing else changes.
 *
 * Design note (premium pass): the light ground is a warm off-white, not pure
 * white — pure #FFF next to warm brand colours reads clinical. Cards, bands and
 * shadows are all tuned to sit on that warm ground with real depth rather than
 * hairline outlines. `surface.*` keys must stay in sync between the two modes
 * (theme.test.js asserts the key sets match).
 */

const BLUE = {
  50: '#E7F0FB',
  100: '#C6DDF6',
  200: '#93BEEC',
  300: '#5E9DE1',
  400: '#3B84D9',
  500: '#1565C0',
  600: '#1157A6',
  700: '#0D47A1',
  800: '#0A387F',
  900: '#07285C',
};

const ORANGE = {
  50: '#FFF3E4',
  100: '#FFE0BE',
  200: '#FFC787',
  300: '#FFAE50',
  400: '#FF9A28',
  500: '#F57C00',
  600: '#DC6E00',
  700: '#B85A00',
  800: '#8F4600',
  900: '#663200',
};

// Warm neutral ramp — the "paper stock" the whole site is printed on. Slightly
// warm (a hint of ochre) so it feels tactile beside the blue/orange brand.
const SAND = {
  0: '#FFFFFF',
  50: '#FCFBF9',
  100: '#F6F3EE',
  200: '#EDE8E0',
  300: '#DED7CB',
  400: '#B9B0A2',
  500: '#8C8577',
  600: '#635E54',
  700: '#413D37',
  800: '#2A2723',
  900: '#1C1A17',
};

/**
 * @param {'light'|'dark'} mode
 * @returns {object} palette object for createTheme, including the custom
 *                   `surface` and `brand` sections.
 */
export function buildPalette(mode) {
  if (mode === 'dark') {
    return {
      mode: 'dark',
      primary: { main: BLUE[300], light: BLUE[200], dark: BLUE[500], contrastText: '#08203A' },
      secondary: { main: ORANGE[300], light: ORANGE[200], dark: ORANGE[500], contrastText: '#241300' },
      success: { light: '#81C784', main: '#66BB6A', dark: '#388E3C', contrastText: '#0A2E12' },
      error: { light: '#E57373', main: '#F26D6D', dark: '#C62828', contrastText: '#2E0A0A' },
      warning: { light: '#FFD08A', main: '#FFB74D', dark: '#C77F1E', contrastText: '#2A1B00' },
      info: { light: '#7ED0F5', main: '#4FC3F7', dark: '#0288D1', contrastText: '#04222E' },
      background: { default: '#0B1220', paper: '#111A2B' },
      text: {
        primary: 'rgba(255,255,255,0.92)',
        secondary: 'rgba(255,255,255,0.66)',
        disabled: 'rgba(255,255,255,0.40)',
      },
      divider: 'rgba(255,255,255,0.14)',
      surface: {
        subtle: '#0E1728', // tinted band behind page headers / alternating sections
        raised: '#16213A', // a card sitting on `subtle`
        card: '#141F35', // primary card surface on the page ground
        cardHover: '#1A2742', // same card, hover/active
        ring: 'rgba(255,255,255,0.10)', // 1px hairline on cards / inputs
        ringStrong: 'rgba(255,255,255,0.20)',
        inverse: '#060C15', // footer band (dark in both modes)
        inverseText: 'rgba(255,255,255,0.92)',
        inverseTextDim: 'rgba(255,255,255,0.58)',
        inverseBorder: 'rgba(255,255,255,0.12)',
        heroFrom: '#0E1B30',
        heroVia: '#0B1220',
        heroTo: '#1A140A',
        heroGlow: 'rgba(59,132,217,0.28)', // radial accent bloom in the hero
        heroGlowWarm: 'rgba(245,124,0,0.20)',
        onColor: 'rgba(255,255,255,0.16)', // translucent chip/border on a brand band
        onColorText: 'rgba(255,255,255,0.86)',
        imageFrom: '#132239',
        imageTo: '#2A2113',
        imagePlaceholder: '#1B2740',
        dotGrid: 'rgba(255,255,255,0.06)', // decorative dot-grid texture
      },
      // Layered, colour-tinted shadows. Cards use `.md`; lifted/hover uses `.lg`.
      shadow: {
        sm: '0 1px 2px rgba(0,0,0,0.40)',
        md: '0 2px 4px rgba(0,0,0,0.32), 0 8px 24px -6px rgba(0,0,0,0.50)',
        lg: '0 8px 16px -4px rgba(0,0,0,0.40), 0 24px 48px -12px rgba(0,0,0,0.60)',
        glow: '0 0 0 1px rgba(94,157,225,0.30), 0 12px 40px -8px rgba(59,132,217,0.45)',
      },
      brand: { blue: BLUE, orange: ORANGE, sand: SAND },
    };
  }

  return {
    mode: 'light',
    primary: { main: BLUE[500], light: BLUE[300], dark: BLUE[700], contrastText: '#FFFFFF' },
    secondary: { main: ORANGE[500], light: ORANGE[300], dark: ORANGE[700], contrastText: '#1A1A1A' },
    success: { light: '#4CAF50', main: '#2E7D32', dark: '#1B5E20', contrastText: '#FFFFFF' },
    error: { light: '#EF5350', main: '#D32F2F', dark: '#B71C1C', contrastText: '#FFFFFF' },
    warning: { light: '#FFB74D', main: '#F59E0B', dark: '#B77900', contrastText: '#1A1A1A' },
    info: { light: '#4FC3F7', main: '#0288D1', dark: '#01579B', contrastText: '#FFFFFF' },
    // Warm off-white ground; `paper` is a hair brighter so raised things separate.
    background: { default: SAND[50], paper: SAND[0] },
    text: {
      primary: '#211E1A',
      secondary: '#5B5750',
      disabled: '#9A948A',
    },
    divider: 'rgba(33, 30, 26, 0.10)',
    surface: {
      subtle: SAND[100], // alternating band / page-header ground
      raised: SAND[0], // a card sitting on `subtle`
      card: SAND[0], // primary card surface on the page ground
      cardHover: SAND[0], // same card, hover (depth changes via shadow, not fill)
      ring: 'rgba(33, 30, 26, 0.10)', // 1px hairline on cards / inputs
      ringStrong: 'rgba(33, 30, 26, 0.18)',
      inverse: '#131A16',
      inverseText: 'rgba(255,255,255,0.92)',
      inverseTextDim: 'rgba(255,255,255,0.60)',
      inverseBorder: 'rgba(255,255,255,0.12)',
      heroFrom: '#EEF4FC',
      heroVia: SAND[50],
      heroTo: '#FFF4E6',
      heroGlow: 'rgba(21,101,192,0.14)', // radial accent bloom in the hero
      heroGlowWarm: 'rgba(245,124,0,0.12)',
      onColor: 'rgba(255,255,255,0.20)', // translucent chip/border on a brand band
      onColorText: 'rgba(255,255,255,0.90)',
      imageFrom: '#E7F0FB',
      imageTo: '#FFF3E4',
      imagePlaceholder: '#EEF1F5',
      dotGrid: 'rgba(33, 30, 26, 0.05)', // decorative dot-grid texture
    },
    // Layered, warm-tinted shadows — the core of the "objects, not outlines" feel.
    shadow: {
      sm: '0 1px 2px rgba(28, 25, 20, 0.06)',
      md: '0 1px 2px rgba(28, 25, 20, 0.06), 0 12px 28px -8px rgba(28, 25, 20, 0.14)',
      lg: '0 8px 16px -6px rgba(28, 25, 20, 0.12), 0 32px 56px -16px rgba(28, 25, 20, 0.22)',
      glow: '0 0 0 1px rgba(21,101,192,0.16), 0 16px 44px -10px rgba(21,101,192,0.28)',
    },
    brand: { blue: BLUE, orange: ORANGE, sand: SAND },
  };
}
