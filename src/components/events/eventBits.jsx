import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import GlobalStyles from '@mui/material/GlobalStyles';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import { publicApi } from '../../services/api.js';

/**
 * The small pieces the Events pages share (EventsPage, EventDetailPage, the pop-up), each aimed at
 * one job on the way to "I'm coming" — and from there to enrolling in a programme.
 */

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });

/** The big date block: SAT / 21 / NOV. */
export function DateTile({ date, size = 'md', sx }) {
  if (!date) return null;
  const d = new Date(`${String(date).slice(0, 10)}T12:00:00Z`);
  const big = size === 'lg';
  return (
    <Box
      aria-hidden
      sx={{
        width: big ? 84 : 62, flexShrink: 0, borderRadius: big ? 3 : 2.5, overflow: 'hidden', textAlign: 'center',
        bgcolor: 'background.paper', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', lineHeight: 1, ...sx,
      }}
    >
      <Box sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 900, fontSize: big ? 13 : 11, letterSpacing: '0.08em', py: big ? 0.6 : 0.4, textTransform: 'uppercase' }}>
        {WEEKDAY.format(d)}
      </Box>
      <Box sx={{ color: 'text.primary', fontWeight: 900, fontSize: big ? 36 : 26, pt: big ? 0.75 : 0.5 }}>{d.getUTCDate()}</Box>
      <Box sx={{ color: 'text.secondary', fontWeight: 800, fontSize: big ? 13 : 11, textTransform: 'uppercase', pb: big ? 0.9 : 0.6 }}>{MONTH.format(d)}</Box>
    </Box>
  );
}

