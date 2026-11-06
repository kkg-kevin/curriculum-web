import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FramedImage from '../media/FramedImage.jsx';
import { formatKsh } from '../../cart/format.js';
import { periodUnit, planPrice } from '../../utils/pathwayPrice.js';
import { stageAgeLabel } from '../../utils/pathwayAges.js';
import { PERIOD_LABEL, pricesOf } from '../../content/homeSchooling.js';

/**
 * The pathway enrolment, laid out like a checkout: one step bar for the whole journey across the
 * top, the current step on the left, and a summary of what's being bought on the right (a strip
 * that opens on a phone).
 *
 * The steps (enrolSteps): Learner (date of birth) → Quick quiz (only when there is one for their
 * age) → Plan & hub → Your details → Pay — or, for a pathway not sold online, Learner → Quick
 * quiz → Your details (an enquiry).
 *
 * <EnrolCheckout> holds the frame; whoever renders the current step tells it what's known:
 *   - props `active` / `info` (PathwayEnrolJourney: the learner, the quiz);
 *   - useEnrolCheckout().report({ step, plan, hub, learners }) from inside (PathwayEnrollForm:
 *     its own steps, the plan and hub chosen, how many learners).
 */

export const STEP_LABELS = { learner: 'Learner', quiz: 'Quick quiz', plan: 'Plan & hub', details: 'Your details', pay: 'Pay' };

export function enrolSteps({ quiz = true, paid = true, learner = true } = {}) {
  return [learner && 'learner', quiz && 'quiz', ...(paid ? ['plan', 'details', 'pay'] : ['details'])].filter(Boolean);
}

const Ctx = createContext(null);
/** Inside an EnrolCheckout: { report(partial) } — null outside one. */
export const useEnrolCheckout = () => useContext(Ctx);

