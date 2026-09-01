import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { hero } from '../../content/home.js';

export default function Hero() {
  return (
    <Box
      sx={{
        background: (t) =>
          `linear-gradient(160deg, ${t.palette.surface.heroFrom} 0%, ${t.palette.surface.heroVia} 55%, ${t.palette.surface.heroTo} 100%)`,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ maxWidth: 720 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
            {hero.eyebrow}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ mt: 1, mb: 2 }}>
            {hero.heading}
          </Typography>
          <Typography variant="h3" component="p" sx={{ fontWeight: 400, color: 'text.secondary', mb: 4 }}>
            {hero.sub}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to={hero.primaryCta.to} variant="contained" size="large">
              {hero.primaryCta.label}
            </Button>
            <Button component={RouterLink} to={hero.secondaryCta.to} variant="outlined" size="large">
              {hero.secondaryCta.label}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
