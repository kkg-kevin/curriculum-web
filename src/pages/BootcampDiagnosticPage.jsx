import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { useBootcampDiagnostic, useSubmitBootcampDiagnostic } from '../hooks/useBootcampDiagnostic.js';
import { diagnosticAgeSchema, diagnosticContactSchema } from '../components/forms/schemas.js';
import { whatsAppUrl } from '../config/site.js';
import FormStatus from '../components/forms/FormStatus.jsx';
import DiagnosticQuestions from '../components/diagnostic/DiagnosticQuestions.jsx';
import DiagnosticReport from '../components/diagnostic/DiagnosticReport.jsx';
import BootcampNextStepsPanel from '../components/diagnostic/BootcampNextStepsPanel.jsx';

// The Bootcamp counterpart to DiagnosticPage.jsx (Pathways) — same flow (pick an age -> answer
// questions, giving a name + phone -> submit -> see the report), scoped to a Bootcamp instead of
// a Pathway. See that file's own comments for the per-step reasoning; identical here except for
// which hooks/labels/next-steps panel are used.
const STEP = { AGE: 'age', QUESTIONS: 'questions', REPORT: 'report' };

function AgeStep({ onSubmit, minAge, maxAge }) {
  const hasRange = Number.isFinite(minAge) && Number.isFinite(maxAge);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(diagnosticAgeSchema), defaultValues: { age: '' } });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => onSubmit(values.age))}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}
    >
      <Typography color="text.secondary">
        {hasRange
          ? `This diagnostic is for ages ${minAge}–${maxAge}. Enter the learner’s age to begin.`
          : 'Enter the learner’s age so we can show the right diagnostic questions.'}
      </Typography>
      <TextField
        label="Learner's age"
        type="number"
        inputProps={{ min: hasRange ? minAge : 3, max: hasRange ? maxAge : 19 }}
        {...register('age')}
        error={!!errors.age}
        helperText={
          errors.age?.message ||
          (hasRange ? `Enter an age between ${minAge} and ${maxAge}` : undefined)
        }
      />
      <Button type="submit" variant="contained" size="large">
        Continue
      </Button>
    </Box>
  );
}

