import { useParams, Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema, eventSchema } from '../components/seo/JsonLd.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import { DetailHeading } from '../components/common/DetailSection.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import { AsideCard } from '../components/common/DetailLayout.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import EventRegisterFlow from '../components/events/EventRegisterFlow.jsx';
import { usePublicEvent } from '../hooks/usePublicEvents.js';
import { resolveMediaUrl } from '../utils/media.js';
import { safeHtml } from '../utils/safeHtml.js';
import { ASIDE_WIDTH, PROSE_MAX_WIDTH } from '../theme/layout.js';

/**
 * One general event (`/events/:slug`): what, when, where, and the registration form right there
 * (in the side column on wide screens, straight after the facts on a phone). Free; name, phone and
 * email, then an optional "about you". A cancelled or past event says so and takes no registrations.
 */
function Fact({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: 'action.hover', color: 'primary.main', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ pt: 0.75, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

function RegisterCard({ event, invited }) {
  const reg = event.registration;
  const stateNote = event.state === 'cancelled' ? null : event.state === 'ended' ? 'This event has ended.' : null;
  return (
    <AsideCard sx={{ gap: 2 }}>
      <Box>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800 }}>{invited ? 'You’re invited' : 'Free — register'}</Typography>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
          {event.state === 'cancelled' ? 'Cancelled' : reg.full && reg.open ? 'Join the waiting list' : 'Reserve your place'}
        </Typography>
        {reg.open && reg.seatsLeft != null && !reg.full && (
          <Typography sx={{ color: 'warning.dark', fontWeight: 700, mt: 0.5 }}>Only {reg.seatsLeft} {reg.seatsLeft === 1 ? 'place' : 'places'} left</Typography>
        )}
      </Box>
      {event.state === 'cancelled' ? (
        <Alert severity="warning">This event has been cancelled{event.cancelReason ? `: ${event.cancelReason}` : '.'}</Alert>
      ) : stateNote ? (
        <Alert severity="info">{stateNote}</Alert>
      ) : (
        <EventRegisterFlow event={event} source="page" />
      )}
    </AsideCard>
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
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="70%" height={60} />
        <Skeleton variant="rectangular" height={260} sx={{ mt: 3, borderRadius: 3 }} />
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
  const description = safeHtml(event.description);
  const gallery = (event.images || []).filter(Boolean);

  return (
    <>
      <SeoHead title={`${event.title} — ${event.kindLabel}`} description={event.descriptionText || event.tagline || `${event.title}: ${event.when}, ${event.where}. Free — register now.`} image={resolveMediaUrl(event.coverImage) || undefined} />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Events', path: '/events' }, { name: event.title, path }]),
          eventSchema({
            name: event.title, description: event.descriptionText || event.tagline, startDate: event.startsAt, endDate: event.endsAt,
            image: resolveMediaUrl(event.coverImage), path,
            location: !online && event.venueName ? { name: event.venueName, address: event.venueAddress } : undefined,
          }),
        ]}
      />

      <DetailHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Events', to: '/events' }, { label: event.title }]}>
        <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, flexWrap: { xs: 'wrap', md: 'nowrap' }, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={event.kindLabel} sx={{ fontWeight: 700 }} color="primary" />
              {event.free && <Chip label="Free" variant="outlined" sx={{ fontWeight: 700 }} />}
              <Chip label={event.formatLabel} variant="outlined" sx={{ fontWeight: 600 }} />
              {event.state === 'cancelled' && <Chip label="Cancelled" color="error" sx={{ fontWeight: 700 }} />}
              {event.state === 'ended' && <Chip label="Ended" sx={{ fontWeight: 700 }} />}
            </Box>
            <Typography variant="h1" component="h1" sx={{ mb: 1.5 }}>{event.title}</Typography>
            {event.tagline && <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary', mb: 2.5 }}>{event.tagline}</Typography>}
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Fact icon={<CalendarMonthRoundedIcon />}><Typography sx={{ fontWeight: 700 }}>{event.when}</Typography></Fact>
              <Fact icon={online ? <VideocamRoundedIcon /> : <PlaceRoundedIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{online ? 'Online' : event.venueName || event.where}</Typography>
                {!online && event.venueAddress && <Typography variant="body2" color="text.secondary">{event.venueAddress}</Typography>}
                {event.format === 'hybrid' && <Typography variant="body2" color="text.secondary">Or join online — the link is emailed to you.</Typography>}
                {online && <Typography variant="body2" color="text.secondary">The link to join is emailed to you before it starts.</Typography>}
              </Fact>
            </Box>
            {event.mapUrl && !online && (
              <Button href={event.mapUrl} target="_blank" rel="noopener" startIcon={<MapRoundedIcon />} variant="outlined" sx={{ mt: 2.5 }}>Directions</Button>
            )}
            <Button href="#register" variant="contained" size="large" sx={{ mt: 2.5, ml: event.mapUrl && !online ? 1.5 : 0, display: { lg: 'none' } }}>Register — free</Button>
          </Box>
          {event.coverImage && (
            <Box sx={{ width: { xs: '100%', md: 420 }, flexShrink: 0 }}>
              <SmartImage src={event.coverImage} alt={event.title} ratio="16 / 10" eager />
            </Box>
          )}
        </Box>
      </DetailHero>

      <Section>
        {/* Like DetailLayout, but on a phone or tablet the registration comes first, not last. */}
        <Box sx={{ display: 'grid', gap: { xs: 5, lg: 7 }, gridTemplateColumns: { xs: '1fr', lg: `minmax(0, 1fr) ${ASIDE_WIDTH}px` }, alignItems: 'start' }}>
        <Box component="aside" id="register" sx={{ order: { xs: -1, lg: 1 }, position: { lg: 'sticky' }, top: { lg: 96 }, scrollMarginTop: 90 }}>
          <RegisterCard event={event} invited={invited} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          {description ? (
            <Box sx={{ maxWidth: 760, mb: 6 }}>
              <DetailHeading title="About the event" icon={<InfoOutlinedIcon />} />
              <Box sx={{ color: 'text.secondary', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.75, '& p': { mt: 0, mb: 2 }, '& img': { maxWidth: '100%', borderRadius: 2 }, '& a': { color: 'primary.main' } }}
                dangerouslySetInnerHTML={{ __html: description }} />
            </Box>
          ) : (
            <Box sx={{ maxWidth: 760, mb: 6 }}>
              <DetailHeading title="About the event" icon={<InfoOutlinedIcon />} />
              <Typography sx={{ color: 'text.secondary' }}>Come along — it&rsquo;s free. Register so we can keep a place for you and anyone coming with you.</Typography>
            </Box>
          )}
          {gallery.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <DetailHeading title={event.state === 'ended' ? 'Photos from the day' : 'Pictures'} icon={<PhotoLibraryRoundedIcon />} tight />
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                {gallery.map((src) => <SmartImage key={src} src={src} alt="" ratio="4 / 3" />)}
              </Box>
            </Box>
          )}
        </Box>
        </Box>
      </Section>
    </>
  );
}
