import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import ClubCard from '../components/cards/ClubCard.jsx';
import { usePublicHubList, usePublicHubProfiles } from '../hooks/usePublicHubs.js';
import { clubPath } from '../utils/clubs.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../theme/layout.js';

const GRID_SX = { display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: CARD_GRID_COLUMNS };

function CardSkeleton() {
  return (
    <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card' }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 10', height: 'auto' }} />
      <Box sx={{ p: 2.5 }}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="50%" />
      </Box>
    </Box>
  );
}

/**
 * Estate Tech Clubs (`/estate-tech-clubs`) — every active, non-school learning hub in the
 * curriculum system (GET /api/public/hubs): the estate clubs, Thika Gateway and the online club.
 * A hub added or switched off in the portal shows up or drops off here by itself; its own page
 * (/estate-tech-clubs/:slug) needs a website rebuild to be pre-rendered for search engines.
 */
export default function EstateTechClubsPage() {
  const { data: hubs = [], isLoading, isError, error, refetch } = usePublicHubList();
  const profiles = usePublicHubProfiles(hubs.map((h) => h.id));
  const count = hubs.length;

  return (
    <>
      <SeoHead
        title="Estate Tech Clubs — Coding & Robotics Clubs for Kids"
        description="Digifunzi estate tech clubs bring coding, robotics and AI to kids close to home in Kiambu, plus an online club. Find a club near you, see its days and hours, and enquire."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(hubs.map((h) => ({ name: h.name, url: clubPath(h) })), { name: 'Digifunzi Estate Tech Clubs' }),
        ]}
      />

      <PageHeader
        title="Estate Tech Clubs"
        lead="Coding, robotics and AI clubs run in estates and community spaces, so children can learn close to home. Find the club nearest you, check its days and hours, and send us an enquiry."
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
              {count} {count === 1 ? 'club' : 'clubs'} open now
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section dots>
        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && count === 0 && (
          <EmptyBlock
            title="New clubs are on the way"
            body="We're setting up our next estate clubs. Contact us and we'll tell you when one opens near you."
          />
        )}

        {!isLoading && !isError && count > 0 && (
          <Box sx={{ ...GRID_SX, ...shortListSx(count) }}>
            {hubs.map((hub) => (
              <ClubCard key={hub.id} hub={hub} profile={profiles[hub.id]} />
            ))}
          </Box>
        )}
      </Section>

      <CTABanner
        heading="No club near you yet?"
        body="Tell us your estate or neighbourhood. We open new clubs where families ask for them."
        primary={{ label: 'Tell us where', to: '/contact?subject=A%20tech%20club%20in%20my%20estate' }}
        secondary={{ label: 'Enroll a learner', to: '/enroll' }}
      />
    </>
  );
}
