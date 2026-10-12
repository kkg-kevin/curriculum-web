import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import SvgIcon from '@mui/material/SvgIcon';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import Logo from '../common/Logo.jsx';
import { ORG, phoneUrl, whatsAppUrl } from '../../config/site.js';

const contactLinkSx = { color: 'surface.inverseTextDim', '&:hover': { color: 'surface.inverseText' } };

// The icon set has no TikTok mark, so this one is drawn here.
function TikTokIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </SvgIcon>
  );
}

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
};

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Pathways', to: '/pathways' },
      { label: 'Projects', to: '/projects' },
      { label: 'Bootcamps', to: '/bootcamps' },
      { label: 'Competitions', to: '/competitions' },
      { label: 'Home Schooling', to: '/home-schooling' },
      { label: 'Schools', to: '/schools' },
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
            <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: -1 }}>
              {ORG.social.map((x) => {
                const Icon = SOCIAL_ICONS[x.key];
                return (
                  <Link
                    key={x.key}
                    href={x.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Digifunzi on ${x.label}`}
                    sx={{ ...contactLinkSx, display: 'grid', placeItems: 'center', width: 40, height: 40 }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Link>
                );
              })}
            </Box>
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
              <Typography variant="body2" sx={{ color: 'surface.inverseTextDim' }}>
                {ORG.address.streetAddress}, {ORG.address.addressLocality}
              </Typography>
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
