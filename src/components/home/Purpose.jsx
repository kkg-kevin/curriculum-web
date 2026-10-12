import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import FlagIcon from '@mui/icons-material/Flag';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { purpose } from '../../content/organisation.js';

export const PURPOSE_ICONS = { vision: VisibilityIcon, mission: TrackChangesIcon, goal: FlagIcon };
// The goal is the one with a number and a date on it, so it takes the warm accent.
export const PURPOSE_ACCENTS = { vision: 'primary.main', mission: 'primary.main', goal: 'secondary.main' };

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
          const Icon = PURPOSE_ICONS[p.key];
          const accent = PURPOSE_ACCENTS[p.key];
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
                <Box
                  aria-hidden
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2.5,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: accent,
                    background: (t) =>
                      `linear-gradient(150deg, ${t.palette.primary.main}22, ${t.palette.secondary.main}1f)`,
                  }}
                >
                  <Icon sx={{ fontSize: 32 }} />
                </Box>
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
