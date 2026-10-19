import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, EmptyBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import ClubSignupForm from '../components/clubs/ClubSignupForm.jsx';
import { usePublicHubList } from '../hooks/usePublicHubs.js';
import { packagesForClub, useClubPackages } from '../hooks/usePublicClubs.js';
import { CLUBS_PATH, clubPath, clubSlug } from '../utils/clubs.js';

/**
 * /estate-tech-clubs/:slug/join — a family joins an Estate Tech Club themselves: package, parent
 * and children create their accounts, which unlock once our team approves their payment.
 * ?package=<slug>&children=<n> pre-select what they chose on the club's page. Not indexed (like
 * the Home Schooling sign-up), and not pre-rendered.
 */
export default function ClubSignupPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const hubs = usePublicHubList();
  const packagesQuery = useClubPackages();
  const hub = (hubs.data || []).find((h) => clubSlug(h) === slug) || null;
  const packages = packagesForClub(packagesQuery.data, hub?.id);
  const enquirePath = hub ? `/enroll?club=${encodeURIComponent(hub.name)}` : '/enroll';
  const isLoading = hubs.isLoading || packagesQuery.isLoading;
  const isError = hubs.isError || packagesQuery.isError;

  return (
    <>
      <SeoHead
        title={hub ? `Join ${hub.name}` : 'Join an Estate Tech Club'}
        description="Sign your children up for a Digifunzi Estate Tech Club — choose a package and create your family’s logins."
        noindex
      />
      <PageHeader
        title={hub ? `Join ${hub.name}` : 'Join an Estate Tech Club'}
        lead="Four quick steps: choose a package, tell us about you and your children, and check your details. Your accounts unlock as soon as we confirm your payment."
      />
      <Section py={{ xs: 5, md: 8 }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          {isLoading && <LoadingBlock label="Loading the club…" />}
          {isError && <ErrorBlock error={hubs.error || packagesQuery.error} onRetry={() => { hubs.refetch(); packagesQuery.refetch(); }} />}
          {!isLoading && !isError && !hub && (
            <EmptyBlock title="Club not found" body="This club doesn’t exist or isn’t open at the moment. See all our clubs to find another near you." />
          )}
          {!isLoading && !isError && hub && packages.length === 0 && (
            <EmptyBlock
              title="Sign-ups open soon"
              body={`We’re finalising the packages for ${hub.name}. Send us a question and we’ll tell you about places, days and prices.`}
            />
          )}
          {!isLoading && !isError && hub && packages.length > 0 && (
            <ClubSignupForm hub={hub} packages={packages} initialSlug={params.get('package')} initialChildren={params.get('children')} enquirePath={enquirePath} />
          )}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Rather talk to us first?</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button component={RouterLink} to={enquirePath} variant="outlined">Ask a question</Button>
              <Button component={RouterLink} to={hub ? clubPath(hub) : CLUBS_PATH} variant="text">{hub ? `Back to ${hub.name}` : 'See all clubs'}</Button>
            </Box>
          </Box>
        </Box>
      </Section>
    </>
  );
}
