import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

/**
 * A pathway's (or stage's) price and Enrol button, kept at the bottom of the screen.
 *
 * - Phone / tablet: always there.
 * - Large screen: only with `watchRef` (the page's own Enrol button, e.g. in the hero) — the bar
 *   slides in once that button has scrolled out of view, so there's always one Enrol in reach.
 *   Without `watchRef` it stays hidden there (the page has a side panel instead).
 *
 * Lifts the floating WhatsApp button above itself (--floating-bottom-offset) and renders a spacer
 * of its own height so the end of the page isn't hidden behind it.
 */
export default function PathwayEnrolBar({ to, label, price, note, watchRef = null }) {
  const [heroHidden, setHeroHidden] = useState(false);

  useEffect(() => {
    const el = watchRef?.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setHeroHidden(!entry.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchRef]);

  const onLarge = Boolean(watchRef) && heroHidden;
  const display = { xs: 'flex', lg: onLarge ? 'flex' : 'none' };

  return (
    <>
      <GlobalStyles
        styles={(t) => ({
          [t.breakpoints.down('lg')]: { ':root': { '--floating-bottom-offset': '72px' } },
          ...(onLarge ? { [t.breakpoints.up('lg')]: { ':root': { '--floating-bottom-offset': '80px' } } } : {}),
        })}
      />
      <Box aria-hidden sx={{ display: { xs: 'block', lg: watchRef ? 'block' : 'none' }, height: 88 }} />
      <Box
        sx={{
          display,
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar - 1,
          justifyContent: 'center',
          px: 2,
          pt: 1.25,
          pb: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -6px 20px rgba(0,0,0,0.08)',
          animation: { lg: 'enrolBarIn 220ms ease-out' },
          '@keyframes enrolBarIn': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
          '@media print': { display: 'none' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1200, display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
          <Button component={RouterLink} to={to} variant="contained" sx={{ flexShrink: 0, px: { lg: 4 } }}>
            {label}
          </Button>
        </Box>
      </Box>
    </>
  );
}
