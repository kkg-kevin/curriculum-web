import { Link as RouterLink } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useCart } from '../../cart/cartStore.js';

/** The header's cart, with how many things are in it — shown only once something is. */
export default function CartButton() {
  const { count } = useCart();
  if (!count) return null;
  return (
    <IconButton component={RouterLink} to="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
      <Badge badgeContent={count} color="secondary" max={99}>
        <ShoppingBagOutlinedIcon />
      </Badge>
    </IconButton>
  );
}
