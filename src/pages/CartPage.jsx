import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import { EmptyBlock } from '../components/common/StateViews.jsx';
import { cart, useCart } from '../cart/cartStore.js';
import { formatKsh } from '../cart/format.js';

const itemPath = (line) => (line.type === 'project' ? `/projects/${line.slug}` : `/store/${line.slug}`);

/** /cart — what's in the cart: change quantities, add or drop a project's kit, remove, check out. */
export default function CartPage() {
  const { lines, subtotal, currency, lineTotal } = useCart();

  return (
    <>
      <SeoHead title="Your cart" noindex />
      <PageHeader title="Your cart" lead="Store items and projects you've picked. Prices are confirmed at checkout." />
      <Section py={{ xs: 5, md: 8 }}>
        <Box sx={{ maxWidth: 880, mx: 'auto' }}>
          {lines.length === 0 ? (
            <>
              <EmptyBlock title="Your cart is empty" body="Browse our kits and projects — add what you like and check out when you're ready." />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: -4 }}>
                <Button component={RouterLink} to="/store" variant="contained">Visit the store</Button>
                <Button component={RouterLink} to="/projects" variant="outlined">See projects</Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 300px' }, alignItems: 'start' }}>
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {lines.map((line) => (
                  <Box key={line.key} sx={{ display: 'flex', gap: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', alignItems: 'flex-start' }}>
                    <Box component={RouterLink} to={itemPath(line)} sx={{ width: 96, flexShrink: 0, borderRadius: 2, overflow: 'hidden' }}>
                      <SmartImage src={line.image} alt={line.name} ratio="1 / 1" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography component={RouterLink} to={itemPath(line)} sx={{ fontWeight: 800, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{line.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{line.type === 'project' ? 'Project · for one child' : 'Store item'} · {formatKsh(line.unitPrice, line.currency)}</Typography>

                      {line.type === 'store_item' && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 999, mt: 1 }}>
                          <IconButton size="small" aria-label={`Fewer ${line.name}`} onClick={() => cart.setQuantity(line.key, line.quantity - 1)} disabled={line.quantity <= 1}><RemoveRoundedIcon fontSize="small" /></IconButton>
                          <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 800 }}>{line.quantity}</Typography>
                          <IconButton size="small" aria-label={`More ${line.name}`} onClick={() => cart.setQuantity(line.key, line.quantity + 1)} disabled={line.quantity >= 20}><AddRoundedIcon fontSize="small" /></IconButton>
                        </Box>
                      )}
                      {line.type === 'project' && line.kitPrice != null && (
                        <FormControlLabel
                          sx={{ display: 'flex', mt: 0.5 }}
                          control={<Checkbox size="small" checked={Boolean(line.withKit)} onChange={(e) => cart.setKit(line.key, e.target.checked)} />}
                          label={<Typography variant="body2">Materials kit (+{formatKsh(line.kitPrice, line.currency)})</Typography>}
                        />
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 800 }}>{formatKsh(lineTotal(line), line.currency)}</Typography>
                      <IconButton aria-label={`Remove ${line.name}`} onClick={() => cart.remove(line.key)} size="small" sx={{ mt: 1 }}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: { md: 'sticky' }, top: { md: 96 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{formatKsh(subtotal, currency)}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Delivery, if you choose it, is added at checkout.</Typography>
                <Button component={RouterLink} to="/checkout" variant="contained" size="large" fullWidth>Checkout</Button>
                <Button component={RouterLink} to="/store" variant="text" fullWidth sx={{ mt: 1 }}>Continue shopping</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Section>
    </>
  );
}
