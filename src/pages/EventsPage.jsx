import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema, eventSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import EventCard from '../components/events/EventCard.jsx';
import { usePublicEvents } from '../hooks/usePublicEvents.js';
import { resolveMediaUrl } from '../utils/media.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../theme/layout.js';

const GRID_SX = { display: 'grid', gap: { xs: 2.5, md: 3 }, gridTemplateColumns: CARD_GRID_COLUMNS };

function CardSkeleton() {
  return (
    <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card' }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 9', height: 'auto' }} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
}

/**
 * Events (`/events`) — the team's general events: showcases, open days, talks (server:
 * modules/general-events/, GET /api/public/events). Free; each has its own page to register on.
 * Past events follow with their photos — what learners showed off is the best invitation.
 */
export default function EventsPage() {
  const upcoming = usePublicEvents();
  const past = usePublicEvents({ past: true });
  const events = upcoming.data || [];
  const pastEvents = (past.data || []).filter((e) => e.state !== 'cancelled');

  return (
    <>
      <SeoHead
        title="Events — Showcases & Open Days"
        description="Free Digifunzi events for families and schools in Kenya — come and see what young coders and robot builders have made, meet our mentors and find the right programme."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(events.map((e) => ({ name: e.title, url: `/events/${e.slug}` })), { name: 'Digifunzi Events' }),
          ...events.map((e) => eventSchema({
            name: e.title, description: e.descriptionText || e.tagline, startDate: e.startsAt, endDate: e.endsAt,
            image: resolveMediaUrl(e.coverImage), path: `/events/${e.slug}`,
            location: e.format !== 'online' && e.venueName ? { name: e.venueName, address: e.venueAddress } : undefined,
          })).filter(Boolean),
        ]}
      />

      <PageHeader
        title="Events"
        lead="Showcases, open days and talks — free to come to. See what our learners have built, meet the mentors, and find the right programme for your child."
      />

      <Section dots>
        {upcoming.isLoading && (
          <Box sx={GRID_SX}>{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</Box>
        )}
        {upcoming.isError && <ErrorBlock error={upcoming.error} onRetry={upcoming.refetch} />}
        {!upcoming.isLoading && !upcoming.isError && events.length === 0 && (
          <EmptyBlock
            title="No events coming up just now"
            body="We run showcases at the end of every bootcamp and open days through the year. Follow us, or get in touch and we'll tell you about the next one."
          />
        )}
        {events.length > 0 && (
          <Box sx={{ ...GRID_SX, ...shortListSx(events.length) }}>
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </Box>
        )}
      </Section>

      {pastEvents.length > 0 && (
        <Section>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 1 }}>Past events</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3.5, maxWidth: 640 }}>A look back at what our learners showed off.</Typography>
          <Box sx={{ ...GRID_SX, ...shortListSx(pastEvents.length) }}>
            {pastEvents.map((e) => <EventCard key={e.id} event={e} past />)}
          </Box>
        </Section>
      )}

      <CTABanner
        heading="Can't make it to an event?"
        body="Tell us your child's age and interests and we'll recommend the right bootcamp, club or pathway."
        primary={{ label: 'Get in touch', to: '/contact?subject=Event%20enquiry' }}
        secondary={{ label: 'Explore bootcamps', to: '/bootcamps' }}
      />
    </>
  );
}
