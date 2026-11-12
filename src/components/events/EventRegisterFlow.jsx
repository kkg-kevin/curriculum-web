import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { publicApi } from '../../services/api.js';
import { downloadCalendar, googleCalendarUrl } from '../../utils/eventCalendar.js';

/**
 * Registering for a general event, in as few steps as possible — the event's page and the
 * website pop-up both use it:
 *   1. contact  name, phone (WhatsApp), email, how many are coming, "keep me posted" (unticked).
 *               Pressing Reserve saves the registration — that's all that's needed.
 *   2. about    optional, taps only: who they are, children's ages, interests, how they heard.
 *               Skipping (or closing the page) loses nothing.
 *   3. done     confirmation, add to calendar, share on WhatsApp, their registration page.
 * `onStep(step)` tells a pop-up which step is showing; `compact` tightens it for the pop-up.
 */
const AGES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const PHONE = /^[+\d][\d\s()-]{7,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Chips({ options, value, onChange, multi = false }) {
  const selected = multi ? value || [] : [value];
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {Object.entries(options).map(([key, label]) => {
        const on = selected.includes(key);
        return (
          <Button key={key} size="small" variant={on ? 'contained' : 'outlined'} aria-pressed={on}
            onClick={() => onChange(multi ? (on ? selected.filter((k) => k !== key) : [...selected, key]) : on ? null : key)}
            sx={{ borderRadius: 999, minHeight: 40, px: 1.75, fontWeight: 700, textTransform: 'none' }}>
            {label}
          </Button>
        );
      })}
    </Box>
  );
}

/** The optional "about you" — taps only (the event page, the pop-up, the registration page). */
export function AboutYouFields({ questions, value: about, onChange: setAbout }) {
  return (
    <>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>I am…</Typography>
          <Chips options={questions.personTypes} value={about.personType} onChange={(v) => setAbout({ ...about, personType: v })} />
        </Box>
        {about.personType === 'school' && <TextField label="Which school?" value={about.organisation} onChange={(e) => setAbout({ ...about, organisation: e.target.value })} />}
        {about.personType !== 'school' && about.personType !== 'student' && (
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Children&rsquo;s ages <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>(tap each)</Box></Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {AGES.map((a) => {
                const on = about.childrenAges.includes(a);
                return (
                  <Button key={a} size="small" variant={on ? 'contained' : 'outlined'} aria-pressed={on}
                    onClick={() => setAbout({ ...about, childrenAges: on ? about.childrenAges.filter((x) => x !== a) : [...about.childrenAges, a] })}
                    sx={{ minWidth: 44, minHeight: 40, borderRadius: 999, fontWeight: 700 }}>{a}</Button>
                );
              })}
            </Box>
          </Box>
        )}
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>Interested in</Typography>
          <Chips multi options={questions.interests} value={about.interests} onChange={(v) => setAbout({ ...about, interests: v })} />
        </Box>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>How did you hear about it?</Typography>
          <Chips options={questions.heardFrom} value={about.heardFrom} onChange={(v) => setAbout({ ...about, heardFrom: v })} />
        </Box>
    </>
  );
}

