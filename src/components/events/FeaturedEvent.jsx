import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { resolveMediaUrl } from '../../utils/media.js';
import { Countdown, DateTile, ProofChips, whenFromNow } from './eventBits.jsx';

/**
 * The next event, as the Events page's hero: its picture behind, the date tile, a live countdown,
 * why now (places left, people coming, ages, free) and one big button to register.
 */
export default function FeaturedEvent({ event }) {
  const reg = event.registration || {};
  const image = resolveMediaUrl(event.coverImage);
  const time = event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : null;
  return (
    <Box
      sx={{
        position: 'relative', borderRadius: { xs: 4, md: 6 }, overflow: 'hidden', color: '#fff',
        background: image
          ? `linear-gradient(100deg, rgba(16,32,52,0.96) 0%, rgba(16,32,52,0.86) 45%, rgba(16,32,52,0.35) 100%), center / cover no-repeat url(${image})`
          : 'linear-gradient(135deg, #1a3550 0%, #25476a 45%, #2e7db5 80%, #38aae1 100%)',
        px: { xs: 2.5, sm: 4, md: 6 }, py: { xs: 3.5, md: 6 },
      }}
    >
      <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, alignItems: 'flex-start', maxWidth: 760 }}>
        <DateTile date={event.startDate} size="lg" sx={{ display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: 'secondary.light', fontWeight: 900, letterSpacing: '0.12em' }}>
            Next event · {event.kindLabel}{whenFromNow(event.startsAt) ? ` · ${whenFromNow(event.startsAt)}` : ''}
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 900, mt: 0.5, mb: 1.25, lineHeight: 1.1, fontSize: { xs: 30, md: 44 } }}>{event.title}</Typography>
          {event.tagline && <Typography sx={{ fontSize: { xs: 16, md: 19 }, opacity: 0.9, mb: 2.25, maxWidth: 620 }}>{event.tagline}</Typography>}
          <Box sx={{ display: 'grid', gap: 0.75, mb: 2.25 }}>
            <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center', fontWeight: 800 }}><ScheduleRoundedIcon sx={{ fontSize: 20, color: 'secondary.light' }} /> {event.when.replace(/ · .*$/, '')}{time ? ` · ${time}` : ''}</Typography>
            <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center', opacity: 0.9 }}>
              {event.format === 'online' ? <VideocamRoundedIcon sx={{ fontSize: 20, color: 'secondary.light' }} /> : <PlaceRoundedIcon sx={{ fontSize: 20, color: 'secondary.light' }} />} {event.where}
            </Typography>
          </Box>
          <ProofChips event={event} onDark sx={{ mb: 2.5 }} />
          <Countdown startsAt={event.startsAt} onDark sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to={`/events/${event.slug}#register`} variant="contained" color="secondary" size="large" sx={{ fontWeight: 900, px: 4, minHeight: 52 }}>
              {reg.open ? (reg.full && reg.waitlist ? 'Join the waiting list' : 'Reserve your free place') : 'See the details'}
            </Button>
            <Button component={RouterLink} to={`/events/${event.slug}`} size="large" sx={{ color: '#fff', fontWeight: 800, minHeight: 52 }}>What&rsquo;s happening</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
