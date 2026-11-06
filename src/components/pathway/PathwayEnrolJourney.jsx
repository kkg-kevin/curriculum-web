import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import { ErrorBlock, LoadingBlock } from '../common/StateViews.jsx';
import { useDiagnostic, useSubmitDiagnostic } from '../../hooks/useDiagnostic.js';
import { diagnosticContactSchema, learnerBirthDateSchema } from '../forms/schemas.js';
import { ageLabel } from '../../utils/format.js';
import { ageOn } from '../../utils/dates.js';
import { startFor } from '../../utils/pathwayPrice.js';
import { stageAgeLabel } from '../../utils/pathwayAges.js';
import DiagnosticAnswerForm from '../diagnostic/DiagnosticAnswerForm.jsx';
import DiagnosticReport from '../diagnostic/DiagnosticReport.jsx';
import DateOfBirthField from '../forms/DateOfBirthField.jsx';
import EnrolCheckout, { StepCard, enrolSteps } from '../enrol/EnrolCheckout.jsx';
import useScrollToFlowTop from '../../hooks/useScrollToFlowTop.js';
import { atPeriod, defaultPeriodOf } from '../../content/homeSchooling.js';

const STEP = { AGE: 'age', QUESTIONS: 'questions', REPORT: 'report', ENROL: 'enrol' };

// The diagnostics on offer — one per developmental stage, for its ages. From a stage's page only
// that stage's.
function diagnosticGroups(pathway, stageSlug) {
  const offered = (pathway?.stages || []).filter((s) => s.diagnostic?.available);
  const stage = stageSlug ? offered.find((s) => s.slug === stageSlug) || null : null;
  return { stage, groups: (stage ? [stage] : offered).map((s) => ({ name: s.name, minAge: s.diagnostic.minAge, maxAge: s.diagnostic.maxAge })) };
}
const groupForAge = (groups, age) => (Number.isFinite(age) ? groups.find((g) => age >= g.minAge && age <= g.maxAge) || null : null);

// A selectable card with a radio mark (take the quiz / skip it).
function Choice({ selected, onClick, icon: Icon, title, text, badge }) {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      sx={{
        width: '100%', textAlign: 'left', p: 2, borderRadius: 3, cursor: 'pointer', font: 'inherit', color: 'text.primary',
        display: 'flex', gap: 1.5, alignItems: 'flex-start',
        border: '2px solid', borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: (t) => (selected ? alpha(t.palette.primary.main, 0.07) : t.palette.background.paper),
        transition: 'border-color .15s, background-color .15s',
        '&:hover': { borderColor: 'primary.main' },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
      }}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: (t) => alpha(t.palette.primary.main, selected ? 0.14 : 0.07), color: 'primary.main' }}>
        <Icon />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
          {badge && <Box component="span" sx={{ fontSize: 11, fontWeight: 800, px: 1, py: 0.2, borderRadius: 999, bgcolor: 'primary.main', color: 'primary.contrastText' }}>{badge}</Box>}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{text}</Typography>
      </Box>
      <Box component="span" aria-hidden sx={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: 0.25, border: '2px solid', borderColor: selected ? 'primary.main' : 'divider', display: 'grid', placeItems: 'center', bgcolor: 'background.paper' }}>
        {selected && <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />}
      </Box>
    </Box>
  );
}

