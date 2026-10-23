import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PriceTag from './PriceTag.jsx';
import { cart } from '../../cart/cartStore.js';
import { formatKsh } from '../../cart/format.js';

/**
 * Price and the way to buy — on a Store item or Project page. With a price: a quantity (Store) or
 * "add the materials kit" (Project, when it has one), Add to cart and Buy now (which goes straight
 * to checkout). Without a price, or "coming soon", it stays an enquiry.
 *
 *   kind     'store_item' | 'project'
 *   item     { id, slug, name, image, price, kitPrice? }
 *   status   'available' | 'preorder' | 'coming_soon' (Store only)
 *   enquireTo / contactTo   where the enquiry buttons go
 *   compact  the smaller version for a page's side rail
 */
export default function BuyBox({ kind, item, status = 'available', enquireTo, contactTo, compact = false }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [withKit, setWithKit] = useState(false);
  const [added, setAdded] = useState(false);
  const { price, kitPrice } = item;
  const buyable = Boolean(price) && status !== 'coming_soon';

  const addToCart = () => {
    cart.add({
      type: kind, id: item.id, slug: item.slug, name: item.name, image: item.image || null,
      unitPrice: price.amount, currency: price.currency || 'KES', quantity,
      ...(kind === 'project' ? { withKit, kitPrice: kitPrice?.amount ?? null } : {}),
    });
    setAdded(true);
  };

  return (
    <Box sx={{ p: compact ? 0 : 2.5, borderRadius: 2, border: compact ? 0 : '1px solid', borderColor: 'divider', bgcolor: compact ? 'transparent' : 'background.paper', maxWidth: compact ? 'none' : 440 }}>
      <PriceTag price={price} size={compact ? 'sm' : 'lg'} />
      {!compact && price?.note && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{price.note}</Typography>}

      {!buyable ? (
        <>
          <Button component={RouterLink} to={status === 'coming_soon' ? contactTo : enquireTo} variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
            {status === 'coming_soon' ? 'Notify me when available' : 'Enquire to buy'}
          </Button>
          {!compact && <Button component={RouterLink} to={contactTo} variant="text" size="small" fullWidth sx={{ mt: 0.5 }}>Ask a question first</Button>}
        </>
      ) : (
        <>
          {kind === 'store_item' && !compact && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Quantity</Typography>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
                <IconButton size="small" aria-label="Fewer" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}><RemoveRoundedIcon fontSize="small" /></IconButton>
                <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 800 }} aria-live="polite">{quantity}</Typography>
                <IconButton size="small" aria-label="More" onClick={() => setQuantity((q) => Math.min(20, q + 1))} disabled={quantity >= 20}><AddRoundedIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          )}

          {kind === 'project' && kitPrice && !compact && (
            <FormControlLabel
              sx={{ mt: 1.5, alignItems: 'flex-start', mr: 0 }}
              control={<Checkbox checked={withKit} onChange={(e) => setWithKit(e.target.checked)} sx={{ pt: 0.5 }} />}
              label={(
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Add the materials kit (+{formatKsh(kitPrice.amount, kitPrice.currency)})</Typography>
                  <Typography variant="body2" color="text.secondary">Everything listed under “What you’ll need”, ready to build with.</Typography>
                </Box>
              )}
            />
          )}

          {added ? (
            <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                <CheckCircleRoundedIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Added to your cart</Typography>
              </Box>
              <Button component={RouterLink} to="/checkout" variant="contained" size="large" fullWidth>Checkout</Button>
              <Button component={RouterLink} to="/cart" variant="outlined" fullWidth>View cart</Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
              <Button variant="contained" size="large" fullWidth onClick={() => { addToCart(); navigate('/checkout'); }}>
                {status === 'preorder' ? 'Pre-order now' : 'Buy now'}
              </Button>
              <Button variant="outlined" size="large" fullWidth onClick={addToCart}>Add to cart</Button>
            </Box>
          )}

          {!compact && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              {kind === 'project'
                ? 'Pay by M-Pesa, bank or cash after checkout. The project opens in your child’s learner account once your payment is confirmed.'
                : 'Pay by M-Pesa, bank or cash after checkout. Collect from a Digifunzi hub or have it delivered.'}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
