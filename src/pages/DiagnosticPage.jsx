import { useState } from 'react';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
import { usePathway } from '../hooks/usePathways.js';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { useDiagnostic, useSubmitDiagnostic } from '../hooks/useDiagnostic.js';
import { diagnosticContactSchema } from '../components/forms/schemas.js';
import { whatsAppUrl } from '../config/site.js';
import { ageLabel } from '../utils/format.js';
import DiagnosticAnswerForm from '../components/diagnostic/DiagnosticAnswerForm.jsx';
import DiagnosticReport from '../components/diagnostic/DiagnosticReport.jsx';
import NextStepsPanel from '../components/diagnostic/NextStepsPanel.jsx';
import BirthDateStep from '../components/diagnostic/BirthDateStep.jsx';
import useScrollToFlowTop from '../hooks/useScrollToFlowTop.js';

// Flow: pick a pathway -> date of birth (its age fetches the right question set) -> answer the questions,
// giving a name + phone -> submit -> SEE THE REPORT. The name + phone are required before
// submitting; they become a `source: "diagnostic"` lead so the team can follow up. The report
// itself never exposes them.
//
// `?bootcamp=` links from before a bootcamp's Enroll button (BootcampEnrollPage.jsx, which picks
// the pathway from the child's age) still work here — the
// diagnostic itself is always the PATHWAY's own (no bootcamp-specific assessment override, see
// that resolver's comment), carried through via `?bootcamp=:bootcampSlug` purely so the report's
// "Where to from here" step can offer the bootcamp's own auto-provisioned-account enrollment
// instead of the generic pathway /enroll lead form.
const STEP = { AGE: 'age', QUESTIONS: 'questions', REPORT: 'report' };

// A pathway has one diagnostic per age group (developmental stage). `groups` are the ones on offer
// — [{ name, minAge, maxAge }] — and the learner's age decides which one they take.
const groupForAge = (groups, age) =>
  Number.isFinite(age) ? groups.find((g) => age >= g.minAge && age <= g.maxAge) || null : null;

const groupLabel = (g) => [g.name, ageLabel(g.minAge, g.maxAge)].filter(Boolean).join(' · ');

