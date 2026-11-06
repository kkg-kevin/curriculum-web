import Box from '@mui/material/Box';
import { PERIOD_LABEL } from '../../content/homeSchooling.js';

/**
 * Weekly | Monthly | 3 months | Yearly — a pill switch between the periods a package is offered
 * for. `periods` in order; `value` the chosen one. Keyboard: the buttons are a radio group.
 * `fullWidth`: the buttons share the whole row equally (a package card) — it never scrolls.
 */
export default function PeriodSwitch({ periods, value, onChange, label = 'How often you pay', size = 'small', fullWidth = false }) {
  if (!periods || periods.length < 2) return null;
  const small = size === 'small';
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{
        display: fullWidth ? 'grid' : 'inline-flex',
        gridTemplateColumns: fullWidth ? `repeat(${periods.length}, minmax(0, 1fr))` : undefined,
        width: fullWidth ? '100%' : 'auto',
        p: 0.4, gap: 0.25, borderRadius: 999, bgcolor: 'surface.subtle', border: '1px solid', borderColor: 'divider', maxWidth: '100%', boxSizing: 'border-box',
      }}
    >
      {periods.map((period) => {
        const on = period === value;
        return (
          <Box
            key={period}
            component="button"
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(period)}
            sx={{
              border: 0,
              cursor: 'pointer',
              font: 'inherit',
              fontSize: small ? '0.78rem' : '0.86rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              px: fullWidth ? 0.5 : small ? 1.25 : 1.75,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              py: small ? 0.5 : 0.75,
              borderRadius: 999,
              color: on ? 'primary.contrastText' : 'text.secondary',
              bgcolor: on ? 'primary.main' : 'transparent',
              boxShadow: on ? 'shadow.md' : 'none',
              transition: 'background-color 160ms ease, color 160ms ease',
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              '@media (hover: hover)': { '&:hover': { color: on ? 'primary.contrastText' : 'text.primary' } },
            }}
          >
            {PERIOD_LABEL[period] || period}
          </Box>
        );
      })}
    </Box>
  );
}
