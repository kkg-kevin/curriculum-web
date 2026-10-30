import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TimerOffRoundedIcon from '@mui/icons-material/TimerOffRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import PrivacyNote from '../forms/PrivacyNote.jsx';
import FormStatus from '../forms/FormStatus.jsx';
import { ItemField, isAnswered, kindHint } from './DiagnosticQuestions.jsx';
import useScrollToFlowTop from '../../hooks/useScrollToFlowTop.js';

/**
 * The questions step of a public diagnostic, made for the child taking it: a welcome card (their
 * first name, what to expect), then ONE question at a time with big answer cards, a progress bar
 * and numbered dots to jump between questions, then a finish screen that hands over to a grown-up
 * for the name + phone the report needs. Shared by the pathway diagnostic (DiagnosticPage) and a
 * bootcamp's Enroll flow (BootcampEnrollPage).
 *
 * Props:
 *   diagnostic     — the GET /api/public/diagnostics/:id response data ({ instructions, items })
 *   contactForm    — the page's react-hook-form instance for the details (the page keeps it so the
 *                    report and the enrolment form can pre-fill from it)
 *   onAnswersChange, onSubmit — answers go up as they change; onSubmit is the form's submit handler
 *   submitMutation — the useSubmitDiagnostic mutation, for its pending/error state
 *   onSkip         — optional (a bootcamp's Enroll): enrol without it. A learner takes ONE
 *                    diagnostic — this one, or the system's own in their portal after enrolling
 *                    (the server withdraws that one when this one placed them).
 */

const STAGE = { WELCOME: 'welcome', QUESTIONS: 'questions', FINISH: 'finish' };

// Said when a question gets an answer — about having answered, never about being right (the
// website doesn't know the answers until it's marked).
const CHEERS = ['Got it!', 'Nice one!', 'Great thinking!', 'Super!', 'Keep going!', 'Awesome!'];

const cardSx = {
  borderRadius: 6,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'background.paper',
  boxShadow: '0 10px 30px rgba(15, 35, 60, 0.08)',
  p: { xs: 2.25, sm: 3.5 },
};

function Mascot({ src, size = 120 }) {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden="true"
      sx={{ width: size, height: 'auto', flexShrink: 0, display: 'block', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }}
    />
  );
}

function Fact({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 999, backgroundColor: 'surface.subtle', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{children}</Typography>
    </Box>
  );
}