/** "Today", "Tomorrow", "In 9 days" from the event's start. */
export function whenFromNow(startsAt, now = Date.now()) {
  if (!startsAt) return null;
  const start = new Date(startsAt).getTime();
  const kenyaDay = (t) => new Date(t + 3 * 3600 * 1000).toISOString().slice(0, 10);
  const days = Math.round((new Date(`${kenyaDay(start)}T00:00:00Z`) - new Date(`${kenyaDay(now)}T00:00:00Z`)) / 86400000);
  if (start <= now) return 'On now';
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** A live countdown: days · hours · minutes (only while it's under 60 days away). */
export function Countdown({ startsAt, onDark = false, sx }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);
  if (!startsAt) return null;
  const ms = new Date(startsAt).getTime() - now;
  if (ms <= 0 || ms > 60 * 86400000) return null;
  const parts = [
    [Math.floor(ms / 86400000), 'days'],
    [Math.floor((ms % 86400000) / 3600000), 'hours'],
    [Math.floor((ms % 3600000) / 60000), 'mins'],
  ];
  return (
    <Box role="timer" aria-label={`Starts ${whenFromNow(startsAt, now)}`} sx={{ display: 'flex', gap: 1, ...sx }}>
      {parts.map(([n, label]) => (
        <Box key={label} sx={{ minWidth: 58, textAlign: 'center', px: 1, py: 0.75, borderRadius: 2, bgcolor: onDark ? 'rgba(255,255,255,0.12)' : 'action.hover', border: '1px solid', borderColor: onDark ? 'rgba(255,255,255,0.22)' : 'divider' }}>
          <Typography sx={{ fontWeight: 900, fontSize: 22, lineHeight: 1.1, color: onDark ? '#fff' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '0')}</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: onDark ? 'rgba(255,255,255,0.75)' : 'text.secondary' }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/** Why say yes now: places left, people going, the ages it's for, free. */
export function ProofChips({ event, onDark = false, sx }) {
  const reg = event.registration || {};
  const chips = [];
  if (event.free) chips.push({ key: 'free', label: 'Free', icon: <CheckRoundedIcon />, tone: 'success' });
  if (reg.open && reg.full && reg.waitlist) chips.push({ key: 'full', label: 'Full — join the waiting list', icon: <LocalFireDepartmentRoundedIcon />, tone: 'warning' });
  else if (reg.open && reg.seatsLeft != null) chips.push({ key: 'left', label: `Only ${reg.seatsLeft} ${reg.seatsLeft === 1 ? 'place' : 'places'} left`, icon: <LocalFireDepartmentRoundedIcon />, tone: 'warning' });
  if (event.going) chips.push({ key: 'going', label: `${event.going} people coming`, icon: <GroupsRoundedIcon />, tone: 'info' });
  if (event.ages) chips.push({ key: 'ages', label: event.ages, icon: <ChildCareRoundedIcon />, tone: 'neutral' });
  if (!chips.length) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ...sx }}>
      {chips.map((c) => (
        <Chip
          key={c.key} icon={c.icon} label={c.label} size="small"
          sx={{
            fontWeight: 800, height: 30, '& .MuiChip-icon': { fontSize: 17 },
            ...(onDark
              ? { bgcolor: c.tone === 'warning' ? 'secondary.main' : 'rgba(255,255,255,0.16)', color: c.tone === 'warning' ? 'secondary.contrastText' : '#fff', '& .MuiChip-icon': { color: 'inherit', fontSize: 17 } }
              : c.tone === 'warning' ? { bgcolor: 'secondary.light', color: 'secondary.contrastText' }
                : c.tone === 'success' ? { bgcolor: 'success.main', color: '#fff', '& .MuiChip-icon': { color: '#fff', fontSize: 17 } }
                  : c.tone === 'info' ? { bgcolor: 'primary.main', color: '#fff', '& .MuiChip-icon': { color: '#fff', fontSize: 17 } } : {}),
          }}
        />
      ))}
    </Box>
  );
}

/** Share before (and after) registering — families bring families. */
export function ShareRow({ event, compact = false, sx }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/events/${event.slug}` : `/events/${event.slug}`;
  const text = `${event.title} — ${event.when}. It's free: ${url}`;
  const copy = async () => {
    try { await window.navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ }
  };
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', ...sx }}>
      {!compact && <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>Bring a friend:</Typography>}
      <Button size="small" variant="outlined" startIcon={<WhatsAppIcon />} href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">WhatsApp</Button>
      <Button size="small" variant="outlined" startIcon={copied ? <CheckRoundedIcon /> : <LinkRoundedIcon />} onClick={copy}>{copied ? 'Link copied' : 'Copy link'}</Button>
    </Box>
  );
}

/** Why come to a Digifunzi event — for the Events page (the event page has its own "What to expect"). */
export const WHY_COME = [
  { title: 'See it for real', text: 'Learners show the games, robots and apps they built — and let your child try them.' },
  { title: 'Meet the mentors', text: 'Talk to the people who would teach your child, and ask them anything.' },
  { title: 'Find the right fit', text: 'Leave knowing which bootcamp, club or pathway suits your child’s age and interests.' },
  { title: 'Free for the family', text: 'Bring the children, grandparents and friends — register once for everyone.' },
];

export const EVENT_FAQS = [
  { q: 'Do I have to pay?', a: 'No. Our events are free. We ask you to register so we can keep a place for you and plan for everyone coming.' },
  { q: 'Can I bring my children and other family members?', a: 'Yes — please do. When you register, tell us how many of you are coming (up to the number shown on the form).' },
  { q: 'My child hasn’t done any coding. Is that a problem?', a: 'Not at all. Events are made for families who are curious — no experience needed. It’s a great way to see where your child could start.' },
  { q: 'What if I can’t make it any more?', a: 'Use the link in your confirmation email to cancel, so someone on the waiting list can have your place. You can register again any time while places last.' },
  { q: 'Will you call me afterwards?', a: 'Only if you ask us to. You’ll get your confirmation and a reminder before the day. If you tick “keep me posted”, we’ll tell you about programmes and future events.' },
];

/** "Tell me about the next event" — an enquiry, so nobody who's interested is lost. */
export function NotifyMe({ title = 'Tell me about the next event', lead = 'Leave your details and we’ll let you know as soon as the next showcase or open day is announced.', sx }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [state, setState] = useState({ busy: false, done: false, error: null });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) || form.phone.replace(/\D/g, '').length < 9) {
      setState({ busy: false, done: false, error: 'Add your name, phone and email so we can reach you.' });
      return;
    }
    setState({ busy: true, done: false, error: null });
    try {
      await publicApi.submitLead({ parentName: form.name.trim(), parentEmail: form.email.trim(), parentPhone: form.phone.trim(), interestedIn: 'general', note: 'Wants to hear about upcoming events (Events page).' });
      setState({ busy: false, done: true, error: null });
    } catch (err) {
      setState({ busy: false, done: false, error: err?.message || 'That didn’t go through — please try again.' });
    }
  };
  return (
    <Box sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card', display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, alignItems: 'center', ...sx }}>
      <Box>
        <NotificationsActiveRoundedIcon color="secondary" sx={{ fontSize: 34, mb: 1 }} />
        <Typography variant="h4" component="h2" sx={{ fontWeight: 900, mb: 1 }}>{title}</Typography>
        <Typography sx={{ color: 'text.secondary' }}>{lead}</Typography>
      </Box>
      {state.done ? (
        <Alert severity="success" sx={{ fontWeight: 600 }}>Thanks, {form.name.trim().split(/\s+/)[0]} — you&rsquo;ll be the first to know.</Alert>
      ) : (
        <Box component="form" noValidate onSubmit={submit} sx={{ display: 'grid', gap: 1.5 }}>
          <TextField label="Your name" value={form.name} onChange={set('name')} autoComplete="name" />
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="Phone (WhatsApp)" value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="0712 345 678" />
            <TextField label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </Box>
          {state.error && <Alert severity="warning">{state.error}</Alert>}
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={state.busy} sx={{ fontWeight: 800 }}>{state.busy ? 'Saving…' : 'Notify me'}</Button>
        </Box>
      )}
    </Box>
  );
}

