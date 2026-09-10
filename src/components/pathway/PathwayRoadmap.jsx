import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import SmartImage from '../common/SmartImage.jsx';
import { ageLabel } from '../../utils/format.js';

const FALLBACK_ACCENT = '#25476a';

/**
 * The ordered course roadmap for a pathway — "start here" through to the finish, as a
 * numbered vertical timeline with a filled accent rail. Used on the diagnostic report's
 * "Get started" panel and reusable anywhere the pathway's `courses` array is on hand.
 *
 * `courses` is the public pathway-detail shape: [{ name, description, ageMin, ageMax, coverImage }],
 * already in learning order (the backend sorts by courseSequence). `accent` is the pathway colour.
 */
export default function PathwayRoadmap({ courses = [], accent = FALLBACK_ACCENT, name }) {
  if (courses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        The course list for {name || 'this pathway'} is being finalised — our team will walk you
        through it.
      </Typography>
    );
  }

  return (
    <Box>
      {courses.map((course, i) => {
        const isFirst = i === 0;
        const isLast = i === courses.length - 1;
        const age = ageLabel(course.ageMin, course.ageMax);
        return (
          <Box key={`${course.name}-${i}`} sx={{ display: 'flex', gap: { xs: 1.75, sm: 2.5 } }}>
            {/* rail */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
            >
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
                  boxShadow: `0 0 0 4px ${accent}22`,
                  zIndex: 1,
                }}
              >
                {i + 1}
              </Box>
              {!isLast && (
                <Box sx={{ flexGrow: 1, width: '3px', bgcolor: `${accent}33`, minHeight: 22, my: 0.5 }} />
              )}
            </Box>

            {/* card */}
            <Box
              sx={{
                pb: isLast ? 0 : 2.5,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                {isFirst && (
                  <>
                    <FlagIcon sx={{ fontSize: 15, color: accent }} />
                    <Typography
                      variant="overline"
                      sx={{ color: accent, fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}
                    >
                      Start here
                    </Typography>
                  </>
                )}
                {isLast && !isFirst && (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
                    <Typography
                      variant="overline"
                      sx={{ color: 'success.main', fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}
                    >
                      Finish
                    </Typography>
                  </>
                )}
              </Box>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  p: { xs: 1.75, sm: 2 },
                  display: 'flex',
                  gap: 2,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  alignItems: 'flex-start',
                }}
              >
                {course.coverImage && (
                  <Box sx={{ width: { xs: '100%', sm: 120 }, flexShrink: 0 }}>
                    <SmartImage src={course.coverImage} alt={course.name} ratio="4 / 3" />
                  </Box>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {course.name}
                  </Typography>
                  {age && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={age}
                      sx={{ mt: 0.75, mb: course.description ? 1 : 0, fontWeight: 600 }}
                    />
                  )}
                  {course.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        whiteSpace: 'pre-line',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
