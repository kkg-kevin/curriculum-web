import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FlagIcon from '@mui/icons-material/Flag';
import SmartImage from '../common/SmartImage.jsx';
import { ageLabel, formatPrice } from '../../utils/format.js';

const FALLBACK_ACCENT = '#25476a';

/**
 * One pathway's priced courses as a numbered vertical roadmap — same visual language as
 * PathwayRoadmap.jsx (numbered rail, accent-striped card, course thumbnail, Ages chip), with a
 * price chip added per step. Used on the Bootcamp detail page's "Pathway courses" section and the
 * Competition detail page's "Course pricing" section, one instance per pathway section from the
 * `coursePricing` API shape (see
 * server's resolveCoursePricing): [{ pathwayId, pathwayName, pathwayColor, courses: [{ courseId,
 * name, description, coverImage, ageMin, ageMax, priceAmount, priceCurrency, modules }] }].
 *
 * A course priced by module instead of as a whole (`modules.length > 0`) has `priceAmount: null`
 * — its own header price chip is skipped in favour of a small per-module price list underneath
 * (modules only carry a name, no description/age range of their own — see course_modules table).
 */
export default function CoursePricingRoadmap({ courses = [], accent = FALLBACK_ACCENT }) {
  return (
    <Box>
      {courses.map((course, i) => {
        const isFirst = i === 0;
        const isLast = i === courses.length - 1;
        const age = ageLabel(course.ageMin, course.ageMax);
        const modules = course.modules || [];
        const byModule = modules.length > 0;
        const priceLabel = course.priceAmount != null
          ? formatPrice({ amount: course.priceAmount, currency: course.priceCurrency })
          : 'Enquire for pricing';
        return (
          <Box key={course.courseId} sx={{ display: 'flex', gap: { xs: 1.75, sm: 2.5 } }}>
            {/* rail */}
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
            <Box sx={{ pb: isLast ? 0 : 2.5, minWidth: 0, flex: 1 }}>
              {isFirst && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <FlagIcon sx={{ fontSize: 15, color: accent }} />
                  <Typography
                    variant="overline"
                    sx={{ color: accent, fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}
                  >
                    Start here
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
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
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      {course.name}
                    </Typography>
                    {!byModule && (
                      <Typography sx={{ fontWeight: 800, color: accent, whiteSpace: 'nowrap' }}>
                        {priceLabel}
                      </Typography>
                    )}
                  </Box>
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
                  {byModule && (
                    <Box sx={{ mt: 1.25, display: 'grid', gap: 0.5 }}>
                      {modules.map((mod) => (
                        <Box
                          key={mod.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 1.5,
                            bgcolor: 'surface.subtle',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {mod.name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: accent, whiteSpace: 'nowrap' }}>
                            {mod.priceAmount != null ? formatPrice({ amount: mod.priceAmount, currency: mod.priceCurrency }) : 'Enquire for pricing'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
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
