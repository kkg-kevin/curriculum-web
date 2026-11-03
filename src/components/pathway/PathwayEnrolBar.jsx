import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

/**
 * On a phone or tablet, a pathway's (or stage's) price and Enrol button stay at the bottom of the
 * screen — on a large screen the side panel does that job (DetailLayout), so this hides there.
 * Lifts the floating WhatsApp button above itself (--floating-bottom-offset) and renders a spacer
 * of its own height so the end of the page isn't hidden behind it.
 */
export default function PathwayEnrolBar({ to, label, price, note }) {
  return (
    <>
      <GlobalStyles
        styles={(t) => ({ [t.breakpoints.down('lg')]: { ':root': { '--floating-bottom-offset': '72px' } } })}
      />
      <Box aria-hidden sx={{ display: { xs: 'block', lg: 'none' }, height: 88 }} />
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar - 1,
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          pt: 1.25,
          pb: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.08)',
          '@media print': { display: 'none' },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {price || 'Enquire for pricing'}
          </Typography>
          {note && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {note}
            </Typography>
          )}
        </Box>
        <Button component={RouterLink} to={to} variant="contained" sx={{ flexShrink: 0 }}>
          {label}
        </Button>
      </Box>
    </>
  );
}
