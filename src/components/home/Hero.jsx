import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Reveal from '../common/Reveal.jsx';
import { hero } from '../../content/home.js';
import { purpose } from '../../content/organisation.js';
import { PURPOSE_ICONS, PURPOSE_ACCENTS } from './Purpose.jsx';

/**
 * Premium hero. Two-column on desktop, stacked on mobile:
 *
 *  LEFT  — the copy: a status pill, a per-word clip-reveal heading with a
 *          one-time sheen, sub, CTAs and a "what's inside" strip.
 *  RIGHT — the vision, mission and 2030 goal as three stacked cards. On phones they drop
 *          under the copy.
 *
 * Motion notes: entrance animation is done with the <Reveal> component
 * (IntersectionObserver + CSS transition) and the infinite float/sheen use
 * keyframes defined in styles/global.css — never `@keyframes` inside `sx`,
 * because emotion can inject those a frame late and leave an element that
 * starts at opacity 0 stuck invisible. Everything decorative is aria-hidden /
 * pointer-events:none and stills under `prefers-reduced-motion`.
 */

const HEADING_WORDS = hero.heading.split(' ');
const HEADING_LAST_DELAY = 280;
const wordStep = HEADING_LAST_DELAY / Math.max(HEADING_WORDS.length - 1, 1);

// The clip box is overflow-hidden, so whitespace *inside* it collapses — hence
// the right margin for the inter-word gap.
const wordClip = {
  display: 'inline-block',
  overflow: 'hidden',
  verticalAlign: 'top',
  py: '0.12em',
  my: '-0.12em',
  mr: '0.26em',
};

const wordInner = (index) => ({
  display: 'inline-block',
  willChange: 'transform',
  animation: `df-word-rise 640ms cubic-bezier(0.22, 1, 0.36, 1) ${80 + index * wordStep}ms both`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transform: 'none',
  },
});

// One-time sheen sweep. The text keeps a real `color` so it is always legible
// even if the gradient/clip fails to apply; the gradient just rides on top for
// the duration of the sweep.
const headingSheen = (t) => ({
  color: t.palette.text.primary,
  backgroundImage: `linear-gradient(100deg, ${t.palette.text.primary} 42%, ${t.palette.primary.main} 50%, ${t.palette.text.primary} 58%)`,
  backgroundSize: '260% 100%',
  backgroundPositionX: '100%',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'df-sheen 1500ms ease-out 900ms both',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    backgroundImage: 'none',
    WebkitTextFillColor: t.palette.text.primary,
  },
});

const PILLARS = [
  'Learning pathways',
  'Holiday bootcamps',
  'Home schooling',
  'Schools programme',
  'Buildable projects',
  'Competitions',
  'The Quarky robot',
];

function HeroBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          borderRadius: '50%',
        },
        '&::before': {
          width: 640,
          height: 640,
          top: -260,
          left: -200,
          background: (t) =>
            `radial-gradient(circle at 50% 50%, ${t.palette.surface.heroGlow} 0%, transparent 70%)`,
        },
        '&::after': {
          width: 720,
          height: 720,
          right: -220,
          bottom: -340,
          background: (t) =>
            `radial-gradient(circle at 50% 50%, ${t.palette.surface.heroGlowWarm} 0%, transparent 72%)`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: (t) =>
            `radial-gradient(${t.palette.surface.dotGrid} 1px, transparent 1.6px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 75% at 30% 35%, #000 20%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 75% at 30% 35%, #000 20%, transparent 72%)',
        }}
      />
    </Box>
  );
}

// Vision, mission and 2030 goal, stacked beside the copy (under it on phones). The cards are
// lightly see-through so the illustration behind the hero (HeroStudents) reads through them.
// The two Digifunzi students, faded, behind the whole hero: the girl ends up behind the copy and
// the boy behind the cards. The drawing only fills the middle three-quarters of its file, so the
// image is set wider than the frame to bring the pair out to its edges. On phones it sits behind
// the cards at the bottom instead, where the pair would otherwise be too small to make out.
function HeroStudents() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        left: '50%',
        top: { xs: 'auto', md: '50%' },
        bottom: { xs: 40, md: 'auto' },
        width: { xs: '150%', md: '134%' },
        transform: { xs: 'translateX(-50%)', md: 'translate(-50%, -50%)' },
        opacity: (t) => (t.palette.mode === 'dark' ? 0.3 : 0.24),
        pointerEvents: 'none',
        // Fainter on the left, where the girl sits behind running text.
        maskImage: { md: 'linear-gradient(90deg, rgba(0,0,0,0.5) 25%, #000 60%)' },
        WebkitMaskImage: { md: 'linear-gradient(90deg, rgba(0,0,0,0.5) 25%, #000 60%)' },
      }}
    >
      <Box
        className="df-anim-float"
        component="img"
        src="/hero-students.png"
        alt=""
        width={1366}
        height={768}
        sx={{
          display: 'block',
          width: '100%',
          height: 'auto',
          animation: 'df-float-lg 8s ease-in-out infinite',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
    </Box>
  );
}

function HeroPurpose() {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        gap: { xs: 2, md: 2.5 },
        width: '100%',
        maxWidth: { md: 480 },
        justifySelf: { md: 'end' },
      }}
    >
      {purpose.map((p, i) => {
        const Icon = PURPOSE_ICONS[p.key];
        const accent = PURPOSE_ACCENTS[p.key];
        return (
          <Reveal key={p.key} delay={220 + i * 110} y={20} sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, sm: 2.5 },
                p: { xs: 2.5, md: 3 },
                borderRadius: 4,
                backgroundColor: (t) => alpha(t.palette.surface.card, 0.78),
                backdropFilter: 'blur(3px)',
                border: '1px solid',
                borderColor: 'surface.ring',
                boxShadow: 'shadow.md',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: accent,
                  background: (t) =>
                    `linear-gradient(150deg, ${t.palette.primary.main}22, ${t.palette.secondary.main}1f)`,
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>
                  {p.title}
                </Typography>
                <Typography color="text.secondary">{p.body}</Typography>
              </Box>
            </Box>
          </Reveal>
        );
      })}
    </Box>
  );
}

export default function Hero() {
  return (
    <Box
      component="section"
      className="df-anim-wash"
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        background: (t) =>
          `linear-gradient(160deg, ${t.palette.surface.heroFrom} 0%, ${t.palette.surface.heroVia} 52%, ${t.palette.surface.heroTo} 100%)`,
        backgroundSize: '160% 160%',
        animation: 'df-wash 20s ease-in-out infinite alternate',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <HeroBackdrop />

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 6, md: 5 },
            alignItems: 'center',
          }}
        >
          <HeroStudents />
          <Box sx={{ position: 'relative', maxWidth: { xs: '100%', md: 560, xl: 640 } }}>
            <Reveal
              as="span"
              delay={40}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1.75,
                py: 0.75,
                mb: 3,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'surface.ring',
                backgroundColor: (t) =>
                  t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  boxShadow: (t) => `0 0 0 4px ${t.palette.success.main}22`,
                }}
              />
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}>
                {hero.eyebrow}
              </Typography>
            </Reveal>

            <Typography variant="h1" component="h1" sx={{ mb: 3, ...headingSheen }}>
              {HEADING_WORDS.map((word, i) => (
                <Box key={`${word}-${i}`} component="span" sx={wordClip}>
                  <Box component="span" sx={wordInner(i)}>
                    {word}
                  </Box>
                </Box>
              ))}
            </Typography>

            <Reveal delay={140}>
              <Typography
                component="p"
                sx={{
                  fontSize: { xs: '1.08rem', md: '1.2rem' },
                  lineHeight: 1.6,
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: 520,
                }}
              >
                {hero.sub}
              </Typography>
            </Reveal>

            <Reveal delay={210} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button component={RouterLink} to={hero.primaryCta.to} variant="contained" size="large">
                {hero.primaryCta.label}
              </Button>
              <Button component={RouterLink} to={hero.secondaryCta.to} variant="outlined" size="large">
                {hero.secondaryCta.label}
              </Button>
            </Reveal>

            <Reveal
              delay={290}
              sx={{
                mt: 5,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 1.75 },
              }}
            >
              {PILLARS.map((p) => (
                <Box
                  key={p}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                  }}
                >
                  <Box
                    component="span"
                    sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'primary.main' }}
                  />
                  {p}
                </Box>
              ))}
            </Reveal>
          </Box>

          <HeroPurpose />
        </Box>
      </Container>
    </Box>
  );
}
