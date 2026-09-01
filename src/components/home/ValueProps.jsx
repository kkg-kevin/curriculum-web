import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Section from '../common/Section.jsx';
import { valueProps } from '../../content/home.js';

export default function ValueProps() {
  return (
    <Section>
      <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
        Why families choose Digifunzi
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 5, maxWidth: 640 }}>
        A structured, hands-on approach to STEM that turns curiosity into real skills.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        }}
      >
        {valueProps.map((v) => (
          <Box key={v.title} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h4" component="h3" gutterBottom>
              {v.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {v.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Section>
  );
}
