import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SmartImage from '../common/SmartImage.jsx';
import { DateTile, whenFromNow } from './eventBits.jsx';

/**
 * A general event's card (/events): the date at a glance on the picture, what it is, when and
 * where, who it's for, and why now (places left / people coming) — with a clear "Register free"
 * at the bottom. A past event says what happened instead.
 */
export default function EventCard({ event, past = false }) {
  const reg = event.registration || {};
  const time = event.startTime ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ''}` : null;
  const urgency = event.state === 'cancelled' ? { label: 'Cancelled', bg: 'error.main', fg: '#fff' }
    : past ? null
      : reg.full ? { label: reg.waitlist ? 'Full · waiting list' : 'Full', bg: 'secondary.main', fg: 'secondary.contrastText' }
        : reg.seatsLeft != null ? { label: `${reg.seatsLeft} ${reg.seatsLeft === 1 ? 'place' : 'places'} left`, bg: 'secondary.main', fg: 'secondary.contrastText' }
          : event.going ? { label: `${event.going} coming`, bg: 'primary.main', fg: '#fff' } : null;
  const soon = !past && event.state !== 'cancelled' ? whenFromNow(event.startsAt) : null;
  return (
    <Box
      component={RouterLink}
      to={`/events/${event.slug}`}
      aria-label={`${event.title}, ${event.when}`}
      sx={{
        display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
        bgcolor: 'surface.card', color: 'text.primary', textDecoration: 'none', transition: 'transform .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 }, '&:hover .ev-cta': { gap: 1 },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {event.coverImage ? (
          <SmartImage src={event.coverImage} alt="" ratio="16 / 9" rounded={false} />
        ) : (
          <Box sx={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #1a3550 0%, #25476a 45%, #2e7db5 80%, #38aae1 100%)' }} />
        )}
        <DateTile date={event.startDate} sx={{ position: 'absolute', left: 14, bottom: -22 }} />
        {urgency && <Chip label={urgency.label} size="small" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 900, bgcolor: urgency.bg, color: urgency.fg }} />}
        {past && <Chip label="Past event" size="small" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }} />}
      </Box>
      <Box sx={{ p: { xs: 2.25, md: 2.5 }, pt: 4, display: 'grid', gap: 0.9, flex: 1, alignContent: 'start' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, lineHeight: 1.4 }}>{event.kindLabel}</Typography>
          {soon && <Typography variant="overline" sx={{ color: 'secondary.dark', fontWeight: 900, lineHeight: 1.4 }}>· {soon}</Typography>}
        </Box>
        <Typography variant="h5" component="h3" sx={{ fontWeight: 900, lineHeight: 1.25 }}>{event.title}</Typography>
        {event.tagline && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{event.tagline}</Typography>}
        <Box sx={{ display: 'grid', gap: 0.5, mt: 0.5 }}>
          {time && (
            <Typography variant="body2" sx={{ display: 'flex', gap: 0.75, alignItems: 'center', fontWeight: 700 }}>
              <ScheduleRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} /> {time}
            </Typography>
          )}
          <Typography variant="body2" sx={{ display: 'flex', gap: 0.75, alignItems: 'center', color: 'text.secondary' }}>
            {event.format === 'online' ? <VideocamRoundedIcon sx={{ fontSize: 18 }} /> : <PlaceRoundedIcon sx={{ fontSize: 18 }} />} {event.where}
          </Typography>
          {event.ages && <Typography variant="body2" sx={{ color: 'text.secondary', pl: 3.25 }}>{event.ages}</Typography>}
        </Box>
        {!past && event.state !== 'cancelled' && (
          <Box className="ev-cta" sx={{ mt: 'auto', pt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.dark', fontWeight: 900, transition: 'gap .15s' }}>
            {reg.open ? (reg.full && reg.waitlist ? 'Join the waiting list' : 'Register free') : 'See the details'} <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
