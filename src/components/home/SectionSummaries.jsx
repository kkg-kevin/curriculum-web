import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Section from '../common/Section.jsx';
import { sectionSummaries } from '../../content/home.js';

/** Summary of all four content sections (spec §1.1). */
export default function SectionSummaries() {
  return (
    <Section tone="subtle">
      <Typography variant="h2" component="h2" sx={{ mb: 5 }}>
        What we offer
      </Typography>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {sectionSummaries.map((s) => (
          <Box
            key={s.to}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h3" component="h3" gutterBottom>
              {s.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
              {s.blurb}
            </Typography>
            <Button component={RouterLink} to={s.to} variant="text" sx={{ alignSelf: 'flex-start' }}>
              Explore {s.title} →
            </Button>
          </Box>
        ))}
      </Box>
    </Section>
  );
}
