import { createTheme } from '@mui/material/styles';
import { buildPalette } from './palette.js';

/**
 * Builds the full MUI theme for a given colour mode. Same typography, shape and
 * component behaviour in both modes — only the palette swaps.
 *
 * @param {'light'|'dark'} mode
 */
export default function createAppTheme(mode) {
  const palette = buildPalette(mode);
  const isDark = mode === 'dark';

  return createTheme({
    palette,

    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1 },
      h2: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, lineHeight: 1.2 },
      h3: { fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 700 },
      h4: { fontSize: '1.25rem', fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },

    shape: { borderRadius: 10 },

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
          },
          '#root': { minHeight: '100vh' },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { paddingInline: 20, paddingBlock: 10 },
        },
      },

      MuiContainer: { defaultProps: { maxWidth: 'lg' } },

      // Cards / outlined boxes: the "outlined" look should read on both grounds.
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background.paper,
            backgroundImage: 'none', // kill MUI's dark-mode elevation overlay on flat cards
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: palette.divider,
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          colorInherit: {
            backgroundColor: palette.background.paper,
            color: palette.text.primary,
          },
        },
      },

      // Chips used for tags/statuses — outlined variant needs a visible border.
      MuiChip: {
        styleOverrides: {
          outlined: { borderColor: palette.divider },
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
          notchedOutline: { borderColor: palette.divider },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { border: '1px solid', borderColor: 'transparent' },
        },
      },
    },
  });
}
