import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

/** Reusable full-bleed CTA band. */
export default function CTABanner({
  heading = 'Ready to get started?',
  body = 'Tell us a little about your learner and we’ll help you find the right programme.',
  primary = { label: 'Enroll a learner', to: '/enroll' },
  secondary = { label: 'Talk to us', to: '/contact' },
}) {
  return (
    <Box sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText', py: { xs: 6, md: 9 } }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          {heading}
        </Typography>
        <Typography sx={{ mb: 4, opacity: 0.9 }}>{body}</Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={RouterLink}
            to={primary.to}
            variant="contained"
            color="secondary"
            size="large"
          >
            {primary.label}
          </Button>
          {secondary && (
            <Button
              component={RouterLink}
              to={secondary.to}
              variant="outlined"
              size="large"
              sx={{ color: 'inherit', borderColor: 'currentColor' }}
            >
              {secondary.label}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}