// Step 1: the learner's date of birth — answered straight back with their stage, and (when there
// is a quiz for their age) the choice to take it or skip it.
function LearnerStep({ pathway, groups, restrictTo, defaultDateOfBirth, defaultQuiz, onPreview, onSubmit }) {
  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(learnerBirthDateSchema),
    defaultValues: { dateOfBirth: defaultDateOfBirth || '' },
    mode: 'onTouched',
  });
  const [quiz, setQuiz] = useState(defaultQuiz);
  const dob = watch('dateOfBirth');
  const age = ageOn(dob);
  const valid = age !== null && age >= 0;
  const est = valid ? startFor(pathway, dob) : null;
  const group = valid ? groupForAge(groups, age) : null;
  const outsideStage = restrictTo && valid && (age < restrictTo.diagnostic.minAge || age > restrictTo.diagnostic.maxAge);
  // The summary beside the step follows the date as it's typed.
  useEffect(() => { onPreview?.(dob); }, [dob, onPreview]);

  return (
    <StepCard
      eyebrow="The learner"
      title="When was the learner born?"
      lead="Their age decides their stage — the courses made for their age group."
    >
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(({ dateOfBirth }) => {
          const a = ageOn(dateOfBirth);
          if (outsideStage) {
            setError('dateOfBirth', { message: `${restrictTo.name} is for ${ageLabel(restrictTo.diagnostic.minAge, restrictTo.diagnostic.maxAge).toLowerCase()} — the learner is ${a}. Go back to the pathway and choose the stage for their age.` });
            return;
          }
          onSubmit(dateOfBirth, a, Boolean(group) && quiz);
        })}
        sx={{ display: 'grid', gap: 2.5 }}
      >
        <Box sx={{ maxWidth: 360 }}>
          <DateOfBirthField registration={register('dateOfBirth')} value={dob} error={errors.dateOfBirth} />
        </Box>

        {valid && !errors.dateOfBirth && (
          est?.stage ? (
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: (t) => alpha(t.palette.primary.main, 0.06), border: '1px solid', borderColor: (t) => alpha(t.palette.primary.main, 0.25), display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box sx={{ px: 1.25, py: 0.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>Age {age}</Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.35 }}>
                  Stage {(pathway.stages || []).indexOf(est.stage) + 1 || ''} · {est.stage.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[stageAgeLabel(est.stage.minAge, est.stage.maxAge), `${(est.stage.courses || []).length} courses`, est.course ? `first course: ${est.course.name}` : null].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="warning">{pathway.name} doesn’t have a stage for age {age} yet. You can still carry on — our team will help find the right fit.</Alert>
          )
        )}

        {valid && group && !outsideStage && (
          <Box role="radiogroup" aria-label="How should they start?" sx={{ display: 'grid', gap: 1.25 }}>
            <Typography sx={{ fontWeight: 800 }}>How should they start?</Typography>
            <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } }}>
              <Choice selected={quiz} onClick={() => setQuiz(true)} icon={QuizOutlinedIcon} badge="Recommended" title="Take the quick quiz"
                text="A few questions so they start at the course that fits what they already know." />
              <Choice selected={!quiz} onClick={() => setQuiz(false)} icon={SkipNextOutlinedIcon} title="Skip the quiz"
                text="They start at the first course of their stage, and can take the quiz later in their portal." />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            {valid && group && quiz && !outsideStage ? 'Start the quiz' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </StepCard>
  );
}

/**
 * The start of every pathway enrolment on the website, inside the enrolment checkout
 * (EnrolCheckout: one step bar, a summary beside it): the learner's date of birth (their stage
 * shown at once; take the quick quiz or skip it, when there is one for their age) → the quiz and
 * its result → the enrolment itself. The quiz is part of enrolling: its result places the learner
 * at the course their score earns (the attempt is handed on), and the name, date of birth and
 * parent details typed for it carry over.
 *
 * `children(start)` renders the enrolment — PathwayEnrollForm (plan & hub → details → payment) or
 * EnrollForm (an enquiry) — with start = { attemptId, dateOfBirth, childName, parentName,
 * parentPhone, onBack }. `stageSlug` (from a stage page) limits it to that stage's diagnostic and ages.
 * `planId` / `period` the plan and period picked on the pathway's page (or since, at Plan & hub —
 * PathwayEnrollForm keeps them in the address); `paid` whether it's sold online.
 */
