import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import RouteIcon from '@mui/icons-material/Route';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Reveal from '../common/Reveal.jsx';
import { programmeIcon } from './programmeIcons.js';
import { hero } from '../../content/home.js';
import { purpose } from '../../content/organisation.js';
import { PurposeIcon } from './Purpose.jsx';

/**
 * Premium hero. Two-column on desktop, stacked on mobile:
 *
 *  LEFT  — the copy: a status pill, a per-word clip-reveal heading with a
 *          one-time sheen, sub, the three programme buttons (Bootcamps, Home Schooling,
 *          Tech Clubs) and a "what's inside" strip.
 *  RIGHT — the vision, mission and 2030 goal as three stacked cards, with "Browse pathways"
 *          under them. On phones they drop under the copy.
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

// "5–17" never breaks across two lines.
function keepRangesTogether(text) {
  return text.split(/(\d+–\d+)/).map((part, i) =>
    /^\d+–\d+$/.test(part) ? (
      <Box key={i} component="span" sx={{ whiteSpace: 'nowrap' }}>
        {part}
      </Box>
    ) : (
      part
    ),
  );
}

// What's inside — each one opens its own page.
const PILLARS = [
  { label: 'Learning pathways', to: '/pathways' },
  { label: 'Holiday bootcamps', to: '/bootcamps' },
  { label: 'Home schooling', to: '/home-schooling' },
  { label: 'Schools programme', to: '/schools' },
  { label: 'Buildable projects', to: '/store?category=projects' },
  { label: 'Competitions', to: '/competitions' },
  { label: 'The Quarky robot', to: '/store' },
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
        opacity: { xs: 0.16, md: 0.24 },
        'html[data-color-mode="dark"] &': { opacity: { xs: 0.22, md: 0.3 } },
        pointerEvents: 'none',
        // Much fainter on the left, where the girl sits behind the heading and running text.
        maskImage: { md: 'linear-gradient(90deg, rgba(0,0,0,0.22) 22%, #000 64%)' },
        WebkitMaskImage: { md: 'linear-gradient(90deg, rgba(0,0,0,0.22) 22%, #000 64%)' },
      }}
    >
      <Box
        className="df-anim-float"
        component="img"
        src="/hero-kids.png"
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

// One of the three programme buttons: an icon tile, the name, a short hint, and an arrow that
// slides on hover. Three across from `sm` up, one under the other on a phone. The first is filled
// so the row has one clear lead.
function ProgrammeButton({ programme, highlighted }) {
  const Icon = programmeIcon(programme.key);
  return (
    <Box
      component={RouterLink}
      to={programme.to}
      sx={{
        position: 'relative',
        display: 'flex',
        // A row on a phone; from `sm` up the tiles are narrow, so icon on top, then the words.
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        gap: { xs: 1.5, sm: 1.25 },
        p: { xs: 1.5, sm: 2 },
        pr: { xs: 1.25, sm: 2 },
        minWidth: 0,
        borderRadius: 3,
        textDecoration: 'none',
        color: highlighted ? 'primary.contrastText' : 'text.primary',
        background: (t) =>
          highlighted
            ? `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`
            : alpha(t.palette.surface.card, 0.86),
        backdropFilter: 'blur(4px)',
        border: '1px solid',
        borderColor: highlighted ? 'transparent' : 'surface.ring',
        boxShadow: highlighted ? 'shadow.md' : 'shadow.sm',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'shadow.lg',
          borderColor: highlighted ? 'transparent' : 'primary.main',
        },
        '&:hover .df-programme-arrow': { transform: 'translateX(3px)', opacity: 1 },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: (t) => (highlighted ? 'rgba(255,255,255,0.18)' : alpha(t.palette.primary.main, 0.12)),
          color: highlighted ? 'inherit' : 'primary.main',
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="span" sx={{ display: 'block', fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25 }}>
          {programme.label}
        </Typography>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontSize: '0.78rem',
            lineHeight: 1.35,
            opacity: highlighted ? 0.85 : 1,
            color: highlighted ? 'inherit' : 'text.secondary',
          }}
        >
          {programme.hint}
        </Typography>
      </Box>
      <ArrowForwardIcon
        className="df-programme-arrow"
        sx={{
          fontSize: 18,
          flexShrink: 0,
          opacity: 0.7,
          transition: 'transform 180ms ease, opacity 180ms ease',
          // Top-right corner of the stacked tile.
          position: { sm: 'absolute' },
          top: { sm: 18 },
          right: { sm: 16 },
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
        maxWidth: { md: 500 },
        justifySelf: { md: 'end' },
      }}
    >
      {purpose.map((p, i) => {
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
              <PurposeIcon name={p.key} size={60} />
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

      {/* Browse pathways, right under the 2030 goal. */}
      <Reveal delay={220 + purpose.length * 110} y={20}>
        <Button
          component={RouterLink}
          to={hero.pathwaysCta.to}
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<RouteIcon />}
          endIcon={<ArrowForwardIcon />}
          sx={{
            py: 1.5,
            px: 3,
            backgroundColor: (t) => alpha(t.palette.surface.card, 0.78),
            backdropFilter: 'blur(3px)',
            '& .MuiButton-endIcon': { ml: 'auto', transition: 'transform 180ms ease' },
            '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)' },
          }}
        >
          {hero.pathwaysCta.label}
        </Button>
      </Reveal>
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

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 12 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.15fr) minmax(0, 0.85fr)' },
            gap: { xs: 6, md: 8 },
            alignItems: 'center',
          }}
        >
          <HeroStudents />
          <Box sx={{ position: 'relative', maxWidth: { xs: '100%', md: 640, xl: 700 } }}>
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
                  maxWidth: 560,
                }}
              >
                {keepRangesTogether(hero.sub)}
              </Typography>
            </Reveal>

            <Reveal
              as="nav"
              aria-label="Join a programme"
              delay={210}
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
              }}
            >
              {hero.programmes.map((p, i) => (
                <ProgrammeButton key={p.key} programme={p} highlighted={i === 0} />
              ))}
            </Reveal>

            <Reveal
              as="nav"
              aria-label="Programmes"
              delay={290}
              sx={{
                mt: 5,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: { xs: 2, sm: 2.25 },
                rowGap: 1,
              }}
            >
              {PILLARS.map((p) => (
                <Box
                  key={p.to}
                  component={RouterLink}
                  to={p.to}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    py: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    borderRadius: 1,
                    transition: 'color 160ms ease',
                    '&:hover': { color: 'primary.main', textDecoration: 'underline', textUnderlineOffset: 3 },
                  }}
                >
                  <Box
                    component="span"
                    aria-hidden
                    sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'primary.main', flexShrink: 0 }}
                  />
                  {p.label}
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
