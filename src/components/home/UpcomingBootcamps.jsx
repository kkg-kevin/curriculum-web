import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Reveal from '../common/Reveal.jsx';
import BootcampCard from '../cards/BootcampCard.jsx';
import { usePublicBootcamps } from '../../hooks/usePublicBootcamps.js';
import { hasEnded } from '../../utils/dates.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../../theme/layout.js';

// One full row: the grid is four across on wide screens and three below that, where the fourth
// card is hidden rather than left to wrap onto a row of its own.
const MAX_SHOWN = 4;

/**
 * "Coming up" — the next bootcamps a family can still book, straight from the same
 * GET /api/public/bootcamps the Bootcamps page reads. The one dated, time-limited thing on an
 * otherwise evergreen home page.
 *
 * Renders nothing while loading, on an error, or when nothing is coming up, so the home page
 * never shows a spinner or an empty heading for it. The list arrives soonest-first (see
 * usePublicBootcamps); runs that have ended are left to the Bootcamps page.
 */
export default function UpcomingBootcamps() {
  const { data } = usePublicBootcamps();
  const upcoming = (data || []).filter((b) => !hasEnded(b.endDate));
  if (upcoming.length === 0) return null;

  const shown = upcoming.slice(0, MAX_SHOWN);

  return (
    <Section tone="subtle">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 4, md: 5 },
        }}
      >
        <SectionHeading
          eyebrow="Coming up"
          title="Holiday bootcamps"
          lead="Short, intensive programmes with a showcase at the end. Check the dates and register before the deadline."
        />
        <Button component={RouterLink} to="/bootcamps" variant="outlined">
          {upcoming.length > shown.length ? `See all ${upcoming.length} bootcamps` : 'About our bootcamps'}
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2.5, md: 3 },
          // Exactly one row (see MAX_SHOWN). With fewer than four to show, the cards sit together
          // in the middle instead of leaving empty columns on the right.
          gridTemplateColumns: CARD_GRID_COLUMNS,
          ...shortListSx(shown.length),
        }}
      >
        {shown.map((b, i) => (
          <Reveal key={b.id} delay={i * 90} sx={i === MAX_SHOWN - 1 ? { display: { xs: 'none', xl: 'block' } } : undefined}>
            <BootcampCard bootcamp={b} />
          </Reveal>
        ))}
      </Box>
    </Section>
  );
}
