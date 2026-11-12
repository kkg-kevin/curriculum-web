import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import EventRegisterFlow from './EventRegisterFlow.jsx';
import { useEventPopup } from '../../hooks/usePublicEvents.js';
import { resolveMediaUrl } from '../../utils/media.js';

/**
 * The website's event pop-up and the slim bar that stays after it (server: GET
 * /api/public/events-popup — the soonest event the team has a pop-up on today).
 *
 * Polite by design: never on a page where someone is signing up, paying or doing a diagnostic
 * (or on the events pages, which have the form anyway); it opens after a few seconds or once
 * they've scrolled a third of the page, at most once a visit, and not again for 3 days after
 * "Not now" — never again once they've registered. Phones get a sheet from the bottom, not a
 * full-screen box (search engines penalise those). After that, `EventBar` keeps a one-line
 * reminder at the top until they close it for the visit.
 */
const QUIET_PATHS = [/^\/enroll/, /^\/checkout/, /^\/cart/, /^\/pay\//, /\/diagnostic/, /\/signup/, /\/join$/, /\/enroll$/, /^\/events(\/|$)/, /^\/affiliate/, /^\/become-an-affiliate/, /^\/get-started/];
const AFTER_MS = 8000;
const HIDE_DAYS = 3;
const shownKey = 'events.popup.shown';
const dismissedKey = (id) => `events.popup.dismissed.${id}`;
const registeredKey = (id) => `events.registered.${id}`;
const barKey = (id) => `events.bar.closed.${id}`;

const read = (store, key) => { try { return window[store].getItem(key); } catch { return null; } };
const write = (store, key, value) => { try { window[store].setItem(key, value); } catch { /* storage blocked */ } };
const quiet = (path) => QUIET_PATHS.some((re) => re.test(path));
const putOff = (id) => {
  const at = Number(read('localStorage', dismissedKey(id)) || 0);
  return at && Date.now() - at < HIDE_DAYS * 86400000;
};

// Shared by the pop-up and the bar: the event, once the page has settled.
function usePopupEvent() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(t);
  }, []);
  const { data } = useEventPopup({ enabled: ready });
  return data && data.registration?.open ? data : null;
}

function Facts({ event }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center', fontWeight: 700 }}>
        <CalendarMonthRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} /> {event.when}
      </Typography>
      <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary' }}>
        {event.format === 'online' ? <VideocamRoundedIcon sx={{ fontSize: 20 }} /> : <PlaceRoundedIcon sx={{ fontSize: 20 }} />} {event.where}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: event.registration.full ? 'warning.dark' : 'success.dark' }}>
        Free{event.registration.seatsLeft != null && !event.registration.full ? ` · only ${event.registration.seatsLeft} ${event.registration.seatsLeft === 1 ? 'place' : 'places'} left` : ''}{event.registration.full ? ' · full — join the waiting list' : ''}
      </Typography>
    </Box>
  );
}

export function EventPopup() {
  const { pathname } = useLocation();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const event = usePopupEvent();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('contact');
  const eligible = useMemo(() => Boolean(event)
    && !quiet(pathname)
    && read('sessionStorage', shownKey) !== event.id
    && !read('localStorage', registeredKey(event.id))
    && !putOff(event.id), [event, pathname]);

  useEffect(() => {
    if (!eligible || open) return undefined;
    let done = false;
    const show = () => {
      if (done || quiet(window.location.pathname)) return;
      done = true;
      write('sessionStorage', shownKey, event.id);
      setOpen(true);
    };
    const timer = window.setTimeout(show, AFTER_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.33) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [eligible, open, event]);

  if (!event) return null;
  const close = () => {
    if (step === 'contact') write('localStorage', dismissedKey(event.id), String(Date.now()));
    setOpen(false);
    window.dispatchEvent(new window.Event('event-popup-closed'));
  };

  const body = (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{
        position: 'relative', color: '#fff', p: { xs: 2.5, sm: 3 }, pt: { xs: 5, sm: 6 }, minHeight: step === 'contact' ? { xs: 150, sm: 190 } : 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 0.75,
        background: event.coverImage
          ? `linear-gradient(180deg, rgba(26,53,80,0.25) 0%, rgba(26,53,80,0.92) 100%), center / cover no-repeat url(${resolveMediaUrl(event.coverImage)})`
          : 'linear-gradient(135deg, #1a3550 0%, #25476a 40%, #2e7db5 75%, #38aae1 100%)',
      }}>
        <IconButton onClick={close} aria-label="Close" sx={{ position: 'absolute', top: 10, right: 10, color: '#fff', bgcolor: 'rgba(255,255,255,0.18)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <CloseRoundedIcon />
        </IconButton>
        <Typography variant="overline" sx={{ color: '#feb139', fontWeight: 800, lineHeight: 1.3 }}>You&rsquo;re invited · {event.kindLabel}</Typography>
        <Typography id="event-popup-title" variant="h4" component="h2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{event.title}</Typography>
        {step === 'contact' && event.tagline && <Typography sx={{ opacity: 0.9 }}>{event.tagline}</Typography>}
      </Box>
      <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'grid', gap: 2.25 }}>
        {step === 'contact' && <Facts event={event} />}
        <EventRegisterFlow event={event} source="popup" compact onStep={setStep} onClose={close} />
        {step === 'contact' && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={close} color="inherit">Not now</Button>
            <Button component={RouterLink} to={`/events/${event.slug}`} onClick={() => setOpen(false)}>
              More about it{event.others > 0 ? ` · ${event.others} more ${event.others === 1 ? 'event' : 'events'}` : ''}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  return phone ? (
    <Drawer anchor="bottom" open={open} onClose={close} PaperProps={{ sx: { borderRadius: '20px 20px 0 0', maxHeight: '92dvh' } }} aria-labelledby="event-popup-title">
      {body}
    </Drawer>
  ) : (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }} aria-labelledby="event-popup-title">
      {body}
    </Dialog>
  );
}

/** One line at the top of every page while there's an event to come to — closable for the visit. */
export function EventBar() {
  const { pathname } = useLocation();
  const event = usePopupEvent();
  const [closedNow, setClosedNow] = useState(false);
  if (!event || closedNow || /^\/events(\/|$)/.test(pathname) || quiet(pathname)) return null;
  if (read('localStorage', registeredKey(event.id)) || read('sessionStorage', barKey(event.id))) return null;
  const close = () => { write('sessionStorage', barKey(event.id), '1'); setClosedNow(true); };
  return (
    <Box role="region" aria-label="Upcoming event" sx={{ bgcolor: '#25476a', color: '#fff', px: { xs: 1.5, sm: 3 }, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25, fontSize: 14 }}>
      <CampaignRoundedIcon sx={{ fontSize: 20, color: '#feb139', flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      <Box component={RouterLink} to={`/events/${event.slug}`} sx={{ color: 'inherit', textDecoration: 'none', minWidth: 0, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box component="span" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</Box>
        <Box component="span" sx={{ opacity: 0.85, display: { xs: 'none', md: 'inline' } }}>· {event.when}</Box>
        <Box component="span" sx={{ fontWeight: 800, color: '#25476a', bgcolor: '#feb139', px: 1.25, py: 0.25, borderRadius: 999, whiteSpace: 'nowrap' }}>Register free</Box>
      </Box>
      <IconButton size="small" onClick={close} aria-label="Hide for now" sx={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0 }}><CloseRoundedIcon fontSize="small" /></IconButton>
    </Box>
  );
}
