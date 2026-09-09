import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartImage from '../common/SmartImage.jsx';
import { catalogVisual } from '../common/catalogVisuals.js';
import PriceTag from './PriceTag.jsx';
import { storeStatusLabel } from '../../utils/format.js';

/**
 * Card for one catalogue item — shared by the Projects grid (`/projects`) and
 * the Store grid (`/store`). Leads with a visual (photo, or a designed gradient
 * panel keyed to the item's kind when there's no image yet), then name + a
 * one-line summary, and closes on the PRICE — the thing a shopper scans for.
 * Visual language matches PathwayCard / CompetitionCard.
 *
 * Props:
 *  - item      a catalogue item (src/content/catalog.js shape)
 *  - to        the detail-page href (e.g. `/projects/<slug>` or `/store/<slug>`)
 *  - topLeft   optional override for the top-left chip label (defaults to the
 *              kind label, e.g. "Project"); pass e.g. a project's level here
 */
function ItemVisual({ item, meta }) {
  if (item.image) {
    return <SmartImage src={item.image} alt={item.name} ratio="16 / 10" rounded={false} />;
  }
  const { Icon } = meta;
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        aspectRatio: '16 / 10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}CC 100%)`,
      }}
    >
      <Icon sx={{ fontSize: 132, color: '#fff', opacity: 0.16, position: 'absolute', transform: 'rotate(-12deg)' }} />
      <Icon sx={{ fontSize: 44, color: '#fff', position: 'relative' }} />
    </Box>
  );
}

export default function CatalogItemCard({ item, to, topLeft }) {
  const meta = catalogVisual(item);
  const notAvailable = item.status !== 'available';

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
        to={to}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >
        <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
          <ItemVisual item={item} meta={meta} />
          <Chip
            size="small"
            label={topLeft || meta.label}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: '#1a1a1a',
              fontWeight: 700,
              textTransform: 'capitalize',
            }}
          />
          {(item.badge || notAvailable) && (
            <Chip
              size="small"
              label={notAvailable ? storeStatusLabel(item.status) : item.badge}
              color={notAvailable ? 'default' : 'secondary'}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontWeight: 700,
                ...(notAvailable ? { bgcolor: 'rgba(0,0,0,0.55)', color: '#fff' } : {}),
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" component="h3" gutterBottom>
            {item.name}
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
            {item.summary}
          </Typography>

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <PriceTag price={item.price} size="sm" />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: meta.accent,
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0,
              }}
            >
              View
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