const PROGRAMMES = {
  bootcamps: { title: 'Holiday bootcamps', text: 'A week or two of building games, robots and apps.', to: '/bootcamps', icon: RocketLaunchRoundedIcon },
  home_learning: { title: 'Home Schooling', text: 'A Digifunzi educator at home, at your pace.', to: '/home-schooling', icon: HomeRoundedIcon },
  tech_clubs: { title: 'Estate Tech Clubs', text: 'Weekly coding and robotics near home.', to: '/estate-tech-clubs', icon: MemoryRoundedIcon },
  pathways: { title: 'Learning pathways', text: 'A step-by-step journey by age, online or at a hub.', to: '/pathways', icon: RouteRoundedIcon },
};

/**
 * Where to go from here — the programmes a child could join, the event's own bootcamp first and
 * then what the family said interested them. `interests` are the "about you" keys.
 */
export function ExplorePrograms({ bootcamp = null, interests = [], title = 'What your child could join', lead = null, limit = 4, sx }) {
  const order = [...new Set([...(interests || []).filter((k) => PROGRAMMES[k]), 'bootcamps', 'pathways', 'tech_clubs', 'home_learning'])];
  const cards = order.map((k) => ({ key: k, ...PROGRAMMES[k] })).slice(0, Math.max(1, limit - (bootcamp ? 1 : 0)));
  return (
    <Box sx={sx}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 900, mb: lead ? 0.75 : 2 }}>{title}</Typography>
      {lead && <Typography sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 640 }}>{lead}</Typography>}
      {bootcamp && (
        <Box component={RouterLink} to={`/bootcamps/${bootcamp.slug}`} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, mb: 1.5, borderRadius: 3, textDecoration: 'none', color: 'inherit', border: '2px solid', borderColor: 'secondary.main', bgcolor: 'surface.card', '&:hover': { boxShadow: 4 } }}>
          <RocketLaunchRoundedIcon color="secondary" sx={{ fontSize: 34, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'secondary.dark', fontWeight: 900, lineHeight: 1.4 }}>The bootcamp behind this showcase</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: 17 }}>{bootcamp.name}</Typography>
            <Typography variant="body2" color="text.secondary">See what&rsquo;s next and save a place for your child.</Typography>
          </Box>
          <ArrowForwardRoundedIcon color="secondary" />
        </Box>
      )}
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
        {cards.map(({ key, title: t, text, to, icon: Icon }) => (
          <Box key={key} component={RouterLink} to={to} sx={{ display: 'grid', gap: 0.75, alignContent: 'start', p: 2, borderRadius: 3, textDecoration: 'none', color: 'inherit', border: '1px solid', borderColor: (interests || []).includes(key) ? 'primary.main' : 'divider', bgcolor: 'surface.card', transition: 'transform .15s, box-shadow .15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
            <Icon color="primary" sx={{ fontSize: 28 }} />
            <Typography sx={{ fontWeight: 900 }}>{t}{(interests || []).includes(key) && <Chip label="You asked about this" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: 11, fontWeight: 800 }} />}</Typography>
            <Typography variant="body2" color="text.secondary">{text}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>Explore <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} /></Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Phones and tablets: "Free · 12 places left — Reserve" at the bottom of the screen, scrolling to
 * the form — and out of the way while the form itself is on screen.
 */
export function RegisterBar({ event, targetId = 'register' }) {
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetId]);
  const reg = event.registration || {};
  if (!reg.open) return null;
  const note = [reg.full && reg.waitlist ? 'Full — waiting list open' : reg.seatsLeft != null ? `Only ${reg.seatsLeft} places left` : null, whenFromNow(event.startsAt)].filter(Boolean).join(' · ');
  return (
    <>
      <GlobalStyles styles={(t) => ({ [t.breakpoints.down('lg')]: { ':root': { '--floating-bottom-offset': formVisible ? '0px' : '76px' } } })} />
      <Box aria-hidden sx={{ display: { xs: 'block', lg: 'none' }, height: 84 }} />
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar - 1,
          px: 2, pt: 1.25, pb: 'calc(10px + env(safe-area-inset-bottom, 0px))', alignItems: 'center', gap: 1.5,
          bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', boxShadow: '0 -6px 20px rgba(0,0,0,0.1)',
          transform: formVisible ? 'translateY(110%)' : 'translateY(0)', transition: 'transform 200ms ease', '@media print': { display: 'none' },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>Free{event.ages ? ` · ${event.ages.replace(/^For /, '')}` : ''}</Typography>
          {note && <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note}</Typography>}
        </Box>
        <Button variant="contained" color="secondary" href={`#${targetId}`} sx={{ flexShrink: 0, fontWeight: 900 }}>
          {reg.full && reg.waitlist ? 'Join the list' : 'Reserve free'}
        </Button>
      </Box>
    </>
  );
}
