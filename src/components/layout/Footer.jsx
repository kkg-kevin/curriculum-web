import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Logo from '../common/Logo.jsx';
import { ORG, phoneUrl, whatsAppUrl } from '../../config/site.js';

const contactLinkSx = { color: 'surface.inverseTextDim', '&:hover': { color: 'surface.inverseText' } };

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Pathways', to: '/pathways' },
      { label: 'Projects', to: '/projects' },
      { label: 'Bootcamps', to: '/bootcamps' },
      { label: 'Competitions', to: '/competitions' },
      { label: 'Home Schooling', to: '/home-schooling' },
      { label: 'Store', to: '/store' },
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

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
];

/**
 * Footer sits on the `surface.inverse` band — intentionally dark in both light
 * and dark mode (a common landing-page pattern). All colours come from the
 * `surface.inverse*` tokens so the exact shade still adapts per mode.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const phone = phoneUrl();
  const whatsApp = whatsAppUrl('Hello Digifunzi, I have a question.');
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
        {/* Four columns across a wide page — brand, two link lists, how to reach us — so the
            footer is filled edge to edge instead of leaving a blank band in the middle. */}
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 6 },
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.6fr 1fr 1fr 1.2fr' },
          }}
        >
          <Box sx={{ gridColumn: { sm: '1 / -1', md: 'auto' } }}>
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

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'surface.inverseTextDim' }}>
              Get in touch
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href={`mailto:${ORG.email}`} underline="hover" sx={contactLinkSx}>
                {ORG.email}
              </Link>
              {/* Phone and WhatsApp appear once real numbers are set in config/site.js. */}
              {phone && (
                <Link href={phone} underline="hover" sx={contactLinkSx}>
                  {ORG.telephone}
                </Link>
              )}
              {whatsApp && (
                <Link href={whatsApp} target="_blank" rel="noopener noreferrer" underline="hover" sx={contactLinkSx}>
                  Chat on WhatsApp
                </Link>
              )}
              <Link component={RouterLink} to="/contact" underline="hover" sx={contactLinkSx}>
                Send us a message
              </Link>
            </Box>
          </Box>
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5 }}>
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                component={RouterLink}
                to={l.to}
                underline="hover"
                variant="body2"
                sx={{ color: 'surface.inverseTextDim', '&:hover': { color: 'surface.inverseText' } }}
              >
                {l.label}
              </Link>
            ))}
            <Typography variant="body2" sx={{ color: 'surface.inverseTextDim' }}>
              {ORG.address.addressLocality}, {ORG.address.addressCountry}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
