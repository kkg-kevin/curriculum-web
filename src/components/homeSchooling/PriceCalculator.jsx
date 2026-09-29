import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChildIcons from './ChildIcons.jsx';
import {
  bestPackageFor, childrenLabel, formatKsh, homeSchoolingEnquiryPath, maxChildrenOffered,
} from '../../content/homeSchooling.js';

const panelSx = {
  position: 'relative',
  borderRadius: 5,
  p: { xs: 3, sm: 4 },
  border: '1px solid',
  borderColor: 'surface.ring',
  backgroundColor: (t) => (t.palette.mode === 'dark' ? 'rgba(20,31,53,0.86)' : 'rgba(255,255,255,0.92)'),
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: 'shadow.lg',
};

/**
 * "How much for my family?" — pick a number of children and see the cheapest package that
 * covers them, the monthly total and the cost per child, with an enquiry link that carries both
 * the package and the child count through to the enquiry form.
 */
export default function PriceCalculator({ packages, isLoading }) {
  const [count, setCount] = useState(1);
  const max = Math.max(1, maxChildrenOffered(packages));
  const children = Math.min(count, max);
  const best = bestPackageFor(packages, children);
  const sparePlaces = best ? best.price.childCount - children : 0;

  if (isLoading) {
    return (
      <Box sx={panelSx} role="status" aria-label="Loading prices">
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="rounded" height={56} sx={{ my: 2 }} />
        <Skeleton variant="text" width="45%" height={56} />
        <Skeleton variant="rounded" height={46} sx={{ mt: 2 }} />
      </Box>
    );
  }
  if (!packages.length) return null;

  return (
    <Box sx={panelSx}>
      <Typography variant="overline" sx={{ color: 'primary.main' }}>Price calculator</Typography>
      <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>How many children are learning?</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.25, borderRadius: 3, bgcolor: 'surface.subtle' }}>
        <IconButton aria-label="Fewer children" onClick={() => setCount(Math.max(1, children - 1))} disabled={children <= 1} sx={{ bgcolor: 'background.paper', boxShadow: 'shadow.sm' }}>
          <RemoveRoundedIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center' }} aria-live="polite">
          <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1 }}>{children}</Typography>
          <Typography variant="body2" color="text.secondary">{children === 1 ? 'child' : 'children'}</Typography>
        </Box>
        <IconButton aria-label="More children" onClick={() => setCount(Math.min(max, children + 1))} disabled={children >= max} sx={{ bgcolor: 'background.paper', boxShadow: 'shadow.sm' }}>
          <AddRoundedIcon />
        </IconButton>
      </Box>

      {best ? (
        <Box sx={{ mt: 3 }} aria-live="polite">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Best fit: <Box component="strong" sx={{ color: 'text.primary' }}>{best.pkg.name}</Box></Typography>
            <ChildIcons count={children} size={20} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: { xs: '2.2rem', sm: '2.6rem' }, fontWeight: 800, lineHeight: 1.1, color: 'primary.main', letterSpacing: '-0.02em' }}>
              {formatKsh(best.price.monthlyAmount)}
            </Typography>
            <Typography color="text.secondary">/ month</Typography>
          </Box>
          {children > 1 && (
            <Typography variant="body2" sx={{ mt: 0.5, color: 'success.main', fontWeight: 700 }}>
              That’s about {formatKsh(Math.round(best.price.monthlyAmount / children))} per child
            </Typography>
          )}
          {sparePlaces > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Includes {childrenLabel(best.price.childCount)} — room for {sparePlaces} more at no extra cost.
            </Typography>
          )}
          <Button
            component={RouterLink}
            to={homeSchoolingEnquiryPath(best.pkg.slug, children)}
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 2.5 }}
          >
            Enquire for {childrenLabel(children)}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25, textAlign: 'center' }}>
            Free to enquire · no payment or sign-up
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            For a family of {children}, our team will put together the right package for you.
          </Typography>
          <Button component={RouterLink} to={homeSchoolingEnquiryPath()} variant="contained" color="secondary" size="large" fullWidth endIcon={<ArrowForwardIcon />}>
            Ask about family pricing
          </Button>
        </Box>
      )}
    </Box>
  );
}
