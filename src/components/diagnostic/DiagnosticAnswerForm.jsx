import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PrivacyNote from '../forms/PrivacyNote.jsx';
import FormStatus from '../forms/FormStatus.jsx';
import DiagnosticQuestions from './DiagnosticQuestions.jsx';

/**
 * The questions step of a public diagnostic: the instructions, "Your details" (name + phone
 * required, learner name optional), the questions, and the submit button. Shared by the pathway
 * diagnostic (DiagnosticPage) and a bootcamp's Enroll flow (BootcampEnrollPage).
 *
 * Props:
 *   diagnostic     — the GET /api/public/diagnostics/:id response data ({ instructions, items })
 *   contactForm    — the page's react-hook-form instance for the details (the page keeps it so the
 *                    report and the enrolment form can pre-fill from it)
 *   onAnswersChange, onSubmit — answers go up as they change; onSubmit is the form's submit handler
 *   submitMutation — the useSubmitDiagnostic mutation, for its pending/error state
 */
export default function DiagnosticAnswerForm({ diagnostic, contactForm, onAnswersChange, onSubmit, submitMutation }) {
  const { errors } = contactForm.formState;
  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography color="text.secondary" sx={{ '& p': { m: 0 } }}>
        {diagnostic.instructions ? (
          <span dangerouslySetInnerHTML={{ __html: diagnostic.instructions }} />
        ) : (
          'Answer as many questions as you can — there is no time limit. You’ll see your results as soon as you submit.'
        )}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: 480,
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'surface.subtle',
        }}
      >
        <Typography variant="subtitle2">Your details</Typography>
        <Typography variant="body2" color="text.secondary">
          We&apos;ll send your report to the screen straight away. Your name and phone let
          our team follow up with next steps.
        </Typography>
        <TextField
          label="Your name"
          required
          {...contactForm.register('parentName')}
          error={!!errors.parentName}
          helperText={errors.parentName?.message}
          inputProps={{ maxLength: 120 }}
        />
        <TextField
          label="Phone number"
          required
          {...contactForm.register('parentPhone')}
          error={!!errors.parentPhone}
          helperText={errors.parentPhone?.message}
          inputProps={{ maxLength: 20 }}
        />
        <TextField
          label="Learner's first name (optional)"
          {...contactForm.register('childName')}
          error={!!errors.childName}
          helperText={errors.childName?.message || 'Just so the report reads nicely — you can leave this blank'}
          inputProps={{ maxLength: 120 }}
        />
      </Box>

      <DiagnosticQuestions items={diagnostic.items} onChange={onAnswersChange} />

      <FormStatus status={submitMutation.isError ? 'error' : 'idle'} error={submitMutation.error} />

      <Box>
        <Button type="submit" variant="contained" size="large" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? 'Grading…' : 'Submit & see my report'}
        </Button>
        <PrivacyNote sx={{ display: 'block', mt: 1.5 }}>
          We use your name and phone number to follow up on this diagnostic. See our
        </PrivacyNote>
      </Box>
    </Box>
  );
}
