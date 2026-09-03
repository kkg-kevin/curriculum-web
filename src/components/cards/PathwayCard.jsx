import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const FALLBACK_ACCENT = '#25476a';

/**
 * A Pathway is an ordered track of courses. The card shows the name, a truncated
 * description and a course-count badge, with the pathway's own colour as a subtle
 * left-border accent. Links to /pathways/:slug.
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
        borderLeft: '4px solid',
        borderLeftColor: accent,
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/pathways/${slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={`${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`}
              sx={{
                bgcolor: `${accent}1A`, // ~10% tint
                color: 'text.primary',
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="h4" component="h3" gutterBottom>
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
