import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { enrollSchema, storeEnquirySchema } from './schemas.js';
import { useLeadSubmission } from '../../hooks/useLeadSubmission.js';
import FormStatus from './FormStatus.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';

// `value` must stay within the lead API's enum (bootcamp | project | quarky |
// general — WEBSITE_INTEGRATION_CONTRACT §4.1); labels are free to be broader.
// Store items pass a specific slug in `referenceId` so staff still see exactly
// what was enquired about.
const INTEREST_OPTIONS = [
  { value: 'project', label: 'A project' },
  { value: 'quarky', label: 'The Quarky robot or a kit' },
  { value: 'bootcamp', label: 'A bootcamp' },
  { value: 'general', label: 'Not sure yet — help me choose' },
];

/**
 * Enroll / store-enquiry form → POST /api/public/leads (spec §4.5). Lead
 * capture, not account creation: the Digifunzi team follows up.
 *
 * Props:
 *  - variant: 'enroll' (default) | 'enquiry'
 *      'enquiry' is for the Store — a product/project enquiry that may not be
 *      about one named child, so learner name/age are optional and the copy
 *      changes. Same endpoint either way.
 *  - defaultInterest: pre-selects "interested in" (e.g. 'quarky' from a store page)
 *  - referenceId: slug of the store item / pathway they came from → `referenceId`
 *  - referenceLabel: human label shown as read-only context
 *  - defaultMessage: pre-fills the "anything else" field
 */
export default function EnrollForm({
  variant = 'enroll',
  defaultInterest = 'general',
  referenceId = null,
  referenceLabel,
  defaultMessage = '',
}) {
  const isEnquiry = variant === 'enquiry';
  const mutation = useLeadSubmission();
  const [spamBlocked, setSpamBlocked] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEnquiry ? storeEnquirySchema : enrollSchema),
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
      learnerName: values.learnerName || '',
      learnerAge: values.learnerAge === '' || values.learnerAge == null ? null : values.learnerAge,
      interestedIn: values.interestedIn,
      referenceId: referenceId || null,
      // message is not in the documented contract; send it as a note the backend can ignore or store.
      note: values.message || undefined,
    });
    reset();
  };

  const status =
    mutation.isSuccess || spamBlocked ? 'success' : mutation.isError ? 'error' : 'idle';

  const defaultSuccess = isEnquiry
    ? 'Thanks! Our team will be in touch to confirm pricing and next steps.'
    : 'Thanks! Our team will contact you to arrange next steps.';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'grid', gap: 2 }}>
      <FormStatus
        status={status}
        successMessage={mutation.data?.message || defaultSuccess}
        error={mutation.error}
      />

      <Honeypot register={register} />

      {referenceLabel && (
        <Typography variant="body2" color="text.secondary">
          {isEnquiry ? 'Enquiring about: ' : 'Enrolling for: '}
          <strong>{referenceLabel}</strong>
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
          label={isEnquiry ? 'Learner’s name (optional)' : 'Learner’s name'}
          required={!isEnquiry}
          {...register('learnerName')}
          error={!!errors.learnerName}
          helperText={errors.learnerName?.message}
        />
        <TextField
          label={isEnquiry ? 'Learner’s age (optional)' : 'Learner’s age'}
          type="number"
          required={!isEnquiry}
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
        label={isEnquiry ? 'Anything else? (quantity, school name, questions…)' : 'Anything else? (optional)'}
        multiline
        minRows={3}
        {...register('message')}
        error={!!errors.message}
        helperText={errors.message?.message}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending
          ? 'Sending…'
          : isEnquiry
            ? 'Send enquiry'
            : 'Submit enrolment interest'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        We use your details only to contact you about Digifunzi programmes.
      </Typography>
    </Box>
  );
}
