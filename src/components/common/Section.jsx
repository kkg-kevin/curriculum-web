import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

/**
 * Vertical rhythm wrapper for page sections. Keeps padding consistent and lets a
 * section paint a full-bleed background while content stays contained.
 *
 * Prefer the semantic `tone` prop over a raw `bg`:
 *   tone="default"  → transparent (page background shows through)
 *   tone="subtle"   → theme.palette.surface.subtle (alternating band)
 *   tone="primary"  → brand band (primary.main + contrast text)
 *   tone="inverse"  → dark band in both modes (surface.inverse)
 *
 * `bg` still accepts any theme colour path for one-offs.
 *
 * `dots` overlays a faint decorative dot-grid on the section ground (see
 * `surface.dotGrid`). Purely presentational; sits behind the contained content.
 */
const TONE_SX = {
  default: {},
  subtle: { backgroundColor: 'surface.subtle' },
  primary: { backgroundColor: 'primary.main', color: 'primary.contrastText' },
  inverse: { backgroundColor: 'surface.inverse', color: 'surface.inverseText' },
};

export default function Section({
  children,
  tone = 'default',
  bg,
  dots = false,
  py = { xs: 8, md: 13 },
  maxWidth = 'lg',
  component = 'section',
  sx,
  ...rest
}) {
  return (
    <Box
      component={component}
      sx={{
        position: 'relative',
        py,
        ...(bg ? { backgroundColor: bg } : TONE_SX[tone] || TONE_SX.default),
        ...sx,
      }}
      {...rest}
    >
      {dots && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: (t) => `radial-gradient(${t.palette.surface.dotGrid} 1px, transparent 1.6px)`,
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)',
          }}
        />
      )}
      <Container maxWidth={maxWidth} sx={{ position: 'relative' }}>
        {children}
      </Container>
    </Box>
  );
}
