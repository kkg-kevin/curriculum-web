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
  py = { xs: 6, md: 10 },
  maxWidth = 'lg',
  component = 'section',
  sx,
  ...rest
}) {
  return (
    <Box
      component={component}
      sx={{
        py,
        ...(bg ? { backgroundColor: bg } : TONE_SX[tone] || TONE_SX.default),
        ...sx,
      }}
      {...rest}
    >
      <Container maxWidth={maxWidth}>{children}</Container>
    </Box>
  );
}
