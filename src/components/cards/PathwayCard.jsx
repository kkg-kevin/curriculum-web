import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RouteIcon from '@mui/icons-material/Route';

const FALLBACK_ACCENT = '#25476a';

/**
 * A Pathway is an ordered track of courses. Pathways have no cover image (the
 * list endpoint only ever returns name/description/color/courseCount), so the
 * card leans on the pathway's own accent colour as the visual instead of a
 * photo: a tinted header band with a route glyph, then name + description
 * below. Links to /pathways/:slug.
 */
export default function PathwayCard({ pathway }) {
  const { slug, name, description, color, courseCount } = pathway;
  const accent = color || FALLBACK_ACCENT;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/pathways/${slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        <Box
          sx={{
            position: 'relative',
            height: 96,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundImage: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
          }}
        >
          <RouteIcon
            aria-hidden
            sx={{ fontSize: 132, color: '#fff', opacity: 0.16, transform: 'rotate(-12deg)' }}
          />
          <Chip
            size="small"
            label={`${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: '#1a1a1a',
              fontWeight: 700,
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" component="h3" gutterBottom>
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: accent,
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            View pathway
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
