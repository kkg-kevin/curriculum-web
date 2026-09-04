import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CodeIcon from '@mui/icons-material/Code';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import SmartImage from '../common/SmartImage.jsx';
import { ageLabel } from '../../utils/format.js';

// Projects carry no category/colour field, so — same fix as bootcamps/
// pathways — a card with no coverImage gets a deterministic gradient + icon
// instead of the generic wordmark placeholder. Cycled by list position, not
// content, so it stays correct if courses are added/renamed.
const STYLES = [
  { gradient: ['#1565C0', '#3B84D9'], Icon: PrecisionManufacturingIcon },
  { gradient: ['#DC6E00', '#FF9A28'], Icon: CodeIcon },
  { gradient: ['#2E7D32', '#4CAF50'], Icon: CameraAltIcon },
  { gradient: ['#6A1B9A', '#9C27B0'], Icon: BoltIcon },
];

export default function ProjectCard({ project, index = 0 }) {
  const { slug, name, description, coverImage, ageMin, ageMax, sessionCount } = project;
  const style = STYLES[index % STYLES.length];
  const { Icon } = style;

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
        to={`/projects/${slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        {coverImage ? (
          <SmartImage src={coverImage} alt={`${name} course`} rounded={false} />
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
              backgroundImage: `linear-gradient(135deg, ${style.gradient[0]} 0%, ${style.gradient[1]} 100%)`,
            }}
          >
            <Icon aria-hidden sx={{ fontSize: 108, color: '#fff', opacity: 0.18, transform: 'rotate(-10deg)' }} />
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            {ageLabel(ageMin, ageMax) && (
              <Chip size="small" variant="outlined" label={ageLabel(ageMin, ageMax)} />
            )}
            {sessionCount > 0 && (
              <Chip
                size="small"
                variant="outlined"
                icon={<CalendarMonthIcon sx={{ fontSize: '16px !important' }} />}
                label={`${sessionCount} sessions`}
              />
            )}
          </Box>
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
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            View course
            <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
