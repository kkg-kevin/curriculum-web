import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import { programme, features } from '../../content/schools.js';
import { actionRowSx } from '../common/ActionRow.jsx';

/**
 * "For schools" on the home page — the schools programme in one paragraph, with what it
 * includes listed beside it. The full story is on /schools.
 */
export default function SchoolsBand() {
  return (
    <Section dots>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 5, md: 8 },
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'center',
        }}
      >
        <Box>
          <SectionHeading eyebrow="For schools" title={programme.title} lead={programme.body[0]} />
          <Reveal delay={180} sx={{ mt: 4, ...actionRowSx }}>
            <Button component={RouterLink} to="/schools" variant="contained" size="large">
              See the schools programme
            </Button>
            <Button component={RouterLink} to={programme.contactTo} variant="outlined" size="large">
              Talk to us
            </Button>
          </Reveal>
        </Box>

        <Reveal delay={120}>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              m: 0,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              backgroundColor: 'surface.card',
              border: '1px solid',
              borderColor: 'surface.ring',
              boxShadow: 'shadow.md',
              display: 'grid',
              gap: 2,
            }}
          >
            {features.map((f) => (
              <Box component="li" key={f.title} sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box
                  aria-hidden
                  component="svg"
                  viewBox="0 0 24 24"
                  sx={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    p: 0.5,
                    borderRadius: '50%',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 3,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    color: 'secondary.contrastText',
                    backgroundColor: 'secondary.main',
                  }}
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{f.title}</Typography>
              </Box>
            ))}
          </Box>
        </Reveal>
      </Box>
    </Section>
  );
}