// ---- The step bar ---------------------------------------------------------------------------
function StepBar({ steps, active }) {
  const index = Math.max(0, steps.indexOf(active));
  return (
    <Box component="nav" aria-label="Enrolment steps" sx={{ mb: { xs: 2.5, md: 3.5 } }}>
      {/* Phone: "Step 2 of 5 · Quick quiz" and a progress line */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.secondary' }}>
          Step {index + 1} of {steps.length} · <Box component="span" sx={{ color: 'text.primary' }}>{STEP_LABELS[active]}</Box>
        </Typography>
        <Box sx={{ mt: 1, height: 6, borderRadius: 999, bgcolor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ width: `${((index + 1) / steps.length) * 100}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 999, transition: 'width 240ms ease' }} />
        </Box>
      </Box>
      {/* Larger: every step, done ones ticked */}
      <Box component="ol" sx={{ display: { xs: 'none', sm: 'flex' }, listStyle: 'none', m: 0, p: 0, alignItems: 'center' }}>
        {steps.map((key, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <Box component="li" key={key} aria-current={current ? 'step' : undefined} sx={{ display: 'flex', alignItems: 'center', flex: i === steps.length - 1 ? '0 0 auto' : '1 1 0', minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800,
                    border: '2px solid', borderColor: done || current ? 'primary.main' : 'divider',
                    bgcolor: done ? 'primary.main' : current ? (t) => alpha(t.palette.primary.main, 0.1) : 'background.paper',
                    color: done ? 'primary.contrastText' : current ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {done ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : i + 1}
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: current ? 800 : 600, color: current ? 'text.primary' : 'text.secondary', whiteSpace: 'nowrap' }}>
                  {STEP_LABELS[key]}
                </Typography>
              </Box>
              {i < steps.length - 1 && <Box aria-hidden sx={{ flex: 1, height: 2, mx: 1.5, minWidth: 16, borderRadius: 2, bgcolor: done ? 'primary.main' : 'divider' }} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ---- The summary ----------------------------------------------------------------------------
function Row({ label, children, muted = false }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline' }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: muted ? 500 : 700, color: muted ? 'text.secondary' : 'text.primary', textAlign: 'right', minWidth: 0 }}>{children}</Typography>
    </Box>
  );
}

function SummaryBody({ pathway, info, paid }) {
  const { plan, hub, learners = 1, stage, age, startsAt, quizDone, step } = info;
  const total = plan ? planPrice(plan, learners) : null;
  const unit = plan ? periodUnit(plan.billingPeriod) : null;
  const cheapest = (pathway.plans || []).reduce((min, p) => (min == null || p.amount < min.amount ? p : min), null);
  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <Row label="Plan">{plan ? (
        <>
          {plan.name}
          <Box component="span" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary', fontSize: 13 }}>
            {`Paid ${(PERIOD_LABEL[plan.billingPeriod] || 'monthly').toLowerCase()}`}{pricesOf(plan).length > 1 && step !== 'pay' ? ' — change it at Plan & hub' : ''}
          </Box>
        </>
      ) : paid && cheapest ? `From ${formatKsh(cheapest.amount, cheapest.currency)} / ${periodUnit(cheapest.billingPeriod)}` : 'Our team confirms'}</Row>
      {age != null && (
        <Row label="Learner">{`Age ${age}`}{learners > 1 ? ` + ${learners - 1} more` : ''}</Row>
      )}
      <Row label="Stage" muted={!stage}>
        {stage ? (
          <>
            {stage.name}
            {stage.minAge != null && <Box component="span" sx={{ display: 'block', fontWeight: 500, color: 'text.secondary', fontSize: 13 }}>{stageAgeLabel(stage.minAge, stage.maxAge)}</Box>}
          </>
        ) : age != null ? 'Not offered for this age' : 'From their date of birth'}
      </Row>
      {(startsAt || quizDone) && <Row label="Starts at">{quizDone ? 'Where their quiz places them' : startsAt}</Row>}
      {paid && <Row label="Hub" muted={!hub}>{hub ? hub.name : step === 'plan' ? 'Choose one' : 'Chosen at Plan & hub'}</Row>}
      {paid && plan && total != null && (
        <>
          <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', my: 0.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
            <Typography sx={{ fontWeight: 800 }}>First payment</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.35rem' }}>{formatKsh(total, plan.currency)}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: -0.75 }}>Then {formatKsh(total, plan.currency)} every {unit} — renews automatically.</Typography>
        </>
      )}
      {!paid && (
        <Typography variant="body2" color="text.secondary">Nothing to pay now — our team gets in touch to arrange a place.</Typography>
      )}
    </Box>
  );
}

function Summary({ pathway, info, paid }) {
  const [open, setOpen] = useState(false);
  const { plan, learners = 1 } = info;
  const total = plan ? planPrice(plan, learners) : null;
  return (
    <>
      {/* Phone: a strip that opens */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm', overflow: 'hidden' }}>
        <Box
          component="button"
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: 0, bgcolor: 'transparent', font: 'inherit', color: 'text.primary', cursor: 'pointer', textAlign: 'left' }}
        >
          {pathway.image && <Box component="img" src={pathway.image} alt="" sx={{ width: 44, height: 44, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pathway.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5 }}>
              {plan && total != null ? `${plan.name} · ${formatKsh(total, plan.currency)} / ${periodUnit(plan.billingPeriod)}` : 'Your enrolment'}
            </Typography>
          </Box>
          <Typography component="span" sx={{ fontSize: 12.5, fontWeight: 700, color: 'primary.main', display: 'inline-flex', alignItems: 'center' }}>
            {open ? 'Hide' : 'Details'} <ExpandMoreRoundedIcon sx={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />
          </Typography>
        </Box>
        <Collapse in={open}>
          <Box sx={{ px: 2, pb: 2, pt: 0.5 }}><SummaryBody pathway={pathway} info={info} paid={paid} /></Box>
        </Collapse>
      </Box>

      {/* Large: a card beside the step */}
      <Box component="aside" aria-label="Your enrolment" sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 96 }}>
        <Box sx={{ borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.md', overflow: 'hidden' }}>
          {pathway.image && <FramedImage src={pathway.image} alt={`${pathway.name} pathway`} ratio="16 / 8" rounded={0} />}
          <Box sx={{ p: 2.5, display: 'grid', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main' }}>Your enrolment</Typography>
              <Typography variant="h5" component="p" sx={{ fontWeight: 800, mt: 0.25, lineHeight: 1.25 }}>{pathway.name}</Typography>
            </Box>
            <SummaryBody pathway={pathway} info={info} paid={paid} />
          </Box>
        </Box>
        <Box sx={{ mt: 1.5, px: 0.5, display: 'grid', gap: 0.75 }}>
          {paid && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              <LockOutlinedIcon sx={{ fontSize: 16 }} /> You pay at the last step, after the accounts are set up.
            </Typography>
          )}
          <Button component={RouterLink} to="/contact" size="small" startIcon={<ChatBubbleOutlineRoundedIcon />} sx={{ justifySelf: 'start', px: 0.5 }}>
            Questions? Talk to us
          </Button>
        </Box>
      </Box>
    </>
  );
}

// ---- The frame ------------------------------------------------------------------------------
/**
 * Props: pathway, steps (enrolSteps), active (a step key), info ({ plan, hub, learners, stage,
 * age, startsAt, quizDone } — what the journey knows), paid, children (the current step).
 */
export default function EnrolCheckout({ pathway, steps, active, info = {}, paid = true, children }) {
  const [reported, setReported] = useState({});
  const api = useMemo(() => ({ report: (partial) => setReported((r) => ({ ...r, ...partial })) }), []);
  // What the journey says now wins over an older report about the same thing; the step comes from
  // the form while it's showing (it moves Plan & hub → details → pay on its own).
  const formStep = reported.step && steps.includes(reported.step) && ['plan', 'details', 'pay'].includes(active) ? reported.step : active;
  // Only what was actually reported overrides the journey's (a reset leaves plan / hub undefined).
  const merged = { ...info, ...Object.fromEntries(Object.entries(reported).filter(([, v]) => v !== undefined)), step: formStep };
  useEffect(() => { if (!['plan', 'details', 'pay'].includes(active)) setReported((r) => ({ plan: r.plan, hub: r.hub })); }, [active]);

  return (
    <Ctx.Provider value={api}>
      <StepBar steps={steps} active={formStep} />
      <Box sx={{ display: 'grid', gap: { xs: 0, md: 4 }, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' } }}>
        <Box sx={{ minWidth: 0, order: { xs: 2, md: 1 } }}>{children}</Box>
        <Box sx={{ minWidth: 0, order: { xs: 1, md: 2 } }}>
          <Summary pathway={pathway} info={merged} paid={paid} />
        </Box>
      </Box>
    </Ctx.Provider>
  );
}

/** The white card each step sits in, with its title and a line under it. */
export function StepCard({ eyebrow, title, lead, children, sx }) {
  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card', boxShadow: 'shadow.sm', display: 'grid', gap: 2.5, ...sx }}>
      {(eyebrow || title || lead) && (
        <Box>
          {eyebrow && <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main', mb: 0.5 }}>{eyebrow}</Typography>}
          {title && <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>{title}</Typography>}
          {lead && <Typography color="text.secondary" sx={{ mt: 0.75 }}>{lead}</Typography>}
        </Box>
      )}
      {children}
    </Box>
  );
}
