import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { sectionSummaries } from '../../content/home.js';

/**
 * "What we offer" — the four content pillars (spec §1.1). Presented as four
 * large, tactile panels rather than a flat 2×2 of outlined boxes:
 *
 *  - each panel carries its own accent colour and a big line-art motif bled off
 *    the top-right corner
 *  - the whole panel is the link; on hover it lifts (shadow.lg), the accent bar
 *    grows and the "Explore →" arrow slides
 *  - a large ghosted index number anchors each one
 *
 * Accent + motif are keyed by `to` so the mapping survives content reordering.
 */

const ACCENTS = {
  '/bootcamps': {
    color: 'secondary.main',
    tint: (t) => t.palette.secondary.main,
    motif: (
      <>
        <path d="M20 44 44 20M32 12l16 16M12 32l16 16" />
        <circle cx="46" cy="18" r="4" />
      </>
    ),
  },
  '/competitions': {
    color: 'primary.main',
    tint: (t) => t.palette.primary.main,
    motif: (
      <>
        <path d="M18 14h28v10a14 14 0 0 1-28 0V14Z" />
        <path d="M46 16h6a6 6 0 0 1-6 6M18 16h-6a6 6 0 0 0 6 6M26 44h12M32 38v6" />
      </>
    ),
  },
  '/projects': {
    color: 'success.main',
    tint: (t) => t.palette.success.main,
    motif: (
      <>
        <rect x="12" y="14" width="40" height="30" rx="3" />
        <path d="M22 26l-5 5 5 5M42 26l5 5-5 5M34 22l-4 18" />
      </>
    ),
  },
  '/quarky': {
    color: 'warning.main',
    tint: (t) => t.palette.warning.main,
    motif: (
      <>
        <rect x="16" y="20" width="32" height="24" rx="5" />
        <path d="M32 12v8M24 12h16M22 32h4M38 32h4M26 44v4M38 44v4" />
      </>
    ),
  },
};

export default function SectionSummaries() {
  return (
    <Section tone="subtle">
      <SectionHeading
        eyebrow="Programmes"
        title="Four ways to learn with us"
        lead="Weekly courses, holiday intensives, team competitions and the robot they run on — designed to fit together into one path."
        sx={{ mb: { xs: 5, md: 7 } }}
      />

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2.5, md: 3 },
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        {sectionSummaries.map((s, i) => {
          const accent = ACCENTS[s.to] || ACCENTS['/projects'];
          return (
            <Reveal key={s.to} delay={i * 90}>
              <Box
                component={RouterLink}
                to={s.to}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: { md: 232 },
                  p: { xs: 3, md: 3.75 },
                  borderRadius: 4,
                  textDecoration: 'none',
                  color: 'text.primary',
                  backgroundColor: 'surface.card',
                  border: '1px solid',
                  borderColor: 'surface.ring',
                  boxShadow: 'shadow.md',
                  transition:
                    'transform 260ms cubic-bezier(0.22,1,0.36,1), box-shadow 260ms ease, border-color 260ms ease',
                  '@media (hover: hover)': {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 'shadow.lg',
                      borderColor: accent.color,
                    },
                    '&:hover .ss-bar': { width: 64 },
                    '&:hover .ss-arrow': { transform: 'translateX(4px)' },
                    '&:hover .ss-motif': { opacity: 0.16, transform: 'rotate(-6deg) scale(1.04)' },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                    '& .ss-motif, & .ss-bar, & .ss-arrow': { transition: 'none' },
                  },
                }}
              >
                {/* bled line-art motif */}
                <Box
                  className="ss-motif"
                  aria-hidden
                  component="svg"
                  viewBox="0 0 64 56"
                  sx={{
                    position: 'absolute',
                    top: -14,
                    right: -12,
                    width: 132,
                    height: 116,
                    fill: 'none',
                    stroke: accent.tint,
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    opacity: 0.1,
                    transition: 'opacity 260ms ease, transform 260ms ease',
                  }}
                >
                  {accent.motif}
                </Box>

                {/* ghost index */}
                <Typography
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    right: 20,
                    bottom: -6,
                    fontSize: '6rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: accent.color,
                    opacity: 0.08,
                  }}
                >
                  {i + 1}
                </Typography>

                <Box
                  className="ss-bar"
                  sx={{
                    width: 32,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: accent.color,
                    mb: 2,
                    transition: 'width 260ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                />

                <Typography variant="h3" component="h3" gutterBottom>
                  {s.title}
                </Typography>
                <Typography color="text.secondary" sx={{ flexGrow: 1, maxWidth: 380 }}>
                  {s.blurb}
                </Typography>

                <Box
                  sx={{
                    mt: 2.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontWeight: 650,
                    fontSize: '0.92rem',
                    color: accent.color,
                  }}
                >
                  Explore {s.title}
                  <Box
                    className="ss-arrow"
                    component="span"
                    aria-hidden
                    sx={{ transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1)' }}
                  >
                    →
                  </Box>
                </Box>
              </Box>
            </Reveal>
          );
        })}
      </Box>
    </Section>
  );
}
