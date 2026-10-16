import Box from '@mui/material/Box';

/**
 * A row of page-level buttons (Enroll + Browse, Enquire + See all…). Side by side from `sm` up;
 * on a phone each takes the full width, one under the other, so the pair lines up instead of
 * stacking at two different widths. `actionRowSx` is the same rule for a wrapper that is already
 * something else (a <Reveal>).
 */
export const actionRowSx = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 1.5,
  '& > *': { flex: { xs: '1 1 100%', sm: '0 0 auto' } },
};

export default function ActionRow({ children, justify = 'flex-start', sx }) {
  return <Box sx={{ ...actionRowSx, justifyContent: justify, ...sx }}>{children}</Box>;
}
