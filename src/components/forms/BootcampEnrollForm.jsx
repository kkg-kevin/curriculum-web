import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Skeleton from '@mui/material/Skeleton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaceIcon from '@mui/icons-material/Place';
import { bootcampEnrollmentSchema } from './schemas.js';
import { useSubmitBootcampEnrollment } from '../../hooks/useBootcampEnrollment.js';
import PaymentStep from '../payments/PaymentStep.jsx';
import { usePublicBootcamp } from '../../hooks/usePublicBootcamps.js';
import { APP_URL } from '../../config/env.js';
import FormStatus from './FormStatus.jsx';
import PrivacyNote from './PrivacyNote.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';

/** One selectable "Running at" hub card for the hub-choice step. */
function HubOption({ run, selected, onSelect }) {
  const { hub, startDate, endDate } = run;
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: 3,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.main' : 'background.paper',
        color: selected ? 'primary.contrastText' : 'text.primary',
        cursor: 'pointer',
        font: 'inherit',
        transition: 'border-color 160ms ease',
      }}
    >
      <PlaceIcon sx={{ mt: 0.25 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700 }}>{hub.name}</Typography>
        {hub.address && (
          <Typography variant="body2" sx={{ opacity: selected ? 0.85 : 1, color: selected ? 'inherit' : 'text.secondary' }}>
            {hub.address}
          </Typography>
        )}
        {startDate && (
          <Typography variant="caption" sx={{ opacity: selected ? 0.85 : 1, color: selected ? 'inherit' : 'text.secondary' }}>
            {new Date(startDate).toLocaleDateString()}
            {endDate ? ` – ${new Date(endDate).toLocaleDateString()}` : ''}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Copies a value to the clipboard and flips a "Copied!" state for a moment — small, local, no
// need for a shared utility given it's only used twice on this one confirmation card.
function CopyableField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard access denied — the value is still visible to copy by hand */
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, wordBreak: 'break-all' }}>
          {value}
        </Typography>
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton onClick={handleCopy} size="small" color={copied ? 'success' : 'default'}>
          {copied ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/**
 * Bootcamp enrollment form (auto-provisioned account) — POST /api/public/bootcamp-enrollments.
 * Rendered inline on a pathway diagnostic's report when it was reached from a bootcamp (see
 * NextStepsPanel.jsx's `bootcamp` prop and its "Enroll now" option), not navigated to as a
 * separate page, so the visitor's already-given diagnostic contact details can be passed straight
 * in as pre-fill defaults instead of round-tripping through a URL.
 *
 * The learner's OWN login (username + password) is chosen right here on the form, not minted by
 * the system. On success this shows the Payment step (PaymentStep.jsx — every way to pay the
 * invoice the enrolment raised) above both logins: the username AND password they just chose (as
 * a reminder — the API never round-trips the password, so it's captured locally at submit time,
 * see submittedPassword), and a link to the real curriculum system to log in. Access stays
 * view-only until payment is confirmed.
 *
 * Which hub the learner attends is chosen here too, as its own step, whenever the bootcamp
 * runs at more than one hub (bootcamp.upcomingRuns.length > 1) — a bootcamp running at just one
 * hub (or none published yet) skips straight to the details/login step and that hub (if any) is
 * submitted automatically.
 *
 * Props: bootcampSlug, bootcampName, defaultParentName?, defaultParentPhone?,
 * defaultLearnerName?, defaultLearnerAge?
 */
export default function BootcampEnrollForm({
  bootcampSlug,
  bootcampName,
  defaultParentName = '',
  defaultParentPhone = '',
  defaultLearnerName = '',
  defaultLearnerAge = '',
}) {
  const mutation = useSubmitBootcampEnrollment();
  const [spamBlocked, setSpamBlocked] = useState(false);
  // The password never comes back from the API (it's never round-tripped once set) — captured
  // here right before submit so the success screen below can still show it alongside the
  // username. It's the same value the learner just typed into the form, not a secret being
  // exposed anywhere it shouldn't be.
  const [submittedPassword, setSubmittedPassword] = useState('');
  // The parent's phone, for the M-Pesa prompt on the Payment step.
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [submittedLearnerName, setSubmittedLearnerName] = useState('');
  const { data: bootcamp, isLoading: bootcampLoading } = usePublicBootcamp(bootcampSlug);
  const runs = bootcamp?.upcomingRuns || [];
  const needsHubChoice = runs.length > 1;
  // (Choose a hub) → Your details → Payment. Submitting the details creates the logins and the
  // invoice; the Payment step then takes the payment (PaymentStep.jsx).
  const steps = needsHubChoice ? ['Choose a hub', 'Your details', 'Payment'] : ['Your details', 'Payment'];
  const stepper = (active) => (
    <Stepper activeStep={active} alternativeLabel sx={{ mb: 1 }}>
      {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
    </Stepper>
  );

  // 'hub' only ever appears when there's a real choice to make; single-hub / no-hub bootcamps
  // go straight to 'details' and submit whichever hub (if any) resolved automatically.
  const [stage, setStage] = useState('details');
  const [hubId, setHubId] = useState('');

  useEffect(() => {
    if (needsHubChoice) setStage('hub');
  }, [needsHubChoice]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bootcampEnrollmentSchema),
    mode: 'onTouched',
    defaultValues: {
      parentName: defaultParentName,
      parentEmail: '',
      parentPhone: defaultParentPhone,
      parentPassword: '',
      confirmParentPassword: '',
      learnerName: defaultLearnerName,
      learnerAge: defaultLearnerAge,
      username: '',
      password: '',
      confirmPassword: '',
      ...HONEYPOT_DEFAULT,
    },
  });

  const onSubmit = async (values) => {
    if (isBot(values)) {
      setSpamBlocked(true);
      reset();
      return;
    }
    setSubmittedPassword(values.password);
    setSubmittedPhone(values.parentPhone);
    setSubmittedLearnerName(values.learnerName);
    await mutation.mutateAsync({
      bootcampIdOrSlug: bootcampSlug,
      parentName: values.parentName,
      parentEmail: values.parentEmail,
      parentPhone: values.parentPhone,
      parentPassword: values.parentPassword,
      learnerName: values.learnerName,
      learnerAge: values.learnerAge,
      username: values.username,
      password: values.password,
      hubId: hubId || undefined,
    });
  };

  const selectedRun = runs.find((r) => r.hub.id === hubId);

  // ---- Success: the account is ready with the login they just chose --------
  if (mutation.isSuccess) {
    const { learnerUsername, parentAccount, payment } = mutation.data?.data || {};
    const learnerFirstName = (submittedLearnerName || '').trim().split(/\s+/)[0] || 'The learner';
    const hasPrice = payment?.amount != null;
    return (
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'surface.subtle',
        }}
      >
        {stepper(steps.length - 1)}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, mb: 0.5 }}>
          <CheckCircleIcon color="success" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
            You’re enrolled in {bootcampName} — now pay
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Two logins are ready: yours, to follow progress and pay, and {learnerFirstName}&rsquo;s own. Both work right away
          but stay view-only until your payment is confirmed.
        </Typography>

        {/* Payment — every way this workspace takes money (PaymentStep); paying in full unlocks
            full access by itself, whether by the M-Pesa prompt or once staff confirm the payment. */}
        {hasPrice ? (
          <>
            <PaymentStep
              pay={payment.pay}
              amountDue={payment.amount}
              invoiceNumber={payment.invoiceNumber}
              defaultPhone={submittedPhone}
              paidMessage="Your account now has full access — log in with the details below."
            />
            {/* This bootcamp is priced by course/module rather than as a whole — the total is the
                sum of every priced course (or module), since enrollment covers the whole bootcamp. */}
            {payment.mode === 'by_course' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -2, mb: 2.5, textAlign: 'center' }}>
                This total combines this bootcamp’s individually priced courses/modules — see the
                “Pathway courses” section on the bootcamp page for the breakdown.
              </Typography>
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ mb: 2.5 }}>
            The price is still to be confirmed — {payment?.hubName || 'your hub'} will be in touch about paying.
          </Alert>
        )}

        <Box sx={{ mb: 2.5, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 1.25, alignContent: 'start' }}>
            <Typography sx={{ fontWeight: 800 }}>Your parent account</Typography>
            <CopyableField label="Email" value={parentAccount?.email} />
            <Typography variant="body2" color="text.secondary">
              {parentAccount?.existing
                ? `Sign in with your existing password — ${learnerFirstName} has been added to your account.`
                : 'Sign in with the password you just chose.'}
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'grid', gap: 1.25, alignContent: 'start' }}>
            <Typography sx={{ fontWeight: 800 }}>{learnerFirstName}&rsquo;s login</Typography>
            <CopyableField label="Username" value={learnerUsername} />
            <CopyableField label="Password" value={submittedPassword} />
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          href={`${APP_URL}/login`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to login
        </Button>
      </Box>
    );
  }

  if (spamBlocked) {
    return (
      <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.subtle' }}>
        <Alert severity="success">Thanks! We’ll be in touch shortly.</Alert>
      </Box>
    );
  }

  // ---- Step 1 (only when the bootcamp runs at more than one hub): choose a hub ----
  if (stage === 'hub') {
    return (
      <Box sx={{ display: 'grid', gap: 2, p: { xs: 2.5, md: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'surface.subtle' }}>
        {stepper(0)}

        <Box>
          <Typography variant="h6" component="h2" gutterBottom>
            Where should {defaultLearnerName || 'the learner'} attend?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {bootcampName} runs at more than one hub — pick the one that works best.
          </Typography>

          {bootcampLoading && <Skeleton variant="rounded" height={72} sx={{ mb: 1.5 }} />}

          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {runs.map((run) => (
              <HubOption
                key={run.hub.id}
                run={run}
                selected={hubId === run.hub.id}
                onSelect={() => setHubId(run.hub.id)}
              />
            ))}
          </Box>
        </Box>

        <Button variant="contained" size="large" disabled={!hubId} onClick={() => setStage('details')}>
          Continue
        </Button>
      </Box>
    );
  }

  // ---- The form --------------------------------------------------------------
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        display: 'grid',
        gap: 2,
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.subtle',
      }}
    >
      <Box>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
          Enroll in {bootcampName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          We’ll set up your account and the learner’s right away so you can get started. Next you choose how to
          pay — your account unlocks fully as soon as the payment is confirmed.
        </Typography>
      </Box>

      {stepper(needsHubChoice ? 1 : 0)}
      {needsHubChoice && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => setStage('hub')} sx={{ px: 1 }}>
              Change hub
            </Button>
            {selectedRun && (
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedRun.hub.name}
              </Typography>
            )}
          </Box>
        </>
      )}

      <FormStatus status={mutation.isError ? 'error' : 'idle'} error={mutation.error} />

      <Honeypot register={register} />

      <TextField
        label="Your name"
        required
        {...register('parentName')}
        error={!!errors.parentName}
        helperText={errors.parentName?.message}
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField
          label="Your email"
          type="email"
          required
          {...register('parentEmail')}
          error={!!errors.parentEmail}
          helperText={errors.parentEmail?.message}
        />
        <TextField
          label="Your phone"
          required
          {...register('parentPhone')}
          error={!!errors.parentPhone}
          helperText={errors.parentPhone?.message}
        />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700 }}>Your parent account</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>
          Sign in with your email and this password to follow progress and pay invoices. Already have
          a Digifunzi account with this email? Use its password.
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField
            label="Your password"
            type="password"
            required
            autoComplete="new-password"
            {...register('parentPassword')}
            error={!!errors.parentPassword}
            helperText={errors.parentPassword?.message || 'At least 6 characters'}
          />
          <TextField
            label="Confirm your password"
            type="password"
            required
            autoComplete="new-password"
            {...register('confirmParentPassword')}
            error={!!errors.confirmParentPassword}
            helperText={errors.confirmParentPassword?.message}
          />
        </Box>
      </Box>

      <Typography sx={{ fontWeight: 700, mb: -0.5 }}>The learner</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' } }}>
        <TextField
          label="Learner's name"
          required
          {...register('learnerName')}
          error={!!errors.learnerName}
          helperText={errors.learnerName?.message}
        />
        <TextField
          label="Learner's age"
          type="number"
          required
          inputProps={{ min: 3, max: 19 }}
          {...register('learnerAge')}
          error={!!errors.learnerAge}
          helperText={errors.learnerAge?.message}
        />
      </Box>

      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Set up the learner&rsquo;s login</Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Choose a username"
            required
            autoComplete="username"
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message || 'Letters, numbers, dots, underscores and hyphens only'}
          />
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label="Create a password"
              type="password"
              required
              autoComplete="new-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message || 'At least 6 characters'}
            />
            <TextField
              label="Confirm password"
              type="password"
              required
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </Box>
        </Box>
      </Box>

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Setting up your account…' : 'Continue to payment'}
      </Button>
      <PrivacyNote>We use your details only to set up and manage this account. See our</PrivacyNote>
    </Box>
  );
}
