import { createTheme } from '@mui/material/styles';
import { buildPalette } from './palette.js';

/**
 * Builds the full MUI theme for a given colour mode. Same typography, shape and
 * component behaviour in both modes — only the palette swaps.
 *
 * Premium pass: a tighter display type scale with real tracking, a warm-tinted
 * elevation scale wired into MUI's `shadows` array (so `elevation={1}` etc. and
 * `boxShadow: 1` pick up the layered brand shadows), pill buttons, and softer
 * default surfaces.
 *
 * @param {'light'|'dark'} mode
 */
export default function createAppTheme(mode) {
  const palette = buildPalette(mode);
  const isDark = mode === 'dark';
  const { shadow } = palette;

  // MUI needs a 25-slot shadows array. Map the low indices to our layered brand
  // shadows and let the rest fall back to `lg` so nothing looks flat.
  const shadows = [
    'none',
    shadow.sm,
    shadow.sm,
    shadow.md,
    shadow.md,
    shadow.md,
    shadow.md,
    shadow.lg,
    shadow.lg,
    ...Array(16).fill(shadow.lg),
  ];

  return createTheme({
    palette,

    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      // Display sizes: large, confident, negative tracking so big text feels set,
      // not just scaled up.
      h1: {
        fontSize: 'clamp(2.4rem, 5.4vw, 3.9rem)',
        fontWeight: 800,
        lineHeight: 1.04,
        letterSpacing: '-0.022em',
      },
      h2: {
        fontSize: 'clamp(1.85rem, 4vw, 2.7rem)',
        fontWeight: 750,
        lineHeight: 1.12,
        letterSpacing: '-0.018em',
      },
      h3: {
        fontSize: 'clamp(1.35rem, 3vw, 1.7rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.012em',
      },
      h4: { fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.008em' },
      h5: { fontSize: '1.02rem', fontWeight: 700, lineHeight: 1.35 },
      subtitle1: { fontSize: '1.12rem', fontWeight: 400, lineHeight: 1.6 },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        lineHeight: 1.5,
      },
      button: { textTransform: 'none', fontWeight: 650, letterSpacing: '0.01em' },
    },

    // theme.test.js asserts this stays 10.
    shape: { borderRadius: 10 },

    shadows,

    components: {
      // Paint the document background per-mode and set a smooth cross-fade
      // when the user toggles.
      MuiCssBaseline: {
        styleOverrides: {
          ':root': { colorScheme: mode },
          'html, body': {
            backgroundColor: palette.background.default,
          },
          body: {
            transition: 'background-color 200ms ease, color 200ms ease',
            // Sharper text on the warm ground.
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'optimizeLegibility',
          },
          '#root': { minHeight: '100vh' },
          '::selection': {
            backgroundColor: isDark ? 'rgba(94,157,225,0.35)' : 'rgba(21,101,192,0.16)',
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 24,
            paddingBlock: 11,
            transition:
              'transform 160ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease, background-color 160ms ease',
            '@media (hover: hover)': {
              '&:hover': { transform: 'translateY(-1px)' },
            },
            '&:active': { transform: 'translateY(0)' },
          },
          sizeLarge: { paddingInline: 30, paddingBlock: 14, fontSize: '1rem' },
          contained: {
            boxShadow: shadow.sm,
            '@media (hover: hover)': {
              '&:hover': { boxShadow: shadow.md },
            },
          },
          containedPrimary: {
            backgroundImage: `linear-gradient(180deg, ${palette.brand.blue[isDark ? 400 : 500]}, ${palette.brand.blue[isDark ? 600 : 700]})`,
            color: '#fff',
          },
          outlined: {
            borderColor: palette.surface.ringStrong,
            '@media (hover: hover)': {
              '&:hover': {
                borderColor: 'currentColor',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,20,0.03)',
              },
            },
          },
        },
      },

      MuiContainer: { defaultProps: { maxWidth: 'lg' } },

      // Cards / outlined boxes: the "outlined" look should read on both grounds,
      // and depth comes from a layered shadow, not just a border.
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: palette.surface.card,
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: palette.surface.ring,
            borderRadius: 16,
            boxShadow: shadow.md,
          },
        },
      },
      MuiCardActionArea: {
        styleOverrides: {
          root: {
            transition: 'background-color 160ms ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: palette.surface.ring,
          },
          rounded: { borderRadius: 16 },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          colorInherit: {
            backgroundColor: isDark ? 'rgba(17,26,43,0.72)' : 'rgba(252,251,249,0.72)',
            backdropFilter: 'saturate(180%) blur(12px)',
            WebkitBackdropFilter: 'saturate(180%) blur(12px)',
            color: palette.text.primary,
          },
        },
      },

      // Chips used for tags/statuses — outlined variant needs a visible border.
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
          outlined: { borderColor: palette.surface.ring },
        },
      },

      // Links inside body copy.
      MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: {
          root: { color: isDark ? palette.primary.light : palette.primary.main },
        },
      },

      // Form fields: consistent, legible in both modes.
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12 },
          notchedOutline: { borderColor: palette.surface.ring },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { border: '1px solid', borderColor: 'transparent', borderRadius: 12 },
        },
      },
    },
  });
}
