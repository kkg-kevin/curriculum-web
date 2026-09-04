import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { enrollSchema } from './schemas.js';
import { useLeadSubmission } from '../../hooks/useLeadSubmission.js';
import FormStatus from './FormStatus.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';

const INTEREST_OPTIONS = [
  { value: 'bootcamp', label: 'A bootcamp' },
  { value: 'project', label: 'A project / course' },
  { value: 'quarky', label: 'The Quarky robot' },
  { value: 'general', label: 'Not sure yet — help me choose' },
];

/**
 * Enroll form → POST /api/public/leads (spec §4.5). Lead capture, not account
 * creation: the Digifunzi team follows up and creates the real Learner record.
 *
 * Props:
 *  - defaultInterest: pre-selects "interested in" (e.g. 'bootcamp' from a detail page)
 *  - referenceId: the slug of the bootcamp/course/pathway they came from, passed
 *    straight through as `referenceId`. The API accepts a slug or a uuid and
 *    stores it as a bare string; we send the slug so staff see a readable
 *    "came from" value on the Enquiries page (SYSTEM_INTEGRATION.md §3.1).
 *  - referenceLabel: human label shown as read-only context
 *  - defaultMessage: pre-fills the "anything else" field (e.g. an age-based
 *    starting-course suggestion from the pathway page)
 */
export default function EnrollForm({
  defaultInterest = 'general',
  referenceId = null,
  referenceLabel,
  defaultMessage = '',
}) {
  const mutation = useLeadSubmission();
  const [spamBlocked, setSpamBlocked] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      learnerName: '',
      learnerAge: '',
      interestedIn: defaultInterest,
      message: defaultMessage,
      ...HONEYPOT_DEFAULT,
    },
  });

  const onSubmit = async (values) => {
    if (isBot(values)) {
      // Silently pretend it worked — don't tell the bot why.
      setSpamBlocked(true);
      reset();
      return;
    }
    await mutation.mutateAsync({
      parentName: values.parentName,
      parentEmail: values.parentEmail,
      parentPhone: values.parentPhone,
      learnerName: values.learnerName,
      learnerAge: values.learnerAge,
      interestedIn: values.interestedIn,
      referenceId: referenceId || null,
      // message is not in the documented contract; send it as a note the backend can ignore or store.
      note: values.message || undefined,
    });
    reset();
  };

  const status =
    mutation.isSuccess || spamBlocked ? 'success' : mutation.isError ? 'error' : 'idle';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'grid', gap: 2 }}>
      <FormStatus
        status={status}
        successMessage={mutation.data?.message || 'Thanks! Our team will contact you to arrange next steps.'}
        error={mutation.error}
      />

      <Honeypot register={register} />

      {referenceLabel && (
        <Typography variant="body2" color="text.secondary">
          Enrolling for: <strong>{referenceLabel}</strong>
        </Typography>
      )}

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
          label="Learner’s name"
          required
          {...register('learnerName')}
          error={!!errors.learnerName}
          helperText={errors.learnerName?.message}
        />
        <TextField
          label="Learner’s age"
          type="number"
          required
          inputProps={{ min: 3, max: 19 }}
          {...register('learnerAge')}
          error={!!errors.learnerAge}
          helperText={errors.learnerAge?.message}
        />
      </Box>
      <TextField
        select
        label="Interested in"
        SelectProps={{ native: true }}
        InputLabelProps={{ shrink: true }}
        {...register('interestedIn')}
        error={!!errors.interestedIn}
        helperText={errors.interestedIn?.message}
      >
        {INTEREST_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </TextField>
      <TextField
        label="Anything else? (optional)"
        multiline
        minRows={3}
        {...register('message')}
        error={!!errors.message}
        helperText={errors.message?.message}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Sending…' : 'Submit enrolment interest'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        We use your details only to contact you about Digifunzi programmes.
      </Typography>
    </Box>
  );
}