export default function DiagnosticPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const bootcampSlug = searchParams.get('bootcamp') || null;
  const { data: pathway, isLoading: pathwayLoading } = usePathway(slug);
  const { data: bootcamp } = usePublicBootcamp(bootcampSlug);

  const [step, setStep] = useState(STEP.AGE);
  const [age, setAge] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  // Each step (date of birth → questions → report) starts at the top of the page, under its heading.
  const flowRef = useScrollToFlowTop(step);

  // Contact details (name + phone required, learner name optional) — collected on the questions
  // step; submit is blocked until this validates.
  const contactForm = useForm({
    resolver: zodResolver(diagnosticContactSchema),
    defaultValues: { parentName: '', parentPhone: '', childName: '' },
    mode: 'onTouched',
  });
  const childName = contactForm.watch('childName');

  const diagnosticQuery = useDiagnostic(slug, step === STEP.QUESTIONS ? age : null);
  const submitMutation = useSubmitDiagnostic(slug);

  const handleBirthDateSubmit = (submittedDateOfBirth, submittedAge) => {
    setDateOfBirth(submittedDateOfBirth);
    setAge(submittedAge);
    setStep(STEP.QUESTIONS);
  };

  // Submit the answers -> create the lead + grade -> show the report. `parentName`/`parentPhone`
  // are required and feed the lead; `childName` is optional context that makes the report read
  // nicely ("… for Amara, age 10"). Only fires once the contact form validates (handleSubmit).
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
  const diagGroups = (pathway?.stages || [])
    .filter((s) => s.diagnostic?.available)
    .map((s) => ({ name: s.name, minAge: s.diagnostic.minAge, maxAge: s.diagnostic.maxAge }));
  const ageGroup = groupForAge(diagGroups, age);
  const changeAge = () => {
    setAnswers([]);
    setStep(STEP.AGE);
  };

  // "Speak to a mentor" → WhatsApp, pre-filled with the pathway + the learner's name if given.
  // whatsAppUrl returns null until a real number is set in src/config/site.js — until then the
  // button falls back to the contact page so it's never a dead end.
  const mentorWhatsApp = whatsAppUrl(
    `Hi Digifunzi — my child ${childName ? `(${childName}) ` : ''}just did the ${pathwayName} diagnostic and I'd like to talk through next steps.`,
  );
  const mentorHref = mentorWhatsApp || '/contact?subject=Diagnostic%20follow-up';
  const mentorIsExternal = Boolean(mentorWhatsApp);

  const isReport = step === STEP.REPORT;
  const learnerLabel = childName || 'your learner';

  return (
    <>
      <SeoHead title={`${pathwayName} Diagnostic`} noindex />

      <Box
        ref={flowRef}
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
            <Link component={RouterLink} to="/pathways" underline="hover" color="inherit">
              Pathways
            </Link>
            <Link component={RouterLink} to={`/pathways/${slug}`} underline="hover" color="inherit">
              {pathwayName}
            </Link>
            <Typography color="text.primary">Diagnostic</Typography>
          </Breadcrumbs>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 28, md: 36 } }}>
            {isReport ? `How ${learnerLabel} did` : `${pathwayName} Diagnostic`}
          </Typography>
          {isReport && (
            <Typography
              variant="h4"
              component="p"
              sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 640, mt: 1.5 }}
            >
              {bootcamp
                ? `Here's the graded report, and the ways you can pick up from here with ${bootcamp.name}.`
                : `Here’s the graded report, and the ways you can pick up from here in the ${pathwayName} pathway.`}
            </Typography>
          )}
        </Container>
      </Box>

      <Section maxWidth={isReport ? 'xl' : 'md'}>
        {step === STEP.AGE && (
          <BirthDateStep
            onSubmit={handleBirthDateSubmit}
            defaultDateOfBirth={dateOfBirth}
            checkAge={(a) => {
              if (diagGroups.length > 0) return groupForAge(diagGroups, a) ? null : 'There is no diagnostic for that age yet.';
              if (Number.isFinite(diagMinAge) && Number.isFinite(diagMaxAge) && (a < diagMinAge || a > diagMaxAge)) {
                return `This diagnostic is for ages ${diagMinAge}–${diagMaxAge}.`;
              }
              return null;
            }}
            intro="Choose the learner’s date of birth and we’ll give them the diagnostic for their age."
          />
        )}

        {step === STEP.QUESTIONS && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 600 }}>
                {ageGroup ? `${groupLabel(ageGroup)} diagnostic` : 'Diagnostic'} — for a learner aged {age}
              </Typography>
              <Button size="small" onClick={changeAge}>
                Change date of birth
              </Button>
            </Box>

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
              <DiagnosticAnswerForm
                diagnostic={diagnosticQuery.data}
                contactForm={contactForm}
                onAnswersChange={setAnswers}
                onSubmit={handleSubmit}
                submitMutation={submitMutation}
              />
            )}
          </Box>
        )}

        {step === STEP.REPORT && report && (
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 3, lg: 4 },
              // Report card on the left, next-steps + roadmap on the right on wide screens;
              // stacked below ~1000px.
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 760px) minmax(0, 1fr)' },
              alignItems: 'start',
            }}
          >
            <DiagnosticReport report={{ ...report, childName: childName || undefined, childAge: age }} />

            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              <NextStepsPanel
                enrollTo={`/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}`}
                pathwayName={pathwayName}
                courses={pathway?.courses || []}
                accent={pathway?.color}
                mentorHref={mentorHref}
                mentorIsExternal={mentorIsExternal}
                bootcamp={
                  bootcamp
                    ? {
                        slug: bootcamp.slug,
                        name: bootcamp.name,
                        defaultParentName: contactForm.getValues('parentName'),
                        defaultParentPhone: contactForm.getValues('parentPhone'),
                        defaultLearnerName: childName,
                        defaultLearnerDateOfBirth: dateOfBirth,
                        attemptId: report?.attemptId || null,
                      }
                    : null
                }
              />
            </Box>
          </Box>
        )}
      </Section>
    </>
  );
}
