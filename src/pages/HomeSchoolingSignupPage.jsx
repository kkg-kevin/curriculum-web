import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, EmptyBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import HomeSchoolingSignupForm from '../components/homeSchooling/HomeSchoolingSignupForm.jsx';
import { usePublicHomeLearningPackages } from '../hooks/usePublicHomeLearning.js';
import { homeSchoolingEnquiryPath } from '../content/homeSchooling.js';

/**
 * /home-schooling/signup — a family signs up for Home Schooling themselves: package, parent,
 * children and home details create their accounts, which unlock once our team approves their
 * payment. ?package=<slug>&children=<n> pre-select what they chose on the Home Schooling page.
 */
export default function HomeSchoolingSignupPage() {
  const [params] = useSearchParams();
  const { data: packages = [], isLoading, isError, error, refetch } = usePublicHomeLearningPackages();

  return (
    <>
      <SeoHead
        title="Sign up for Home Schooling"
        description="Create your family’s Digifunzi Home Schooling accounts — choose a package, add your children and your home details."
        noindex
      />
      <PageHeader
        title="Sign up for Home Schooling"
        lead="Five quick steps: choose a package, tell us about you, your children and your home. Your accounts unlock as soon as we confirm your payment."
      />
      <Section py={{ xs: 5, md: 8 }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          {isLoading && <LoadingBlock label="Loading packages…" />}
          {isError && <ErrorBlock error={error} onRetry={refetch} />}
          {!isLoading && !isError && packages.length === 0 && (
            <EmptyBlock
              title="Sign-ups open soon"
              body="Our Home Schooling packages are being finalised. Send us a question and we’ll talk you through the options."
            />
          )}
          {!isLoading && !isError && packages.length > 0 && (
            <HomeSchoolingSignupForm packages={packages} initialSlug={params.get('package')} initialChildren={params.get('children')} />
          )}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Rather talk to us first?</Typography>
            <Button component={RouterLink} to={homeSchoolingEnquiryPath(params.get('package') || undefined)} variant="outlined">Ask a question</Button>
          </Box>
        </Box>
      </Section>
    </>
  );
}
