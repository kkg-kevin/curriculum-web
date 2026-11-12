import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import SmartImage from '../common/SmartImage.jsx';

/** A general event's card on /events (and anywhere an event is listed). */
export default function EventCard({ event, past = false }) {
  const reg = event.registration || {};
  const badge = event.state === 'cancelled' ? 'Cancelled'
    : past ? null
      : reg.full ? (reg.waitlist ? 'Full — waiting list' : 'Full')
        : reg.seatsLeft != null ? `${reg.seatsLeft} ${reg.seatsLeft === 1 ? 'place' : 'places'} left`
          : event.free ? 'Free' : null;
  return (
    <Box
      component={RouterLink}
      to={`/events/${event.slug}`}
      sx={{
        display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
        bgcolor: 'surface.card', color: 'text.primary', textDecoration: 'none', transition: 'transform .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {event.coverImage ? (
          <SmartImage src={event.coverImage} alt="" ratio="16 / 9" rounded={false} />
        ) : (
          <Box sx={{ aspectRatio: '16 / 9', background: 'linear-gradient(135deg, #1a3550 0%, #25476a 45%, #2e7db5 80%, #38aae1 100%)' }} />
        )}
        {badge && (
          <Chip label={badge} size="small" sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 800, bgcolor: event.state === 'cancelled' ? 'error.main' : reg.full ? 'warning.main' : 'background.paper', color: event.state === 'cancelled' || reg.full ? '#fff' : 'text.primary' }} />
        )}
      </Box>
      <Box sx={{ p: { xs: 2.25, md: 2.75 }, display: 'grid', gap: 1, flex: 1, alignContent: 'start' }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, lineHeight: 1.4 }}>{event.kindLabel}</Typography>
        <Typography variant="h5" component="h3" sx={{ fontWeight: 800, lineHeight: 1.3 }}>{event.title}</Typography>
        {event.tagline && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{event.tagline}</Typography>}
        <Box sx={{ display: 'grid', gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ display: 'flex', gap: 0.75, alignItems: 'center', fontWeight: 600 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} /> {event.when}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', gap: 0.75, alignItems: 'center', color: 'text.secondary' }}>
            {event.format === 'online' ? <VideocamRoundedIcon sx={{ fontSize: 18 }} /> : <PlaceRoundedIcon sx={{ fontSize: 18 }} />} {event.where}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
