import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Reveal from './Reveal.jsx';

/**
 * The standard section opener: a small tracked eyebrow with a short accent rule,
 * a display heading, and an optional lead paragraph. Used by every home-page
 * section so they share one rhythm instead of each rolling its own <Typography>
 * stack.
 *
 * Props:
 *  - eyebrow   short kicker above the title (optional)
 *  - title     the heading text (string or node)
 *  - lead      supporting paragraph (optional)
 *  - align     'left' (default) | 'center'
 *  - onColor   true when placed on a brand / inverse band (adjusts colours)
 *  - id        anchor id on the <h2>
 *  - component heading element (default 'h2')
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  onColor = false,
  id,
  component = 'h2',
  maxWidth = 620,
  sx,
}) {
  const center = align === 'center';

  return (
    <Box
      sx={{
        maxWidth: center ? maxWidth : undefined,
        mx: center ? 'auto' : 0,
        textAlign: center ? 'center' : 'left',
        ...sx,
      }}
    >
      {eyebrow && (
        <Reveal
          as="p"
          sx={{
            m: 0,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: center ? 'center' : 'flex-start',
            gap: 1.25,
          }}
        >
          <Box
            component="span"
            sx={{
              height: 2,
              width: 26,
              borderRadius: 1,
              backgroundColor: onColor ? 'surface.onColorText' : 'secondary.main',
              opacity: onColor ? 0.7 : 1,
            }}
          />
          <Box
            component="span"
            sx={{
              typography: 'overline',
              color: onColor ? 'surface.onColorText' : 'primary.main',
            }}
          >
            {eyebrow}
          </Box>
        </Reveal>
      )}

      <Reveal delay={eyebrow ? 60 : 0}>
        <Typography
          variant="h2"
          component={component}
          id={id}
          sx={{ color: onColor ? 'common.white' : 'text.primary' }}
        >
          {title}
        </Typography>
      </Reveal>

      {lead && (
        <Reveal delay={120}>
          <Typography
            sx={{
              mt: 2,
              maxWidth: center ? undefined : maxWidth,
              fontSize: '1.08rem',
              color: onColor ? 'surface.onColorText' : 'text.secondary',
            }}
          >
            {lead}
          </Typography>
        </Reveal>
      )}
    </Box>
  );
}
