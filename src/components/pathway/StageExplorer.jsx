import { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandableText from '../common/ExpandableText.jsx';
import PathwayCourseStep from './PathwayCourseStep.jsx';
import { stageAgeLabel, stageAgeShort } from '../../utils/pathwayAges.js';

/**
 * A pathway's developmental stages, explored in place.
 *
 * Large screen: the stages as a vertical ladder on the left (youngest first, joined by a line — it
 * reads as a progression) and the chosen stage's courses on the right. It is a set of vertical tabs:
 * ↑ / ↓ (and Home / End) move between stages.
 * Phone: an accordion — each stage a row; the chosen one opens its courses right under it.
 *
 * `stages`, `activeSlug`, `onSelect(stage)`, `accent`, `label` (the ladder's accessible name),
 * `enrolTo` (the pathway's enrol address — the chosen stage's Enrol adds `&stage=`) and `enrolLabel`.
 */
const courseCount = (stage) => (stage.courses || []).length || stage.courseCount || 0;

// `compact` (the phone accordion): the row above already names the stage and its ages.
function StagePanel({ stage, number, accent, idPrefix, compact = false, enrolTo, enrolLabel }) {
  const courses = stage.courses || [];
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2.5 }}>
        <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
          {!compact && (
            <>
              <Typography variant="overline" component="p" sx={{ color: 'text.secondary', fontWeight: 800, lineHeight: 1.6 }}>
                Stage {number} · {stageAgeLabel(stage.minAge, stage.maxAge) || 'All ages'}
              </Typography>
              <Typography id={`${idPrefix}-title`} variant="h4" component="h3">{stage.name || 'More courses'}</Typography>
            </>
          )}
          {stage.description && (
            <ExpandableText lines={3} variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {stage.description}
            </ExpandableText>
          )}
        </Box>
        {enrolTo && (
          <Button component={RouterLink} to={`${enrolTo}&stage=${encodeURIComponent(stage.slug)}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ flexShrink: 0 }}>
            {enrolLabel} · {stage.name || 'this stage'}
          </Button>
        )}
      </Box>
      {courses.length ? (
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {courses.map((course, i) => (
            <PathwayCourseStep key={`${stage.slug}-${course.name}-${i}`} index={i} total={courses.length} course={course} accent={accent} />
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">Courses for this stage are being added.</Typography>
      )}
    </>
  );
}

// One stage on the ladder: a numbered dot on the line, then its ages, name and course count.
function StageButton({ stage, number, active, last, onClick, onKeyDown, tabProps, buttonRef, accordion = false }) {
  const ages = stageAgeShort(stage.minAge, stage.maxAge);
  const count = courseCount(stage);
  return (
    <Box
      component="button"
      type="button"
      ref={buttonRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...tabProps}
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        pr: accordion ? 1.5 : 2,
        textAlign: 'left',
        font: 'inherit',
        color: 'text.primary',
        cursor: 'pointer',
        border: '1.5px solid',
        borderColor: active && !accordion ? 'primary.main' : 'transparent',
        borderRadius: 3,
        bgcolor: (t) => (active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.22 : 0.08) : 'transparent'),
        transition: 'background-color 160ms ease, border-color 160ms ease',
        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, active ? 0.1 : 0.05) },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
      }}
    >
      {/* the ladder: a dot per stage, a line down to the next */}
      <Box sx={{ position: 'relative', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 800,
            zIndex: 1,
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: active ? 'primary.main' : 'background.paper',
            color: active ? 'primary.contrastText' : 'primary.main',
          }}
        >
          {number}
        </Box>
        {!last && !accordion && (
          <Box aria-hidden sx={{ position: 'absolute', top: 30, bottom: -26, width: 2, bgcolor: 'divider' }} />
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
        <Typography component="span" sx={{ display: 'block', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: active ? 'primary.main' : 'text.secondary' }}>
          Stage {number}{ages ? ` · Ages ${ages}` : ''}
        </Typography>
        <Typography component="span" sx={{ display: 'block', fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, mt: 0.25 }}>
          {stage.name || 'More courses'}
        </Typography>
        <Typography component="span" sx={{ display: 'block', fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          {count} {count === 1 ? 'course' : 'courses'}
        </Typography>
      </Box>
      {accordion && (
        <ExpandMoreRoundedIcon sx={{ alignSelf: 'center', color: 'text.secondary', transition: 'transform 160ms ease', transform: active ? 'rotate(180deg)' : 'none' }} />
      )}
    </Box>
  );
}

export default function StageExplorer({ stages, activeSlug, onSelect, accent, label = 'Stages', enrolTo = null, enrolLabel = 'Enrol' }) {
  const refs = useRef([]);
  const activeIndex = Math.max(0, stages.findIndex((s) => s.slug === activeSlug));
  const active = stages[activeIndex];

  // Vertical tabs: arrows move and choose.
  const onKeyDown = (event, index) => {
    const last = stages.length - 1;
    const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = Math.min(last, Math.max(0, next));
    onSelect(stages[target]);
    refs.current[target]?.focus();
  };

  return (
    <>
      {/* Large screen: ladder | courses */}
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'minmax(240px, 300px) minmax(0, 1fr)',
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Box
          role="tablist"
          aria-label={label}
          aria-orientation="vertical"
          sx={{ display: 'grid', gap: 1.5, position: { md: 'sticky' }, top: { md: 96 } }}
        >
          {stages.map((stage, i) => {
            const on = i === activeIndex;
            return (
              <StageButton
                key={stage.slug}
                stage={stage}
                number={i + 1}
                active={on}
                last={i === stages.length - 1}
                onClick={() => onSelect(stage)}
                onKeyDown={(e) => onKeyDown(e, i)}
                buttonRef={(el) => { refs.current[i] = el; }}
                tabProps={{
                  role: 'tab',
                  id: `stage-tab-${stage.slug}`,
                  'aria-selected': on,
                  'aria-controls': 'stage-panel',
                  tabIndex: on ? 0 : -1,
                }}
              />
            );
          })}
        </Box>
        <Box
          role="tabpanel"
          id="stage-panel"
          aria-labelledby={`stage-tab-${active.slug}`}
          sx={{ minWidth: 0, p: { md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', boxShadow: 'shadow.sm' }}
        >
          <StagePanel stage={active} number={activeIndex + 1} accent={accent} idPrefix="stage-panel" enrolTo={enrolTo} enrolLabel={enrolLabel} />
        </Box>
      </Box>

      {/* Phone: an accordion — the chosen stage opens in place */}
      <Box component="ol" aria-label={label} sx={{ display: { xs: 'grid', md: 'none' }, listStyle: 'none', m: 0, p: 0, gap: 1.25 }}>
        {stages.map((stage, i) => {
          const on = i === activeIndex;
          return (
            <Box
              component="li"
              key={stage.slug}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: on ? 'primary.main' : 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}
            >
              <StageButton
                stage={stage}
                number={i + 1}
                active={on}
                last
                accordion
                onClick={() => onSelect(stage)}
                tabProps={{ 'aria-expanded': on, 'aria-controls': `stage-acc-${stage.slug}` }}
              />
              {on && (
                <Box id={`stage-acc-${stage.slug}`} sx={{ px: 2, pb: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <StagePanel stage={stage} number={i + 1} accent={accent} idPrefix={`stage-acc-${stage.slug}`} compact enrolTo={enrolTo} enrolLabel={enrolLabel} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );
}
