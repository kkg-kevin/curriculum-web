import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import GlobalStyles from '@mui/material/GlobalStyles';
import Typography from '@mui/material/Typography';
import SmartImage from '../common/SmartImage.jsx';
import QuickAddButton from '../catalog/QuickAddButton.jsx';
import { cart } from '../../cart/cartStore.js';
import { formatPrice } from '../../utils/format.js';

/**
 * A product's name, price and buttons along the bottom of the screen once the buy panel's own
 * buttons (`watchRef`) have scrolled out of view — on every screen size, so there's always a way to
 * buy in reach while reading the details. Lifts the floating WhatsApp button above itself
 * (--floating-bottom-offset) and leaves room at the end of the page.
 *
 *   kind, item { id, slug, name, image, price, kitPrice? }, buyable, status, enquireTo
 */
export default function StickyBuyBar({ watchRef, kind, item, buyable, status = 'available', enquireTo }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = watchRef?.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    // Shown once the buttons are above the top of the screen (not while they're still to come).
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: '-72px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchRef]);

  const buyNow = () => {
    cart.add({
      type: kind, id: item.id, slug: item.slug, name: item.name, image: item.image || null,
      unitPrice: item.price.amount, currency: item.price.currency || 'KES', quantity: 1,
      ...(kind === 'project' ? { withKit: false, kitPrice: item.kitPrice?.amount ?? null } : {}),
    });
    navigate('/checkout');
  };

  return (
    <>
      {show && <GlobalStyles styles={{ ':root': { '--floating-bottom-offset': '76px' } }} />}
      <Box aria-hidden sx={{ height: show ? 84 : 0 }} />
      <Box
        role="region"
        aria-label={`Buy ${item.name}`}
        sx={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: (t) => t.zIndex.appBar - 1,
          transform: show ? 'translateY(0)' : 'translateY(110%)',
          visibility: show ? 'visible' : 'hidden',
          transition: 'transform 220ms ease, visibility 220ms',
          bgcolor: 'background.paper',
          borderTop: '1px solid', borderColor: 'divider',
          boxShadow: 'shadow.lg',
          px: 2, pt: 1.25, pb: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          '@media print': { display: 'none' },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 48, flexShrink: 0, borderRadius: 1.5, overflow: 'hidden' }}>
            <SmartImage src={item.image} alt="" ratio="1 / 1" rounded={false} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {item.name}
            </Typography>
            <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
              {item.price ? formatPrice(item.price) : 'Ask us for a price'}
            </Typography>
          </Box>
          {buyable ? (
            <>
              <QuickAddButton kind={kind} item={item} sx={{ minHeight: 42, display: { xs: 'none', sm: 'inline-flex' } }} />
              <Button variant="contained" onClick={buyNow} sx={{ flexShrink: 0, minHeight: 42, px: { xs: 2.5, sm: 3 } }}>
                {status === 'preorder' ? 'Pre-order' : 'Buy now'}
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to={enquireTo} variant="contained" sx={{ flexShrink: 0, minHeight: 42 }}>
              {status === 'coming_soon' ? 'Notify me' : 'Enquire'}
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
