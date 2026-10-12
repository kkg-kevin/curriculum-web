import Box from '@mui/material/Box';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { whatsAppUrl } from '../../config/site.js';

/**
 * Floating "chat on WhatsApp" button, bottom right on every page. Opens a chat with
 * ORG.whatsappNumber (config/site.js) in a new tab; renders nothing while that number is unset.
 * WhatsApp's own green in both colour modes, so it reads as the WhatsApp button at a glance.
 */
export default function WhatsAppButton() {
  const url = whatsAppUrl('Hello Digifunzi, I have a question.');
  if (!url) return null;
  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 24 },
        // Clear of the phone's home-indicator strip.
        bottom: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', md: 24 },
        zIndex: (t) => t.zIndex.speedDial,
        width: 56,
        height: 56,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        backgroundColor: '#25D366',
        boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
        transition: 'transform 200ms ease, background-color 200ms ease',
        '@media (hover: hover)': {
          '&:hover': { transform: 'scale(1.08)', backgroundColor: '#1EBE5A' },
        },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '@media print': { display: 'none' },
      }}
    >
      <WhatsAppIcon sx={{ fontSize: 32 }} />
    </Box>
  );
}
