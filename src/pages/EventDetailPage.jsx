import { useParams, Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema, eventSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import FaqList from '../components/common/FaqList.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import EventRegisterFlow from '../components/events/EventRegisterFlow.jsx';
import { Countdown, DateTile, EVENT_FAQS, ExplorePrograms, ProofChips, RegisterBar, ShareRow, whenFromNow } from '../components/events/eventBits.jsx';
import { usePublicEvent } from '../hooks/usePublicEvents.js';
import { resolveMediaUrl } from '../utils/media.js';
import { safeHtml } from '../utils/safeHtml.js';
import { downloadCalendar, googleCalendarUrl } from '../utils/eventCalendar.js';
import { ASIDE_WIDTH, PROSE_MAX_WIDTH } from '../theme/layout.js';

/**
 * One general event (`/events/:slug`), laid out to get a family from "what's this?" to "we're
 * coming" — and on to a programme:
 *   hero      the date tile, title, the line that sells it, time and place, why now (free, places
 *             left, people coming, ages), a live countdown and the one button that matters
 *   form      beside everything on a wide screen (sticky), straight after the hero on a phone, with
 *             a bar at the bottom of a phone's screen that brings you back to it
 *   body      what to expect, about it, photos, where (directions, add to calendar), the questions
 *             families ask, and what your child could join next (the event's own bootcamp first)
 * A cancelled or past event says so and takes no registrations.
 */
function Fact({ icon, title, children }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', minWidth: 0 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.14)', color: 'secondary.light', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0, pt: 0.25 }}>
        <Typography sx={{ fontWeight: 900, lineHeight: 1.3 }}>{title}</Typography>
        {children && <Typography variant="body2" sx={{ opacity: 0.85 }}>{children}</Typography>}
      </Box>
    </Box>
  );
}

