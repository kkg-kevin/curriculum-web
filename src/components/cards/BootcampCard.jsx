import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartImage from '../common/SmartImage.jsx';
import { formatPrice, ageLabel } from '../../utils/format.js';

// The curriculum system's brand blues — Pathways, Projects, the Store and Bootcamps all share
// this one family so the structured-learning surfaces read as one system.
const ACCENT = '#25476a';
const ACCENT_MID = '#2e7db5';
const ACCENT_LIGHT = '#38aae1';

export const FORMAT_LABEL = {
  holiday: 'Holiday',
  weekend: 'Weekend',
  after_school: 'After school',
  online: 'Online',
};

/**
 * One card in the Bootcamps grid (`/bootcamps`). A bootcamp is a short, intensive Program the
 * curriculum team flipped "List on the website" — a full build packed into a week or two, with
 * a showcase at the end. Same visual language as ProjectCard — a brand-blue band with a
 * "BOOTCAMP · HOLIDAY" kicker and the name as the hero — closing on the PRICE. Links to
 * /bootcamps/:slug.
 *
 * Data shape: { slug, name, tagline, format, duration, ageMin, ageMax, coverImage, price,
 * highlightCount } (see usePublicBootcamps.js).
 */
export default function BootcampCard({ bootcamp }) {
  const { slug, name, tagline, format, duration, ageMin, ageMax, coverImage, price } = bootcamp;

  const age = ageLabel(ageMin, ageMax);
  const priceLabel = price ? formatPrice(price) : 'Enquire for pricing';
  const kicker = ['Bootcamp', format && FORMAT_LABEL[format]].filter(Boolean).join(' · ').toUpperCase();
  const metaLine = [duration, age].filter(Boolean).join(' · ') || 'A short, intensive build';

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
          borderColor: ACCENT_MID,
        },
        '&:hover .bc-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/bootcamps/${slug}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        {/* header — the cover photo if there is one, else the brand band */}
        {coverImage ? (
          <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
            <SmartImage src={coverImage} alt={name} ratio="16 / 10" rounded={false} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(15,37,69,0) 45%, rgba(15,37,69,0.78) 100%)',
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
              background: `linear-gradient(150deg, ${ACCENT} 0%, ${ACCENT_MID} 100%)`,
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: '-20%',
                top: '-55%',
                width: '80%',
                paddingBottom: '80%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
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
        <CardContent
          sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}
        >
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
            {tagline || 'A short, intensive holiday programme — a full build packed into a week or two.'}
          </Typography>

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>
              {metaLine}
            </Typography>
          </Box>

          {/* footer — price on the left, "View" on the right, like the Store / Project cards */}
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
            <Box>
              <Typography
                sx={{
                  fontSize: price ? '1.05rem' : '0.9rem',
                  fontWeight: 800,
                  color: (t) => (t.palette.mode === 'dark' ? ACCENT_LIGHT : ACCENT),
                  lineHeight: 1.2,
                }}
              >
                {priceLabel}
              </Typography>
              {price?.note && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>
                  {price.note}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 700,
                fontSize: '0.875rem',
                color: (t) => (t.palette.mode === 'dark' ? ACCENT_LIGHT : ACCENT_MID),
                flexShrink: 0,
              }}
            >
              View
              <ArrowForwardIcon
                className="bc-arrow"
                sx={{ fontSize: 18, transition: 'transform 200ms ease' }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
