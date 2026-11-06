import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeriodSwitch from '../common/PeriodSwitch.jsx';
import {
  atPeriod, childrenLabel, defaultPeriodOf, formatKsh, homeSchoolingSignupPath, periodUnit, periodWord, pricesOf, savingVsMonthly,
} from '../../content/homeSchooling.js';

function PriceRow({ title, note, amount, unit, currency, strong }) {
  return (
    // The price sits beside its line, or drops under it when the card is narrow — never squeezing it.
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', columnGap: 1.5, rowGap: 0.5, flexWrap: 'wrap' }}>
      <Box sx={{ minWidth: 0, flex: '1 1 130px' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{title}</Typography>
        {note && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.35 }}>{note}</Typography>}
      </Box>
      <Typography sx={{ whiteSpace: 'nowrap', textAlign: 'right', lineHeight: 1.2, ml: 'auto' }}>
        <Box component="span" sx={{ fontWeight: 900, fontSize: strong ? '1.15rem' : '1rem' }}>{formatKsh(amount, currency)}</Box>
        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}> / {unit}</Box>
      </Typography>
    </Box>
  );
}

/**
 * One package — Home Schooling, an Estate Tech Club, or a pathway plan. Laid out like a plan card:
 * the name with a switch between the periods it's offered for (weekly, monthly, every 3 months,
 * yearly — set in the curriculum system's Billing → Packages), a headline, the main action, a price
 * box (the children included, and each extra child) that follows the switch, what's included, and
 * how billing works. A package with a badge is the featured one.
 *
 * `linkFor(period)` — where Choose goes, with the chosen period (defaults to the Home Schooling
 * sign-up). `fallbackFeature` — the line shown when the package lists no features. `showExtra` =
 * false leaves the extra-child line out. `actionLabel` — the button's words. `period` /
 * `onPeriodChange` — a period shared with the page (every card on it follows the last switch, and
 * the page's Enrol links carry it); a card not offered for it keeps its own.
 */
export default function PackageCard({ pkg, linkFor, to, fallbackFeature, showExtra = true, actionLabel, period: shared = null, onPeriodChange = null }) {
  const periods = pricesOf(pkg).map((p) => p.billingPeriod);
  const [own, setOwn] = useState(() => defaultPeriodOf(pkg));
  const period = shared && periods.includes(shared) ? shared : own;
  const setPeriod = (next) => { setOwn(next); onPeriodChange?.(next); };
  const priced = atPeriod(pkg, period);
  const unit = periodUnit(priced.billingPeriod);
  const featured = Boolean(pkg.badge);
  const saving = savingVsMonthly(pkg, priced.billingPeriod);
  const extras = showExtra && pkg.allowExtraChildren && priced.extraChildAmount != null;
  const points = pkg.features?.length ? pkg.features : [fallbackFeature || `Home learning for ${childrenLabel(pkg.childrenIncluded)}`];
  const href = linkFor ? linkFor(priced.billingPeriod) : to || homeSchoolingSignupPath(pkg.slug, null, priced.billingPeriod);
  const headline = pkg.summary || `For ${childrenLabel(pkg.childrenIncluded)}`;
  // The description, unless it only repeats the headline.
  const same = (a, b) => String(a || '').trim().replace(/[.\s]+$/, '').toLowerCase() === String(b || '').trim().replace(/[.\s]+$/, '').toLowerCase();
  const description = pkg.description && !same(pkg.description, headline) ? pkg.description : '';

  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
        border: featured ? '2px solid' : '1px solid',
        borderColor: featured ? 'primary.main' : 'surface.ring',
        bgcolor: 'surface.card',
        boxShadow: featured ? 'shadow.glow' : 'shadow.md',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        '@media (hover: hover)': { '&:hover': { transform: { md: 'translateY(-4px)' }, boxShadow: featured ? 'shadow.glow' : 'shadow.lg' } },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {featured && (
        <Box
          sx={{
            position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', px: 2, py: 0.6, borderRadius: 999,
            bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: 'shadow.md',
          }}
        >
          {pkg.badge}
        </Box>
      )}

      <Box sx={{ p: { xs: 2.75, sm: 3.25 }, pt: featured ? { xs: 3.75, sm: 4.25 } : undefined, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2.25 }}>
        {/* The name, and the switch between periods — its own row, the buttons sharing it, so four
            periods fit a narrow card without scrolling. */}
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{pkg.name}</Typography>
          <PeriodSwitch periods={periods} value={priced.billingPeriod} onChange={setPeriod} label={`How often you pay for ${pkg.name}`} fullWidth />
        </Box>

        <Box>
          <Typography variant="h4" component="p" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{headline}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {description}
            </Typography>
          )}
        </Box>

        <Button
          component={RouterLink}
          to={href}
          variant="contained"
          color={featured ? 'secondary' : 'primary'}
          size="large"
          endIcon={<ArrowForwardIcon />}
          fullWidth
          sx={{ borderRadius: 999 }}
        >
          {actionLabel || `Choose ${pkg.name}`}
        </Button>

        {/* The price box — follows the switch */}
        <Box aria-live="polite" sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.subtle', display: 'grid', gap: 1.5 }}>
          <PriceRow
            title={childrenLabel(pkg.childrenIncluded)}
            note={pkg.childrenIncluded > 1 ? `Included · ${formatKsh(Math.round(priced.amount / pkg.childrenIncluded), pkg.currency)} per child` : 'Included in the package'}
            amount={priced.amount}
            unit={unit}
            currency={pkg.currency}
            strong
          />
          {extras && (
            <PriceRow
              title="Each extra child"
              note={pkg.maxChildren ? `Up to ${childrenLabel(pkg.maxChildren)} in all` : 'Add more children'}
              amount={priced.extraChildAmount}
              unit={unit}
              currency={pkg.currency}
            />
          )}
          {saving > 0 && (
            <Box component="span" sx={{ justifySelf: 'start', px: 1, py: 0.25, borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, color: 'success.dark', bgcolor: (t) => `${t.palette.success.main}1f` }}>
              Save {saving}% compared with paying monthly
            </Box>
          )}
        </Box>

        {/* What's included */}
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.25 }}>
          {points.map((point) => (
            <Box component="li" key={point} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20, mt: '1px', color: 'primary.main', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'text.primary' }}>{point}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', lineHeight: 1.5 }}>
          Billed {periodWord(priced.billingPeriod)}. You pay your first {unit} when you sign up, then one invoice every {unit} from the day you join.
        </Typography>
      </Box>
    </Box>
  );
}