function RegisterCard({ event, invited }) {
  const reg = event.registration;
  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: '0 18px 40px rgba(16,32,52,0.12)', display: 'grid', gap: 2 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'secondary.dark', fontWeight: 900 }}>{invited ? 'You’re invited · free' : 'Free · takes 30 seconds'}</Typography>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
          {event.state === 'cancelled' ? 'This event is cancelled' : event.state === 'ended' ? 'This event has ended' : reg.full && reg.open ? 'Join the waiting list' : 'Reserve your place'}
        </Typography>
        {reg.open && reg.seatsLeft != null && !reg.full && (
          <Typography sx={{ color: 'secondary.dark', fontWeight: 800, mt: 0.5 }}>Only {reg.seatsLeft} {reg.seatsLeft === 1 ? 'place' : 'places'} left</Typography>
        )}
      </Box>
      {event.state === 'cancelled' ? (
        <Alert severity="warning">{event.cancelReason ? `From our team: ${event.cancelReason}` : 'We’re sorry — this one won’t go ahead.'}</Alert>
      ) : event.state === 'ended' ? (
        <Alert severity="info">Thanks to everyone who came. See what&rsquo;s coming up next.</Alert>
      ) : (
        <EventRegisterFlow event={event} source="page" />
      )}
      {(event.state === 'cancelled' || event.state === 'ended') && (
        <Button component={RouterLink} to="/events" variant="contained">See upcoming events</Button>
      )}
    </Box>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const invited = params.get('invited') === '1';
  const { data: event, isLoading, isError, error, refetch } = usePublicEvent(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="rectangular" sx={{ borderRadius: 6, height: 360 }} />
        <Skeleton variant="text" width="60%" sx={{ mt: 3 }} />
      </Container>
    );
  }
  if (isError || !event) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <SeoHead title="Event not found" noindex />
        <ErrorBlock error={{ message: notFound ? 'We couldn’t find that event — it may have been taken down.' : error?.message }} onRetry={notFound ? undefined : refetch} />
        <Box sx={{ textAlign: 'center', mt: 2 }}><Button component={RouterLink} to="/events" variant="outlined">All events</Button></Box>
      </Container>
    );
  }

  const path = `/events/${event.slug}`;
  const online = event.format === 'online';
  const live = ['upcoming', 'on_now'].includes(event.state);
  const description = safeHtml(event.description);
  const gallery = (event.images || []).filter(Boolean);
  const image = resolveMediaUrl(event.coverImage);
  const time = event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : null;
  const soon = live ? whenFromNow(event.startsAt) : null;
  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

  return (
    <>
      <SeoHead title={`${event.title} — ${event.kindLabel}`} description={event.descriptionText || event.tagline || `${event.title}: ${event.when}, ${event.where}. Free — register now.`} image={image || undefined} />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Events', path: '/events' }, { name: event.title, path }]),
          eventSchema({
            name: event.title, description: event.descriptionText || event.tagline, startDate: event.startsAt, endDate: event.endsAt,
            image, path, location: !online && event.venueName ? { name: event.venueName, address: event.venueAddress } : undefined,
          }),
          faqSchema(EVENT_FAQS),
        ]}
      />

      {/* Hero */}
      <Box sx={{
        color: '#fff',
        background: image
          ? `linear-gradient(100deg, rgba(16,32,52,0.97) 0%, rgba(16,32,52,0.88) 50%, rgba(16,32,52,0.5) 100%), center / cover no-repeat url(${image})`
          : 'linear-gradient(135deg, #1a3550 0%, #25476a 45%, #2e7db5 80%, #38aae1 100%)',
      }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
          <Button component={RouterLink} to="/events" startIcon={<ArrowBackRoundedIcon />} size="small" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2, ml: -1 }}>All events</Button>
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, alignItems: 'flex-start' }}>
            <DateTile date={event.startDate} size="lg" sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ minWidth: 0, maxWidth: 780 }}>
              <Typography variant="overline" sx={{ color: 'secondary.light', fontWeight: 900, letterSpacing: '0.12em' }}>
                {event.kindLabel}{soon ? ` · ${soon}` : ''}{event.state === 'cancelled' ? ' · Cancelled' : event.state === 'ended' ? ' · Ended' : ''}
              </Typography>
              <Typography variant="h1" component="h1" sx={{ fontWeight: 900, mt: 0.5, mb: 1.25, lineHeight: 1.08, fontSize: { xs: 32, md: 50 } }}>{event.title}</Typography>
              {event.tagline && <Typography sx={{ fontSize: { xs: 17, md: 20 }, opacity: 0.92, mb: 2.5 }}>{event.tagline}</Typography>}
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, mb: 2.5, maxWidth: 640 }}>
                <Fact icon={<ScheduleRoundedIcon />} title={event.when.replace(/ · .*$/, '')}>{time}</Fact>
                <Fact icon={online ? <VideocamRoundedIcon /> : <PlaceRoundedIcon />} title={online ? 'Online' : event.venueName || event.where}>
                  {online ? 'The link is emailed to you' : event.venueAddress || (event.format === 'hybrid' ? 'Or join online' : null)}
                </Fact>
              </Box>
              {live && <ProofChips event={event} onDark sx={{ mb: 2.5 }} />}
              {live && <Countdown startsAt={event.startsAt} onDark sx={{ mb: 3 }} />}
              {live && event.registration.open && (
                <Button href="#register" variant="contained" color="secondary" size="large" sx={{ fontWeight: 900, px: 4, minHeight: 52, display: { lg: 'none' } }}>
                  {event.registration.full && event.registration.waitlist ? 'Join the waiting list' : 'Reserve your free place'}
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Section py={{ xs: 4, md: 7 }}>
        <Box sx={{ display: 'grid', gap: { xs: 5, lg: 7 }, gridTemplateColumns: { xs: '1fr', lg: `minmax(0, 1fr) ${ASIDE_WIDTH + 40}px` }, alignItems: 'start' }}>
          {/* The form: first on a phone or tablet, beside everything (and staying in view) on a wide screen. */}
          <Box component="aside" id="register" sx={{ order: { xs: -1, lg: 1 }, position: { lg: 'sticky' }, top: { lg: 96 }, mt: { lg: -14 }, scrollMarginTop: 90, minWidth: 0 }}>
            <RegisterCard event={event} invited={invited} />
            {live && <ShareRow event={event} sx={{ mt: 2, justifyContent: { lg: 'center' } }} />}
          </Box>

          <Box sx={{ minWidth: 0, display: 'grid', gap: { xs: 5, md: 6 } }}>
            {live && (
              <Box>
                <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 2 }}>What to expect</Typography>
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
                  {event.highlights.map((h) => (
                    <Box key={h} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', p: 2, borderRadius: 3, bgcolor: 'surface.card', border: '1px solid', borderColor: 'divider' }}>
                      <CheckCircleRoundedIcon color="success" sx={{ mt: 0.1 }} />
                      <Typography sx={{ fontWeight: 600 }}>{h}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {description && (
              <Box>
                <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 2 }}>About the {event.kindLabel.toLowerCase()}</Typography>
                <Box sx={{ color: 'text.secondary', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.75, fontSize: 16.5, '& p': { mt: 0, mb: 2 }, '& img': { maxWidth: '100%', borderRadius: 2 }, '& a': { color: 'primary.main' } }}
                  dangerouslySetInnerHTML={{ __html: description }} />
              </Box>
            )}

            {gallery.length > 0 && (
              <Box>
                <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 2 }}>{event.state === 'ended' ? 'Photos from the day' : 'A look inside'}</Typography>
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' } }}>
                  {gallery.map((src) => <SmartImage key={src} src={src} alt="" ratio="4 / 3" />)}
                </Box>
              </Box>
            )}

            {live && (
              <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: 'surface.subtle', border: '1px solid', borderColor: 'divider', display: 'grid', gap: 2 }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 900 }}>{online ? 'How to join' : 'Getting there'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {online
                    ? 'It’s online — your join link comes in your confirmation email and again in your reminder.'
                    : [event.venueName, event.venueAddress].filter(Boolean).join(', ') || event.where}
                  {event.format === 'hybrid' ? ' You can also join online — the link is in your email.' : ''}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {event.mapUrl && !online && <Button variant="outlined" startIcon={<MapRoundedIcon />} href={event.mapUrl} target="_blank" rel="noopener">Directions</Button>}
                  <Button variant="outlined" startIcon={<EventRoundedIcon />} onClick={() => downloadCalendar(event, { url: pageUrl })}>Add to calendar</Button>
                  <Button variant="text" href={googleCalendarUrl(event)} target="_blank" rel="noopener">Google Calendar</Button>
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant="h3" component="h2" sx={{ fontWeight: 900, mb: 2 }}>Questions families ask</Typography>
              <FaqList faqs={EVENT_FAQS} />
            </Box>

            <ExplorePrograms
              bootcamp={event.bootcamp}
              title={event.state === 'ended' ? 'Keep the excitement going' : 'Can’t wait for the day?'}
              lead="These are the programmes your child could join — have a look before you come, and bring your questions."
            />
          </Box>
        </Box>
      </Section>

      {live && <RegisterBar event={event} />}
    </>
  );
}
