import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';

/**
 * Text-based placeholder logo (spec §9 item 5). Replace with the real brand
 * asset — drop an SVG at /public/logo.svg and swap the markup here.
 *
 * The wordmark inherits `color` from its context (dark text on light header,
 * light text in the footer). The icon tile keeps the brand blue in both modes —
 * a logo mark doesn't invert — but its colours come from the theme's brand
 * scale so they track any rebrand.
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
        aria-hidden="true"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 2,
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 800,
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.brand.blue[700]}, ${t.palette.brand.blue[400]})`,
        }}
      >
        D
      </Box>
      Digifunzi
    </Box>
  );
}