export default function EventRegisterFlow({ event, source = 'page', compact = false, onStep, onClose }) {
  const qc = useQueryClient();
  const [step, setStepState] = useState('contact');
  const [form, setForm] = useState({ name: '', phone: '', email: '', partySize: 1, marketingConsent: false, hp_field: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const [result, setResult] = useState(null);
  const [about, setAbout] = useState({ personType: null, organisation: '', childrenAges: [], interests: [], heardFrom: null });
  const reg = event.registration;
  const max = reg?.maxPartySize || 5;
  const setStep = (s) => { setStepState(s); onStep?.(s); };
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (!PHONE.test(form.phone.trim())) next.phone = 'Enter your phone number';
    if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setProblem(null);
    try {
      const res = await publicApi.registerForEvent(event.slug, {
        name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), partySize: form.partySize,
        marketingConsent: form.marketingConsent, fromPopup: source === 'popup', hp_field: form.hp_field || undefined,
      });
      setResult(res);
      qc.invalidateQueries({ queryKey: ['public-event', event.slug] });
      try { window.localStorage.setItem(`events.registered.${event.id}`, '1'); } catch { /* storage blocked */ }
      setStep(res.already || !res.registration || !event.askAboutYou ? 'done' : 'about');
    } catch (err) {
      setProblem(err?.message || 'We couldn’t save that. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveAbout = async () => {
    setBusy(true);
    try {
      await publicApi.saveEventDetails(result.registration.token, { ...about, organisation: about.organisation || null });
    } catch { /* optional — never blocks */ }
    setBusy(false);
    setStep('done');
  };

  if (step === 'about') {
    return (
      <Box sx={{ display: 'grid', gap: 2.25 }}>
        <Typography sx={{ color: 'text.secondary' }}>Your place is saved. A few taps help us make it great for you — or skip.</Typography>
        <AboutYouFields questions={event.questions} value={about} onChange={setAbout} />
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button variant="outlined" size="large" onClick={() => setStep('done')}>Skip</Button>
          <Button variant="contained" size="large" onClick={saveAbout} disabled={busy}>{busy ? 'Saving…' : 'Done'}</Button>
        </Box>
      </Box>
    );
  }

  if (step === 'done') {
    const already = result?.already;
    const waiting = (result?.registration?.status || result?.status) === 'waitlisted';
    const shareText = `I'm going to ${event.title} (${event.when}) — it's free, come too: ${typeof window !== 'undefined' ? `${window.location.origin}/events/${event.slug}` : ''}`;
    return (
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          {waiting ? <HourglassTopRoundedIcon color="warning" sx={{ fontSize: 40 }} /> : <CheckCircleRoundedIcon color="success" sx={{ fontSize: 40 }} />}
          <Box>
            <Typography variant="h5" component="p" sx={{ fontWeight: 800 }}>
              {already ? 'You’re already registered' : waiting ? 'You’re on the waiting list' : 'You’re in — see you there!'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
              {already
                ? 'That email is already registered for this event — we’ve emailed the details to it again.'
                : waiting
                  ? 'It’s full right now. If a place frees up it’s yours in turn — we’ll email you straight away.'
                  : `We’ve emailed your confirmation to ${form.email.trim()}, and we’ll remind you before the day.`}
            </Typography>
          </Box>
        </Box>
        {!waiting && !already && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<EventRoundedIcon />} onClick={() => downloadCalendar(event, { url: typeof window !== 'undefined' ? `${window.location.origin}/events/${event.slug}` : undefined })}>Add to calendar</Button>
            <Button variant="outlined" href={googleCalendarUrl(event)} target="_blank" rel="noopener">Google Calendar</Button>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button variant="contained" color="success" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener">Invite a friend on WhatsApp</Button>
          {result?.registration?.token && (
            <Button variant="outlined" component={RouterLink} to={`/events/registration/${result.registration.token}`} onClick={onClose}>My registration</Button>
          )}
          {onClose && <Button onClick={onClose}>Close</Button>}
        </Box>
      </Box>
    );
  }

  if (!reg?.open) {
    return <Alert severity="info">{reg?.reason || 'Registration is closed.'}</Alert>;
  }

  return (
    <Box component="form" noValidate onSubmit={submit} sx={{ display: 'grid', gap: compact ? 1.5 : 2, position: 'relative' }}>
      {/* Only a bot fills this. */}
      <Box aria-hidden="true" sx={{ position: 'absolute', left: '-9999px', top: 0, width: 1, height: 1, overflow: 'hidden' }}>
        <input tabIndex={-1} name="hp_field" value={form.hp_field} onChange={set('hp_field')} autoComplete="off" readOnly onFocus={(e) => { e.target.readOnly = false; }} />
      </Box>
      <TextField label="Your name" value={form.name} onChange={set('name')} required autoComplete="name" error={Boolean(errors.name)} helperText={errors.name} size={compact ? 'small' : 'medium'} />
      <Box sx={{ display: 'grid', gap: compact ? 1.5 : 2, gridTemplateColumns: { xs: '1fr', sm: compact ? '1fr 1fr' : '1fr' } }}>
        <TextField label="Phone (WhatsApp)" value={form.phone} onChange={set('phone')} required autoComplete="tel" inputMode="tel" placeholder="0712 345 678" error={Boolean(errors.phone)} helperText={errors.phone} size={compact ? 'small' : 'medium'} />
        <TextField label="Email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" error={Boolean(errors.email)} helperText={errors.email || (compact ? undefined : 'Your confirmation goes here')} size={compact ? 'small' : 'medium'} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700 }}>How many of you are coming?</Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="Fewer people" onClick={() => setForm((f) => ({ ...f, partySize: Math.max(1, f.partySize - 1) }))} disabled={form.partySize <= 1} sx={{ border: '1px solid', borderColor: 'divider' }}><RemoveRoundedIcon /></IconButton>
          <Typography aria-live="polite" sx={{ minWidth: 32, textAlign: 'center', fontSize: 20, fontWeight: 800 }}>{form.partySize}</Typography>
          <IconButton aria-label="More people" onClick={() => setForm((f) => ({ ...f, partySize: Math.min(max, f.partySize + 1) }))} disabled={form.partySize >= max} sx={{ border: '1px solid', borderColor: 'divider' }}><AddRoundedIcon /></IconButton>
        </Box>
      </Box>
      <FormControlLabel
        control={<Checkbox checked={form.marketingConsent} onChange={set('marketingConsent')} />}
        label={<Typography variant="body2">Keep me posted about Digifunzi programmes and events</Typography>}
        sx={{ alignItems: 'flex-start', '& .MuiCheckbox-root': { pt: 0.5 } }}
      />
      {problem && <Alert severity="error">{problem}</Alert>}
      <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ minHeight: 50, fontWeight: 800 }}>
        {busy ? 'Saving…' : reg.full && reg.waitlist ? 'Join the waiting list' : form.partySize > 1 ? `Reserve ${form.partySize} places — free` : 'Reserve my place — free'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        We use your details for this event{form.marketingConsent ? ' and to tell you about our programmes' : ''}. See our{' '}
        <RouterLink to="/privacy" target="_blank">Privacy Policy</RouterLink>.
      </Typography>
    </Box>
  );
}
