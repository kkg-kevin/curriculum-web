import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import DateOfBirthField from '../components/forms/DateOfBirthField.jsx';
import PaymentStep from '../components/payments/PaymentStep.jsx';
import { usePublicCompetition } from '../hooks/usePublicCompetitions.js';
import { publicApi } from '../services/api.js';
import { ageOn, formatDate } from '../utils/dates.js';
import { agesText, entryOptions, teamSizeText } from '../utils/competitions.js';

/**
 * Registering for a competition track (20 Nov 2026) — /competitions/:slug/register?track=<id>.
 *   1. the track (when there's more than one), then Individual or Team — only what the track takes,
 *      each with its fee;
 *   2. the participant, or the team: its name, school and every member (within the track's size);
 *   3. the person registering — a parent for a child, or the teacher / school entering a team —
 *      whose email gets the confirmation and the payment link;
 * then the Payment step for the entry fee (one fee per team), or "you're registered" for a free
 * track. No account is made.
 */

const ROLES = [
  { value: 'parent', label: 'Parent / guardian' },
  { value: 'teacher', label: 'Teacher / coach' },
  { value: 'school', label: 'School' },
  { value: 'participant', label: 'The participant (18 or over)' },
  { value: 'other', label: 'Someone else' },
];
const PHONE = /^[+\d][\d\s()-]{7,}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Fields on the grey member card: white boxes, the helper text left on the card.
const onPaper = { '& .MuiInputBase-root': { bgcolor: 'background.paper' } };
const emptyPerson = () => ({ name: '', dateOfBirth: '', school: '' });

function Panel({ step, title, children }) {
  return (
    <Box component="section" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{step}</Box>
        <Typography variant="h4" component="h2" sx={{ fontSize: '1.15rem' }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}

function Choice({ selected, onClick, icon, title, line, aside }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        textAlign: 'left', cursor: 'pointer', font: 'inherit', p: 2, borderRadius: 2.5, display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 0,
        border: '2px solid', borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: (t) => (selected ? alpha(t.palette.primary.main, 0.06) : t.palette.background.paper),
        color: 'text.primary', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light' },
      }}
    >
      {icon && <Box sx={{ color: selected ? 'primary.main' : 'text.secondary', mt: 0.25 }}>{icon}</Box>}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
        {line && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{line}</Typography>}
      </Box>
      {aside && <Typography sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>{aside}</Typography>}
    </Box>
  );
}

