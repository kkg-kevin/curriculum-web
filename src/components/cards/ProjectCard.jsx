import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import SmartImage from '../common/SmartImage.jsx';
import { ageLabel } from '../../utils/format.js';

export default function ProjectCard({ project }) {
  const { slug, name, description, coverImage, ageMin, ageMax, sessionCount } = project;

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={RouterLink}
        to={`/projects/${slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        <SmartImage src={coverImage} alt={`${name} course`} rounded={false} />
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            {ageLabel(ageMin, ageMax) && (
              <Chip size="small" variant="outlined" label={ageLabel(ageMin, ageMax)} />
            )}
            {sessionCount > 0 && (
              <Chip size="small" variant="outlined" label={`${sessionCount} sessions`} />
            )}
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
