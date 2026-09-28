import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import { usePublicHomeLearningPackages } from '../hooks/usePublicHomeLearning.js';
import { childrenLabel, formatKsh, homeSchoolingEnquiryPath } from '../content/homeSchooling.js';

const gridSx = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(280px, 1fr))' },
  alignItems: 'stretch',
};

function PackageSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3.5 }}>
        <Skeleton variant="text" width="50%" height={36} />
        <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="90%" sx={{ mt: 2 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rectangular" height={44} sx={{ mt: 3, borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

function PackageCard({ pkg }) {
  const points = pkg.features.length ? pkg.features : [`Monthly package for ${childrenLabel(pkg.childrenIncluded)}`];
  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderColor: pkg.badge ? 'primary.main' : 'divider',
        borderWidth: pkg.badge ? 2 : 1,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.shadows[2],
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 3.5 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: 'surface.subtle', color: 'primary.main' }}>
            <FamilyRestroomIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h3">{pkg.name}</Typography>
            <Typography variant="body2" color="text.secondary">{childrenLabel(pkg.childrenIncluded)}</Typography>
          </Box>
          {pkg.badge && <Chip label={pkg.badge} color="primary" size="small" sx={{ ml: 'auto', fontWeight: 700 }} />}
        </Box>

        <Typography variant="h2" component="p" sx={{ mb: 0.25, color: 'primary.main', fontWeight: 800 }}>
          {formatKsh(pkg.monthlyAmount)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: pkg.summary ? 1.5 : 3 }}>
          per month
        </Typography>
        {pkg.summary && (
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>{pkg.summary}</Typography>
        )}

        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 3, display: 'grid', gap: 1 }}>
          {points.map((point) => (
            <Box component="li" key={point} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleOutlineIcon fontSize="small" color="primary" sx={{ mt: '2px' }} />
              <Typography variant="body2" color="text.secondary">{point}</Typography>
            </Box>
          ))}
          {pkg.allowExtraChildren && pkg.extraChildAmount != null && (
            <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleOutlineIcon fontSize="small" color="primary" sx={{ mt: '2px' }} />
              <Typography variant="body2" color="text.secondary">
                Add more children for {formatKsh(pkg.extraChildAmount)} per month each (up to {pkg.maxChildren})
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          component={RouterLink}
          to={homeSchoolingEnquiryPath(pkg.slug)}
          variant="contained"
          color="secondary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Enquire about this package
        </Button>
      </CardContent>
    </Card>
  );
}

export default function HomeSchoolingPage() {
  const { data: packages = [], isLoading, isError, error, refetch } = usePublicHomeLearningPackages();
  const extraPrices = packages.filter((p) => p.allowExtraChildren && p.extraChildAmount != null).map((p) => p.extraChildAmount);
  const lowestExtra = extraPrices.length ? Math.min(...extraPrices) : null;

  return (
    <>
      <SeoHead
        title="Home Schooling"
        description="Explore Digifunzi Home Schooling monthly family packages and enquire about the right option for your children."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title="Home Schooling"
        lead="Monthly family packages with clear pricing. Choose the package that fits your household, then send us an enquiry to discuss the details."
      />

      <Section id="packages">
        <Box sx={{ maxWidth: 760, mb: 5 }}>
          <Typography variant="h2" component="h2" sx={{ mb: 1.5 }}>
            Choose a monthly package
          </Typography>
          <Typography color="text.secondary">
            Each package covers the number of children shown. Enquiring is free and does not commit you to a payment.
          </Typography>
        </Box>

        {isLoading && (
          <Box sx={gridSx} role="status" aria-label="Loading packages">
            {[0, 1, 2].map((i) => <PackageSkeleton key={i} />)}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && packages.length === 0 && (
          <EmptyBlock
            title="Packages are being finalised"
            body="We're putting the finishing touches on our Home Schooling packages. Send us an enquiry and we'll talk you through the options for your family."
          />
        )}

        {!isLoading && !isError && packages.length > 0 && (
          <Box sx={gridSx}>
            {packages.map((pkg) => <PackageCard key={pkg.slug} pkg={pkg} />)}
          </Box>
        )}

        <Box
          sx={{
            mt: 4,
            p: { xs: 2.5, sm: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'surface.subtle',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>
              {lowestExtra != null ? 'Adding another child?' : 'Not sure which package fits?'}
            </Typography>
            <Typography color="text.secondary">
              {lowestExtra != null
                ? `Additional children start from ${formatKsh(lowestExtra)} per month each. Enquire and our team can confirm the package total for your family.`
                : 'Tell us about your family and our team will recommend the right package.'}
            </Typography>
          </Box>
          <Button component={RouterLink} to={homeSchoolingEnquiryPath()} variant="outlined" sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
            Ask about family pricing
          </Button>
        </Box>
      </Section>

      <Section tone="subtle">
        <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h2" component="h2" sx={{ mb: 1.5 }}>
            Want to talk it through?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Send an enquiry with your preferred package. Our team will follow up to discuss your family’s needs and next steps.
          </Typography>
          <Button component={RouterLink} to={homeSchoolingEnquiryPath()} variant="contained" size="large">
            Ask us about Home Schooling
          </Button>
        </Box>
      </Section>
    </>
  );
}
