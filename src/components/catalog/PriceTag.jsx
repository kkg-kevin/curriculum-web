import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatPrice } from '../../utils/format.js';
import { PRICING_IS_PLACEHOLDER } from '../../content/catalog.js';

/**
 * Renders a catalogue item's price — shared by Projects and the Store. One
 * component so the "indicative pricing" treatment (shown while real checkout
 * isn't wired up — PRICING_IS_PLACEHOLDER) is identical everywhere it appears.
 *
 * Props:
 *  - price     { amount, currency, unit, compareAt } from a catalogue item
 *  - size      'sm' (cards) | 'lg' (detail price card)
 *  - onColor   true when placed on a brand/gradient band (lightens text)
 */
export default function PriceTag({ price, size = 'sm', onColor = false, sx }) {
  if (!price || typeof price.amount !== 'number') {
    return (
      <Typography
        sx={{ fontWeight: 600, color: onColor ? 'inherit' : 'text.secondary', ...sx }}
      >
        Contact us for pricing
      </Typography>
    );
  }

  const isLg = size === 'lg';
  const main = formatPrice(price);
  const compare = price.compareAt ? formatPrice({ ...price, amount: price.compareAt }) : null;

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography
          component="span"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            fontSize: isLg ? { xs: '2rem', md: '2.4rem' } : '1.25rem',
            color: onColor ? 'inherit' : 'text.primary',
          }}
        >
          {main}
        </Typography>
        {compare && (
          <Typography
            component="span"
            sx={{
              textDecoration: 'line-through',
              color: onColor ? 'rgba(255,255,255,0.7)' : 'text.disabled',
              fontSize: isLg ? '1.1rem' : '0.9rem',
            }}
          >
            {compare}
          </Typography>
        )}
        {price.unit && (
          <Typography
            component="span"
            sx={{
              color: onColor ? 'rgba(255,255,255,0.8)' : 'text.secondary',
              fontSize: isLg ? '0.95rem' : '0.8rem',
              fontWeight: 500,
            }}
          >
            / {price.unit}
          </Typography>
        )}
      </Box>

      {PRICING_IS_PLACEHOLDER && (
        <Typography
          component="span"
          sx={{
            display: 'inline-block',
            mt: isLg ? 0.75 : 0.25,
            fontSize: isLg ? '0.8rem' : '0.7rem',
            fontStyle: 'italic',
            color: onColor ? 'rgba(255,255,255,0.75)' : 'text.disabled',
          }}
        >
          Indicative price — final pricing confirmed at enquiry
        </Typography>
      )}
    </Box>
  );
}
