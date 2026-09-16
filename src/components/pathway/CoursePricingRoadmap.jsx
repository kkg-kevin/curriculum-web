import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmartImage from '../common/SmartImage.jsx';
import { ageLabel, formatPrice } from '../../utils/format.js';

const FALLBACK_ACCENT = '#25476a';

/**
 * One pathway's priced courses as a numbered vertical roadmap — same visual language as
 * PathwayDetailPage.jsx's own PathwayStep (number-bubble rail, plain/unboxed step body, bigger
 * thumbnail, "Start here"/"Finish" labels), with a price chip added next to the age chip. Used on
 * the Bootcamp detail page's "Pathways in this bootcamp" section and the Competition detail
 * page's "Course pricing" section, one instance per pathway section from the `coursePricing` API
 * shape (see server's resolveCoursePricing): [{ pathwayId, pathwayName, pathwayColor,
 * courses: [{ courseId, name, description, coverImage, ageMin, ageMax, priceAmount,
 * priceCurrency, modules }] }].
 *
 * A course priced by module instead of as a whole (`modules.length > 0`) has `priceAmount: null`
 * — its own price chip is skipped in favour of a small per-module price list underneath (modules
 * only carry a name, no description/age range of their own — see course_modules table).
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
          <Box key={course.courseId} sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative' }}>
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
                {i + 1}
              </Box>
              {!isLast && (
                <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 24, mt: 0.5 }} />
              )}
            </Box>

            {/* step body */}
            <Box sx={{ pb: isLast ? 0 : 4, minWidth: 0, flex: 1 }}>
              {isFirst && (
                <Typography variant="overline" sx={{ color: accent, fontWeight: 700, letterSpacing: '0.08em' }}>
                  Start here
                </Typography>
              )}
              {isLast && !isFirst && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
                  <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Finish
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {course.coverImage && (
                  <Box sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}>
                    <SmartImage src={course.coverImage} alt={course.name} />
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {course.name}
                    </Typography>
                    {!byModule && (
                      <Typography sx={{ fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
                        {priceLabel}
                      </Typography>
                    )}
                  </Box>
                  {age && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontWeight: 600, mb: 1 }}>
                      {age}
                    </Typography>
                  )}
                  {course.description && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
                      {course.description}
                    </Typography>
                  )}
                  {byModule && (
                    <Box sx={{ mt: 1.5 }}>
                      {modules.map((mod, mi) => (
                        <Box
                          key={mod.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            gap: 1.5,
                            py: 0.625,
                            borderTop: mi > 0 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {mod.name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
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
