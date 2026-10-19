import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SellIcon from '@mui/icons-material/Sell';
import DetailSection from '../common/DetailSection.jsx';
import PackageCard from '../homeSchooling/PackageCard.jsx';
import { childrenLabel, formatKsh, perChildAmount } from '../../content/homeSchooling.js';
import { clubJoinPath } from '../../utils/clubs.js';

/**
 * "Membership & prices" on an Estate Tech Club's page: the packages offered at this club (from
 * the curriculum system's Billing → Packages → Tech Clubs), each leading to the club's sign-up.
 * Same cards as the Home Schooling page.
 *
 * The "add more children" line shows on one card only — the biggest package that takes extra
 * children — so a smaller package never seems to offer a cheaper way to a larger family than the
 * package made for it.
 */
export default function ClubPackages({ hub, packages }) {
  // "Save … per child" is measured against the smallest package (usually one child), and shown
  // only on the bigger family packages — never one single-child package against another.
  const minIncluded = packages.length ? Math.min(...packages.map((p) => p.childrenIncluded)) : 1;
  const baseline = Math.max(0, ...packages.filter((p) => p.childrenIncluded === minIncluded).map(perChildAmount));
  const savingBase = (pkg) => (pkg.childrenIncluded > minIncluded ? baseline : perChildAmount(pkg));
  const volumeDiscount = packages.some((p) => p.childrenIncluded > minIncluded && perChildAmount(p) < baseline);
  const withExtras = packages.filter((p) => p.allowExtraChildren && p.extraChildAmount != null);
  const extraSlug = withExtras.length ? withExtras.reduce((big, p) => (p.childrenIncluded > big.childrenIncluded ? p : big)).slug : null;
  const lowest = packages.length ? Math.min(...packages.map((p) => p.monthlyAmount)) : null;

  return (
    <DetailSection
      id="packages"
      title="Membership & prices"
      icon={<SellIcon />}
      lead={`One monthly price covers your family’s place in the club.${volumeDiscount ? ' The more children joining, the less you pay per child.' : ''}`}
      sx={{ scrollMarginTop: 96 }}
    >
      {/* At most two cards a row in this column, so the big price never wraps. */}
      <Box sx={{ display: 'grid', gap: { xs: 3, md: 2.5 }, gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }, alignItems: 'stretch', pt: 1.5 }}>
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.slug}
            pkg={pkg}
            highestPerChild={savingBase(pkg)}
            to={clubJoinPath(hub, pkg.slug)}
            fallbackFeature={`Club sessions for ${childrenLabel(pkg.childrenIncluded)}`}
            showExtra={pkg.slug === extraSlug}
          />
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
        Prices are per month, in Kenyan shillings{lowest != null ? `, from ${formatKsh(lowest)}` : ''}. You pay the first month when
        you sign up; after that, one invoice each month.
      </Typography>
    </DetailSection>
  );
}
