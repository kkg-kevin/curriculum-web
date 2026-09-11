import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartImage from '../common/SmartImage.jsx';
import PriceTag from '../catalog/PriceTag.jsx';

const CATEGORY_LABEL = { kit: 'Robots & kits', bundle: 'Bundle', accessory: 'Accessory' };
const STOCK_LABEL = { available: 'Available now', preorder: 'Pre-order', coming_soon: 'Coming soon' };

/**
 * One card in the Store grid (`/store`). A store item is a shared `inventory` row the
 * curriculum team flipped "For sale" in the portal. Same visual language as ProjectCard — a
 * cover photo (or a brand-blue band) with a "ROBOTS & KITS" kicker and the name as the hero —
 * closing on the PRICE, the thing a shopper scans for. Links to /store/:slug.
 *
 * Data shape: { slug, name, tagline, storeCategory, badge, stockStatus, image, price,
 * highlightCount } (see usePublicStore.js).
 */
export default function StoreItemCard({ item }) {
  const { slug, name, tagline, storeCategory, badge, stockStatus, image, price } = item;

  const notAvailable = stockStatus && stockStatus !== 'available';
  const kicker = (CATEGORY_LABEL[storeCategory] || 'Store').toUpperCase();

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
        '&:hover .st-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/store/${slug}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        {/* header — the product photo if there is one, else the brand band */}
        {image ? (
          <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
            <SmartImage src={image} alt={name} ratio="16 / 10" rounded={false} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15,37,69,0) 45%, rgba(15,37,69,0.78) 100%)',
              }}
            />
            <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 14, color: '#fff' }}>
              <Typography
                component="span"
                sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}
              >
                {kicker}
              </Typography>
              <Typography
                component="h3"
                sx={{
                  fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25, mt: 0.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {name}
              </Typography>
            </Box>
            {(badge || notAvailable) && (
              <Box
                sx={{
                  position: 'absolute', top: 12, right: 12, px: 1, py: 0.4, borderRadius: 1,
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  bgcolor: notAvailable ? 'rgba(0,0,0,0.6)' : 'primary.main',
                }}
              >
                {notAvailable ? STOCK_LABEL[stockStatus] : badge}
              </Box>
            )}
          </Box>
        ) : (
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
            <Box
              aria-hidden
              sx={{
                position: 'absolute', right: '-20%', top: '-55%', width: '80%', paddingBottom: '80%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
            {(badge || notAvailable) && (
              <Box
                sx={{
                  position: 'absolute', top: 12, right: 12, px: 1, py: 0.4, borderRadius: 1,
                  fontSize: 11, fontWeight: 700,
                  bgcolor: notAvailable ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.22)',
                }}
              >
                {notAvailable ? STOCK_LABEL[stockStatus] : badge}
              </Box>
            )}
            <Typography
              component="span"
              sx={{
                position: 'relative', fontSize: 11, fontWeight: 800, letterSpacing: '0.09em',
                color: 'rgba(255,255,255,0.82)', mb: 0.75,
              }}
            >
              {kicker}
            </Typography>
            <Typography
              component="h3"
              sx={{
                position: 'relative', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {name}
            </Typography>
          </Box>
        )}

        {/* body */}
        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
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
            {tagline || 'A hands-on kit from the Digifunzi store.'}
          </Typography>

          {/* footer — price on the left, "View" on the right */}
          <Box
            sx={{
              mt: 'auto',
              pt: 2.5,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <PriceTag price={price} size="sm" />
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 700,
                fontSize: '0.875rem',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              View
              <ArrowForwardIcon className="st-arrow" sx={{ fontSize: 18, transition: 'transform 200ms ease' }} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
