import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock, LoadingBlock } from '../components/common/StateViews.jsx';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { useDiagnostic, useSubmitDiagnostic } from '../hooks/useDiagnostic.js';
import { diagnosticContactSchema } from '../components/forms/schemas.js';
import DiagnosticAnswerForm from '../components/diagnostic/DiagnosticAnswerForm.jsx';
import DiagnosticReport from '../components/diagnostic/DiagnosticReport.jsx';
import BootcampEnrollForm from '../components/forms/BootcampEnrollForm.jsx';
import BirthDateStep from '../components/diagnostic/BirthDateStep.jsx';
import useScrollToFlowTop from '../hooks/useScrollToFlowTop.js';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EnrollProgress from '../components/bootcamp/EnrollProgress.jsx';
import EnrollSummary from '../components/bootcamp/EnrollSummary.jsx';
import { ageLabel } from '../utils/format.js';

// A bootcamp's Enroll button: date of birth (-> age) -> the diagnostic -> the report -> enrol. The visitor never
// picks a pathway: the bootcamp's pathways (pathwayDiagnostics, in the bootcamp's own order, each
// with its stage's age range — see public-bootcamp.service.js's resolvePathwayDiagnostics) are
// matched against the child's age and the FIRST one that covers it supplies the diagnostic. That
// diagnostic is the pathway's own, served and graded by the same /api/public/diagnostics API as
// /pathways/:slug/diagnostic (addressed by pathway id, so two pathways sharing a name can't mix).
// Nothing on the page names the pathway.
//
// When no pathway's diagnostic covers the age (or the bootcamp has none), the visitor goes
// straight to the enrolment form — the diagnostic shortens onboarding, it never blocks it.
const STEP = { AGE: 'age', QUESTIONS: 'questions', REPORT: 'report', ENROLL: 'enroll' };

// The date-of-birth and enrol steps: the step on the left, the bootcamp's summary on the right
// (below it on a phone).
const summaryLayout = {
  display: 'grid',
  gap: { xs: 3, md: 4 },
  gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px', lg: 'minmax(0, 1fr) 380px' },
  alignItems: 'start',
};

const pathwayForAge = (pathwayDiagnostics, age) =>
  pathwayDiagnostics.find(
    (pd) => Number.isFinite(pd.minAge) && Number.isFinite(pd.maxAge) && age >= pd.minAge && age <= pd.maxAge,
  ) || null;

