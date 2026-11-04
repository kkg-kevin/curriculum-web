import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { ErrorBlock, LoadingBlock } from '../common/StateViews.jsx';
import { useDiagnostic, useSubmitDiagnostic } from '../../hooks/useDiagnostic.js';
import { diagnosticContactSchema } from '../forms/schemas.js';
import { ageLabel } from '../../utils/format.js';
import DiagnosticAnswerForm from '../diagnostic/DiagnosticAnswerForm.jsx';
import DiagnosticReport from '../diagnostic/DiagnosticReport.jsx';
import BirthDateStep from '../diagnostic/BirthDateStep.jsx';
import useScrollToFlowTop from '../../hooks/useScrollToFlowTop.js';

const STEP = { AGE: 'age', QUESTIONS: 'questions', REPORT: 'report', ENROL: 'enrol' };

// The diagnostics on offer — one per developmental stage, for its ages. From a stage's page only
// that stage's.
function diagnosticGroups(pathway, stageSlug) {
  const offered = (pathway?.stages || []).filter((s) => s.diagnostic?.available);
  const stage = stageSlug ? offered.find((s) => s.slug === stageSlug) || null : null;
  return { stage, groups: (stage ? [stage] : offered).map((s) => ({ name: s.name, minAge: s.diagnostic.minAge, maxAge: s.diagnostic.maxAge })) };
}
const groupForAge = (groups, age) => (Number.isFinite(age) ? groups.find((g) => age >= g.minAge && age <= g.maxAge) || null : null);

/**
 * The start of every pathway enrolment on the website: the learner's date of birth, then — when
 * the pathway has a diagnostic for their age — the short diagnostic (with "Skip the diagnostic"),
 * its result, and only then the enrolment itself. The diagnostic is part of enrolling, not a
 * separate button: its result places the learner at the course their score earns (the attempt is
 * handed on), and the name, date of birth and parent details typed for it carry over.
 *
 * After the result the enrolment comes straight in — beside the result on a large screen (the
 * result on the left, the enrolment on the right, staying in view), under it on a phone.
 *
 * `children(start)` renders the enrolment — PathwayEnrollForm (plan & hub → details → payment) or
 * EnrollForm (an enquiry) — with start = { attemptId, dateOfBirth, childName, parentName,
 * parentPhone }. `stageSlug` (from a stage page) limits it to that stage's diagnostic and ages.
 */
