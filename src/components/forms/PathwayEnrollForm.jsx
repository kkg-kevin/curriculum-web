import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { bootcampEnrollmentSchema } from './schemas.js';
import { publicApi } from '../../services/api.js';
import PaymentStep from '../payments/PaymentStep.jsx';
import FormStatus from './FormStatus.jsx';
import PrivacyNote from './PrivacyNote.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';
import DateOfBirthField from './DateOfBirthField.jsx';
import PasswordField from './PasswordField.jsx';
import { CopyableField, ParentSignIn } from './BootcampEnrollForm.jsx';
import { ageOn } from '../../utils/dates.js';
import { formatKsh } from '../../cart/format.js';
import { priceLabel, startFor } from '../../utils/pathwayPrice.js';
import { APP_URL } from '../../config/env.js';
import useScrollToFlowTop from '../../hooks/useScrollToFlowTop.js';

const STEPS = ['Choose a hub', 'Your details', 'Payment'];
const MAX_CHILDREN = 6;
const emptyChild = (name = '', dateOfBirth = '') => ({ learnerName: name, learnerDateOfBirth: dateOfBirth, username: '', password: '', confirmPassword: '' });
const box = { p: { xs: 2.5, md: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.subtle' };
const hubLine = (hub) => [hub.town, hub.deliveryMode !== 'in_person' ? hub.deliveryLabel : null].filter(Boolean).join(' · ') || hub.deliveryLabel;

/**
 * Paid enrolment for a priced pathway that runs at chosen hubs (both set in the curriculum system —
 * Settings → Pathways → On the website) → POST /api/public/pathway-enrollments. Choose a hub →
 * your details (the parent once — or "Sign in" — and one block per child, each with their own
 * login, "+ Add another child") → Payment (PaymentStep, every way the hub takes money). The server
 * creates the logins, links each child to the hub at their stage and starting course, and raises
 * one invoice: per child the whole pathway's price, or their starting course's; paying it switches
 * the accounts on. "Enrol another child" afterwards starts again signed in (the parent token).
 *
 * Props: pathway (the public detail — name, slug, price, hubs, stages), defaultHubId?,
 * attemptId? (a website diagnostic just taken — places the first child), defaultLearnerName?,
 * defaultLearnerDateOfBirth?
 */
export default function PathwayEnrollForm({ pathway, defaultHubId = null, attemptId = null, defaultLearnerName = '', defaultLearnerDateOfBirth = '' }) {
  const hubs = pathway.hubs || [];
  const [hubId, setHubId] = useState(() => (hubs.some((h) => h.id === defaultHubId) ? defaultHubId : hubs.length === 1 ? hubs[0].id : ''));
  const [stage, setStage] = useState('hub');
  const [moves, setMoves] = useState(0);
  const goTo = (next) => { setStage(next); setMoves((n) => n + 1); };
  const [parent, setParent] = useState(null); // { token, name, email, phone }
  const [showSignIn, setShowSignIn] = useState(false);
  const [spamBlocked, setSpamBlocked] = useState(false);
  const [submitted, setSubmitted] = useState({ children: [], phone: '' });
  const mutation = useMutation({ mutationFn: (payload) => publicApi.submitPathwayEnrollment(payload) });
  const hub = hubs.find((h) => h.id === hubId);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(bootcampEnrollmentSchema),
    mode: 'onTouched',
    defaultValues: {
      signedIn: false, parentName: '', parentEmail: '', parentPhone: '', parentPassword: '', confirmParentPassword: '',
      children: [emptyChild(defaultLearnerName, defaultLearnerDateOfBirth)], ...HONEYPOT_DEFAULT,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'children' });
  const children = watch('children') || [];

  const signInAs = ({ token, parent: who }) => {
    setParent({ token, ...who });
    setShowSignIn(false);
    setValue('signedIn', true);
    setValue('parentName', who.name || '', { shouldValidate: true });
    setValue('parentEmail', who.email, { shouldValidate: true });
    if (who.phone) setValue('parentPhone', who.phone, { shouldValidate: true });
  };
  const signOut = () => { setParent(null); setValue('signedIn', false); setValue('parentEmail', ''); };

  // What each child is expected to cost, from their date of birth (the invoice is final).
  const estimates = children.map((c) => startFor(pathway, c.learnerDateOfBirth));
  const estimateTotal = estimates.every((e) => e?.amount != null) ? estimates.reduce((sum, e) => sum + e.amount, 0) : null;

  const onSubmit = async (values) => {
    if (isBot(values)) { setSpamBlocked(true); reset(); return; }
    setSubmitted({ children: values.children.map((c) => ({ name: c.learnerName, username: c.username, password: c.password })), phone: values.parentPhone });
    await mutation.mutateAsync({
      pathwayIdOrSlug: pathway.slug,
      hubId,
      parentName: values.parentName,
      parentEmail: values.parentEmail,
      parentPhone: values.parentPhone,
      ...(parent ? { parentToken: parent.token } : { parentPassword: values.parentPassword }),
      children: values.children.map((c, i) => ({
        learnerName: c.learnerName, learnerDateOfBirth: c.learnerDateOfBirth, learnerAge: ageOn(c.learnerDateOfBirth),
        username: c.username, password: c.password, attemptId: i === 0 && attemptId ? attemptId : undefined,
      })),
    });
  };

  const enrolAnother = () => {
    const { parentToken, parentAccount } = mutation.data?.data || {};
    if (parentToken && parentAccount) setParent({ token: parentToken, name: parentAccount.name, email: parentAccount.email, phone: parentAccount.phone });
    reset({
      signedIn: Boolean(parentToken), parentName: parentAccount?.name || '', parentEmail: parentAccount?.email || '',
      parentPhone: parentAccount?.phone || submitted.phone, parentPassword: '', confirmParentPassword: '',
      children: [emptyChild()], ...HONEYPOT_DEFAULT,
    });
    mutation.reset();
    goTo('details');
  };

  const flowRef = useScrollToFlowTop(`${moves}:${mutation.isSuccess}:${spamBlocked}`);
  const stepper = (active) => (
    <Stepper activeStep={active} alternativeLabel sx={{ mb: 1 }}>
      {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
    </Stepper>
  );

  // ---- Payment: the accounts and invoice exist now ----------------------------------------
  if (mutation.isSuccess) {
    const { parentAccount, payment, parentToken, learners = [] } = mutation.data?.data || {};
    const first = (name) => (name || '').trim().split(/\s+/)[0] || 'The learner';
    const names = submitted.children.map((c) => first(c.name));
    const childNames = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
    return (
      <Box ref={flowRef} sx={box}>
        {stepper(2)}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, mb: 0.5 }}>
          <CheckCircleIcon color="success" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
            {names.length > 1 ? `${childNames} are` : `${childNames} is`} enrolled in {pathway.name} — now pay
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          At {mutation.data?.data?.hub?.name || hub?.name}. The logins work right away but stay view-only until your payment is confirmed; the hub then puts {names.length > 1 ? 'them' : first(submitted.children[0]?.name)} in a class.
        </Typography>
        <Box sx={{ mb: 2.5, display: 'grid', gap: 0.75 }}>
          {learners.map((l) => (
            <Box key={l.username} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2"><strong>{first(l.name)}</strong> — {l.stage ? `${l.stage}, ` : ''}starts at {l.startsAt}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatKsh(l.amount, payment?.currency)}</Typography>
            </Box>
          ))}
        </Box>
        {payment?.amount > 0 && (
          <PaymentStep pay={payment.pay} amountDue={payment.amount} invoiceNumber={payment.invoiceNumber} defaultPhone={submitted.phone}
            paidMessage="Full access is on — log in with the details below." />
        )}
        <Box sx={{ mb: 2.5, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 1.25, alignContent: 'start' }}>
            <Typography sx={{ fontWeight: 800 }}>Your parent account</Typography>
            <CopyableField label="Email" value={parentAccount?.email} />
            <Typography variant="body2" color="text.secondary">
              {parentAccount?.existing ? `Sign in with your existing password — ${childNames} ${names.length > 1 ? 'have' : 'has'} been added to your account.` : 'Sign in with the password you just chose.'}
            </Typography>
          </Box>
          {submitted.children.map((c) => (
            <Box key={c.username} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 1.25, alignContent: 'start' }}>
              <Typography sx={{ fontWeight: 800 }}>{first(c.name)}&rsquo;s login</Typography>
              <CopyableField label="Username" value={c.username} />
              <CopyableField label="Password" value={c.password} />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Button variant="contained" size="large" fullWidth href={`${APP_URL}/login`} target="_blank" rel="noopener noreferrer">Go to login</Button>
          {parentToken && (
            <Button variant="outlined" size="large" fullWidth startIcon={<PersonAddAltRoundedIcon />} onClick={enrolAnother}>
              Enrol another child — no need to type your password again
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  if (spamBlocked) {
    return <Box ref={flowRef} sx={box}><Alert severity="success">Thanks! We’ll be in touch shortly.</Alert></Box>;
  }

  // ---- Step 1: choose a hub ------------------------------------------------------------------
  if (stage === 'hub') {
    return (
      <Box ref={flowRef} sx={{ ...box, display: 'grid', gap: 2 }}>
        {stepper(0)}
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>Enrol in {pathway.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{priceLabel(pathway.price)}. Where would the learner attend?</Typography>
        </Box>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {hubs.map((h) => {
            const selected = hubId === h.id;
            return (
              <Box key={h.id} component="button" type="button" onClick={() => setHubId(h.id)}
                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%', textAlign: 'left', p: 2, borderRadius: 3, border: '2px solid', borderColor: selected ? 'primary.main' : 'divider', bgcolor: selected ? 'primary.main' : 'background.paper', color: selected ? 'primary.contrastText' : 'text.primary', cursor: 'pointer', font: 'inherit' }}>
                <PlaceOutlinedIcon sx={{ mt: 0.25 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{h.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: selected ? 0.85 : 1, color: selected ? 'inherit' : 'text.secondary' }}>{hubLine(h)}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        <Button variant="contained" size="large" disabled={!hubId} onClick={() => goTo('details')}>Continue</Button>
      </Box>
    );
  }

  // ---- Step 2: details ---------------------------------------------------------------------
  return (
    <Box ref={flowRef} component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ...box, display: 'grid', gap: 2 }}>
      {stepper(1)}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button size="small" onClick={() => goTo('hub')} sx={{ px: 1 }}>Change hub</Button>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{hub?.name}{hub ? ` · ${hubLine(hub)}` : ''}</Typography>
      </Box>
      <FormStatus status={mutation.isError ? 'error' : 'idle'} error={mutation.error} />
      <Honeypot register={register} />

      {parent ? (
        <>
          <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'success.light', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <CheckCircleIcon color="success" />
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography sx={{ fontWeight: 700 }}>Signed in as {parent.name || parent.email}</Typography>
              <Typography variant="body2" color="text.secondary">{parent.email} — the learners join this account.</Typography>
            </Box>
            <Button size="small" onClick={signOut}>Not you?</Button>
          </Box>
          <TextField label="Your phone" required {...register('parentPhone')} error={!!errors.parentPhone} helperText={errors.parentPhone?.message || 'For the M-Pesa prompt and the hub to reach you'} />
        </>
      ) : showSignIn ? (
        <ParentSignIn onSignedIn={signInAs} onCancel={() => setShowSignIn(false)} />
      ) : (
        <>
          <Alert severity="info" icon={false} sx={{ py: 0.25 }}>
            Already have a Digifunzi account (for another child)?{' '}
            <Button size="small" onClick={() => setShowSignIn(true)} sx={{ verticalAlign: 'baseline', px: 0.5, minWidth: 0 }}>Sign in</Button>
            {' '}— we’ll fill in your details.
          </Alert>
          <TextField label="Your name (parent or guardian)" required {...register('parentName')} error={!!errors.parentName} helperText={errors.parentName?.message} />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="Your email" type="email" required {...register('parentEmail')} error={!!errors.parentEmail} helperText={errors.parentEmail?.message} />
            <TextField label="Your phone" required {...register('parentPhone')} error={!!errors.parentPhone} helperText={errors.parentPhone?.message} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Your parent account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>
              Sign in with your email and this password to follow progress and pay invoices. Already have a Digifunzi account with this email? Use its password.
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <PasswordField label="Your password" required {...register('parentPassword')} error={errors.parentPassword} helperText="At least 6 characters" />
              <PasswordField label="Confirm your password" required {...register('confirmParentPassword')} error={errors.confirmParentPassword} />
            </Box>
          </Box>
        </>
      )}

      {fields.map((field, index) => {
        const e = errors.children?.[index] || {};
        const many = fields.length > 1;
        const est = estimates[index];
        return (
          <Box key={field.id} sx={{ display: 'grid', gap: 2, ...(many ? { p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' } : {}) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: -0.5 }}>
              <Typography sx={{ fontWeight: 700 }}>{many ? `Learner ${index + 1}` : 'The learner'}</Typography>
              {index > 0 && <Button size="small" color="inherit" startIcon={<RemoveCircleOutlineRoundedIcon />} onClick={() => remove(index)}>Remove</Button>}
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' } }}>
              <TextField label="Learner's name" required {...register(`children.${index}.learnerName`)} error={!!e.learnerName} helperText={e.learnerName?.message} />
              <DateOfBirthField required registration={register(`children.${index}.learnerDateOfBirth`)} value={watch(`children.${index}.learnerDateOfBirth`)} error={e.learnerDateOfBirth} />
            </Box>
            {est && (
              <Typography variant="body2" sx={{ color: est.course ? 'text.secondary' : 'warning.main' }}>
                {est.course
                  ? `${est.stage?.name ? `${est.stage.name} · ` : ''}starts at ${est.course.name}${est.amount != null ? ` — ${formatKsh(est.amount, pathway.price?.currency)}` : ' — no online price yet; enquire instead'}`
                  : `${pathway.name} isn’t offered for age ${est.age} — enquire instead and our team will help.`}
              </Typography>
            )}
            <Typography sx={{ fontWeight: 600, fontSize: 14, mb: -0.5 }}>Their own login</Typography>
            <TextField label="Choose a username" required autoComplete="off" {...register(`children.${index}.username`)} error={!!e.username} helperText={e.username?.message || 'Letters, numbers, dots, underscores and hyphens only'} />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <PasswordField label="Create a password" required {...register(`children.${index}.password`)} error={e.password} helperText="At least 6 characters" />
              <PasswordField label="Confirm password" required {...register(`children.${index}.confirmPassword`)} error={e.confirmPassword} />
            </Box>
          </Box>
        );
      })}
      {fields.length < MAX_CHILDREN && (
        <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => append(emptyChild())} sx={{ justifySelf: 'start' }}>Add another child</Button>
      )}

      {estimateTotal != null && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700 }}>To pay{children.length > 1 ? ` for ${children.length} learners` : ''}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{formatKsh(estimateTotal, pathway.price?.currency)}</Typography>
        </Box>
      )}
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Setting up the accounts…' : 'Continue to payment'}
      </Button>
      <PrivacyNote>We use your details only to set up and manage this account. See our</PrivacyNote>
    </Box>
  );
}
