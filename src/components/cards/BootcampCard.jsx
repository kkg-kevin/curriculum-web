import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmartImage from '../common/SmartImage.jsx';
import { formatDateRange } from '../../utils/dates.js';

/**
 * Status drives both the label and, when there's no coverImage, the whole
 * visual identity of the card (gradient band + icon) — the same trick as
 * PathwayCard. `completed` cohorts are intentionally muted so an `upcoming`
 * or `active` bootcamp — the ones a parent can actually act on — reads first.
 */
const STATUS_META = {
  upcoming: { label: 'upcoming', chipColor: 'primary', gradient: ['#1565C0', '#3B84D9'], Icon: RocketLaunchIcon },
  active: { label: 'enrolling now', chipColor: 'success', gradient: ['#2E7D32', '#4CAF50'], Icon: BoltIcon },
  completed: { label: 'completed', chipColor: 'default', gradient: null, Icon: CheckCircleIcon },
};

export default function BootcampCard({ bootcamp }) {
  const { slug, name, description, coverImage, status, startDate, endDate, gradeFrom, gradeTo } = bootcamp;
  const meta = STATUS_META[status] || STATUS_META.upcoming;
  const isCompleted = status === 'completed';
  const { Icon } = meta;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isCompleted ? 0.72 : 1,
        transition: 'transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: 4, opacity: 1 },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/bootcamps/${slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        {coverImage ? (
          <SmartImage src={coverImage} alt={`${name} bootcamp`} rounded={false} />
        ) : (
          <Box
            sx={{
              position: 'relative',
              height: 140,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              ...(meta.gradient
                ? { backgroundImage: `linear-gradient(135deg, ${meta.gradient[0]} 0%, ${meta.gradient[1]} 100%)` }
                : { backgroundColor: 'surface.imagePlaceholder' }),
            }}
          >
            <Icon
              aria-hidden
              sx={{
                fontSize: 108,
                color: meta.gradient ? '#fff' : 'text.disabled',
                opacity: meta.gradient ? 0.18 : 0.5,
                transform: 'rotate(-10deg)',
              }}
            />
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={meta.label} color={meta.chipColor} />
            {(gradeFrom || gradeTo) && (
              <Chip size="small" variant="outlined" label={[gradeFrom, gradeTo].filter(Boolean).join(' – ')} />
            )}
          </Box>
          <Typography variant="h4" component="h3" gutterBottom>
            {name}
          </Typography>
          {(startDate || endDate) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
              {formatDateRange(startDate, endDate)}
            </Typography>
          )}
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
              color: isCompleted ? 'text.secondary' : 'primary.main',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {isCompleted ? 'View recap' : 'View details'}
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
