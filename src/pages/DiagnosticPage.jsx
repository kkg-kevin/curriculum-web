import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SeoHead from '../components/seo/SeoHead.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import { usePathway } from '../hooks/usePathways.js';
import { useDiagnostic, useSubmitDiagnostic } from '../hooks/useDiagnostic.js';
import { diagnosticAgeSchema } from '../components/forms/schemas.js';
import FormStatus from '../components/forms/FormStatus.jsx';
import DiagnosticQuestions from '../components/diagnostic/DiagnosticQuestions.jsx';
import DiagnosticReport from '../components/diagnostic/DiagnosticReport.jsx';

// Flow: pick a pathway -> age (only to fetch the right question set) -> answer the questions ->
// submit -> SEE THE REPORT. No name/email is asked at any point — the visitor submits their
// answers and gets their graded report straight away, plus a permanent link to it. Enrolment
// (which does collect contact details) happens afterwards via the normal /enroll form.
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

// Shown on the REPORT step — the permanent, shareable URL for this graded report. The report is
// never emailed; this link (plus "Download PDF" on the report page) is how the visitor keeps it.
function ReportLinkCard({ url }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await window.navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked (insecure context / permissions) — the link is still selectable manually */
    }
  };

  return (
    <Box
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'surface.subtle',
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Keep this report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Bookmark or share this link — it opens the full report any time, and there’s a
        “Download PDF” button on it.
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          value={url}
          size="small"
          fullWidth
          InputProps={{ readOnly: true, sx: { fontSize: 13 } }}
          onFocus={(e) => e.target.select()}
        />
        <IconButton onClick={copy} aria-label="Copy report link" color={copied ? 'success' : 'default'}>
          {copied ? <CheckIcon /> : <ContentCopyIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default function DiagnosticPage() {
  const { slug } = useParams();
  const { data: pathway, isLoading: pathwayLoading } = usePathway(slug);

  const [step, setStep] = useState(STEP.AGE);
  const [age, setAge] = useState(null);
  const [childName, setChildName] = useState('');
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  const [reportItems, setReportItems] = useState([]);
  const [reportAnswers, setReportAnswers] = useState([]);
  const [attemptId, setAttemptId] = useState(null);

  const diagnosticQuery = useDiagnostic(slug, step === STEP.QUESTIONS ? age : null);
  const submitMutation = useSubmitDiagnostic(slug);

  const handleAgeSubmit = (submittedAge) => {
    setAge(submittedAge);
    setStep(STEP.QUESTIONS);
  };

  // Submit the answers -> grade -> show the report. Nothing else is collected. `childName` is
  // optional context that just makes the report read nicely ("… for Amara, age 10").
  const handleSubmit = async () => {
    const result = await submitMutation.mutateAsync({
      answers,
      childName: childName || undefined,
      childAge: age,
    });
    setReport(result.data);
    // Snapshotted now — itemResults alone carries no question text / the visitor's own answers,
    // both needed to render each feedback row (see DiagnosticReport.jsx).
    setReportItems(diagnosticQuery.data?.items || []);
    setReportAnswers(answers);
    setAttemptId(result.data?.attemptId ?? null);
    setStep(STEP.REPORT);
  };

  // The stored report page lives at this stable path (DiagnosticReportPage / the backend's
  // GET /api/public/diagnostics/attempts/:attemptId). Absolute so it's copy-paste shareable.
  const reportUrl = attemptId
    ? `${window.location.origin}/pathways/${slug}/diagnostic/report/${attemptId}`
    : null;

  if (pathwayLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="text" width={240} height={28} />
        <Skeleton variant="text" width="60%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  const pathwayName = pathway?.name || 'this pathway';
  const diagMinAge = pathway?.diagnostic?.minAge ?? null;
  const diagMaxAge = pathway?.diagnostic?.maxAge ?? null;

  return (
    <>
      <SeoHead title={`${pathwayName} Diagnostic`} noindex />

      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="md">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/pathways" underline="hover" color="inherit">
              Pathways
            </Link>
            <Link component={RouterLink} to={`/pathways/${slug}`} underline="hover" color="inherit">
              {pathwayName}
            </Link>
            <Typography color="text.primary">Diagnostic</Typography>
          </Breadcrumbs>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>
            {pathwayName} Diagnostic
          </Typography>
        </Container>
      </Box>

      <Section maxWidth="md">
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
                      ? `No diagnostic is available for ${pathwayName} at that age right now.`
                      : diagnosticQuery.error?.message,
                }}
                onRetry={diagnosticQuery.error?.status === 404 ? undefined : diagnosticQuery.refetch}
              />
            )}

            {diagnosticQuery.data && (
              <>
                <Typography color="text.secondary" sx={{ '& p': { m: 0 } }}>
                  {diagnosticQuery.data.instructions ? (
                    <span dangerouslySetInnerHTML={{ __html: diagnosticQuery.data.instructions }} />
                  ) : (
                    'Answer as many questions as you can — there is no time limit. You’ll see your results as soon as you submit.'
                  )}
                </Typography>

                <TextField
                  label="Learner's first name (optional)"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  helperText="Just so the report reads nicely — you can leave this blank"
                  sx={{ maxWidth: 420 }}
                  inputProps={{ maxLength: 120 }}
                />

                <DiagnosticQuestions items={diagnosticQuery.data.items} onChange={setAnswers} />

                <FormStatus status={submitMutation.isError ? 'error' : 'idle'} error={submitMutation.error} />

                <Box>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? 'Grading…' : 'Submit & see my report'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        {step === STEP.REPORT && report && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DiagnosticReport
              report={{ ...report, childName: childName || undefined, childAge: age }}
              items={reportItems}
              answers={reportAnswers}
            />

            {reportUrl && <ReportLinkCard url={reportUrl} />}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {reportUrl && (
                <Button
                  component={RouterLink}
                  to={`/pathways/${slug}/diagnostic/report/${attemptId}`}
                  variant="outlined"
                  size="large"
                >
                  Open &amp; download the report
                </Button>
              )}
              <Button
                component={RouterLink}
                to={`/enroll?interestedIn=project&referenceId=${encodeURIComponent(slug)}`}
                variant="contained"
                size="large"
              >
                Enroll in this pathway
              </Button>
              <Button component={RouterLink} to={`/pathways/${slug}`} variant="text" size="large">
                Back to {pathwayName}
              </Button>
            </Box>
          </Box>
        )}
      </Section>
    </>
  );
}
