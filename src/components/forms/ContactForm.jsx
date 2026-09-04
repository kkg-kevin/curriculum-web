import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { contactSchema } from './schemas.js';
import { useContactSubmission, useLeadSubmission } from '../../hooks/useLeadSubmission.js';
import FormStatus from './FormStatus.jsx';
import Honeypot, { HONEYPOT_DEFAULT, isBot } from './Honeypot.jsx';

/**
 * Contact / general-inquiry form.
 *
 * By default it posts to POST /api/public/contact ({ name, email, phone, message },
 * notify-only). Set `useLeadsEndpoint` to route it through POST /api/public/leads
 * with interestedIn: 'general' instead — decide once the backend picks one (spec §4.5).
 *
 * `defaultMessage` pre-fills the message field (e.g. "Re: <competition> —
 * entry details" from the Competitions page).
 */
export default function ContactForm({ useLeadsEndpoint = false, defaultMessage = '' }) {
  const contactMutation = useContactSubmission();
  const leadMutation = useLeadSubmission();
  const mutation = useLeadsEndpoint ? leadMutation : contactMutation;

  const [spamBlocked, setSpamBlocked] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: defaultMessage, ...HONEYPOT_DEFAULT },
  });

  const onSubmit = async (values) => {
    if (isBot(values)) {
      setSpamBlocked(true);
      reset();
      return;
    }
    if (useLeadsEndpoint) {
      await leadMutation.mutateAsync({
        parentName: values.name,
        parentEmail: values.email,
        parentPhone: values.phone || '',
        learnerName: '',
        learnerAge: null,
        interestedIn: 'general',
        referenceId: null,
        note: values.message,
      });
    } else {
      await contactMutation.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone || '',
        message: values.message,
      });
    }
    reset();
  };

  const status =
    mutation.isSuccess || spamBlocked ? 'success' : mutation.isError ? 'error' : 'idle';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'grid', gap: 2 }}>
      <FormStatus
        status={status}
        successMessage={mutation.data?.message || 'Thanks — your message has been received and our team will be in touch.'}
        error={mutation.error}
      />

      <Honeypot register={register} />

      <TextField
        label="Your name"
        required
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField
          label="Email"
          type="email"
          required
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Phone (optional)"
          {...register('phone')}
          error={!!errors.phone}
          helperText={errors.phone?.message}
        />
      </Box>
      <TextField
        label="How can we help?"
        required
        multiline
        minRows={4}
        {...register('message')}
        error={!!errors.message}
        helperText={errors.message?.message}
      />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Sending…' : 'Send message'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        We use your details only to reply to your enquiry.
      </Typography>
    </Box>
  );
}
