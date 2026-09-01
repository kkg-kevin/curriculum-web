import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SeoHead from '../components/seo/SeoHead.jsx';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
      <SeoHead title="Page not found" noindex />
      <Typography variant="h1" component="h1" gutterBottom>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        The page you’re looking for doesn’t exist or has moved.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button component={RouterLink} to="/" variant="contained">
          Go home
        </Button>
        <Button component={RouterLink} to="/projects" variant="outlined">
          Browse projects
        </Button>
      </Box>
    </Container>
  );
}
