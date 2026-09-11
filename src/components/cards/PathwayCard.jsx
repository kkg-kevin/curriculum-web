import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// theme.palette.primary IS the curriculum system's own brand blue (see
// theme/palette.js) — the pathways API returns that same navy as every
// pathway's `color`, so the whole grid is one calm brand family already;
// pathways are told apart by their name and their course journey, not by
// per-card decoration.

/**
 * One card in the Learning Pathways grid. A pathway is an ordered set of courses
 * a child works through in order. The list endpoint returns only
 * name/description/color/courseCount, so the card leads with the pathway name on
 * a brand-blue band, then the description, then a small "journey" rail of course
 * dots. Links to /pathways/:slug.
 *
 * Rows stay aligned: the band is a fixed height, the title clamps to 2 lines,
 * the description to 3, and the footer is pinned with `mt: auto`.
 */
function JourneyRail({ count }) {
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
              bgcolor: i === 0 ? 'primary.main' : 'divider',
              flexShrink: 0,
              ...(i === 0 && {
                boxShadow: (t) =>
                  `0 0 0 4px ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(45,117,170,0.16)'}`,
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

export default function PathwayCard({ pathway }) {
  const { slug, name, description, courseCount } = pathway;

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
          borderColor: 'primary.main',
        },
        '&:hover .pw-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/pathways/${slug}`}
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
            height: 138,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 2.5,
            overflow: 'hidden',
            color: '#fff',
            background: (t) =>
              `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
          }}
        >
          {/* soft light bloom, top-right — subtle depth, not an icon */}
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
              fontSize: '1.2rem',
              fontWeight: 800,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {name}
          </Typography>
        </Box>

        {/* body */}
        <CardContent
          sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
              minHeight: '4.8em',
            }}
          >
            {description}
          </Typography>

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <JourneyRail count={courseCount} />
            <Typography
              component="p"
              sx={{ fontSize: 12, fontWeight: 600, color: 'text.disabled', letterSpacing: '0.01em' }}
            >
              A step-by-step adventure, one course at a time
            </Typography>
          </Box>

          <Box sx={{ mt: 'auto', pt: 2.5, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontWeight: 700,
                fontSize: '0.9rem',
                color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main),
              }}
            >
              Explore this pathway
              <ArrowForwardIcon
                className="pw-arrow"
                sx={{ fontSize: 18, transition: 'transform 200ms ease' }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
