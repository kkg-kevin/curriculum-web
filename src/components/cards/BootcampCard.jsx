import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import SmartImage from '../common/SmartImage.jsx';
import { formatDateRange } from '../../utils/dates.js';

const STATUS_COLOR = { upcoming: 'primary', active: 'success', completed: 'default' };

export default function BootcampCard({ bootcamp }) {
  const { slug, name, description, coverImage, status, startDate, endDate, gradeFrom, gradeTo } = bootcamp;

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={RouterLink}
        to={`/bootcamps/${slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        <SmartImage src={coverImage} alt={`${name} bootcamp`} rounded={false} />
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={status} color={STATUS_COLOR[status] || 'default'} />
            {(gradeFrom || gradeTo) && (
              <Chip size="small" variant="outlined" label={[gradeFrom, gradeTo].filter(Boolean).join(' – ')} />
            )}
          </Box>
          <Typography variant="h4" component="h3" gutterBottom>
            {name}
          </Typography>
          {(startDate || endDate) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {formatDateRange(startDate, endDate)}
            </Typography>
          )}
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
