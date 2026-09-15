import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import { bootcampEnrollmentSchema } from './schemas.js';
import { useSubmitBootcampEnrollment } from '../../hooks/useBootcampEnrollment.js';
import { APP_URL } from '../../config/env.js';
import FormStatus from './FormStatus.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';

function formatMoney(amount, currency) {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
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
 * Rendered inline on the bootcamp diagnostic report (see BootcampNextStepsPanel's "Enroll now"
 * option), not navigated to as a separate page, so the visitor's already-given diagnostic
 * contact details can be passed straight in as pre-fill defaults instead of round-tripping
 * through a URL.
 *
 * On success this shows a DISTINCT confirmation state (not FormStatus's generic success alert):
 * the new firstname.lastname@digifunzi.com login + a one-time temporary password, a "save this
 * now" warning (the password is never shown again), a link to the real curriculum system to log
 * in, and a note that access stays view-only until payment is confirmed.
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
      learnerName: defaultLearnerName,
      learnerAge: defaultLearnerAge,
      ...HONEYPOT_DEFAULT,
    },
  });

  const onSubmit = async (values) => {
    if (isBot(values)) {
      setSpamBlocked(true);
      reset();
      return;
    }
    await mutation.mutateAsync({
      bootcampIdOrSlug: bootcampSlug,
      parentName: values.parentName,
      parentEmail: values.parentEmail,
      parentPhone: values.parentPhone,
      learnerName: values.learnerName,
      learnerAge: values.learnerAge,
    });
  };

  // ---- Success: show the new login exactly once ----------------------------
  if (mutation.isSuccess) {
    const { learnerLoginEmail, learnerTempPassword, payment } = mutation.data?.data || {};
    const hasPrice = payment?.amount != null;
    return (
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'success.main',
          bgcolor: 'surface.subtle',
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 0.5 }}>
          You're enrolled in {bootcampName}!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          We've created an account so you can get started right away.
        </Typography>

        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          <CopyableField label="Login email" value={learnerLoginEmail} />
          <CopyableField label="Temporary password" value={learnerTempPassword} />
        </Box>

        <Alert severity="warning" sx={{ mb: 2.5 }}>
          Save these now — this password is shown only once. You can change it any time after
          logging in.
        </Alert>

        {/* Payment — cash-only for now: there's nothing to click through online, so this is
            instructional (pay at the hub) rather than a "Pay now" action. An admin confirms the
            cash payment was received from the Enquiries page, which unlocks the account. */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <PaymentsIcon color="primary" sx={{ mt: 0.25 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
              {hasPrice ? formatMoney(payment.amount, payment.currency) : 'Price to be confirmed'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasPrice
                ? `Pay by cash at ${payment.hubName || 'your hub'} to activate full access.`
                : `Ask ${payment.hubName || 'your hub'} to confirm the price and pay by cash to activate full access.`}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 2.5 }}>
          Your account can log in right away, but stays view-only until your payment is
          confirmed. Once that's done, you'll have full access.
        </Alert>

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
        <Alert severity="success">Thanks! We'll be in touch shortly.</Alert>
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
          We'll set up an account right away so you can get started. You can pay by cash — your
          account unlocks fully as soon as that's confirmed.
        </Typography>
      </Box>

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

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Setting up your account…' : 'Enroll now'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        We use your details only to set up and manage this account.
      </Typography>
    </Box>
  );
}
