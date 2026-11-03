import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { stageAgeShort } from '../../utils/pathwayAges.js';

/**
 * A pathway's developmental stages as one row of steps, youngest first — "Stage 1 · 5–7 · Junior
 * Coders Academy" → "Stage 2 · 8–10 · …". Scrolls sideways on a phone.
 *
 * - `onSelect(stage)` — the steps are buttons choosing which stage the page shows (a pathway's
 *   page); else `hrefFor(stage)` — they're links to each stage's own page (a stage page).
 * - `activeSlug` — the stage shown now.
 */
export default function StageLadder({ stages, activeSlug, onSelect, hrefFor, label = 'Stages' }) {
  return (
    <Box
      component="ol"
      aria-label={label}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        pb: 0.5,
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: { xs: 'minmax(168px, 1fr)', md: 'minmax(150px, 1fr)' },
        gap: 1.25,
        overflowX: 'auto',
        scrollSnapType: 'x proximity',
        // the scrollbar only where it scrolls
        scrollbarWidth: 'thin',
      }}
    >
      {stages.map((stage, i) => {
        const active = stage.slug === activeSlug;
        const ages = stageAgeShort(stage.minAge, stage.maxAge);
        const linkProps = onSelect
          ? { component: 'button', type: 'button', onClick: () => onSelect(stage), 'aria-pressed': active }
          : { component: RouterLink, to: hrefFor(stage), 'aria-current': active ? 'page' : undefined };
        return (
          <Box component="li" key={stage.slug} sx={{ scrollSnapAlign: 'start', minWidth: 0 }}>
            <Box
              {...linkProps}
              sx={{
                width: '100%',
                height: '100%',
                textAlign: 'left',
                font: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
                p: 1.5,
                borderRadius: 2.5,
                border: '1.5px solid',
                borderColor: active ? 'primary.main' : 'divider',
                bgcolor: (t) => (active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.22 : 0.08) : t.palette.background.paper),
                color: 'text.primary',
                textDecoration: 'none',
                transition: 'border-color 160ms ease, background-color 160ms ease',
                '&:hover': { borderColor: 'primary.main' },
                '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? 'primary.main' : 'text.secondary' }}>
                  Stage {i + 1}
                </Typography>
                {ages && (
                  <Typography component="span" sx={{ fontSize: 12, fontWeight: 800, color: 'text.secondary' }}>
                    {ages}
                  </Typography>
                )}
              </Box>
              <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>
                {stage.name || 'More courses'}
              </Typography>
              <Typography component="span" sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                {(stage.courses || []).length || stage.courseCount || 0} courses
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
