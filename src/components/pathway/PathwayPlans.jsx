import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ExpandableText from '../common/ExpandableText.jsx';
import { formatKsh } from '../../cart/format.js';
import { periodUnit, planChildren } from '../../utils/pathwayPrice.js';

const FEATURES_SHOWN = 4;

/**
 * A pathway's subscription plans as a price list — one panel, a row per plan (not a card each, so a
 * long name, summary or feature list never balloons): name, badge and summary on the left with the
 * features as short ticks (the first four, "Show all" for the rest), the price and how many
 * children it covers, and Choose. On a phone each row stacks. `enrollTo` is the pathway's enrol
 * address; Choose adds `&plan=`.
 */
function PlanRow({ plan, enrollTo, first }) {
  const [allFeatures, setAllFeatures] = useState(false);
  const features = plan.features || [];
  const shown = allFeatures ? features : features.slice(0, FEATURES_SHOWN);
  const highlighted = Boolean(plan.badge);

  return (
    <Box
      component="li"
      sx={{
        display: 'grid',
        gap: { xs: 1.75, md: 3 },
        alignItems: 'center',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 250px 170px' },
        p: { xs: 2.25, md: 3 },
        borderTop: first ? 0 : '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => (highlighted ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.12 : 0.04) : 'transparent'),
      }}
    >
      {/* What it is */}
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.3 }}>{plan.name}</Typography>
          {plan.badge && <Box component="span" sx={{ fontSize: 11, fontWeight: 800, px: 1, py: 0.25, borderRadius: 999, bgcolor: 'primary.main', color: 'primary.contrastText' }}>{plan.badge}</Box>}
        </Box>
        {plan.summary && (
          <ExpandableText lines={2} variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>
            {plan.summary}
          </ExpandableText>
        )}
        {features.length > 0 && (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.25, p: 0, display: 'grid', gap: 0.75, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } }}>
            {shown.map((feature) => (
              <Box component="li" key={feature} sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', fontSize: 14, color: 'text.secondary', minWidth: 0 }}>
                <CheckRoundedIcon sx={{ fontSize: 17, color: 'primary.main', mt: 0.2, flexShrink: 0 }} />
                <Box component="span" sx={{ minWidth: 0 }}>{feature}</Box>
              </Box>
            ))}
          </Box>
        )}
        {features.length > FEATURES_SHOWN && (
          <Button size="small" onClick={() => setAllFeatures((v) => !v)} sx={{ mt: 0.5, px: 0.5, minWidth: 0 }}>
            {allFeatures ? 'Show fewer' : `Show all ${features.length}`}
          </Button>
        )}
      </Box>

      {/* What it costs */}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ lineHeight: 1.15, whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ fontWeight: 900, fontSize: '1.5rem' }}>{formatKsh(plan.amount, plan.currency)}</Box>
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}> / {periodUnit(plan.billingPeriod)}</Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{planChildren(plan)}</Typography>
        {plan.allowExtraChildren && plan.extraChildAmount ? (
          <Typography variant="body2" color="text.secondary">+{formatKsh(plan.extraChildAmount, plan.currency)} per extra child</Typography>
        ) : null}
      </Box>

      {/* Choose */}
      <Button
        component={RouterLink}
        to={`${enrollTo}&plan=${encodeURIComponent(plan.id)}`}
        variant={highlighted ? 'contained' : 'outlined'}
        endIcon={<ArrowForwardRoundedIcon />}
        aria-label={`Choose ${plan.name}`}
        sx={{ width: '100%', whiteSpace: 'nowrap' }}
      >
        Choose plan
      </Button>
    </Box>
  );
}

export default function PathwayPlans({ plans, enrollTo }) {
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', m: 0, p: 0, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}
    >
      {plans.map((plan, i) => <PlanRow key={plan.id} plan={plan} enrollTo={enrollTo} first={i === 0} />)}
    </Box>
  );
}
