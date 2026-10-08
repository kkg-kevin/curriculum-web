import Box from '@mui/material/Box';
import { ASIDE_WIDTH } from '../../theme/layout.js';

/**
 * The body of a detail page: the content on the left, and `aside` — the price, the key facts,
 * the one button that matters — in a panel on the right that stays in view while the content
 * scrolls. Below `lg` the panel drops under the content.
 */
export default function DetailLayout({ aside, children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 5, lg: 7 },
        gridTemplateColumns: { xs: '1fr', lg: `minmax(0, 1fr) ${ASIDE_WIDTH}px` },
        alignItems: 'start',
      }}
    >
      <Box sx={{ minWidth: 0 }}>{children}</Box>
      {/* 96px clears the sticky site header. */}
      <Box component="aside" sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
        {aside}
      </Box>
    </Box>
  );
}

/** The bordered card a detail page's side panel is made of. */
export function AsideCard({ children, sx }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'surface.ring',
        bgcolor: 'surface.card',
        boxShadow: 'shadow.md',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
