import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import HubProfile from '../components/hubs/HubProfile.jsx';
import ClubLogo from '../components/hubs/ClubLogo.jsx';
import { usePublicHub } from '../hooks/usePublicHubs.js';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { formatDateRange } from '../utils/dates.js';

const RUN_STATUS_LABEL = { upcoming: 'Upcoming', active: 'Running now' };

/**
 * /bootcamps/:slug/hubs/:hubId — the full profile for one hub a bootcamp runs at. Reached by
 * clicking a hub in BootcampDetailPage's "Running at" list; the bootcamp slug in the URL is only
 * there to build the breadcrumb/back-link (the hub data itself comes from its own
 * GET /api/public/hubs/:id call and doesn't depend on the bootcamp).
 */
export default function HubDetailPage() {
  const { slug, hubId } = useParams();
  const [searchParams] = useSearchParams();
  const { data: hub, isLoading, isError, error, refetch } = usePublicHub(hubId);
  // Only used for the bootcamp's name in the breadcrumb / back link — a cheap cache hit since
  // the visitor just came from that page. Dates for this specific run travel as query params
  // (BootcampDetailPage sets them when linking here) since a hub can run several bootcamps.
  const { data: bootcamp } = usePublicBootcamp(slug);

  const runStartDate = searchParams.get('start') || '';
  const runEndDate = searchParams.get('end') || '';
  const runStatus = searchParams.get('status') || '';

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError || !hub) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Hub not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This hub doesn’t exist or isn’t currently active.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={slug ? `/bootcamps/${slug}` : '/bootcamps'} variant="outlined">
            {slug ? 'Back to the bootcamp' : 'View all bootcamps'}
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <SeoHead title={hub.name} description={hub.description} noindex />
      <JsonLd data={[organizationSchema()]} />

      {/* header band */}
      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderTop: '4px solid',
          borderTopColor: 'primary.dark',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/bootcamps" underline="hover" color="inherit">
              Bootcamps
            </Link>
            {slug && (
              <Link component={RouterLink} to={`/bootcamps/${slug}`} underline="hover" color="inherit">
                {bootcamp?.name || 'Bootcamp'}
              </Link>
            )}
            <Typography color="text.primary">{hub.name}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 2.5 }, flexWrap: 'wrap', mb: 1.5 }}>
            <ClubLogo src={hub.photo} name={hub.name} size={64} />
            <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.75rem' } }}>
              {hub.name}
            </Typography>
            {runStatus && RUN_STATUS_LABEL[runStatus] && (
              <Chip
                label={RUN_STATUS_LABEL[runStatus]}
                sx={{
                  fontWeight: 700,
                  bgcolor: (t) => alpha(runStatus === 'active' ? t.palette.success.main : t.palette.info.main, 0.12),
                  color: runStatus === 'active' ? 'success.dark' : 'info.dark',
                }}
              />
            )}
          </Box>

          {(runStartDate || runEndDate) && (
            <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {formatDateRange(runStartDate, runEndDate) || 'Dates to be confirmed'}
            </Typography>
          )}
        </Container>
      </Box>

      <HubProfile
        hub={hub}
        sideAction={
          slug && (
            <Button component={RouterLink} to={`/bootcamps/${slug}`} variant="outlined" fullWidth sx={{ mt: 3 }}>
              Back to {bootcamp?.name || 'the bootcamp'}
            </Button>
          )
        }
      />

      <CTABanner
        heading="Ready to enquire about this bootcamp?"
        body="Send us your details and we'll get back to you with everything you need to know."
        primary={{
          label: 'Enquire now',
          to: slug ? `/enroll?interestedIn=bootcamp&referenceId=${encodeURIComponent(slug)}` : '/contact',
        }}
        secondary={{ label: 'Talk to us', to: '/contact' }}
      />
    </>
  );
}
