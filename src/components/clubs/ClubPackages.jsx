import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import PackageCard from '../homeSchooling/PackageCard.jsx';
import { childrenLabel, formatKsh, perChildAmount } from '../../content/homeSchooling.js';
import { clubJoinPath } from '../../utils/clubs.js';

const gridSx = {
  display: 'grid',
  gap: { xs: 4, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(280px, 1fr))' },
  alignItems: 'stretch',
  pt: 2,
};

/**
 * "Membership & prices" on an Estate Tech Club's page: the packages offered at this club (from
 * the curriculum system's Billing → Packages → Tech Clubs), each leading to the club's sign-up.
 * Same cards as the Home Schooling page.
 */
export default function ClubPackages({ hub, packages, enquirePath }) {
  const perChildPrices = packages.map(perChildAmount);
  const highestPerChild = packages.length ? Math.max(...perChildPrices) : 0;
  const volumeDiscount = packages.length > 1 && Math.min(...perChildPrices) < highestPerChild;

  return (
    <Section id="packages" tone="subtle" dots sx={{ scrollMarginTop: 72 }}>
      <SectionHeading
        eyebrow="Membership & prices"
        title={`Join ${hub.name}`}
        lead={`One monthly price covers your family’s place in the club.${volumeDiscount ? ' The more children joining, the less you pay per child.' : ''}`}
        align="center"
      />
      <Box sx={{ mt: { xs: 5, md: 7 }, ...gridSx }}>
        {packages.map((pkg, i) => (
          <Reveal key={pkg.slug} delay={i * 90} sx={{ height: '100%' }}>
            <PackageCard
              pkg={pkg}
              highestPerChild={highestPerChild}
              to={clubJoinPath(hub, pkg.slug)}
              fallbackFeature={`Club sessions for ${childrenLabel(pkg.childrenIncluded)}`}
            />
          </Reveal>
        ))}
      </Box>
      <Box sx={{ mt: { xs: 4, md: 5 }, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', mb: 2 }}>
          Prices are per month, in Kenyan shillings{packages.length ? `, from ${formatKsh(Math.min(...packages.map((p) => p.monthlyAmount)))}` : ''}.
          Signing up creates your family’s logins; you pay the first month in cash and we unlock them once it’s confirmed, then place each child in a club class.
        </Typography>
        <Button component={RouterLink} to={enquirePath} variant="text">Questions first? Ask us</Button>
      </Box>
    </Section>
  );
}
