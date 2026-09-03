import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Logo from '../common/Logo.jsx';
import { ORG } from '../../config/site.js';

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Bootcamps', to: '/bootcamps' },
      { label: 'Competitions', to: '/competitions' },
      { label: 'Projects', to: '/projects' },
      { label: 'Pathways', to: '/pathways' },
      { label: 'Quarky', to: '/quarky' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Enroll', to: '/enroll' },
    ],
  },
];

/**
 * Footer sits on the `surface.inverse` band — intentionally dark in both light
 * and dark mode (a common landing-page pattern). All colours come from the
 * `surface.inverse*` tokens so the exact shade still adapts per mode.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'surface.inverse',
        color: 'surface.inverseText',
        mt: 'auto',
        py: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' } }}>
          <Box>
            <Box sx={{ color: 'surface.inverseText', mb: 1 }}>
              <Logo />
            </Box>
            <Typography variant="body2" sx={{ color: 'surface.inverseTextDim', maxWidth: 360 }}>
              {ORG.description}
            </Typography>
          </Box>

          {COLUMNS.map((col) => (
            <Box key={col.heading}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'surface.inverseTextDim' }}>
                {col.heading}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {col.links.map((l) => (
                  <Link
                    key={l.to}
                    component={RouterLink}
                    to={l.to}
                    underline="hover"
                    sx={{
                      color: 'surface.inverseTextDim',
                      '&:hover': { color: 'surface.inverseText' },
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'surface.inverseBorder',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ color: 'surface.inverseTextDim' }}>
            © {year} {ORG.name}. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: 'surface.inverseTextDim' }}>
            {ORG.address.addressLocality}, {ORG.address.addressCountry}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
