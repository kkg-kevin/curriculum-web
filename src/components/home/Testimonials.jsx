import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { testimonials } from '../../content/home.js';

/**
 * "What parents and schools say" — not three equal quote boxes. The first
 * testimonial is a large feature card with an oversized quote mark and a warm
 * gradient wash; the remaining quotes stack beside it as compact cards. Still
 * plain markup (figure/blockquote), no JS carousel — works without JS for
 * crawlers (spec §7).
 *
 * Avatar is a coloured monogram derived from the attribution, cycling the brand
 * accents so the three read as distinct people.
 */

const AVATAR_ACCENTS = ['primary.main', 'secondary.main', 'success.main'];

function monogram(name) {
  const words = name.replace(/,.*$/, '').trim().split(/\s+/);
  return (words[0]?.[0] || '') + (words[1]?.[0] || '');
}

function Avatar({ name, accent }) {
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#fff',
        backgroundColor: accent,
      }}
    >
      {monogram(name).toUpperCase()}
    </Box>
  );
}

function QuoteMark({ sx }) {
  return (
    <Box
      aria-hidden
      component="svg"
      viewBox="0 0 48 40"
      sx={{ fill: 'currentColor', ...sx }}
    >
      <path d="M0 40V22C0 9.85 6.6 1.85 19.8 0l2.4 6.6C15 8.4 11.4 12.6 11.4 19.2H21V40H0Zm27 0V22C27 9.85 33.6 1.85 46.8 0l2.4 6.6C42 8.4 38.4 12.6 38.4 19.2H48V40H27Z" />
    </Box>
  );
}

export default function Testimonials() {
  const [feature, ...rest] = testimonials;

  return (
    <Section dots>
      <SectionHeading
        eyebrow="Proof"
        title="What parents and schools say"
        sx={{ mb: { xs: 5, md: 7 } }}
      />

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2.5, md: 3 },
          gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
          alignItems: 'stretch',
        }}
      >
        {/* feature quote */}
        <Reveal>
          <Box
            component="figure"
            sx={{
              m: 0,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              p: { xs: 3.5, md: 5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'surface.ring',
              boxShadow: 'shadow.md',
              background: (t) =>
                `linear-gradient(150deg, ${t.palette.surface.card} 40%, ${t.palette.secondary.main}12 100%)`,
            }}
          >
            <QuoteMark
              sx={{
                position: 'absolute',
                top: 28,
                right: 32,
                width: 72,
                height: 60,
                color: 'secondary.main',
                opacity: 0.18,
              }}
            />
            <Typography
              component="blockquote"
              sx={{
                m: 0,
                position: 'relative',
                fontSize: { xs: '1.25rem', md: '1.55rem' },
                lineHeight: 1.45,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'text.primary',
                maxWidth: 560,
              }}
            >
              “{feature.quote}”
            </Typography>
            <Box
              component="figcaption"
              sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Avatar name={feature.name} accent={AVATAR_ACCENTS[0]} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {feature.name}
              </Typography>
            </Box>
          </Box>
        </Reveal>

        {/* supporting quotes */}
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            gridAutoRows: { md: '1fr' },
          }}
        >
          {rest.map((t, i) => (
            <Reveal key={t.name + i} delay={(i + 1) * 90} sx={{ height: '100%' }}>
              <Box
                component="figure"
                sx={{
                  m: 0,
                  height: '100%',
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 4,
                  backgroundColor: 'surface.card',
                  border: '1px solid',
                  borderColor: 'surface.ring',
                  boxShadow: 'shadow.md',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  component="blockquote"
                  sx={{ m: 0, flexGrow: 1, color: 'text.primary', lineHeight: 1.6 }}
                >
                  “{t.quote}”
                </Typography>
                <Box
                  component="figcaption"
                  sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1.25 }}
                >
                  <Avatar name={t.name} accent={AVATAR_ACCENTS[(i + 1) % AVATAR_ACCENTS.length]} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t.name}
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
