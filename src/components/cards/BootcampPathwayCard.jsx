import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FALLBACK_ACCENT = '#25476a';

// Same visual language as PathwayCard.jsx (brand band, course-count kicker, journey rail,
// "Explore this pathway" CTA) — but for a pathway SCOPED to a bootcamp (from the bootcamp's own
// coursePricing sections, see server's resolveCoursePricing), which has no guaranteed public
// /pathways/:slug page of its own, no description, and only a `courses` array rather than a
// courseCount. It selects the pathway in place (onSelect) instead of navigating.
function JourneyRail({ count, accent }) {
  const shown = Math.min(count, 6);
  const extra = count - shown;
  return (
    <Box aria-hidden sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: i === 0 ? 11 : 8,
              height: i === 0 ? 11 : 8,
              borderRadius: '50%',
              bgcolor: i === 0 ? accent : 'divider',
              flexShrink: 0,
              ...(i === 0 && {
                boxShadow: (t) =>
                  `0 0 0 4px ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : `${accent}29`}`,
              }),
            }}
          />
          {i < shown - 1 && (
            <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: 'divider' }} />
          )}
        </Box>
      ))}
      {extra > 0 && (
        <Typography component="span" sx={{ ml: 0.5, fontSize: 12, fontWeight: 700, color: 'text.disabled' }}>
          +{extra}
        </Typography>
      )}
    </Box>
  );
}

/**
 * One card in a bootcamp's "Pathway courses" section — a bootcamp-scoped pathway (from
 * coursePricing: { pathwayId, pathwayName, pathwayColor, courses[] }), clicking it selects that
 * pathway so BootcampDetailPage can reveal its CoursePricingRoadmap in place. `pathwayName` can
 * be null (an "ungrouped" section of priced courses not tied to any pathway) — still gets its
 * own card, titled "Other courses", so every priced course is reachable from the grid.
 */
export default function BootcampPathwayCard({ pathway, onSelect }) {
  const { pathwayName, pathwayColor, courses = [] } = pathway;
  const accent = pathwayColor || FALLBACK_ACCENT;
  const courseCount = courses.length;
  const title = pathwayName || 'Other courses';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition:
          'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'shadow.lg',
          borderColor: accent,
        },
        '&:hover .bpw-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        onClick={onSelect}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        {/* brand band — course-count kicker + pathway name */}
        <Box
          sx={{
            position: 'relative',
            height: 110,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 2.5,
            overflow: 'hidden',
            color: '#fff',
            background: `linear-gradient(150deg, ${accent} 0%, ${accent}cc 100%)`,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: '-20%',
              top: '-55%',
              width: '80%',
              paddingBottom: '80%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <Typography
            component="span"
            sx={{
              position: 'relative',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.82)',
              mb: 0.75,
            }}
          >
            {courseCount}-course pathway
          </Typography>
          <Typography
            component="h3"
            sx={{
              position: 'relative',
              fontSize: '1.1rem',
              fontWeight: 800,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* body */}
        <CardContent
          sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}
        >
          <JourneyRail count={courseCount} accent={accent} />
          <Typography
            component="p"
            sx={{ mt: 1, fontSize: 12, fontWeight: 600, color: 'text.disabled', letterSpacing: '0.01em' }}
          >
            A step-by-step adventure, one course at a time
          </Typography>

          <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontWeight: 700,
                fontSize: '0.9rem',
                color: accent,
              }}
            >
              Explore this pathway
              <ArrowForwardIcon
                className="bpw-arrow"
                sx={{ fontSize: 18, transition: 'transform 200ms ease' }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
