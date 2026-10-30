import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import SmartImage from '../common/SmartImage.jsx';
import { ageLabel } from '../../utils/format.js';
import { PROSE_MAX_WIDTH } from '../../theme/layout.js';

/**
 * One course in a pathway's sequence: a numbered bubble on a rail joining it to the next, then the
 * course's cover, name, ages and description. The first carries "Start here". Used by a pathway's
 * stage page (PathwayStagePage) and, for a pathway with no stages, its own page.
 */
export default function PathwayCourseStep({ index, total, course, accent, headingLevel = 'h3' }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const age = ageLabel(course.ageMin, course.ageMax);

  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative' }}>
      {/* rail: number bubble + connecting line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: '#fff',
            bgcolor: accent,
            zIndex: 1,
          }}
        >
          {index + 1}
        </Box>
        {!isLast && <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 24, mt: 0.5 }} />}
      </Box>

      {/* step body */}
      <Box sx={{ pb: isLast ? 0 : 4, minWidth: 0 }}>
        {isFirst && (
          <Typography variant="overline" sx={{ color: accent, fontWeight: 700, letterSpacing: '0.08em' }}>
            Start here
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {course.coverImage && (
            <Box sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}>
              <SmartImage src={course.coverImage} alt={`${course.name}`} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4" component={headingLevel} gutterBottom>
              {course.name}
            </Typography>
            {age && <Chip size="small" variant="outlined" label={age} sx={{ mb: 1 }} />}
            {course.description && (
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH }}>
                {course.description}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
