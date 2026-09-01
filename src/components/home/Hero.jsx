import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Reveal from '../common/Reveal.jsx';
import { hero } from '../../content/home.js';

/**
 * Premium hero. Two-column on desktop, stacked on mobile:
 *
 *  LEFT  — the copy: a status pill, a per-word clip-reveal heading with a
 *          one-time sheen, sub, CTAs and a "what's inside" strip.
 *  RIGHT — a designed "stage": the Digifunzi mascot on a soft pedestal framed
 *          by floating glass UI chips (a live-session badge, a "first program
 *          compiled" note, a project-progress meter). This is what makes it
 *          read as a product, not a flyer.
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

const PILLARS = ['Weekly projects', 'Holiday bootcamps', 'Competitions', 'The Quarky robot'];

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

// A floating glassy UI chip. `floatDur`/`floatDelay` desync the bobs.
function GlassChip({ children, sx, floatDur = 7, floatDelay = 0 }) {
  return (
    <Box
      className="df-anim-float"
      sx={{
        position: 'absolute',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'surface.ring',
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(20,31,53,0.82)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'shadow.lg',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'text.primary',
        animation: `df-float ${floatDur}s ease-in-out ${floatDelay}s infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function HeroStage() {
  return (
    <Reveal
      delay={220}
      y={24}
      sx={{
        position: 'relative',
        display: { xs: 'none', md: 'block' },
        minHeight: 460,
      }}
    >
      {/* pedestal glow */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          width: 420,
          height: 420,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: (t) =>
            `radial-gradient(circle at 50% 45%, ${t.palette.primary.main}22 0%, transparent 62%)`,
        }}
      />
      {/* ground disc */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 40,
          width: 300,
          height: 44,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: (t) =>
            `radial-gradient(ellipse at center, ${
              t.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(28,25,20,0.14)'
            } 0%, transparent 70%)`,
        }}
      />
      {/* mascot: wrapper centres, inner img bobs */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 340,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Box
          className="df-anim-float"
          component="img"
          src="/logo.png"
          alt=""
          sx={{
            display: 'block',
            width: '100%',
            filter: (t) =>
              t.palette.mode === 'dark'
                ? 'drop-shadow(0 24px 34px rgba(0,0,0,0.5))'
                : 'drop-shadow(0 24px 30px rgba(28,25,20,0.22))',
            animation: 'df-float-lg 8s ease-in-out infinite',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      </Box>

      <GlassChip sx={{ top: 12, left: -4 }} floatDur={6.5}>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'success.main',
            boxShadow: (t) => `0 0 0 4px ${t.palette.success.main}22`,
          }}
        />
        Live session · 12 learners
      </GlassChip>

      <GlassChip sx={{ top: 96, right: -12 }} floatDur={7.5} floatDelay={-2}>
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}
        >
          <path
            d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Box>
        First program compiled
      </GlassChip>

      <GlassChip
        sx={{ bottom: 60, left: 4, flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}
        floatDur={8}
        floatDelay={-4}
      >
        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 700 }}>
          PROJECT PROGRESS
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 88,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'surface.ring',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{ width: '72%', height: '100%', borderRadius: 3, backgroundColor: 'primary.main' }}
            />
          </Box>
          <Box component="span" sx={{ fontSize: '0.72rem' }}>
            72%
          </Box>
        </Box>
      </GlassChip>
    </Reveal>
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
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 6, md: 5 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ maxWidth: { xs: '100%', md: 560 } }}>
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

          <HeroStage />
        </Box>
      </Container>
    </Box>
  );
}