export default function PathwayEnrolJourney({ pathway, slug, stageSlug = null, planId = null, period = null, paid = false, children }) {
  const { stage: restrictTo, groups } = diagnosticGroups(pathway, stageSlug);
  const [step, setStep] = useState(STEP.AGE);
  const [age, setAge] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [previewDob, setPreviewDob] = useState('');
  const [skippedQuiz, setSkippedQuiz] = useState(false);
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

  const start = () => ({
    attemptId: report?.attemptId || null,
    dateOfBirth,
    childName: contactForm.getValues('childName') || '',
    parentName: contactForm.getValues('parentName') || '',
    parentPhone: contactForm.getValues('parentPhone') || '',
    // Back from the enrolment's first step: to the quiz result, else the date of birth.
    onBack: () => setStep(report ? STEP.REPORT : STEP.AGE),
  });

  const handleSubmit = contactForm.handleSubmit(async ({ parentName, parentPhone, childName }) => {
    const result = await submitMutation.mutateAsync({
      answers, parentName, parentPhone, childName: childName || undefined, childAge: age, childDateOfBirth: dateOfBirth,
    });
    setReport(result.data);
    setStep(STEP.REPORT);
  });

  // The steps: the quiz only while there may be one for their age and it wasn't skipped.
  const knownAge = step === STEP.AGE ? ageOn(previewDob) : age;
  const quizPossible = groups.length > 0 && !skippedQuiz && (knownAge == null || knownAge < 0 || Boolean(groupForAge(groups, knownAge)));
  const steps = enrolSteps({ quiz: quizPossible, paid });
  const active = step === STEP.AGE ? 'learner' : step === STEP.ENROL ? (paid ? 'plan' : 'details') : 'quiz';

  const plans = pathway.plans || [];
  const found = plans.find((p) => p.id === planId) || plans[0] || null;
  const plan = found ? atPeriod(found, period || defaultPeriodOf(found)) : null;
  const shownDob = step === STEP.AGE ? previewDob : dateOfBirth;
  const est = shownDob ? startFor(pathway, shownDob) : null;
  const info = {
    plan: paid ? plan : null,
    age: est?.age ?? null,
    stage: est?.stage || null,
    startsAt: est?.course?.name || null,
    quizDone: Boolean(report),
  };

  return (
    <Box ref={flowRef} sx={{ scrollMarginTop: 88 }}>
      <EnrolCheckout pathway={pathway} steps={steps} active={active} info={info} paid={paid}>
        {step === STEP.AGE && (
          <LearnerStep
            pathway={pathway}
            groups={groups}
            restrictTo={restrictTo}
            defaultDateOfBirth={dateOfBirth}
            defaultQuiz={!skippedQuiz}
            onPreview={setPreviewDob}
            onSubmit={(dob, a, takeQuiz) => {
              setDateOfBirth(dob);
              setPreviewDob(dob);
              setAge(a);
              setAnswers([]);
              setReport(null);
              setSkippedQuiz(!takeQuiz && Boolean(groupForAge(groups, a)));
              setStep(takeQuiz ? STEP.QUESTIONS : STEP.ENROL);
            }}
          />
        )}

        {step === STEP.QUESTIONS && (
          // The quiz brings its own card — just its heading above it.
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main', mb: 0.5 }}>Quick quiz</Typography>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>{ageGroup ? `${ageGroup.name} quiz` : 'Quick quiz'}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                For a learner aged {age}{ageGroup ? ` (${ageLabel(ageGroup.minAge, ageGroup.maxAge).toLowerCase()})` : ''}. It isn’t a test to pass — it places them at the right course.
                {' '}<Button size="small" onClick={() => setStep(STEP.AGE)} sx={{ verticalAlign: 'baseline', px: 0.75, minWidth: 0 }}>Change date of birth</Button>
              </Typography>
            </Box>
            {diagnosticQuery.isLoading && <LoadingBlock label="Loading questions…" />}
            {diagnosticQuery.isError && (
              <>
                <ErrorBlock error={{ message: diagnosticQuery.error?.status === 404 ? 'There’s no quiz for that age right now — carry on to enrol.' : diagnosticQuery.error?.message }} />
                <Button variant="contained" onClick={() => { setSkippedQuiz(true); setStep(STEP.ENROL); }} sx={{ justifySelf: 'start' }}>Continue to enrol</Button>
              </>
            )}
            {diagnosticQuery.data && (
              <DiagnosticAnswerForm
                diagnostic={diagnosticQuery.data}
                contactForm={contactForm}
                onAnswersChange={setAnswers}
                onSubmit={handleSubmit}
                submitMutation={submitMutation}
                onSkip={() => { setSkippedQuiz(true); setStep(STEP.ENROL); }}
              />
            )}
          </Box>
        )}

        {step === STEP.REPORT && report && (
          <StepCard eyebrow="Quick quiz · done" title="Their result" lead="They start at the course this result earns. Your details carry over.">
            <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={() => setStep(STEP.ENROL)} sx={{ justifySelf: { xs: 'stretch', sm: 'start' } }}>
              Continue to {paid ? 'plan & hub' : 'your details'}
            </Button>
            <DiagnosticReport report={{ ...report, childName: contactForm.getValues('childName') || undefined, childAge: age }} />
            <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={() => setStep(STEP.ENROL)} sx={{ justifySelf: { xs: 'stretch', sm: 'end' } }}>
              Continue to {paid ? 'plan & hub' : 'your details'}
            </Button>
          </StepCard>
        )}

        {step === STEP.ENROL && (
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            {/* A paid enrolment has its own Back on its first step; an enquiry gets one here. */}
            {!paid && (
              <Box>
                <Button size="small" onClick={() => setStep(report ? STEP.REPORT : STEP.AGE)}>← Back</Button>
              </Box>
            )}
            {children(start())}
          </Box>
        )}
      </EnrolCheckout>
    </Box>
  );
}
