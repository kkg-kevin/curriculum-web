import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';

/**
 * Brand logo: the "digifunzi" wordmark image (public/wordmark.png — the same file the portal
 * uses, dark letters on transparent). The mascot (public/logo.png) is no longer shown beside it;
 * that file stays as the browser-tab icon and the logo in the site's structured data.
 *
 * The wordmark's letters are dark, so wherever the logo sits on a dark background — the footer
 * band (pass `onDark`), and the header and menu in dark mode — it is shown white.
 */
export default function Logo({ onClick, onDark = false }) {
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
        src="/wordmark.png"
        alt="Digifunzi"
        // The file's real size — lets the browser hold the space before the image arrives.
        width={2335}
        height={753}
        sx={{
          height: 28,
          width: 'auto',
          display: 'block',
          flexShrink: 0,
          filter: (t) => (onDark || t.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none'),
        }}
      />
    </Box>
  );
}
