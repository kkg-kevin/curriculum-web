import Box from '@mui/material/Box';
import PackageCard from '../homeSchooling/PackageCard.jsx';

/**
 * A pathway's subscription plans (6 Nov 2026) — the same package cards as Home Schooling and the
 * Tech Clubs: each with a switch between the periods it's offered for, its price for the children
 * included and each extra child, what's included, and Choose. `enrollTo` is the pathway's enrol
 * address; Choose adds `&plan=` and `&period=` (the period chosen on the card). `period` /
 * `onPeriodChange`: the page's period (?period=), which every card follows.
 */
export default function PathwayPlans({ plans, enrollTo, period = null, onPeriodChange = null }) {
  return (
    <Box sx={{ display: 'grid', gap: { xs: 3, md: 2.5 }, gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }, alignItems: 'stretch', pt: 1.5 }}>
      {plans.map((plan) => (
        <PackageCard
          key={plan.id}
          pkg={plan}
          linkFor={(period) => `${enrollTo}&plan=${encodeURIComponent(plan.id)}&period=${encodeURIComponent(period)}`}
          fallbackFeature="Every course of the pathway, self-paced"
          actionLabel="Choose plan"
          period={period}
          onPeriodChange={onPeriodChange}
        />
      ))}
    </Box>
  );
}
