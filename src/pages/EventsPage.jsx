import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema, eventSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import FaqList from '../components/common/FaqList.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import EventCard from '../components/events/EventCard.jsx';
import FeaturedEvent from '../components/events/FeaturedEvent.jsx';
import { EVENT_FAQS, NotifyMe, WHY_COME } from '../components/events/eventBits.jsx';
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
 * Events (`/events`) — showcases, open days and talks (server: modules/general-events/), laid out
 * to turn a visit into "I'm coming" (and from there into enrolling):
 *   1. the next event as the hero — date, countdown, places left / people coming, one button
 *   2. everything else coming up, as cards with the date at a glance and "Register free"
 *   3. why come (four reasons), past events with their photos as proof, the questions families ask
 *   4. "Tell me about the next event" — an enquiry, so nobody interested is lost, even with no
 *      event on the calendar.
 */
export default function EventsPage() {
  const upcoming = usePublicEvents();
  const past = usePublicEvents({ past: true });
  const events = (upcoming.data || []).filter((e) => e.state !== 'cancelled');
  const [featured, ...rest] = events;
  const pastEvents = (past.data || []).filter((e) => e.state !== 'cancelled');

  return (
    <>
      <SeoHead
        title="Free Events for Families — Showcases & Open Days"
        description="Free Digifunzi events in Kenya: see what young coders and robot builders have made, try it yourself, meet the mentors and find the right programme for your child."
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
          faqSchema(EVENT_FAQS),
        ]}
      />

      <Section py={{ xs: 4, md: 6 }}>
        <Box sx={{ mb: { xs: 2.5, md: 3.5 }, maxWidth: 760 }}>
          <Typography variant="overline" sx={{ color: 'secondary.dark', fontWeight: 900, letterSpacing: '0.12em' }}>Free · For the whole family</Typography>
          <Typography variant="h1" component="h1" sx={{ fontWeight: 900, mt: 0.5, mb: 1 }}>Come and see what kids can build</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: { xs: 16, md: 18 } }}>
            Showcases, open days and talks — try the projects, meet the mentors, and find the right programme for your child.
          </Typography>
        </Box>

        {upcoming.isLoading && <Skeleton variant="rectangular" sx={{ borderRadius: 6, height: { xs: 420, md: 380 } }} />}
        {upcoming.isError && <ErrorBlock error={upcoming.error} onRetry={upcoming.refetch} />}
        {featured && <FeaturedEvent event={featured} />}
        {!upcoming.isLoading && !upcoming.isError && !featured && (
          <NotifyMe
            title="No events on the calendar — yet"
            lead="We run a showcase at the end of every bootcamp and open days through the year. Leave your details and we'll tell you the moment the next one is announced."
          />
        )}
      </Section>

      {(upcoming.isLoading || rest.length > 0) && (
        <Section py={{ xs: 2, md: 3 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 3 }}>Also coming up</Typography>
          {upcoming.isLoading ? (
            <Box sx={GRID_SX}>{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</Box>
          ) : (
            <Box sx={{ ...GRID_SX, ...shortListSx(rest.length) }}>{rest.map((e) => <EventCard key={e.id} event={e} />)}</Box>
          )}
        </Section>
      )}

      <Section dots py={{ xs: 6, md: 9 }}>
        <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 1 }}>Why families come</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3.5, maxWidth: 640 }}>An hour or two that answers the big question: what would my child actually do — and would they love it?</Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
          {WHY_COME.map((w, i) => (
            <Box key={w.title} sx={{ p: 2.5, borderRadius: 4, bgcolor: 'surface.card', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 900, mb: 1.5 }}>{i + 1}</Box>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>{w.title}</Typography>
              <Typography variant="body2" color="text.secondary">{w.text}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      {pastEvents.length > 0 && (
        <Section py={{ xs: 6, md: 9 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 1 }}>From our last events</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3.5, maxWidth: 640 }}>What our learners showed their families.</Typography>
          <Box sx={{ ...GRID_SX, ...shortListSx(pastEvents.length) }}>{pastEvents.map((e) => <EventCard key={e.id} event={e} past />)}</Box>
        </Section>
      )}

      <Section py={{ xs: 6, md: 9 }}>
        <Box sx={{ display: 'grid', gap: { xs: 4, md: 6 }, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' }, alignItems: 'start' }}>
          <Box>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 2.5 }}>Questions families ask</Typography>
            <FaqList faqs={EVENT_FAQS} />
          </Box>
          {featured && <NotifyMe sx={{ gridTemplateColumns: '1fr' }} />}
        </Box>
      </Section>
    </>
  );
}
