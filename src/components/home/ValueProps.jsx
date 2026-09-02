import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { valueProps } from '../../content/home.js';

/**
 * "Why families choose Digifunzi" — a two-column editorial block. The section
 * opener sits in a sticky left rail; the four value props run down the right as
 * generously-spaced rows with a line-art glyph and a hairline divider between
 * them. Deliberately NOT a 4-up card grid — this is the "story" beat of the
 * page, so it reads as prose with structure rather than tiles.
 *
 * Each glyph is inline SVG (stroke: currentColor) keyed by index.
 */

const GLYPHS = [
  // Learn by building — a bulb / spark
  <>
    <path d="M12 3a7 7 0 0 0-4 12.7V18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 3Z" />
    <path d="M9.5 21h5" />
  </>,
  // Progression — steps rising
  <>
    <path d="M3 20h5v-4h5v-4h5V7" />
    <path d="M18 4l3 3-3 3" />
  </>,
  // Mentors — two figures
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M4 20c0-3 2.2-5 5-5s5 2 5 5" />
    <path d="M16 11a3 3 0 1 0-1.6-5.5" />
    <path d="M15 20c0-2.3 1-4 3-4.6" />
  </>,
  // Built for Kenyan classrooms — a rugged kit / crate
  <>
    <path d="M4 8l8-4 8 4-8 4-8-4Z" />
    <path d="M4 8v8l8 4 8-4V8" />
    <path d="M12 12v8" />
  </>,
];

export default function ValueProps() {
  return (
    <Section dots>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 5, md: 8 },
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
          alignItems: 'start',
        }}
      >
        <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
          <SectionHeading
            eyebrow="Why Digifunzi"
            title="Why families choose Digifunzi"
            lead="A structured, hands-on approach to STEM that turns curiosity into real, demonstrable skills."
          />
          <Reveal
            delay={200}
            sx={{
              display: { xs: 'none', md: 'flex' },
              mt: 5,
              gap: 4,
            }}
          >
            {[
              { k: '6+', l: 'termly project tracks' },
              { k: '1:6', l: 'mentor-to-learner ratio' },
              { k: '100%', l: 'end each session with a build' },
            ].map((s) => (
              <Box key={s.l}>
                <Typography
                  sx={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1, color: 'primary.main' }}
                >
                  {s.k}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75, maxWidth: 120 }}
                >
                  {s.l}
                </Typography>
              </Box>
            ))}
          </Reveal>
        </Box>

        <Box>
          {valueProps.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 2.5, sm: 3 },
                  py: { xs: 3, md: 3.5 },
                  borderTop: i === 0 ? 'none' : '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 56,
                    height: 56,
                    borderRadius: 3.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    background: (t) =>
                      `linear-gradient(150deg, ${t.palette.primary.main}22, ${t.palette.secondary.main}1f)`,
                    border: '1px solid',
                    borderColor: (t) => `${t.palette.primary.main}33`,
                    boxShadow: 'shadow.sm',
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 24 24"
                    sx={{
                      width: 30,
                      height: 30,
                      fill: 'none',
                      stroke: 'currentColor',
                      strokeWidth: 1.9,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    {GLYPHS[i]}
                  </Box>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 1.25,
                      mb: 0.75,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'text.disabled',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </Typography>
                    <Typography variant="h4" component="h3">
                      {v.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ maxWidth: 460 }}>
                    {v.body}
                  </Typography>
                </Box>
              </Box>
            </Reveal>
          ))}
        </Box>
      </Box>
    </Section>
  );
}