export default function BootcampEnrollPage() {
  const { slug } = useParams();
  const { data: bootcamp, isLoading, isError, error, refetch } = usePublicBootcamp(slug);

  const [step, setStep] = useState(STEP.AGE);
  const [age, setAge] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pathway, setPathway] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  // Each step (date of birth → questions → report → enrol) starts at the top of the page, under its heading.
  const flowRef = useScrollToFlowTop(step);

  const contactForm = useForm({
    resolver: zodResolver(diagnosticContactSchema),
    defaultValues: { parentName: '', parentPhone: '', childName: '' },
    mode: 'onTouched',
  });
  const childName = contactForm.watch('childName');

  const diagnosticQuery = useDiagnostic(pathway?.pathwayId, step === STEP.QUESTIONS ? age : null);
  const submitMutation = useSubmitDiagnostic(pathway?.pathwayId);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="text" width={240} height={28} />
        <Skeleton variant="text" width="60%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError || !bootcamp) {
    const notFound = !bootcamp || error?.status === 404;
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <SeoHead title="Bootcamp not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This bootcamp doesn’t exist or isn’t open for bookings right now.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/bootcamps" variant="outlined">
            View all bootcamps
          </Button>
        </Box>
      </Container>
    );
  }

  const handleBirthDateSubmit = (submittedDateOfBirth, submittedAge) => {
    const match = pathwayForAge(bootcamp.pathwayDiagnostics || [], submittedAge);
    setDateOfBirth(submittedDateOfBirth);
    setAge(submittedAge);
    setPathway(match);
    setAnswers([]);
    setStep(match ? STEP.QUESTIONS : STEP.ENROLL);
  };
  const changeAge = () => {
    setAnswers([]);
    setStep(STEP.AGE);
  };

  const handleSubmit = contactForm.handleSubmit(async ({ parentName, parentPhone, childName: cn }) => {
    const result = await submitMutation.mutateAsync({
      answers,
      parentName,
      parentPhone,
      childName: cn || undefined,
      childAge: age,
      childDateOfBirth: dateOfBirth,
    });
    setReport(result.data);
    setStep(STEP.REPORT);
  });

  const isReport = step === STEP.REPORT;
  const learnerLabel = childName || 'your learner';
  // The steps a parent sees: no diagnostic step when the bootcamp offers none. The report counts
  // the diagnostic as done; enrolling from it (or skipping the quiz) is the last step.
  const hasDiagnostic = (bootcamp.pathwayDiagnostics || []).length > 0;
  const progressSteps = hasDiagnostic ? ['Date of birth', 'Short diagnostic', 'Enrol & pay'] : ['Date of birth', 'Enrol & pay'];
  const progressActive = step === STEP.AGE ? 0 : step === STEP.QUESTIONS ? 1 : progressSteps.length - 1;
  // The date-of-birth and enrol steps sit beside a summary of the bootcamp; the quiz stays narrow.
  const withSummary = step === STEP.AGE || step === STEP.ENROLL;
  const width = isReport ? 'xl' : withSummary ? 'lg' : 'md';
  const bootcampAges = ageLabel(bootcamp.ageMin, bootcamp.ageMax);
  const ageAdvice = (a) => {
    const below = bootcamp.ageMin != null && a < bootcamp.ageMin;
    const above = bootcamp.ageMax != null && a > bootcamp.ageMax;
    return below || above
      ? `${bootcamp.name} is for ${bootcampAges.toLowerCase()}, and your child is ${a}. You can still continue — or ask us first which bootcamp suits them.`
      : null;
  };
  // The diagnostic was removed or went out of range between loading the bootcamp and starting it.
  const diagnosticGone = diagnosticQuery.isError && diagnosticQuery.error?.status === 404;
  const enrollDefaults = {
    defaultParentName: contactForm.getValues('parentName'),
    defaultParentPhone: contactForm.getValues('parentPhone'),
    defaultLearnerName: childName,
    defaultLearnerDateOfBirth: dateOfBirth,
    attemptId: report?.attemptId || null,
  };

  return (
    <>
      <SeoHead title={`Enroll in ${bootcamp.name}`} noindex />

      <Box
        ref={flowRef}
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 4, md: isReport ? 6 : 5 },
        }}
      >
        <Container maxWidth={width}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/bootcamps" underline="hover" color="inherit">
              Bootcamps
            </Link>
            <Link component={RouterLink} to={`/bootcamps/${slug}`} underline="hover" color="inherit">
              {bootcamp.name}
            </Link>
            <Typography color="text.primary">Enroll</Typography>
          </Breadcrumbs>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>
            {isReport ? `How ${learnerLabel} did` : `Enroll in ${bootcamp.name}`}
          </Typography>
          {isReport ? (
            <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 640, mt: 1.5 }}>
              Here&apos;s the graded report — enrol in {bootcamp.name} when you&apos;re ready.
            </Typography>
          ) : (
            bootcamp.tagline && <Typography color="text.secondary" sx={{ maxWidth: 640, mt: 1 }}>{bootcamp.tagline}</Typography>
          )}
          <EnrollProgress steps={progressSteps} active={progressActive} />
        </Container>
      </Box>

      <Section maxWidth={width} py={{ xs: 4, md: 7 }}>
        {step === STEP.AGE && (
          <Box sx={summaryLayout}>
            <Box sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Step 1 of {progressSteps.length}
              </Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 0.5 }}>
                When was your child born?
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: 520 }}>
                {hasDiagnostic
                  ? 'Their age decides which short quiz they take, so they start at the right level. After the quiz you’ll see how they did, then enrol.'
                  : 'Their age places them at the right level. Next you’ll add your details and enrol.'}
                {bootcampAges && ` ${bootcamp.name} is for ${bootcampAges.toLowerCase()}.`}
              </Typography>
              <BirthDateStep
                onSubmit={handleBirthDateSubmit}
                defaultDateOfBirth={dateOfBirth}
                advice={ageAdvice}
                sx={{ maxWidth: 440 }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.25 }} />
                <Typography variant="body2" color="text.secondary">
                  We only use the date of birth to {hasDiagnostic ? 'choose the right questions and level' : 'place them at the right level'}.
                  No account is needed yet — you&apos;ll create the logins when you enrol.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <EnrollSummary bootcamp={bootcamp} hasDiagnostic={hasDiagnostic} />
            </Box>
          </Box>
        )}

        {step === STEP.QUESTIONS && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 600 }}>Diagnostic — for a learner aged {age}</Typography>
              <Button size="small" onClick={changeAge}>
                Change date of birth
              </Button>
            </Box>

            {diagnosticQuery.isLoading && <LoadingBlock label="Loading questions…" />}

            {diagnosticGone && (
              <BootcampEnrollForm bootcampSlug={bootcamp.slug} bootcampName={bootcamp.name} {...enrollDefaults} />
            )}

            {diagnosticQuery.isError && !diagnosticGone && (
              <ErrorBlock error={{ message: diagnosticQuery.error?.message }} onRetry={diagnosticQuery.refetch} />
            )}

            {diagnosticQuery.data && (
              <DiagnosticAnswerForm
                diagnostic={diagnosticQuery.data}
                contactForm={contactForm}
                onAnswersChange={setAnswers}
                onSubmit={handleSubmit}
                submitMutation={submitMutation}
                onSkip={() => setStep(STEP.ENROLL)}
              />
            )}
          </Box>
        )}

        {step === STEP.ENROLL && (
          <Box sx={summaryLayout}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <Box>
                <Button size="small" onClick={changeAge}>
                  Change date of birth
                </Button>
              </Box>
              <BootcampEnrollForm bootcampSlug={bootcamp.slug} bootcampName={bootcamp.name} {...enrollDefaults} />
            </Box>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
              <EnrollSummary bootcamp={bootcamp} hasDiagnostic={false} />
            </Box>
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
            {/* Reported against the bootcamp, not the pathway that supplied the questions. */}
            <DiagnosticReport
              report={{
                ...report,
                pathwayName: undefined,
                bootcampName: bootcamp.name,
                childName: childName || undefined,
                childAge: age,
              }}
            />

            {/* The report's only next step is enrolling, so its details form opens right beside it. */}
            <Box sx={{ minWidth: 0 }}>
              <BootcampEnrollForm bootcampSlug={bootcamp.slug} bootcampName={bootcamp.name} {...enrollDefaults} />
            </Box>
          </Box>
        )}
      </Section>
    </>
  );
}
