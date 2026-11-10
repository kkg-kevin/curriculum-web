import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartImage from '../common/SmartImage.jsx';
import PhotoCountBadge from './PhotoCountBadge.jsx';
import PriceTag from '../catalog/PriceTag.jsx';
import QuickAddButton from '../catalog/QuickAddButton.jsx';

const MEDIA_RATIO = '4 / 3';

const clamp = (lines) => ({
  display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden',
});

const BADGE_TONE = {
  brand: { bgcolor: 'primary.main', color: 'primary.contrastText' },
  muted: { bgcolor: 'text.primary', color: 'background.paper' },
  warm: { bgcolor: 'secondary.main', color: 'secondary.contrastText' },
};

/**
 * One card in the Store grid — a good (StoreItemCard) or a project (ProjectCard), so both read the
 * same, the way shoppers expect a product card to: the picture on its own (a product photo shown
 * whole on a light tile — `fit` "contain" — or a project's cover; without one, a brand tile with
 * the card's `motif`), then the kind, the name, a short line and a few facts, then the price and
 * "Add to cart". The picture and text open the item's page; the footer sits outside that link so
 * its button can be pressed on its own. Every card's picture is the same shape, so a row lines up.
 *
 *   to, image, fit ('contain' | 'cover'), photoCount, kicker, name, tagline, price, facts
 *   (string[]), motif (an icon element), cover (what a brand tile says, e.g. "5 guided steps")
 *   badges   [{ label, tone: 'brand' | 'muted' | 'warm' }] — top-left of the picture
 *   buy      { kind, item } when it can be added to the cart from here, else null (shows "View")
 */
export default function StoreCardShell({ to, image, fit = 'contain', photoCount, kicker, name, tagline, price, facts = [], motif, cover, badges = [], buy }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 4,
        transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg', borderColor: 'primary.main' },
        '&:hover .sc-media img': { transform: 'scale(1.05)' },
        '&:hover .sc-motif': { opacity: 0.4, transform: 'rotate(-8deg) scale(1.06)' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' }, '&:hover .sc-media img': { transform: 'none' } },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flexGrow: 1, '&:hover': { backgroundColor: 'transparent' } }}
      >
        <Box sx={{ position: 'relative', width: '100%', flexShrink: 0, overflow: 'hidden' }}>
          {image ? (
            <Box className="sc-media" sx={{ bgcolor: fit === 'contain' ? 'common.white' : 'surface.imagePlaceholder', '& img': { transition: 'transform 400ms ease' } }}>
              <SmartImage src={image} alt={name} ratio={MEDIA_RATIO} rounded={false} fit={fit} sx={fit === 'contain' ? { bgcolor: 'common.white', p: 2, boxSizing: 'border-box' } : undefined} />
            </Box>
          ) : (
            <Box
              sx={{
                aspectRatio: MEDIA_RATIO, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5,
                color: 'primary.contrastText',
                background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute', right: '-18%', top: '-45%', width: '75%', paddingBottom: '75%', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
                }}
              />
              {motif && (
                <Box className="sc-motif" aria-hidden sx={{ position: 'relative', lineHeight: 0, opacity: 0.32, transition: 'opacity 260ms ease, transform 260ms ease', '& svg': { fontSize: 88 } }}>
                  {motif}
                </Box>
              )}
              {cover && (
                <Typography component="span" sx={{ position: 'relative', fontSize: 12.5, fontWeight: 800, px: 1.5, py: 0.5, borderRadius: 999, bgcolor: 'surface.onColor', color: 'surface.onColorText' }}>
                  {cover}
                </Typography>
              )}
            </Box>
          )}

          {badges.length > 0 && (
            <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 0.75, flexWrap: 'wrap', pr: 6 }}>
              {badges.map((b) => (
                <Box key={b.label} component="span" sx={{ px: 1.1, py: 0.35, borderRadius: 999, fontSize: 11.5, fontWeight: 800, boxShadow: 'shadow.sm', ...(BADGE_TONE[b.tone] || BADGE_TONE.brand) }}>
                  {b.label}
                </Box>
              ))}
            </Box>
          )}
          <PhotoCountBadge count={photoCount} />
        </Box>

        <Box sx={{ px: 2.5, pt: 2.25, pb: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: 'primary.main', textTransform: 'uppercase' }}>
            {kicker}
          </Typography>
          <Typography component="h3" sx={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.3, ...clamp(2) }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ...clamp(2), lineHeight: 1.55, minHeight: '3.1em' }}>
            {tagline}
          </Typography>
          {facts.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
              {facts.map((f) => (
                <Box
                  key={f}
                  component="span"
                  sx={{ px: 1, py: 0.25, borderRadius: 999, fontSize: 11.5, fontWeight: 600, bgcolor: 'surface.subtle', color: 'text.secondary' }}
                >
                  {f}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardActionArea>

      {/* footer — the price, and the way to buy */}
      <Box sx={{ px: 2.5, pb: 2.25, pt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, borderTop: '1px solid', borderColor: 'divider', mt: 1 }}>
        <PriceTag price={price} size="sm" sx={{ minWidth: 0 }} />
        {buy ? (
          <QuickAddButton kind={buy.kind} item={buy.item} />
        ) : (
          <Button component={RouterLink} to={to} size="small" endIcon={<ArrowForwardIcon />} sx={{ flexShrink: 0, fontWeight: 700 }}>
            View
          </Button>
        )}
      </Box>
    </Card>
  );
}