export default function BootcampDiagnosticPage() {
  const { slug } = useParams();
  const { data: bootcamp, isLoading: bootcampLoading } = usePublicBootcamp(slug);

  const [step, setStep] = useState(STEP.AGE);
  const [age, setAge] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);

  const contactForm = useForm({
    resolver: zodResolver(diagnosticContactSchema),
    defaultValues: { parentName: '', parentPhone: '', childName: '' },
    mode: 'onTouched',
  });
  const childName = contactForm.watch('childName');

  const diagnosticQuery = useBootcampDiagnostic(slug, step === STEP.QUESTIONS ? age : null);
  const submitMutation = useSubmitBootcampDiagnostic(slug);

  const handleAgeSubmit = (submittedAge) => {
    setAge(submittedAge);
    setStep(STEP.QUESTIONS);
  };

  const handleSubmit = contactForm.handleSubmit(async ({ parentName, parentPhone, childName: cn }) => {
    const result = await submitMutation.mutateAsync({
      answers,
      parentName,
      parentPhone,
      childName: cn || undefined,
      childAge: age,
    });
    setReport(result.data);
    setStep(STEP.REPORT);
  });

  if (bootcampLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="text" width={240} height={28} />
        <Skeleton variant="text" width="60%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  const bootcampName = bootcamp?.name || 'this bootcamp';
  const diagMinAge = bootcamp?.diagnostic?.minAge ?? null;
  const diagMaxAge = bootcamp?.diagnostic?.maxAge ?? null;

  const mentorWhatsApp = whatsAppUrl(
    `Hi Digifunzi — my child ${childName ? `(${childName}) ` : ''}just did the ${bootcampName} diagnostic and I'd like to talk through next steps.`,
  );
  const mentorHref = mentorWhatsApp || '/contact?subject=Diagnostic%20follow-up';
  const mentorIsExternal = Boolean(mentorWhatsApp);

  const isReport = step === STEP.REPORT;
  const learnerLabel = childName || 'your learner';

  return (
    <>
      <SeoHead title={`${bootcampName} Diagnostic`} noindex />

      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 4, md: isReport ? 6 : 5 },
        }}
      >
        <Container maxWidth={isReport ? 'xl' : 'md'}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/bootcamps" underline="hover" color="inherit">
              Bootcamps
            </Link>
            <Link component={RouterLink} to={`/bootcamps/${slug}`} underline="hover" color="inherit">
              {bootcampName}
            </Link>
            <Typography color="text.primary">Diagnostic</Typography>
          </Breadcrumbs>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>
            {isReport ? `How ${learnerLabel} did` : `${bootcampName} Diagnostic`}
          </Typography>
          {isReport && (
            <Typography
              variant="h4"
              component="p"
              sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 640, mt: 1.5 }}
            >
              Here’s the graded report, and the ways you can pick up from here with {bootcampName}.
            </Typography>
          )}
        </Container>
      </Box>

      <Section maxWidth={isReport ? 'xl' : 'md'}>
        {step === STEP.AGE && (
          <AgeStep onSubmit={handleAgeSubmit} minAge={diagMinAge} maxAge={diagMaxAge} />
        )}

        {step === STEP.QUESTIONS && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {diagnosticQuery.isLoading && <LoadingBlock label="Loading questions…" />}

            {diagnosticQuery.isError && (
              <ErrorBlock
                error={{
                  message:
                    diagnosticQuery.error?.status === 404
                      ? `No diagnostic is available for ${bootcampName} at that age right now.`
                      : diagnosticQuery.error?.message,
                }}
                onRetry={diagnosticQuery.error?.status === 404 ? undefined : diagnosticQuery.refetch}
              />
            )}

            {diagnosticQuery.data && (
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography color="text.secondary" sx={{ '& p': { m: 0 } }}>
                  {diagnosticQuery.data.instructions ? (
                    <span dangerouslySetInnerHTML={{ __html: diagnosticQuery.data.instructions }} />
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
                    error={!!contactForm.formState.errors.parentName}
                    helperText={contactForm.formState.errors.parentName?.message}
                    inputProps={{ maxLength: 120 }}
                  />
                  <TextField
                    label="Phone number"
                    required
                    {...contactForm.register('parentPhone')}
                    error={!!contactForm.formState.errors.parentPhone}
                    helperText={contactForm.formState.errors.parentPhone?.message}
                    inputProps={{ maxLength: 20 }}
                  />
                  <TextField
                    label="Learner's first name (optional)"
                    {...contactForm.register('childName')}
                    error={!!contactForm.formState.errors.childName}
                    helperText={
                      contactForm.formState.errors.childName?.message ||
                      'Just so the report reads nicely — you can leave this blank'
                    }
                    inputProps={{ maxLength: 120 }}
                  />
                </Box>

                <DiagnosticQuestions items={diagnosticQuery.data.items} onChange={setAnswers} />

                <FormStatus status={submitMutation.isError ? 'error' : 'idle'} error={submitMutation.error} />

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? 'Grading…' : 'Submit & see my report'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {step === STEP.REPORT && report && (
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 3, lg: 4 },
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 760px) minmax(0, 1fr)' },
              alignItems: 'start',
            }}
          >
            <DiagnosticReport report={{ ...report, childName: childName || undefined, childAge: age }} />

            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              <BootcampNextStepsPanel
                enquireTo={`/enroll?interestedIn=bootcamp&referenceId=${encodeURIComponent(slug)}`}
                bootcampName={bootcampName}
                mentorHref={mentorHref}
                mentorIsExternal={mentorIsExternal}
              />
            </Box>
          </Box>
        )}
      </Section>
    </>
  );
}
