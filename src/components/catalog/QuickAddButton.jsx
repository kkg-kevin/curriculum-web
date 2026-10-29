import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { cart } from '../../cart/cartStore.js';

/**
 * "Add to cart" straight from a Store card — one of the thing (a project without its kit; the kit
 * and quantities are chosen on the item's own page or in the cart). Says "Added" for a moment, and
 * the header's cart count goes up. Not shown for something without a price or not yet on sale.
 *
 *   kind  'store_item' | 'project'
 *   item  { id, slug, name, image, price, kitPrice? }
 */
export default function QuickAddButton({ kind, item, sx }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return undefined;
    const t = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [added]);

  const add = () => {
    cart.add({
      type: kind, id: item.id, slug: item.slug, name: item.name, image: item.image || null,
      unitPrice: item.price.amount, currency: item.price.currency || 'KES', quantity: 1,
      ...(kind === 'project' ? { withKit: false, kitPrice: item.kitPrice?.amount ?? null } : {}),
    });
    setAdded(true);
  };

  return (
    <Button
      size="small"
      variant={added ? 'text' : 'contained'}
      color={added ? 'success' : 'primary'}
      onClick={add}
      startIcon={added ? <CheckRoundedIcon /> : <AddShoppingCartRoundedIcon />}
      aria-label={added ? `${item.name} added to your cart` : `Add ${item.name} to your cart`}
      sx={{ flexShrink: 0, whiteSpace: 'nowrap', minHeight: 36, px: 1.75, fontWeight: 700, ...sx }}
    >
      {added ? 'Added' : 'Add to cart'}
    </Button>
  );
}
