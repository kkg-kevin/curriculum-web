import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import BuyBox from '../catalog/BuyBox.jsx';
import StoreAssurances from './StoreAssurances.jsx';

const TONE = {
  good: { bgcolor: 'success.main', color: 'success.contrastText', borderColor: 'success.main' },
  muted: { bgcolor: 'transparent', color: 'text.secondary', borderColor: 'divider' },
  brand: { bgcolor: 'surface.subtle', color: 'primary.main', borderColor: 'surface.ringStrong' },
};

/**
 * The one buy panel of a Store product page: what it is (kicker chips, name, one line), the price
 * and the way to buy (BuyBox), then the promises (StoreAssurances) and the school-quote link.
 * `buyRef` goes round the buttons so StickyBuyBar knows when they've scrolled away.
 *
 *   chips  [{ label, tone: 'good' | 'muted' | 'brand' }]
 *   kind, item, status, enquireTo, contactTo — as BuyBox
 */
export default function ProductBuyPanel({ chips = [], name, tagline, kind, item, status, enquireTo, contactTo, buyRef, extra }) {
  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 4,
        bgcolor: 'surface.card',
        border: '1px solid',
        borderColor: 'surface.ring',
        boxShadow: 'shadow.md',
        display: 'grid',
        gap: 2.25,
      }}
    >
      <Box>
        {chips.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
            {chips.map((c) => (
              <Box
                key={c.label}
                component="span"
                sx={{ px: 1.25, py: 0.35, borderRadius: 999, fontSize: 12, fontWeight: 700, border: '1px solid', ...(TONE[c.tone] || TONE.muted) }}
              >
                {c.label}
              </Box>
            ))}
          </Box>
        )}
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.2rem', lg: '2.5rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {name}
        </Typography>
        {tagline && <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.55 }}>{tagline}</Typography>}
      </Box>

      <Divider />

      <Box ref={buyRef}>
        <BuyBox kind={kind} item={item} status={status} enquireTo={enquireTo} contactTo={contactTo} bare />
      </Box>

      {extra}

      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'surface.subtle' }}>
        <StoreAssurances variant="list" kind={kind} />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Buying for a school or club?{' '}
        <Link component={RouterLink} to={`/contact?subject=${encodeURIComponent(`School quote — ${name}`)}`} sx={{ fontWeight: 700 }}>
          Get a class-set quote
        </Link>
      </Typography>
    </Box>
  );
}
