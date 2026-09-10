import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { enrollSchema, pathwayEnrollSchema, storeEnquirySchema } from './schemas.js';
import { useLeadSubmission } from '../../hooks/useLeadSubmission.js';
import { HUB_TYPE_LABELS } from '../../hooks/usePublicHubs.js';
import FormStatus from './FormStatus.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';
import HubTypeSchedule from './HubTypeSchedule.jsx';

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
 *  - withHub: the pathway / diagnostic enrol flow. Runs as a TWO-STEP wizard:
 *      step 1 is "Choose a hub" (the "Type of learning hub" picker + that hub's
 *      operational schedule, on its own screen), step 2 is "Your details". The
 *      chosen type/hub go onto the lead's note.
 *  - defaultInterest: pre-selects "interested in" (e.g. 'quarky' from a store page)
 *  - referenceId: slug of the store item / pathway they came from → `referenceId`
 *  - referenceLabel: human label shown as read-only context
 *  - defaultMessage: pre-fills the "anything else" field
 */
export default function EnrollForm({
  variant = 'enroll',
  withHub = false,
  defaultInterest = 'general',
  referenceId = null,
  referenceLabel,
  defaultMessage = '',
}) {
  const isEnquiry = variant === 'enquiry';
  const mutation = useLeadSubmission();
  const [spamBlocked, setSpamBlocked] = useState(false);
  // withHub runs as a wizard: 'hub' -> 'details'. Everything else is a single 'details' step.
  const [stage, setStage] = useState(withHub ? 'hub' : 'details');

  const schema = isEnquiry ? storeEnquirySchema : withHub ? pathwayEnrollSchema : enrollSchema;
  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      learnerName: '',
      learnerAge: '',
      interestedIn: defaultInterest,
      message: defaultMessage,
      ...(withHub ? { hubType: '', hubId: '', hubName: '' } : {}),
      ...HONEYPOT_DEFAULT,
    },
  });

  const hubType = watch('hubType');
  const hubName = watch('hubName');

  const goToDetails = async () => {
    const ok = await trigger('hubType');
    if (ok) setStage('details');
  };

  const onSubmit = async (values) => {
    if (isBot(values)) {
      // Silently pretend it worked — don't tell the bot why.
      setSpamBlocked(true);
      reset();
      return;
    }

    // The hub type / chosen hub aren't in the documented lead contract — fold them into the
    // note so staff see them in the Enquiries card. HUB_TYPE_LABELS keeps the note readable.
    const parts = [];
    if (withHub && values.hubType) {
      parts.push(`Preferred hub type: ${HUB_TYPE_LABELS[values.hubType] || values.hubType}`);
      if (values.hubName) parts.push(`Chosen hub: ${values.hubName}`);
    }
    if (values.message) parts.push(values.message.trim());
    const note = parts.length ? parts.join('\n') : undefined;

    await mutation.mutateAsync({
      parentName: values.parentName,
      parentEmail: values.parentEmail,
      parentPhone: values.parentPhone,
      learnerName: values.learnerName || '',
      learnerAge: values.learnerAge === '' || values.learnerAge == null ? null : values.learnerAge,
      interestedIn: values.interestedIn,
      referenceId: referenceId || null,
      note,
    });
    reset();
  };

  const status =
    mutation.isSuccess || spamBlocked ? 'success' : mutation.isError ? 'error' : 'idle';

  const defaultSuccess = isEnquiry
    ? 'Thanks! Our team will be in touch to confirm pricing and next steps.'
    : 'Thanks! Our team will contact you to arrange next steps.';

  // ---- Step 1 (withHub only): choose a hub -----------------------------------
  if (withHub && stage === 'hub' && status !== 'success') {
    return (
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Stepper activeStep={0} alternativeLabel sx={{ mb: 1 }}>
          <Step><StepLabel>Choose a hub</StepLabel></Step>
          <Step><StepLabel>Your details</StepLabel></Step>
        </Stepper>

        {referenceLabel && (
          <Typography variant="body2" color="text.secondary">
            Enrolling for: <strong>{referenceLabel}</strong>
          </Typography>
        )}

        <Box>
          <Typography variant="h6" component="h2" gutterBottom>
            Where would the learner attend?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pick the kind of learning hub. You’ll see its opening hours and days, then add your
            details on the next step.
          </Typography>
          <Controller
            name="hubType"
            control={control}
            render={({ field }) => (
              <HubTypeSchedule
                value={{ hubType: field.value, hubId: watch('hubId') }}
                onChange={(next) => {
                  field.onChange(next.hubType);
                  setValue('hubId', next.hubId || '');
                  setValue('hubName', next.hubName || '');
                }}
                error={errors.hubType?.message}
              />
            )}
          />
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={goToDetails}
          disabled={!hubType}
        >
          Continue
        </Button>
      </Box>
    );
  }

  // ---- Step 2 / the single form: details ------------------------------------
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'grid', gap: 2 }}>
      {withHub && status !== 'success' && (
        <>
          <Stepper activeStep={1} alternativeLabel sx={{ mb: 1 }}>
            <Step><StepLabel>Choose a hub</StepLabel></Step>
            <Step><StepLabel>Your details</StepLabel></Step>
          </Stepper>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => setStage('hub')}
              sx={{ px: 1 }}
            >
              Change hub
            </Button>
            <Chip
              label={`${HUB_TYPE_LABELS[hubType] || hubType}${hubName ? ` · ${hubName}` : ''}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </>
      )}

      <FormStatus
        status={status}
        successMessage={mutation.data?.message || defaultSuccess}
        error={mutation.error}
      />

      <Honeypot register={register} />

      {referenceLabel && !withHub && (
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

      {/* The pathway flow doesn't ask "Interested in" — they're enrolling in a named pathway. */}
      {!withHub && (
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
      )}

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
