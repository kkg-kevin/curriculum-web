import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Reveal from '../common/Reveal.jsx';

/**
 * Reusable full-bleed CTA band. Rather than a flat blue rectangle it's a
 * contained, rounded "plate" floating on the page ground: a deep brand gradient,
 * a soft radial highlight, a masked dot-grid and the Digifunzi mascot bled off
 * the right edge. Reads as a designed closing panel, not a coloured strip.
 */
export default function CTABanner({
  heading = 'Ready to get started?',
  body = 'Tell us a little about your learner and we’ll help you find the right programme — no commitment.',
  primary = { label: 'Enroll a learner', to: '/enroll' },
  secondary = { label: 'Talk to us', to: '/contact' },
}) {
  return (
    <Box component="section" sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 7, md: 12 }, px: { xs: 2, sm: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Reveal>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: { xs: 5, md: 7 },
              px: { xs: 3.5, sm: 6, md: 9 },
              py: { xs: 6, md: 9 },
              color: '#fff',
              background: (t) =>
                `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 55%, ${t.palette.brand.blue[400]} 100%)`,
              boxShadow: 'shadow.lg',
            }}
          >
            {/* radial highlight */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: '-40%',
                left: '-10%',
                width: 520,
                height: 520,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, transparent 66%)',
                pointerEvents: 'none',
              }}
            />
            {/* warm accent bloom */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: '6%',
                bottom: '-50%',
                width: 460,
                height: 460,
                borderRadius: '50%',
                background: (t) =>
                  `radial-gradient(circle at 50% 50%, ${t.palette.secondary.main}55 0%, transparent 68%)`,
                pointerEvents: 'none',
              }}
            />
            {/* dot grid */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1.6px)',
                backgroundSize: '24px 24px',
                maskImage: 'linear-gradient(90deg, #000 0%, transparent 60%)',
                WebkitMaskImage: 'linear-gradient(90deg, #000 0%, transparent 60%)',
              }}
            />
            {/* mascot — bled off the right edge, feet below the plate edge so it
                reads as leaning into frame rather than sitting cropped */}
            <Box
              aria-hidden
              component="img"
              src="/logo.png"
              alt=""
              sx={{
                position: 'absolute',
                right: { md: -12, lg: 8 },
                bottom: -40,
                width: { md: 240, lg: 280 },
                filter: 'drop-shadow(0 24px 34px rgba(0,0,0,0.35))',
                display: { xs: 'none', md: 'block' },
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative', maxWidth: 560 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{ mb: 2, color: '#fff', letterSpacing: '-0.02em' }}
              >
                {heading}
              </Typography>
              <Typography sx={{ mb: 4, fontSize: '1.08rem', color: 'rgba(255,255,255,0.88)' }}>
                {body}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to={primary.to}
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  {primary.label}
                </Button>
                {secondary && (
                  <Button
                    component={RouterLink}
                    to={secondary.to}
                    variant="outlined"
                    size="large"
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '@media (hover: hover)': {
                        '&:hover': {
                          borderColor: '#fff',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        },
                      },
                    }}
                  >
                    {secondary.label}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
