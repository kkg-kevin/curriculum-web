import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartImage from '../common/SmartImage.jsx';
import { formatDateRange } from '../../utils/dates.js';

// Same brand-blue family as Pathways / Projects / Bootcamps — the structured-learning surfaces
// read as one system.
const ACCENT = '#25476a';
const ACCENT_MID = '#2e7db5';
const ACCENT_LIGHT = '#38aae1';

export const FORMAT_LABEL = { individual: 'Individual', pairs: 'Pairs', team: 'Team' };
export const CADENCE_LABEL = { one_off: 'One-off', annual: 'Annual', termly: 'Termly' };
const STATUS_LABEL = { open: 'Registration open', closed: 'Registration closed' };

/**
 * One card in the Competitions grid (`/competitions`). A competition is a `competitions` record
 * the team flipped "Show on the website". Links to /competitions/:slug where the Track cards
 * live. Data shape: { slug, name, edition, level, format, cadence, startDate, endDate,
 * coverImage, status, trackCount } (see usePublicCompetitions.js).
 */
export default function CompetitionCard({ competition }) {
  const { slug, name, edition, level, format, cadence, startDate, endDate, coverImage, status, trackCount } =
    competition;

  const kicker = ['Competition', edition].filter(Boolean).join(' · ').toUpperCase();
  const dates = formatDateRange(startDate, endDate);
  const metaLine =
    [
      level,
      format && FORMAT_LABEL[format],
      cadence && CADENCE_LABEL[cadence],
      trackCount ? `${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Pick a track and build with your team';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition:
          'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg', borderColor: ACCENT_MID },
        '&:hover .cc-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/competitions/${slug}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        {coverImage ? (
          <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
            <SmartImage src={coverImage} alt={name} ratio="16 / 10" rounded={false} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15,37,69,0) 45%, rgba(15,37,69,0.78) 100%)',
              }}
            />
            <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 14, color: '#fff' }}>
              <Typography component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}>
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
                position: 'absolute', right: '-20%', top: '-55%', width: '80%', paddingBottom: '80%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
            <Typography component="span" sx={{ position: 'relative', fontSize: 11, fontWeight: 800, letterSpacing: '0.09em', color: 'rgba(255,255,255,0.82)', mb: 0.75 }}>
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

        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>{metaLine}</Typography>
          {dates && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {dates}
            </Typography>
          )}

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
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: (t) => (t.palette.mode === 'dark' ? ACCENT_LIGHT : ACCENT),
                lineHeight: 1.2,
              }}
            >
              {STATUS_LABEL[status] || 'View details'}
            </Typography>
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
              <ArrowForwardIcon className="cc-arrow" sx={{ fontSize: 18, transition: 'transform 200ms ease' }} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