export default function PathwayEnrolJourney({ pathway, slug, stageSlug = null, children }) {
  const { stage, groups } = diagnosticGroups(pathway, stageSlug);
  const [step, setStep] = useState(groups.length ? STEP.AGE : STEP.ENROL);
  const [age, setAge] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  const flowRef = useScrollToFlowTop(step);

  const contactForm = useForm({
    resolver: zodResolver(diagnosticContactSchema),
    defaultValues: { parentName: '', parentPhone: '', childName: '' },
    mode: 'onTouched',
  });
  const diagnosticQuery = useDiagnostic(slug, step === STEP.QUESTIONS ? age : null);
  const submitMutation = useSubmitDiagnostic(slug);
  const ageGroup = groupForAge(groups, age);
  const rangeMin = groups.length ? Math.min(...groups.map((g) => g.minAge)) : null;
  const rangeMax = groups.length ? Math.max(...groups.map((g) => g.maxAge)) : null;

  const start = () => ({
    attemptId: report?.attemptId || null,
    dateOfBirth,
    childName: contactForm.getValues('childName') || '',
    parentName: contactForm.getValues('parentName') || '',
    parentPhone: contactForm.getValues('parentPhone') || '',
  });

  const handleSubmit = contactForm.handleSubmit(async ({ parentName, parentPhone, childName }) => {
    const result = await submitMutation.mutateAsync({
      answers, parentName, parentPhone, childName: childName || undefined, childAge: age, childDateOfBirth: dateOfBirth,
    });
    setReport(result.data);
    setStep(STEP.REPORT);
  });

  const steps = ['Date of birth', 'Diagnostic', 'Enrol'];
  // The result step shows the enrolment beside it, so "Enrol" is where they are by then.
  const active = step === STEP.AGE ? 0 : step === STEP.QUESTIONS ? 1 : 2;
  const header = groups.length > 0 && step !== STEP.ENROL && (
    <Stepper activeStep={active} alternativeLabel sx={{ mb: 3 }}>
      {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
    </Stepper>
  );

  // The steps before the result keep a reading width; the result step uses the page's width.
  const narrow = { maxWidth: 720, mx: 'auto', width: '100%' };
  if (step === STEP.ENROL) return <Box ref={flowRef} sx={narrow}>{children(start())}</Box>;

  if (step === STEP.REPORT && report) {
    return (
      <Box ref={flowRef}>
        <Box sx={narrow}>{header}</Box>
        <Box sx={{ display: 'grid', gap: { xs: 3, md: 4 }, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' } }}>
          <Box sx={{ minWidth: 0 }}>
            {/* On a phone the enrolment comes after the whole report — a shortcut to it first. */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ display: { md: 'none' }, mb: 2 }}
              onClick={() => document.getElementById('pathway-enrol')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Continue to enrol
            </Button>
            <DiagnosticReport report={{ ...report, childName: contactForm.getValues('childName') || undefined, childAge: age }} />
          </Box>
          <Box id="pathway-enrol" sx={{ minWidth: 0, position: { md: 'sticky' }, top: { md: 88 }, scrollMarginTop: 80 }}>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Next: enrol in {pathway.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The learner starts at the course this result earns. Your details carry over.
            </Typography>
            {children(start())}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box ref={flowRef} sx={narrow}>
      {header}

      {step === STEP.AGE && (
        <BirthDateStep
          defaultDateOfBirth={dateOfBirth}
          intro={stage
            ? `First, when was the learner born? The ${stage.name} diagnostic (${ageLabel(stage.diagnostic.minAge, stage.diagnostic.maxAge).toLowerCase()}) is a short quiz so they start at the right course — you can skip it.`
            : `First, when was the learner born? If there’s a diagnostic for their age (${ageLabel(rangeMin, rangeMax).toLowerCase()}), it’s a short quiz so they start at the right course — you can skip it.`}
          checkAge={(a) => (stage && (a < stage.diagnostic.minAge || a > stage.diagnostic.maxAge)
            ? `${stage.name} is for ${ageLabel(stage.diagnostic.minAge, stage.diagnostic.maxAge).toLowerCase()} — the learner is ${a}. Enrol from the pathway’s own page for other ages.`
            : null)}
          onSubmit={(dob, a) => {
            setDateOfBirth(dob);
            setAge(a);
            setAnswers([]);
            // No diagnostic for this age: straight on to enrolling.
            setStep(groupForAge(groups, a) ? STEP.QUESTIONS : STEP.ENROL);
          }}
        />
      )}

      {step === STEP.QUESTIONS && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 600 }}>
              {ageGroup ? `${[ageGroup.name, ageLabel(ageGroup.minAge, ageGroup.maxAge)].filter(Boolean).join(' · ')} diagnostic` : 'Diagnostic'} — for a learner aged {age}
            </Typography>
            <Button size="small" onClick={() => setStep(STEP.AGE)}>Change date of birth</Button>
          </Box>
          {diagnosticQuery.isLoading && <LoadingBlock label="Loading questions…" />}
          {diagnosticQuery.isError && (
            <>
              <ErrorBlock error={{ message: diagnosticQuery.error?.status === 404 ? 'There’s no diagnostic for that age right now — carry on to enrol.' : diagnosticQuery.error?.message }} />
              <Button variant="contained" onClick={() => setStep(STEP.ENROL)} sx={{ justifySelf: 'start' }}>Continue to enrol</Button>
            </>
          )}
          {diagnosticQuery.data && (
            <DiagnosticAnswerForm
              diagnostic={diagnosticQuery.data}
              contactForm={contactForm}
              onAnswersChange={setAnswers}
              onSubmit={handleSubmit}
              submitMutation={submitMutation}
              onSkip={() => setStep(STEP.ENROL)}
            />
          )}
        </Box>
      )}

    </Box>
  );
}
