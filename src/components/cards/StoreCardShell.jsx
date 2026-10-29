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

const COVER_RATIO = '16 / 10';

const clamp = (lines) => ({
  display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden',
});

function Kicker({ children }) {
  return (
    <Typography
      component="span"
      sx={{ position: 'relative', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}
    >
      {children}
    </Typography>
  );
}

function Title({ children }) {
  return (
    <Typography component="h3" sx={{ position: 'relative', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25, mt: 0.5, ...clamp(2) }}>
      {children}
    </Typography>
  );
}

/**
 * One card in the Store grid — a good (StoreItemCard) or a project (ProjectCard), so both read the
 * same: a cover (the photo, or a brand band with the card's `motif` icon, always the same height so
 * a mixed row lines up) with a kicker and the name, a short line and a few facts, then the price
 * and "Add to cart". The cover and text open the item's page; the footer sits outside that link so
 * its button can be pressed on its own.
 *
 *   to, image, photoCount, kicker, name, tagline, price, facts (string[]), motif (an icon element)
 *   badge     { label, muted } — top-right corner (a "Core kit" badge, or "Coming soon")
 *   buy       { kind, item } when it can be added to the cart from here, else null (shows "View")
 */
export default function StoreCardShell({ to, image, photoCount, kicker, name, tagline, price, facts = [], motif, badge, buy }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg', borderColor: 'primary.main' },
        '&:hover .sc-cover-img img': { transform: 'scale(1.04)' },
        '&:hover .sc-motif': { opacity: 0.32, transform: 'rotate(-8deg) scale(1.06)' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flexGrow: 1, '&:hover': { backgroundColor: 'transparent' } }}
      >
        <Box sx={{ position: 'relative', width: '100%', flexShrink: 0, overflow: 'hidden' }}>
          {image ? (
            <>
              <Box className="sc-cover-img" sx={{ '& img': { transition: 'transform 400ms ease' } }}>
                <SmartImage src={image} alt={name} ratio={COVER_RATIO} rounded={false} />
              </Box>
              <PhotoCountBadge count={photoCount} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,37,69,0) 45%, rgba(15,37,69,0.8) 100%)' }} />
            </>
          ) : (
            <Box
              sx={{
                aspectRatio: COVER_RATIO,
                background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute', right: '-20%', top: '-55%', width: '80%', paddingBottom: '80%', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
                }}
              />
              {motif && (
                <Box
                  className="sc-motif"
                  aria-hidden
                  sx={{
                    position: 'absolute', right: 18, top: 14, color: '#fff', opacity: 0.22, lineHeight: 0,
                    transition: 'opacity 260ms ease, transform 260ms ease',
                    '& svg': { fontSize: 96 },
                  }}
                >
                  {motif}
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 14, color: '#fff' }}>
            <Kicker>{kicker}</Kicker>
            <Title>{name}</Title>
          </Box>

          {badge && (
            <Box
              sx={{
                position: 'absolute', top: 12, right: 12, px: 1, py: 0.4, borderRadius: 1,
                fontSize: 11, fontWeight: 700, color: '#fff',
                bgcolor: badge.muted ? 'rgba(0,0,0,0.6)' : 'primary.main',
              }}
            >
              {badge.label}
            </Box>
          )}
        </Box>

        <Box sx={{ px: 3, pt: 2.5, pb: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ ...clamp(2), lineHeight: 1.6, minHeight: '3.2em' }}>
            {tagline}
          </Typography>
          {facts.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {facts.map((f) => (
                <Box
                  key={f}
                  component="span"
                  sx={{
                    px: 1, py: 0.25, borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                    border: '1px solid', borderColor: 'divider', color: 'text.secondary',
                  }}
                >
                  {f}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardActionArea>

      {/* footer — the price, and the way to buy */}
      <Box sx={{ px: 3, pb: 2.5, pt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <PriceTag price={price} size="sm" sx={{ minWidth: 0 }} />
        {buy ? (
          <QuickAddButton kind={buy.kind} item={buy.item} />
        ) : (
          <Button
            component={RouterLink}
            to={to}
            size="small"
            endIcon={<ArrowForwardIcon />}
            sx={{ flexShrink: 0, fontWeight: 700 }}
          >
            View
          </Button>
        )}
      </Box>
    </Card>
  );
}
