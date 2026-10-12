import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Eye, Target, Flag } from 'lucide-react';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { purpose } from '../../content/organisation.js';

// Line icons from Lucide. The goal is the one with a number and a date on it, so it takes the
// warm accent.
const PURPOSE_ICONS = { vision: Eye, mission: Target, goal: Flag };
const PURPOSE_ACCENTS = { vision: 'primary.main', mission: 'primary.main', goal: 'secondary.main' };

export function PurposeIcon({ name, size = 64, sx }) {
  const Icon = PURPOSE_ICONS[name];
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        color: PURPOSE_ACCENTS[name],
        background: (t) => `linear-gradient(150deg, ${t.palette.primary.main}22, ${t.palette.secondary.main}1f)`,
        ...sx,
      }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.75} />
    </Box>
  );
}

/**
 * Digifunzi's vision, mission and 2030 goal as three cards, on the About page. The home page
 * shows the same three in its hero (components/home/Hero.jsx).
 */
export default function Purpose({
  tone = 'default',
  eyebrow = 'Who we are',
  title = 'An impact-driven digital literacy programme',
  lead,
}) {
  return (
    <Section tone={tone}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        align="center"
        maxWidth={760}
        sx={{ mb: { xs: 5, md: 7 } }}
      />

      <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        {purpose.map((p, i) => {
          return (
            <Reveal key={p.key} delay={i * 90} sx={{ height: '100%' }}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 3.5, md: 4.5 },
                  textAlign: 'center',
                  borderRadius: 4,
                  backgroundColor: 'surface.card',
                  border: '1px solid',
                  borderColor: 'surface.ring',
                  boxShadow: 'shadow.md',
                }}
              >
                <PurposeIcon name={p.key} sx={{ mx: 'auto', mb: 2.5 }} />
                <Typography variant="h3" component="h3" sx={{ mb: 1.5 }}>
                  {p.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '1.08rem', maxWidth: 320, mx: 'auto' }}>
                  {p.body}
                </Typography>
              </Box>
            </Reveal>
          );
        })}
      </Box>
    </Section>
  );
}
