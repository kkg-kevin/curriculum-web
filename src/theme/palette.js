/**
 * Colour tokens for light and dark mode.
 *
 * This is the ONLY place raw hex values live. Components must reference semantic
 * theme paths — `background.default`, `background.paper`, `divider`,
 * `primary.main`, `text.secondary`, and the custom `surface.*` / `brand.*` keys
 * added here — never a hex literal in a component. That keeps every current and
 * future screen theme-correct for free. See THEME.md.
 *
 * Placeholder brand (spec §9 item 5): blue primary, orange secondary. When the
 * real brand lands, edit the scales below and nothing else changes.
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
        inverse: '#060C15', // footer band (dark in both modes)
        inverseText: 'rgba(255,255,255,0.92)',
        inverseTextDim: 'rgba(255,255,255,0.58)',
        inverseBorder: 'rgba(255,255,255,0.12)',
        heroFrom: '#0E1B30',
        heroVia: '#0B1220',
        heroTo: '#1A140A',
        imageFrom: '#132239',
        imageTo: '#2A2113',
        imagePlaceholder: '#1B2740',
      },
      brand: { blue: BLUE, orange: ORANGE },
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
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    text: {
      primary: '#1A2027',
      secondary: '#4B5563',
      disabled: '#9AA4B2',
    },
    divider: 'rgba(15, 23, 42, 0.12)',
    surface: {
      subtle: '#F5F7FA',
      raised: '#FFFFFF',
      inverse: '#0E1626',
      inverseText: 'rgba(255,255,255,0.92)',
      inverseTextDim: 'rgba(255,255,255,0.60)',
      inverseBorder: 'rgba(255,255,255,0.12)',
      heroFrom: '#E7F0FB',
      heroVia: '#FFFFFF',
      heroTo: '#FFF3E4',
      imageFrom: '#E7F0FB',
      imageTo: '#FFF3E4',
      imagePlaceholder: '#EEF1F5',
    },
    brand: { blue: BLUE, orange: ORANGE },
  };
}
