import Box from '@mui/material/Box';
import { formatKsh } from '../../cart/format.js';
import Typography from '@mui/material/Typography';
import FramedImage from '../media/FramedImage.jsx';
import ExpandableText from '../common/ExpandableText.jsx';
import { stageAgeLabel } from '../../utils/pathwayAges.js';

/**
 * One course in a pathway's sequence: a numbered bubble on a rail joining it to the next, then the
 * course's cover, name, ages, price and description (two lines, "Read more" for the rest). The
 * first carries "Starts here" — where a learner placed in the stage by age begins. Used by a
 * pathway's page (the chosen stage, or every course of a pathway with no stages) and a stage page.
 */
export default function PathwayCourseStep({ index, total, course, accent, headingLevel = 'h3' }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const age = stageAgeLabel(course.ageMin, course.ageMax);
  const facts = [age, course.price != null ? formatKsh(course.price) : null].filter(Boolean);

  return (
    <Box component="li" sx={{ display: 'flex', gap: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
      {/* rail: number bubble + connecting line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 14,
            color: '#fff',
            bgcolor: accent,
            zIndex: 1,
          }}
        >
          {index + 1}
        </Box>
        {!isLast && <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 16, mt: 0.5 }} />}
      </Box>

      {/* step body */}
      <Box sx={{ pb: isLast ? 0 : 3, minWidth: 0, flex: 1, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {course.coverImage && (
          <Box sx={{ width: { xs: 88, sm: 132 }, flexShrink: 0, borderRadius: 2, overflow: 'hidden' }}>
            <FramedImage src={course.coverImage} alt="" ratio="4 / 3" rounded={2} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
          {isFirst && (
            <Typography
              component="span"
              sx={{ display: 'inline-block', mb: 0.5, px: 1, py: 0.15, borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', bgcolor: accent }}
            >
              Starts here
            </Typography>
          )}
          <Typography component={headingLevel} sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {course.name}
          </Typography>
          {facts.length > 0 && (
            <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 700, color: 'text.secondary' }}>
              {facts.join(' · ')}
            </Typography>
          )}
          {course.description && (
            <ExpandableText lines={2} variant="body2" color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {course.description}
            </ExpandableText>
          )}
        </Box>
      </Box>
    </Box>
  );
}