export default function DiagnosticAnswerForm({ diagnostic, contactForm, onAnswersChange, onSubmit, submitMutation, onSkip }) {
  const items = diagnostic.items || [];
  const total = items.length;
  const { errors } = contactForm.formState;
  const childName = (contactForm.watch('childName') || '').trim();

  const [stage, setStage] = useState(STAGE.WELCOME);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => new Map());
  // Each new screen (welcome, every question, the grown-up hand-over) starts at its top, just under
  // the header — on a phone the Next button sits below the fold.
  const topRef = useScrollToFlowTop(`${stage}:${current}`);

  const setResponse = (itemId, response) => {
    const next = new Map(answers);
    next.set(itemId, response);
    setAnswers(next);
    onAnswersChange?.([...next.entries()].map(([id, resp]) => ({ itemId: id, response: resp })));
  };

  // Leaving an ordering question untouched still counts its order as the answer — the child may
  // well think it's already right.
  const leaveCurrent = () => {
    const item = items[current];
    if (item?.kind === 'ordering' && !answers.has(item.id) && item.sequence?.length) setResponse(item.id, item.sequence);
  };
  const goTo = (index) => {
    leaveCurrent();
    setCurrent(index);
    setStage(STAGE.QUESTIONS);
  };
  const next = () => {
    leaveCurrent();
    if (current < total - 1) setCurrent(current + 1);
    else setStage(STAGE.FINISH);
  };
  const back = () => {
    leaveCurrent();
    if (current > 0) setCurrent(current - 1);
    else setStage(STAGE.WELCOME);
  };

  const answeredCount = items.filter((it) => isAnswered(it, answers.get(it.id))).length;
  const skipped = items.map((it, i) => (isAnswered(it, answers.get(it.id)) ? null : i)).filter((i) => i !== null);

  // ---- Welcome ------------------------------------------------------------------------------
  if (stage === STAGE.WELCOME) {
    return (
      <Box ref={topRef} sx={{ ...cardSx, display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 720 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <Mascot src="/mascot-girl.png" size={130} />
          <Box>
            <Typography component="h2" sx={{ fontSize: { xs: 26, sm: 30 }, fontWeight: 900, lineHeight: 1.15 }}>
              Hi{childName ? ` ${childName}` : ''}! Let&apos;s see what you already know.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 17, color: 'text.secondary' }}>
              Just try your best. It&apos;s fine not to know some answers — this helps us pick where you start.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <Fact icon={<QuizRoundedIcon fontSize="small" />}>{total} {total === 1 ? 'question' : 'questions'}</Fact>
          <Fact icon={<TimerOffRoundedIcon fontSize="small" />}>No timer</Fact>
          <Fact icon={<FavoriteRoundedIcon fontSize="small" />}>Skip any you&apos;re not sure about</Fact>
        </Box>

        {diagnostic.instructions && (
          <Box sx={{ fontSize: 15, color: 'text.secondary', '& p': { m: 0 } }} dangerouslySetInnerHTML={{ __html: diagnostic.instructions }} />
        )}

        <TextField
          label="What's your first name? (you can leave this)"
          {...contactForm.register('childName')}
          error={!!errors.childName}
          helperText={errors.childName?.message}
          slotProps={{ htmlInput: { maxLength: 120, style: { fontSize: 18 }, autoComplete: 'off' } }}
          sx={{ maxWidth: 420 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => goTo(0)}
            disabled={total === 0}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ px: 4, py: 1.5, fontSize: 18, fontWeight: 900, borderRadius: 999 }}
          >
            Let&apos;s go!
          </Button>
          {onSkip && (
            <Button onClick={onSkip} sx={{ fontWeight: 700 }}>
              Skip — do it after enrolling instead
            </Button>
          )}
        </Box>
        {onSkip && (
          <Typography sx={{ mt: -1, fontSize: 13.5, color: 'text.secondary' }}>
            Only one diagnostic is needed. Skip this one and {childName || 'the learner'} takes it in their Digifunzi portal after enrolling.
          </Typography>
        )}
      </Box>
    );
  }

  // ---- Finish: hand over to a grown-up -----------------------------------------------------
  if (stage === STAGE.FINISH) {
    return (
      <Box ref={topRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 720 }}>
        <Box sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <Mascot src="/mascot-boy.png" size={120} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <EmojiEventsRoundedIcon sx={{ color: 'secondary.main', fontSize: 34 }} />
              <Typography component="h2" sx={{ fontSize: { xs: 26, sm: 30 }, fontWeight: 900 }}>
                All done{childName ? `, ${childName}` : ''}!
              </Typography>
            </Box>
            <Typography sx={{ mt: 0.5, fontSize: 17, color: 'text.secondary' }}>
              You answered {answeredCount} of {total} {total === 1 ? 'question' : 'questions'}. Well done for trying!
            </Typography>
            {skipped.length > 0 && (
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>Want to try the ones you skipped?</Typography>
                {skipped.map((i) => (
                  <Button key={i} size="small" variant="outlined" onClick={() => goTo(i)} sx={{ borderRadius: 999, minWidth: 0, fontWeight: 800 }}>
                    {i + 1}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box component="form" onSubmit={onSubmit} noValidate sx={{ ...cardSx, display: 'flex', flexDirection: 'column', gap: 2, borderColor: 'primary.main', borderWidth: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main' }}>
              Now hand this to a grown-up
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 15, color: 'text.secondary' }}>
              The report shows on the screen straight away. Your name and phone let our team follow up with next steps.
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              label="Your name"
              required
              {...contactForm.register('parentName')}
              error={!!errors.parentName}
              helperText={errors.parentName?.message}
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <TextField
              label="Phone number"
              required
              type="tel"
              {...contactForm.register('parentPhone')}
              error={!!errors.parentPhone}
              helperText={errors.parentPhone?.message}
              slotProps={{ htmlInput: { maxLength: 20 } }}
            />
          </Box>

          <FormStatus status={submitMutation.isError ? 'error' : 'idle'} error={submitMutation.error} />

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button type="submit" variant="contained" size="large" disabled={submitMutation.isPending} sx={{ px: 3.5, fontWeight: 900, borderRadius: 999 }}>
              {submitMutation.isPending ? 'Marking…' : 'See the results'}
            </Button>
            <Button onClick={() => goTo(total - 1)} startIcon={<ArrowBackRoundedIcon />} disabled={submitMutation.isPending}>
              Back to the questions
            </Button>
          </Box>
          <PrivacyNote sx={{ display: 'block' }}>We use your name and phone number to follow up on this diagnostic. See our</PrivacyNote>
        </Box>
      </Box>
    );
  }

  // ---- One question at a time ---------------------------------------------------------------
  const item = items[current];
  const value = answers.get(item.id);
  const answered = isAnswered(item, value);
  const hint = kindHint(item);
  const progress = ((current + (answered ? 1 : 0.35)) / total) * 100;

  return (
    <Box ref={topRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 860 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
            Question {current + 1} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 700 }}>of {total}</Box>
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>{answeredCount} answered</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, progress)}
          sx={{ height: 12, borderRadius: 999, backgroundColor: 'surface.subtle', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
        />
      </Box>

      <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff', backgroundColor: 'primary.main' }}>
            {current + 1}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ fontSize: { xs: 20, sm: 23 }, fontWeight: 800, lineHeight: 1.35, '& p': { m: 0 }, '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, mt: 1 } }}
              dangerouslySetInnerHTML={{ __html: item.question }}
            />
            {hint && <Typography sx={{ mt: 0.75, fontSize: 15, color: 'text.secondary', fontWeight: 600 }}>{hint}</Typography>}
          </Box>
        </Box>

        <ItemField item={item} value={value} onChange={(v) => setResponse(item.id, v)} />

        <Typography aria-live="polite" sx={{ minHeight: 24, fontSize: 16, fontWeight: 800, color: 'success.main' }}>
          {answered ? CHEERS[current % CHEERS.length] : ''}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
          <Button variant="outlined" size="large" onClick={back} startIcon={<ArrowBackRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 800 }}>
            Back
          </Button>
          <Button
            variant={answered ? 'contained' : 'outlined'}
            size="large"
            onClick={next}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ borderRadius: 999, fontWeight: 900, px: 3.5 }}
          >
            {current === total - 1 ? 'Finish' : answered ? 'Next' : 'Skip'}
          </Button>
        </Box>
      </Box>

      {total > 1 && (
        <Box role="navigation" aria-label="Questions" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center' }}>
          {items.map((it, i) => {
            const done = isAnswered(it, answers.get(it.id));
            const here = i === current;
            return (
              <ButtonBase
                key={it.id}
                onClick={() => goTo(i)}
                aria-label={`Question ${i + 1}${done ? ', answered' : ''}`}
                aria-current={here ? 'step' : undefined}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  fontSize: 13,
                  fontWeight: 800,
                  border: '2px solid',
                  borderColor: here ? 'primary.main' : done ? 'success.main' : 'divider',
                  backgroundColor: done ? 'success.main' : 'background.paper',
                  color: done ? '#fff' : 'text.secondary',
                  transform: here ? 'scale(1.12)' : 'none',
                }}
              >
                {i + 1}
              </ButtonBase>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