function PersonFields({ person, onChange, index, errors, label, onRemove, ages }) {
  const set = (k) => (e) => onChange({ ...person, [k]: e.target.value });
  return (
    <Box sx={{ display: 'grid', gap: 1.5, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
        {onRemove && <IconButton size="small" aria-label={`Remove ${label}`} onClick={onRemove}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>}
      </Box>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.4fr) minmax(0, 1fr)' } }}>
        <TextField label="Full name" value={person.name} onChange={set('name')} required error={Boolean(errors?.[`p${index}name`])} helperText={errors?.[`p${index}name`]} sx={onPaper} />
        <DateOfBirthField
          label="Date of birth"
          value={person.dateOfBirth}
          registration={{ value: person.dateOfBirth, onChange: set('dateOfBirth') }}
          error={errors?.[`p${index}dob`] ? { message: errors[`p${index}dob`] } : null}
          sx={onPaper}
          required
        />
      </Box>
      <TextField label="School (optional)" value={person.school} onChange={set('school')} sx={onPaper} helperText={ages || ' '} />
    </Box>
  );
}

export default function CompetitionRegisterPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = usePublicCompetition(slug);
  const ownTracks = useMemo(() => (data?.tracks || []).filter((t) => !t.registerUrl && (t.entry?.individual || t.entry?.group)), [data]);

  const [trackId, setTrackId] = useState(params.get('track') || '');
  const [entryType, setEntryType] = useState('');
  const [person, setPerson] = useState(emptyPerson());
  const [team, setTeam] = useState({ teamName: '', organisation: '', members: [] });
  const [contact, setContact] = useState({ contactRole: 'parent', contactName: '', contactEmail: '', contactPhone: '', hp_field: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);

  const track = ownTracks.find((t) => t.id === trackId) || (ownTracks.length === 1 ? ownTracks[0] : null);
  const options = track ? entryOptions(track) : [];
  const type = options.some((o) => o.type === entryType) ? entryType : options.length === 1 ? options[0].type : '';
  const e = track?.entry || {};
  const members = team.members.length ? team.members : Array.from({ length: e.teamMin || 2 }, emptyPerson);
  const fee = options.find((o) => o.type === type)?.fee;
  const ageLine = track ? agesText(track.ageMin, track.ageMax) : '';

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="text" width="60%" height={56} />
        <Skeleton variant="rounded" height={260} sx={{ mt: 3, borderRadius: 3 }} />
      </Container>
    );
  }
  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <SeoHead title="Competition not found" noindex />
        <ErrorBlock error={{ message: error?.status === 404 ? 'This competition doesn’t exist or isn’t running right now.' : error?.message }} onRetry={error?.status === 404 ? undefined : refetch} />
      </Container>
    );
  }

  const back = (
    <Button component={RouterLink} to={`/competitions/${slug}`} startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 2 }}>
      {data.name}
    </Button>
  );

  if (!data.registration?.open || ownTracks.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <SeoHead title={`Register for ${data.name}`} noindex />
        {back}
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>Register for {data.name}</Typography>
        <Alert severity="info">
          {!data.registration?.open
            ? data.registration?.opensOn ? `Registration opens on ${formatDate(data.registration.opensOn)}.` : 'Registration for this competition isn’t open right now.'
            : 'This competition takes registrations on its tracks’ own forms. Use Register now on a track.'}
        </Alert>
      </Container>
    );
  }

  const validate = () => {
    const errs = {};
    if (!track) errs.track = 'Choose a track';
    if (!type) errs.type = 'Choose individual or team';
    const people = type === 'group' ? members : [person];
    if (type === 'group' && !team.teamName.trim()) errs.teamName = 'Give your team a name';
    people.forEach((p, i) => {
      if (p.name.trim().split(/\s+/).length < 2) errs[`p${i}name`] = 'First and last name';
      const age = ageOn(p.dateOfBirth);
      if (!p.dateOfBirth || age === null || age < 0) errs[`p${i}dob`] = 'Enter the date of birth';
      else if (track?.ageMin != null && age < track.ageMin) errs[`p${i}dob`] = `Age ${age}: this track is for ${ageLine.toLowerCase()}`;
      else if (track?.ageMax != null && age > track.ageMax) errs[`p${i}dob`] = `Age ${age}: this track is for ${ageLine.toLowerCase()}`;
    });
    if (contact.contactName.trim().length < 2) errs.contactName = 'Enter your name';
    if (!EMAIL.test(contact.contactEmail.trim())) errs.contactEmail = 'Enter a valid email';
    if (!PHONE.test(contact.contactPhone.trim())) errs.contactPhone = 'Enter a phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const people = type === 'group' ? members : [person];
      const res = await publicApi.registerForCompetition(slug, {
        trackId: track.id,
        entryType: type,
        teamName: type === 'group' ? team.teamName.trim() : '',
        organisation: type === 'group' ? team.organisation.trim() : (person.school || '').trim(),
        participants: people.map((p) => ({ name: p.name.trim(), dateOfBirth: p.dateOfBirth, school: (p.school || team.organisation || '').trim() })),
        contactRole: contact.contactRole,
        contactName: contact.contactName.trim(),
        contactEmail: contact.contactEmail.trim(),
        contactPhone: contact.contactPhone.trim(),
        hp_field: contact.hp_field || undefined,
      });
      setResult(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setServerError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    const free = !result.amountDue;
    return (
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <SeoHead title={`Registered for ${data.name}`} noindex />
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 36, flexShrink: 0 }} />
            <Box>
              <Typography variant="h3" component="h1">
                {free ? 'You’re registered!' : 'Registration received. One step left'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                {result.entryType === 'group' ? `Team ${result.teamName}` : result.participants[0]} · {result.trackName} · {result.competitionName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Registration number <strong>{result.registrationNumber}</strong>. We’ve emailed {contact.contactEmail.trim()} the details
                {free ? '.' : ' and a link to pay later if you’d rather.'}
              </Typography>
            </Box>
          </Box>
        </Box>
        {!free && result.pay && (
          <PaymentStep
            pay={result.pay}
            amountDue={result.amountDue}
            invoiceNumber={result.invoiceNumber}
            defaultPhone={contact.contactPhone.trim()}
            paidMessage="Paid. Your registration is confirmed. We’ve emailed you the details."
            laterNote="Not paying right now? That’s fine. The email we’ve just sent has a link to pay any time in the next 14 days. Your place is confirmed once the fee is paid."
          />
        )}
        <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to={`/competitions/${slug}`} variant="outlined">Back to {data.name}</Button>
          <Button onClick={() => { setResult(null); setPerson(emptyPerson()); setTeam({ teamName: '', organisation: '', members: [] }); }} variant="text">Register another entry</Button>
        </Box>
      </Container>
    );
  }

  const setMember = (i, p) => setTeam((t) => { const next = [...members]; next[i] = p; return { ...t, members: next }; });

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <SeoHead title={`Register for ${data.name}`} noindex />
      {back}
      <Typography variant="h2" component="h1">Register for {data.name}</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 4 }}>
        It takes a few minutes, then you pay the entry fee online.{data.registrationCloseDate ? ` Registration closes on ${formatDate(data.registrationCloseDate)}.` : ''}
      </Typography>

      <Box component="form" noValidate onSubmit={submit} sx={{ display: 'grid', gap: 2.5 }}>
        <Box aria-hidden sx={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
          <input tabIndex={-1} name="hp_field" value={contact.hp_field} onChange={(ev) => setContact({ ...contact, hp_field: ev.target.value })} autoComplete="off" />
        </Box>

        <Panel step={1} title={ownTracks.length > 1 ? 'Track and entry' : 'Entry'}>
          {ownTracks.length > 1 && (
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {ownTracks.map((t) => (
                <Choice key={t.id} selected={track?.id === t.id} onClick={() => { setTrackId(t.id); setEntryType(''); }} title={t.name} line={[...new Set([t.subtitle, agesText(t.ageMin, t.ageMax)].filter(Boolean))].join(' · ')} />
              ))}
              {errors.track && <Typography variant="body2" color="error">{errors.track}</Typography>}
            </Box>
          )}
          {track && (
            <>
              {ownTracks.length === 1 && <Typography sx={{ fontWeight: 800 }}>{track.name}{ageLine ? ` · ${ageLine}` : ''}</Typography>}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>How are you entering?</Typography>
              <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', sm: `repeat(${options.length}, minmax(0, 1fr))` } }}>
                {options.map((o) => (
                  <Choice
                    key={o.type}
                    selected={type === o.type}
                    onClick={() => setEntryType(o.type)}
                    icon={o.type === 'group' ? <GroupsRoundedIcon /> : <PersonRoundedIcon />}
                    title={o.type === 'group' ? 'As a team' : 'On my own / one child'}
                    line={o.detail}
                    aside={o.fee}
                  />
                ))}
              </Box>
              {errors.type && <Typography variant="body2" color="error">{errors.type}</Typography>}
            </>
          )}
        </Panel>

        {track && type === 'individual' && (
          <Panel step={2} title="The participant">
            <PersonFields person={person} onChange={setPerson} index={0} errors={errors} label="Participant" ages={ageLine} />
          </Panel>
        )}

        {track && type === 'group' && (
          <Panel step={2} title="The team">
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
              <TextField label="Team name" value={team.teamName} onChange={(ev) => setTeam({ ...team, teamName: ev.target.value })} required error={Boolean(errors.teamName)} helperText={errors.teamName || ' '} />
              <TextField label="School / organisation (optional)" value={team.organisation} onChange={(ev) => setTeam({ ...team, organisation: ev.target.value })} helperText=" " />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {teamSizeText(e)}{ageLine ? ` · ${ageLine}` : ''}. Add every member. One fee covers the whole team.
            </Typography>
            {members.map((m, i) => (
              <PersonFields
                key={i}
                person={m}
                index={i}
                errors={errors}
                label={`Member ${i + 1}`}
                onChange={(p) => setMember(i, p)}
                onRemove={members.length > (e.teamMin || 2) ? () => setTeam((t) => ({ ...t, members: members.filter((_, j) => j !== i) })) : null}
              />
            ))}
            {members.length < (e.teamMax || 5) && (
              <Button startIcon={<AddRoundedIcon />} onClick={() => setTeam((t) => ({ ...t, members: [...members, emptyPerson()] }))} sx={{ justifySelf: 'start' }}>
                Add a member ({members.length} of up to {e.teamMax || 5})
              </Button>
            )}
          </Panel>
        )}

        {track && type && (
          <Panel step={3} title="Your details">
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: -1 }}>
              The confirmation and the payment link go to this email{type === 'group' ? ', usually the team’s teacher, coach or a parent' : ''}.
            </Typography>
            <TextField select label="You are" value={contact.contactRole} onChange={(ev) => setContact({ ...contact, contactRole: ev.target.value })}>
              {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            <TextField label="Your name" value={contact.contactName} onChange={(ev) => setContact({ ...contact, contactName: ev.target.value })} required autoComplete="name" error={Boolean(errors.contactName)} helperText={errors.contactName} />
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
              <TextField label="Email" type="email" value={contact.contactEmail} onChange={(ev) => setContact({ ...contact, contactEmail: ev.target.value })} required autoComplete="email" error={Boolean(errors.contactEmail)} helperText={errors.contactEmail} />
              <TextField label="Phone (WhatsApp)" value={contact.contactPhone} onChange={(ev) => setContact({ ...contact, contactPhone: ev.target.value })} required autoComplete="tel" inputMode="tel" placeholder="0712 345 678" error={Boolean(errors.contactPhone)} helperText={errors.contactPhone} />
            </Box>
          </Panel>
        )}

        {serverError && <Alert severity="error">{serverError}</Alert>}
        {Object.keys(errors).length > 0 && !serverError && <Alert severity="warning">Check the highlighted details above.</Alert>}

        {track && type && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', p: 2.5, borderRadius: 3, bgcolor: (t) => alpha(t.palette.primary.main, 0.06) }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Entry fee{type === 'group' ? ' (whole team)' : ''}</Typography>
              <Typography variant="h4" component="p">{fee}</Typography>
            </Box>
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? 'Registering…' : fee === 'Free' ? 'Register' : 'Register and pay'}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
