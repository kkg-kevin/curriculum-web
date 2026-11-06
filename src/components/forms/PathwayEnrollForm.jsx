import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
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
import { startFor, planPrice, planChildren, periodUnit } from '../../utils/pathwayPrice.js';
import { atPeriod, defaultPeriodOf, pricesOf } from '../../content/homeSchooling.js';
import PeriodSwitch from '../common/PeriodSwitch.jsx';
import { APP_URL } from '../../config/env.js';
import useScrollToFlowTop from '../../hooks/useScrollToFlowTop.js';
import { useEnrolCheckout } from '../enrol/EnrolCheckout.jsx';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const STEPS = ['Plan & hub', 'Your details', 'Payment'];
const MAX_CHILDREN = 6;
const emptyChild = (name = '', dateOfBirth = '') => ({ learnerName: name, learnerDateOfBirth: dateOfBirth, username: '', password: '', confirmPassword: '' });
// The white step card of the enrolment checkout (EnrolCheckout's StepCard).
const box = { p: { xs: 2.5, md: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm' };
const hubLine = (hub) => [hub.town, hub.deliveryMode !== 'in_person' ? hub.deliveryLabel : null].filter(Boolean).join(' · ') || hub.deliveryLabel;

// A selectable card (plan or hub): white, its border and a light tint marking the chosen one.
const choiceCard = (selected) => ({
  width: '100%', textAlign: 'left', p: 2, borderRadius: 3, cursor: 'pointer', font: 'inherit', color: 'text.primary',
  border: '2px solid', borderColor: selected ? 'primary.main' : 'divider',
  bgcolor: (t) => (selected ? alpha(t.palette.primary.main, 0.08) : t.palette.background.paper),
  transition: 'border-color .15s, background-color .15s',
  '&:hover': { borderColor: 'primary.main' },
  '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
});
const sectionTitle = { p: 0, mb: 0.25, fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' };
// The radio mark on a selectable card.
function RadioMark({ on }) {
  return (
    <Box component="span" aria-hidden sx={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: '2px solid', borderColor: on ? 'primary.main' : 'divider', display: 'grid', placeItems: 'center', bgcolor: 'background.paper' }}>
      {on && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />}
    </Box>
  );
}

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
 * defaultLearnerDateOfBirth?, defaultParentName?, defaultParentPhone? (from the diagnostic's contact
 * details — PathwayEnrolJourney)
 */
export default function PathwayEnrollForm({ pathway, defaultHubId = null, defaultPlanId = null, defaultPeriod = null, attemptId = null, defaultLearnerName = '', defaultLearnerDateOfBirth = '', defaultParentName = '', defaultParentPhone = '', onBack = null }) {
  const hubs = pathway.hubs || [];
  // The pathway's subscription plans (renewing every period): the family picks one with the hub —
  // the one they chose on the pathway's page, else the first.
  const plans = pathway.plans || [];
  const [planId, setPlanId] = useState(() => (plans.some((p) => p.id === defaultPlanId) ? defaultPlanId : plans[0]?.id || ''));
  // The period chosen on the plan's card (?period=), switchable here; the plan priced for it
  // (atPeriod — its default when it isn't offered for it).
  const [period, setPeriod] = useState(defaultPeriod || null);
  const chosenPlan = plans.find((p) => p.id === planId) || null;
  const plan = chosenPlan ? atPeriod(chosenPlan, period || defaultPeriodOf(chosenPlan)) : null;
  const steps = STEPS;
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

  // What's chosen goes into the address (?plan= &period= &hubId=), so going Back to the date of
  // birth or quiz and returning — or reloading — opens with the same plan, period and hub, and
  // the summary beside the steps (PathwayEnrolJourney) reads the same thing.
  const [, setParams] = useSearchParams();
  useEffect(() => {
    setParams((prev) => {
      const wanted = { plan: planId || null, period: period || prev.get('period'), hubId: hubId || null };
      if (Object.entries(wanted).every(([k, v]) => (prev.get(k) || null) === (v || null))) return prev;
      Object.entries(wanted).forEach(([k, v]) => (v ? prev.set(k, v) : prev.delete(k)));
      return prev;
    }, { replace: true, preventScrollReset: true });
  }, [planId, period, hubId, setParams]);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(bootcampEnrollmentSchema),
    mode: 'onTouched',
    defaultValues: {
      signedIn: false, parentName: defaultParentName, parentEmail: '', parentPhone: defaultParentPhone, parentPassword: '', confirmParentPassword: '',
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

  // Where each child starts, from their date of birth; the family pays the plan's price for the
  // number of children, every period (the invoice is final).
  const estimates = children.map((c) => startFor(pathway, c.learnerDateOfBirth));
  const planTotal = plan ? planPrice(plan, children.length) : null;
  const estimateTotal = planTotal;

  const onSubmit = async (values) => {
    if (isBot(values)) { setSpamBlocked(true); reset(); return; }
    setSubmitted({ children: values.children.map((c) => ({ name: c.learnerName, username: c.username, password: c.password })), phone: values.parentPhone });
    await mutation.mutateAsync({
      pathwayIdOrSlug: pathway.slug,
      hubId,
      packageId: plan?.id,
      billingPeriod: plan?.billingPeriod,
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
  // Inside the enrolment checkout: tell it where we are and what's chosen (its step bar and
  // summary); on its own (no checkout) draw our own step bar.
  const checkout = useEnrolCheckout();
  const currentStep = mutation.isSuccess ? 'pay' : stage === 'hub' ? 'plan' : 'details';
  useEffect(() => {
    checkout?.report({ step: currentStep, plan, hub: hub || null, learners: Math.max(1, children.length) });
  }, [checkout, currentStep, plan, hub, children.length]);
  const stepper = (active) => checkout ? null : (
    <Stepper activeStep={active} alternativeLabel sx={{ mb: 1 }}>
      {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
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
          {mutation.data?.data?.subscription
            ? <>On the {mutation.data.data.subscription.plan} plan — {formatKsh(mutation.data.data.subscription.amount, payment?.currency)} a {periodUnit(mutation.data.data.subscription.billingPeriod)}, renewing automatically. The logins work right away; the pathway’s courses open as soon as your payment is confirmed — self-paced, no class needed.</>
            : <>At {mutation.data?.data?.hub?.name || hub?.name}. The logins work right away but stay view-only until your payment is confirmed; the hub then puts {names.length > 1 ? 'them' : first(submitted.children[0]?.name)} in a class.</>}
        </Typography>
        <Box sx={{ mb: 2.5, display: 'grid', gap: 0.75 }}>
          {learners.map((l) => (
            <Box key={l.username} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2"><strong>{first(l.name)}</strong> — {l.stage ? `${l.stage}, ` : ''}starts at {l.startsAt}</Typography>
              {!mutation.data?.data?.subscription && <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatKsh(l.amount, payment?.currency)}</Typography>}
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

  // ---- Step 1: the plan and the hub ----------------------------------------------------------
  // Plans side by side (price first), hubs as a short list — each a selectable card with a radio
  // mark, the chosen one tinted rather than filled — then what was chosen, and Continue.
  if (stage === 'hub') {
    const chosenPrice = plan ? planPrice(plan, 1) : null;
    return (
      <Box ref={flowRef} sx={{ ...box, display: 'grid', gap: 2.5 }}>
        {stepper(0)}
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main', mb: 0.5 }}>Plan & hub</Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>Choose a plan and a hub</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>Every stage’s courses, self-paced. It renews automatically — the courses stay open while it’s paid.</Typography>
        </Box>

        <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, display: 'grid', gap: 1.25 }}>
          <Typography component="legend" sx={sectionTitle}>1 · Choose a plan</Typography>
          <Box role="radiogroup" aria-label="Plan" sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(auto-fit, minmax(190px, 1fr))' } }}>
            {plans.map((raw) => {
              const p = atPeriod(raw, period || defaultPeriodOf(raw));
              const selected = planId === p.id;
              return (
                <Box key={p.id} component="button" type="button" role="radio" aria-checked={selected} onClick={() => setPlanId(p.id)} sx={choiceCard(selected)}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>{p.name}</Typography>
                      {p.badge && <Box component="span" sx={{ display: 'inline-block', mt: 0.5, fontSize: 11, fontWeight: 800, px: 1, py: 0.25, borderRadius: 999, bgcolor: 'primary.main', color: 'primary.contrastText' }}>{p.badge}</Box>}
                    </Box>
                    <RadioMark on={selected} />
                  </Box>
                  <Typography sx={{ mt: 1.25, lineHeight: 1.1 }}>
                    <Box component="span" sx={{ fontWeight: 800, fontSize: '1.45rem' }}>{formatKsh(p.amount, p.currency)}</Box>
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}> / {periodUnit(p.billingPeriod)}</Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {planChildren(p)}{p.allowExtraChildren && p.extraChildAmount ? ` · +${formatKsh(p.extraChildAmount, p.currency)} per extra child` : ''}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {chosenPlan && pricesOf(chosenPlan).length > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: -1 }}>
            <Typography sx={{ fontWeight: 700 }}>Pay</Typography>
            <PeriodSwitch periods={pricesOf(chosenPlan).map((x) => x.billingPeriod)} value={plan.billingPeriod} onChange={setPeriod} size="medium" />
          </Box>
        )}

        <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, display: 'grid', gap: 1.25 }}>
          <Typography component="legend" sx={sectionTitle}>2 · Where is the learner based?</Typography>
          <Box role="radiogroup" aria-label="Hub" sx={{ display: 'grid', gap: 1 }}>
            {hubs.map((h) => {
              const selected = hubId === h.id;
              return (
                <Box key={h.id} component="button" type="button" role="radio" aria-checked={selected} onClick={() => setHubId(h.id)}
                  sx={{ ...choiceCard(selected), display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                  <PlaceOutlinedIcon sx={{ color: selected ? 'primary.main' : 'text.secondary', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>{h.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{hubLine(h)}</Typography>
                  </Box>
                  <RadioMark on={selected} />
                </Box>
              );
            })}
          </Box>
        </Box>

        {plan && hub && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', p: 1.75, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ minWidth: 0 }}>
              <strong>{plan.name}</strong> at <strong>{hub.name}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{formatKsh(chosenPrice, plan.currency)} / {periodUnit(plan.billingPeriod)}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: onBack ? 'space-between' : 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
          {onBack && <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack}>Back</Button>}
          <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} disabled={!hubId || !planId} onClick={() => goTo('details')} sx={{ minWidth: { xs: '100%', sm: 220 } }}>Continue</Button>
        </Box>
      </Box>
    );
  }

  // ---- Step 2: details ---------------------------------------------------------------------
  return (
    <Box ref={flowRef} component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ...box, display: 'grid', gap: 2 }}>
      {stepper(1)}
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main', mb: 0.5 }}>Your details</Typography>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>Your details and their login</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
          <Typography variant="body2" color="text.secondary">{plan ? `${plan.name} · ` : ''}{hub?.name}{hub ? ` · ${hubLine(hub)}` : ''}</Typography>
          <Button size="small" startIcon={<ArrowBackRoundedIcon />} onClick={() => goTo('hub')} sx={{ px: 1 }}>{plans.length ? 'Change plan or hub' : 'Change hub'}</Button>
        </Box>
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
                  ? `${est.stage?.name ? `${est.stage.name} · ` : ''}starts at ${est.course.name}`
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

      {plan && planTotal == null && (
        <Alert severity="warning">{plan.name} takes {plan.allowExtraChildren ? `up to ${plan.maxChildren}` : plan.childrenIncluded} {plan.childrenIncluded === 1 && !plan.allowExtraChildren ? 'child' : 'children'} — choose a larger plan or remove a learner.</Alert>
      )}
      {estimateTotal != null && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700 }}>{plan ? `Then every ${periodUnit(plan.billingPeriod)}` : 'To pay'}{children.length > 1 ? ` for ${children.length} learners` : ''}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem' }}>{formatKsh(estimateTotal, plan?.currency)}{plan ? ` / ${periodUnit(plan.billingPeriod)}` : ''}</Typography>
        </Box>
      )}
      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending || (plan && planTotal == null)}>
        {isSubmitting || mutation.isPending ? 'Setting up the accounts…' : 'Continue to payment'}
      </Button>
      <PrivacyNote>We use your details only to set up and manage this account. See our</PrivacyNote>
    </Box>
  );
}
