import { useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import BootcampCard, { FORMAT_LABEL } from '../components/cards/BootcampCard.jsx';
import { usePublicBootcamps } from '../hooks/usePublicBootcamps.js';

const GRID_SX = {
  display: 'grid',
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
};

const FORMATS = [
  { key: 'all', label: 'All formats' },
  { key: 'holiday', label: FORMAT_LABEL.holiday },
  { key: 'weekend', label: FORMAT_LABEL.weekend },
  { key: 'after_school', label: FORMAT_LABEL.after_school },
  { key: 'online', label: FORMAT_LABEL.online },
];

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.card',
      }}
    >
      <Skeleton variant="rectangular" height={138} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="55%" sx={{ mt: 2 }} />
        <Skeleton variant="text" width="35%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

/**
 * A holding view for when no bootcamp is listed for sale yet — keeps the original
 * "coming soon" copy so the page never looks broken.
 */
function ComingSoon() {
  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', textAlign: 'center', py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          mb: 3,
          bgcolor: 'surface.subtle',
          color: 'primary.main',
        }}
      >
        <RocketLaunchIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography variant="h3" component="h2" gutterBottom>
        Bootcamps are on the way
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>
        We&apos;re putting together our first holiday bootcamps — dates, age groups and the projects
        each one builds towards. Tell us your learner&apos;s age and we&apos;ll let you know as soon
        as bookings open.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          component={RouterLink}
          to="/contact?subject=Bootcamps%20%E2%80%94%20keep%20me%20posted"
          variant="contained"
          size="large"
        >
          Keep me posted
        </Button>
        <Button component={RouterLink} to="/pathways" variant="outlined" size="large">
          Explore pathways
        </Button>
      </Box>
    </Box>
  );
}

/**
 * Bootcamps section (`/bootcamps`). A bootcamp is an Event the curriculum team flipped "List on
 * the website" — a short, intensive holiday/weekend build with a showcase at the end. See
 * GET /api/public/bootcamps. Booking is an "Enquire to book" lead (no checkout yet).
 *
 * `?format=` filters the grid client-side.
 */
export default function BootcampsPage() {
  const { data, isLoading, isError, error, refetch } = usePublicBootcamps();
  const [params, setParams] = useSearchParams();

  const requested = params.get('format');
  const active = FORMATS.some((f) => f.key === requested) ? requested : 'all';

  const availableFormats = useMemo(() => {
    const present = new Set((data || []).map((b) => b.format).filter(Boolean));
    return FORMATS.filter((f) => f.key === 'all' || present.has(f.key));
  }, [data]);

  const list = useMemo(() => {
    const all = data || [];
    return active === 'all' ? all : all.filter((b) => b.format === active);
  }, [data, active]);

  const setFormat = (key) => {
    setParams(
      (prev) => {
        if (key === 'all') prev.delete('format');
        else prev.set('format', key);
        return prev;
      },
      { replace: true },
    );
  };

  const count = data?.length || 0;

  return (
    <>
      <SeoHead
        title="Holiday Bootcamps for Kids in Kenya"
        description="Short, intensive holiday robotics and coding bootcamps for young learners in Kenya — a full build packed into a week or two, with a showcase at the end."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            (data || []).map((b) => ({ name: b.name, url: `/bootcamps/${b.slug}` })),
            { name: 'Digifunzi Bootcamps' },
          ),
        ]}
      />

      <PageHeader
        title="Bootcamps"
        lead="Short, intensive holiday programmes — a full robotics or coding build packed into a week or two, with a showcase at the end."
      >
        {!isLoading && !isError && count > 0 && (
          <Box
            sx={{
              mt: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'surface.card',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {count} {count === 1 ? 'bootcamp' : 'bootcamps'} open for enquiries
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section>
        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && count === 0 && <ComingSoon />}

        {!isLoading && !isError && count > 0 && (
          <>
            <Box
              role="note"
              sx={{
                mb: 4,
                p: 2,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'surface.subtle',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>Prices shown are indicative.</strong> Open a bootcamp and send an enquiry —
                we&apos;ll confirm the next run&apos;s dates, the final price and how to secure a place.
              </Typography>
            </Box>

            {availableFormats.length > 2 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {availableFormats.map((f) => (
                  <Chip
                    key={f.key}
                    label={f.label}
                    onClick={() => setFormat(f.key)}
                    color={f.key === active ? 'primary' : 'default'}
                    variant={f.key === active ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            )}

            {list.length === 0 ? (
              <ComingSoon />
            ) : (
              <Box sx={GRID_SX}>
                {list.map((b) => (
                  <BootcampCard key={b.id} bootcamp={b} />
                ))}
              </Box>
            )}
          </>
        )}
      </Section>

      <CTABanner
        heading="Not sure where to start?"
        body="Pathways and guided projects run all year — a bootcamp is a fast way in, but not the only one. Tell us about your learner and we'll point you the right way."
        primary={{ label: 'Talk to us', to: '/contact' }}
        secondary={{ label: 'Browse projects', to: '/projects' }}
      />
    </>
  );
}
