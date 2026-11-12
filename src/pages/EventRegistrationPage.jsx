import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import { LoadingBlock, ErrorBlock } from '../components/common/StateViews.jsx';
import { AboutYouFields } from '../components/events/EventRegisterFlow.jsx';
import { useEventRegistration } from '../hooks/usePublicEvents.js';
import { publicApi } from '../services/api.js';
import { downloadCalendar, googleCalendarUrl } from '../utils/eventCalendar.js';

/**
 * A person's own registration (`/events/registration/:token` — the link in every email about it):
 * the event, their place, add to calendar, the join link on the day before (online events), the
 * optional "about you", and cancelling. Not indexed; the token is the only key.
 */
const STATUS = { registered: ['You have a place', 'success'], waitlisted: ['On the waiting list', 'warning'], cancelled: ['Cancelled', 'default'] };

export default function EventRegistrationPage() {
  const { token } = useParams();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useEventRegistration(token);
  const [about, setAbout] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirming, setConfirming] = useState(false);

  if (isLoading) return <LoadingBlock label="Loading your registration…" />;
  if (isError || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <SeoHead title="Your registration" noindex />
        <ErrorBlock error={{ message: error?.status === 404 ? 'We couldn’t find that registration. Check the link in your email.' : error?.message }} />
        <Box sx={{ textAlign: 'center', mt: 2 }}><Button component={RouterLink} to="/events" variant="outlined">See our events</Button></Box>
      </Container>
    );
  }

  const { registration: reg, event } = data;
  const [label, tone] = STATUS[reg.status] || STATUS.registered;
  const live = reg.status !== 'cancelled' && ['upcoming', 'on_now'].includes(event.state);
  const form = about || { personType: reg.personType, organisation: reg.organisation || '', childrenAges: reg.childrenAges || [], interests: reg.interests || [], heardFrom: reg.heardFrom };
  const refresh = () => qc.invalidateQueries({ queryKey: ['public-event-registration', token] });

  const saveAbout = async () => {
    setBusy(true);
    try {
      await publicApi.saveEventDetails(token, { ...form, organisation: form.organisation || null });
      setMessage({ severity: 'success', text: 'Thanks — saved.' });
      setAbout(null);
      refresh();
    } catch (err) {
      setMessage({ severity: 'error', text: err?.message || 'Couldn’t save. Please try again.' });
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    setConfirming(false);
    setBusy(true);
    try {
      await publicApi.cancelEventRegistration(token);
      setMessage({ severity: 'info', text: 'Your registration is cancelled. Thanks for letting us know.' });
      refresh();
    } catch (err) {
      setMessage({ severity: 'error', text: err?.message || 'Couldn’t cancel. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <SeoHead title="Your registration" noindex />
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800 }}>Your registration</Typography>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800 }}>{event.title}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Chip label={label} color={tone} sx={{ fontWeight: 800 }} />
            {event.state === 'cancelled' && <Chip label="Event cancelled" color="error" sx={{ fontWeight: 800 }} />}
          </Box>
        </Box>

        {message && <Alert severity={message.severity} onClose={() => setMessage(null)}>{message.text}</Alert>}
        {event.state === 'cancelled' && <Alert severity="warning">This event has been cancelled{event.cancelReason ? `: ${event.cancelReason}` : '.'}</Alert>}

        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card', display: 'grid', gap: 1.5 }}>
          <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center', fontWeight: 700 }}><CalendarMonthRoundedIcon color="primary" /> {event.when}</Typography>
          <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{event.format === 'online' ? <VideocamRoundedIcon color="primary" /> : <PlaceRoundedIcon color="primary" />} {event.where}</Typography>
          <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><GroupsRoundedIcon color="primary" /> {reg.partySize} {reg.partySize === 1 ? 'person' : 'people'} · {reg.name}</Typography>
          {event.meetingLink && <Button variant="contained" href={event.meetingLink} target="_blank" rel="noopener" sx={{ justifySelf: 'start' }}>Join online</Button>}
          {live && reg.status === 'registered' && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              <Button variant="outlined" onClick={() => downloadCalendar(event, { url: `${window.location.origin}/events/${event.slug}` })}>Add to calendar</Button>
              <Button variant="outlined" href={googleCalendarUrl(event)} target="_blank" rel="noopener">Google Calendar</Button>
              {event.mapUrl && event.format !== 'online' && <Button variant="outlined" href={event.mapUrl} target="_blank" rel="noopener">Directions</Button>}
            </Box>
          )}
        </Box>

        {live && event.askAboutYou && (
          <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card', display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>{reg.detailsDone ? 'About you' : 'Tell us a little about you (optional)'}</Typography>
              <Typography variant="body2" color="text.secondary">Helps us make the day great for you. All taps.</Typography>
            </Box>
            <AboutYouFields questions={event.questions} value={form} onChange={setAbout} />
            <Box><Button variant="contained" onClick={saveAbout} disabled={busy || !about}>{busy ? 'Saving…' : 'Save'}</Button></Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button component={RouterLink} to={`/events/${event.slug}`} variant="text">Event page</Button>
          {live && !confirming && <Button color="error" variant="outlined" onClick={() => setConfirming(true)} disabled={busy}>Cancel my registration</Button>}
          {live && confirming && (
            <Alert severity="warning" sx={{ width: '100%' }} action={(
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={() => setConfirming(false)}>Keep my place</Button>
                <Button size="small" color="error" variant="contained" onClick={cancel}>Yes, cancel</Button>
              </Box>
            )}>
              Cancel your registration? Your place goes to the next person waiting.
            </Alert>
          )}
        </Box>
      </Box>
    </Container>
  );
}
