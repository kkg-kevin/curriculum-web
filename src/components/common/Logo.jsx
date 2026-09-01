import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';

/**
 * Brand logo: the Digifunzi mascot (public/logo.png — cropped from the brand
 * illustration) plus the wordmark. The mascot is a figure, not a wordmark, so
 * the "Digifunzi" text is always shown alongside it for legibility at small
 * sizes.
 *
 * The wordmark inherits `color` from its context (dark text on the light
 * header, light text in the footer). The mascot is a raster image and does not
 * invert — it reads on both the light header and the dark footer band.
 *
 * TODO (spec §9 item 5): replace public/logo.png with a proper logo mark /
 * wordmark SVG when the brand asset is ready, and drop the text fallback.
 */
export default function Logo({ onClick }) {
  return (
    <Box
      component={RouterLink}
      to="/"
      onClick={onClick}
      aria-label="Digifunzi — home"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        color: 'inherit',
        fontWeight: 800,
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
      }}
    >
      <Box
        component="img"
        src="/logo.png"
        alt=""
        aria-hidden="true"
        sx={{
          height: 36,
          width: 'auto',
          display: 'block',
          flexShrink: 0,
        }}
      />
      Digifunzi
    </Box>
  );
}
