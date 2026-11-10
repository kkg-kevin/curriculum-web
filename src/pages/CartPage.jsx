import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import GlobalStyles from '@mui/material/GlobalStyles';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import SeoHead from '../components/seo/SeoHead.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import StoreAssurances from '../components/store/StoreAssurances.jsx';
import StoreItemCard from '../components/cards/StoreItemCard.jsx';
import ProjectCard from '../components/cards/ProjectCard.jsx';
import { cart, useCart } from '../cart/cartStore.js';
import { formatKsh } from '../cart/format.js';
import { useStoreCatalog } from '../hooks/useStoreCatalog.js';
import { projectPath, storeItemPath, STORE_PROJECTS_PATH } from '../utils/storePaths.js';

const itemPath = (line) => (line.type === 'project' ? projectPath(line.slug) : storeItemPath(line.slug));

const panel = { p: { xs: 2, sm: 2.5 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card' };

// One line of the cart: picture, name, what it is, quantity (or a project's kit), line total, remove.
function CartLine({ line, total }) {
  const isProject = line.type === 'project';
  return (
    <Box sx={{ ...panel, display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '84px minmax(0, 1fr)', sm: '112px minmax(0, 1fr) auto' }, alignItems: 'start' }}>
      <Box component={RouterLink} to={itemPath(line)} aria-label={line.name} sx={{ display: 'block', borderRadius: 2.5, overflow: 'hidden', bgcolor: isProject ? 'surface.imagePlaceholder' : 'common.white' }}>
        {line.image ? (
          <SmartImage src={line.image} alt={line.name} ratio="1 / 1" rounded={false} fit={isProject ? 'cover' : 'contain'} sx={isProject ? undefined : { bgcolor: 'common.white', p: 1, boxSizing: 'border-box' }} />
        ) : (
          // A project without a cover: the brand tile the Store's cards use.
          <Box sx={{ aspectRatio: '1 / 1', display: 'grid', placeItems: 'center', color: 'primary.contrastText', background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)` }}>
            <BuildCircleOutlinedIcon sx={{ fontSize: 44, opacity: 0.6 }} />
          </Box>
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: 'primary.main', textTransform: 'uppercase' }}>
          {isProject ? 'Project · for one learner' : 'Store item'}
        </Typography>
        <Typography component={RouterLink} to={itemPath(line)} sx={{ display: 'block', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3, color: 'text.primary', textDecoration: 'none', mt: 0.25, '&:hover': { textDecoration: 'underline' } }}>
          {line.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {formatKsh(line.unitPrice, line.currency)}{isProject ? '' : ' each'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1.25 }}>
          {!isProject && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 999 }}>
              <IconButton size="small" aria-label={`Fewer ${line.name}`} onClick={() => cart.setQuantity(line.key, line.quantity - 1)} disabled={line.quantity <= 1}><RemoveRoundedIcon fontSize="small" /></IconButton>
              <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 800 }} aria-live="polite">{line.quantity}</Typography>
              <IconButton size="small" aria-label={`More ${line.name}`} onClick={() => cart.setQuantity(line.key, line.quantity + 1)} disabled={line.quantity >= 20}><AddRoundedIcon fontSize="small" /></IconButton>
            </Box>
          )}
          {isProject && line.kitPrice != null && (
            <FormControlLabel
              sx={{ m: 0 }}
              control={<Checkbox size="small" checked={Boolean(line.withKit)} onChange={(e) => cart.setKit(line.key, e.target.checked)} />}
              label={<Typography variant="body2">Add the materials kit (+{formatKsh(line.kitPrice, line.currency)})</Typography>}
            />
          )}
          <Button size="small" color="inherit" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => cart.remove(line.key)} sx={{ color: 'text.secondary', fontWeight: 700 }} aria-label={`Remove ${line.name}`}>
            Remove
          </Button>
        </Box>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', gridColumn: { xs: '2', sm: 'auto' }, textAlign: { sm: 'right' }, whiteSpace: 'nowrap' }}>
        {total}
      </Typography>
    </Box>
  );
}

// An empty cart: what to do next, and a few things from the Store to start with.
function EmptyCart() {
  const { entries } = useStoreCatalog();
  const picks = entries.filter((e) => e.price).slice(0, 3);
  return (
    <>
      <Box sx={{ ...panel, textAlign: 'center', py: { xs: 5, md: 7 }, px: 3 }}>
        <Box aria-hidden sx={{ width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 2, display: 'grid', placeItems: 'center', bgcolor: 'surface.subtle', color: 'primary.main' }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 34 }} />
        </Box>
        <Typography component="h2" sx={{ fontSize: '1.4rem', fontWeight: 800 }}>Your cart is empty</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 440, mx: 'auto' }}>
          Browse our robots, kits and guided projects — add what you like and check out when you&apos;re ready.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
          <Button component={RouterLink} to="/store" variant="contained" size="large">Visit the store</Button>
          <Button component={RouterLink} to={STORE_PROJECTS_PATH} variant="outlined" size="large">See projects</Button>
        </Box>
      </Box>
      {picks.length > 0 && (
        <Box sx={{ mt: { xs: 5, md: 7 } }}>
          <Typography component="h2" sx={{ fontSize: '1.3rem', fontWeight: 800, mb: 2.5 }}>Popular in the store</Typography>
          <Box sx={{ display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' } }}>
            {picks.map((e) => (e.kind === 'project' ? <ProjectCard key={e.key} project={e.data} /> : <StoreItemCard key={e.key} item={e.data} />))}
          </Box>
        </Box>
      )}
    </>
  );
}

/**
 * /cart — what's in the cart: change quantities, add or drop a project's kit, remove, and the order
 * summary (staying in view on a large screen; a checkout bar along the bottom on a phone).
 */
export default function CartPage() {
  const { lines, subtotal, currency, lineTotal } = useCart();
  const count = lines.reduce((n, l) => n + (l.type === 'project' ? 1 : l.quantity), 0);

  return (
    <>
      <SeoHead title="Your cart" noindex />
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 12, md: 10 } }}>
        <Link component={RouterLink} to="/store" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: 14, mb: 2 }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} /> Continue shopping
        </Link>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap', mb: { xs: 3, md: 4 } }}>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, letterSpacing: '-0.02em' }}>Your cart</Typography>
          {count > 0 && <Typography color="text.secondary" sx={{ fontWeight: 600 }}>{count} {count === 1 ? 'item' : 'items'}</Typography>}
        </Box>

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <Box sx={{ display: 'grid', gap: { xs: 3, md: 4 }, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 360px' }, alignItems: 'start' }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {lines.map((line) => <CartLine key={line.key} line={line} total={formatKsh(lineTotal(line), line.currency)} />)}
            </Box>

            <Box component="aside" aria-label="Order summary" sx={{ ...panel, boxShadow: 'shadow.md', position: { md: 'sticky' }, top: { md: 96 }, display: 'grid', gap: 2 }}>
              <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>Order summary</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Items ({count})</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatKsh(subtotal, currency)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography color="text.secondary">Pickup or delivery</Typography>
                  <Typography color="text.secondary" sx={{ textAlign: 'right' }}>At checkout</Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 800 }}>Subtotal</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.4rem' }}>{formatKsh(subtotal, currency)}</Typography>
              </Box>
              <Button component={RouterLink} to="/checkout" variant="contained" size="large" fullWidth startIcon={<LockOutlinedIcon />}>
                Check out
              </Button>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'surface.subtle' }}>
                <StoreAssurances variant="list" kind={lines.some((l) => l.type === 'store_item') ? 'store_item' : 'project'} />
              </Box>
            </Box>
          </Box>
        )}
      </Container>

      {/* A phone: the total and Check out always in reach (the WhatsApp button lifts above it). */}
      {lines.length > 0 && <GlobalStyles styles={(t) => ({ [t.breakpoints.down('md')]: { ':root': { '--floating-bottom-offset': '76px' } } })} />}
      {lines.length > 0 && (
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar - 1,
            alignItems: 'center', gap: 1.5, px: 2, pt: 1.25, pb: 'calc(10px + env(safe-area-inset-bottom, 0px))',
            bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', boxShadow: 'shadow.lg',
            '@media print': { display: 'none' },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">Subtotal · {count} {count === 1 ? 'item' : 'items'}</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem' }}>{formatKsh(subtotal, currency)}</Typography>
          </Box>
          <Button component={RouterLink} to="/checkout" variant="contained" sx={{ minHeight: 44, px: 3 }}>Check out</Button>
        </Box>
      )}
    </>
  );
}
