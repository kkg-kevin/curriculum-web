import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from '../common/Section.jsx';
import { testimonials } from '../../content/home.js';

/**
 * Simple responsive testimonial grid (not a JS carousel — keeps the bundle lean
 * and works without JS for crawlers, per spec §7).
 */
export default function Testimonials() {
  return (
    <Section>
      <Typography variant="h2" component="h2" sx={{ mb: 5 }}>
        What parents and schools say
      </Typography>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        {testimonials.map((t, i) => (
          <Box
            key={i}
            component="figure"
            sx={{ m: 0, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <Typography component="blockquote" sx={{ fontStyle: 'italic', mb: 2 }}>
              “{t.quote}”
            </Typography>
            <Typography component="figcaption" variant="body2" color="text.secondary">
              — {t.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Section>
  );
}
