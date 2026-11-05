import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { educatorEnrollmentSchema } from './schemas.js';
import { useSubmitEducatorEnrollment } from '../../hooks/useBootcampEnrollment.js';
import { usePublicBootcamp } from '../../hooks/usePublicBootcamps.js';
import PaymentStep from '../payments/PaymentStep.jsx';
import { APP_URL } from '../../config/env.js';
import FormStatus from './FormStatus.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';
import PasswordField from './PasswordField.jsx';
import useScrollToFlowTop from '../../hooks/useScrollToFlowTop.js';
import { CopyableField, HubOption } from './BootcampEnrollForm.jsx';

/**
 * A TOT (training of trainers) bootcamp's sign-up — for educators, who enrol themselves: (Choose a
 * hub, when it runs at more than one) → Your details → Payment, the same shape as the children's
 * BootcampEnrollForm. Submitting creates their educator account and login, their place in the
 * bootcamp's class and one invoice (server: bootcamp-enrollment/educator-enrollment.service.js);
 * paying it starts their training, which they follow by signing in as TOT learner (a portal of its own).
 */
// Defaults from the steps before it (BootcampEnrollPage): the name and phone typed for the
// diagnostic, their date of birth, and the diagnostic they took (`attemptId`), which places them.
export default function EducatorEnrollForm({ bootcampSlug, bootcampName, defaultName = '', defaultPhone = '', dateOfBirth = '', attemptId = null }) {
  const mutation = useSubmitEducatorEnrollment();
  const [spamBlocked, setSpamBlocked] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const { data: bootcamp, isLoading: bootcampLoading } = usePublicBootcamp(bootcampSlug);
  const runs = bootcamp?.upcomingRuns || [];
  const needsHubChoice = runs.length > 1;
  const steps = needsHubChoice ? ['Choose a hub', 'Your details', 'Payment'] : ['Your details', 'Payment'];
  const stepper = (active) => (
    <Stepper activeStep={active} alternativeLabel sx={{ mb: 1 }}>
      {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
    </Stepper>
  );

  const [stage, setStage] = useState('details');
  const [hubId, setHubId] = useState('');
  const [moves, setMoves] = useState(0);
  const goTo = (next) => { setStage(next); setMoves((n) => n + 1); };
  useEffect(() => {
    if (needsHubChoice) setStage('hub');
  }, [needsHubChoice]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(educatorEnrollmentSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: defaultName.trim().split(/\s+/)[0] || '',
      lastName: defaultName.trim().split(/\s+/).slice(1).join(' '),
      email: '', phone: defaultPhone, organisation: '', password: '', confirmPassword: '', ...HONEYPOT_DEFAULT,
    },
  });

  const onSubmit = async (values) => {
    if (isBot(values)) {
      setSpamBlocked(true);
      reset();
      return;
    }
    setSubmittedPhone(values.phone);
    await mutation.mutateAsync({
      bootcampIdOrSlug: bootcampSlug,
      hubId: hubId || undefined,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      organisation: values.organisation || undefined,
      password: values.password,
      dateOfBirth: dateOfBirth || undefined,
      attemptId: attemptId || undefined,
    });
  };

  const selectedRun = runs.find((r) => r.hub.id === hubId);
  const flowRef = useScrollToFlowTop(`${moves}:${mutation.isSuccess}:${spamBlocked}`);
  const panel = { p: { xs: 2.5, md: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.subtle' };

  // ---- Enrolled: their account is ready; now pay ----------------------------------------
  if (mutation.isSuccess) {
    const { account, payment } = mutation.data?.data || {};
    const hasPrice = payment?.amount != null;
    return (
      <Box ref={flowRef} sx={panel}>
        {stepper(steps.length - 1)}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, mb: 0.5 }}>
          <CheckCircleIcon color="success" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
            You’re enrolled in {bootcampName}{hasPrice ? ' — now pay' : ''}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Your account is ready. Sign in to follow your training (as TOT learner) — it opens fully
          {hasPrice ? ' as soon as your payment is confirmed.' : ' once the hub confirms your place.'}
        </Typography>

        {hasPrice ? (
          <PaymentStep
            pay={payment.pay}
            amountDue={payment.amount}
            invoiceNumber={payment.invoiceNumber}
            defaultPhone={submittedPhone}
            paidMessage="Your training is on — sign in with the details below."
          />
        ) : (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            The price is still to be confirmed — {payment?.hubName || 'the hub'} will be in touch.
          </Alert>
        )}

        <Box sx={{ mb: 2.5, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 1.25 }}>
          <Typography sx={{ fontWeight: 800 }}>Your account</Typography>
          <CopyableField label="Email" value={account?.email} />
          <Typography variant="body2" color="text.secondary">
            {account?.existing ? 'Sign in with your existing password.' : 'Sign in with the password you just chose.'}
          </Typography>
        </Box>

        <Button variant="contained" size="large" fullWidth href={`${APP_URL}/login`} target="_blank" rel="noopener noreferrer">
          Go to login
        </Button>
      </Box>
    );
  }

  if (spamBlocked) {
    return (
      <Box ref={flowRef} sx={panel}>
        <Alert severity="success">Thanks! We’ll be in touch shortly.</Alert>
      </Box>
    );
  }

  // ---- Choose a hub (only when it runs at more than one) ---------------------------------
  if (stage === 'hub') {
    return (
      <Box ref={flowRef} sx={{ ...panel, display: 'grid', gap: 2 }}>
        {stepper(0)}
        <Box>
          <Typography variant="h6" component="h2" gutterBottom>Where would you like to train?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {bootcampName} runs at more than one hub — pick the one that works best for you.
          </Typography>
          {bootcampLoading && <Skeleton variant="rounded" height={72} sx={{ mb: 1.5 }} />}
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {runs.map((run) => (
              <HubOption key={run.hub.id} run={run} selected={hubId === run.hub.id} onSelect={() => setHubId(run.hub.id)} />
            ))}
          </Box>
        </Box>
        <Button variant="contained" size="large" disabled={!hubId} onClick={() => goTo('details')}>Continue</Button>
      </Box>
    );
  }

  // ---- Your details --------------------------------------------------------------------
  return (
    <Box ref={flowRef} component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ ...panel, display: 'grid', gap: 2 }}>
      <Box>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>Enrol in {bootcampName}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Training of trainers, for educators. We’ll set up your account straight away; next you choose how to pay.
        </Typography>
      </Box>

      {stepper(needsHubChoice ? 1 : 0)}
      {needsHubChoice && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => goTo('hub')} sx={{ px: 1 }}>Change hub</Button>
          {selectedRun && <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedRun.hub.name}</Typography>}
        </Box>
      )}

      <FormStatus status={mutation.isError ? 'error' : 'idle'} error={mutation.error} />
      <Honeypot register={register} />

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField label="First name" required {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} />
        <TextField label="Last name" required {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} />
        <TextField label="Email" type="email" required {...register('email')} error={!!errors.email} helperText={errors.email?.message || 'This is your login'} />
        <TextField label="Phone" required {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message || 'For the M-Pesa prompt and the hub to reach you'} />
      </Box>
      <TextField
        label="Where do you teach? (optional)"
        {...register('organisation')}
        error={!!errors.organisation}
        helperText={errors.organisation?.message || 'Your school, club or organisation, if any'}
      />

      <Box>
        <Typography sx={{ fontWeight: 700 }}>Your password</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>
          Sign in with your email and this password. Already have a Digifunzi account with this email? Use its password.
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <PasswordField label="Password" required {...register('password')} error={errors.password} helperText="At least 6 characters" />
          <PasswordField label="Confirm password" required {...register('confirmPassword')} error={errors.confirmPassword} />
        </Box>
      </Box>

      <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
        {mutation.isPending ? 'Enrolling…' : 'Enrol and continue to payment'}
      </Button>
    </Box>
  );
}
