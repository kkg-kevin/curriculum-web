import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { resolveMediaUrl } from '../../utils/media.js';
import { registrationLine } from '../../utils/competitions.js';
import { formatDateRange, hasEnded } from '../../utils/dates.js';

export const FORMAT_LABEL = { individual: 'Individual', pairs: 'Pairs', team: 'Team' };
// How a competition is entered (20 Nov 2026 — entryModes; older APIs still send `format`).
export const entryModesLabel = ({ entryModes, format }) => {
  const modes = Array.isArray(entryModes) && entryModes.length ? entryModes : format ? [format === 'individual' ? 'individual' : 'group'] : [];
  if (modes.includes('individual') && modes.includes('group')) return 'Individuals or teams';
  if (modes.includes('group')) return 'Teams';
  if (modes.includes('individual')) return 'Individuals';
  return '';
};
export const CADENCE_LABEL = { one_off: 'One-off', annual: 'Annual', termly: 'Termly' };
const STATUS_LABEL = { open: 'Registration open', closed: 'Registration closed' };

// A competition left "Open" in the portal after its last day would otherwise still say
// "Registration open" here — the dates win.
export const competitionStatusLabel = (status, endDate) =>
  hasEnded(endDate) ? 'Ended' : STATUS_LABEL[status] || '';

/**
 * One card in the Competitions grid (`/competitions`) — since 20 Nov 2026 the picture fills the
 * whole card and the details sit on it (a dark wash from the bottom so they always read), like the
 * events' banner. No picture: the brand gradient. Links to /competitions/:slug.
 */
export default function CompetitionCard({ competition }) {
  const { slug, name, edition, level, startDate, endDate, coverImage, status, trackCount, summary, registration, registrationCloseDate } =
    competition;

  const kicker = ['Competition', edition].filter(Boolean).join(' · ').toUpperCase();
  const dates = formatDateRange(startDate, endDate);
  const ended = hasEnded(endDate);
  const image = resolveMediaUrl(coverImage);
  const metaLine = [level, entryModesLabel(competition), trackCount ? `${trackCount} ${trackCount === 1 ? 'track' : 'tracks'}` : null].filter(Boolean).join(' · ');
  const live = Boolean(registration?.open) && !ended;
  const state = ended ? 'Ended' : registration ? registrationLine(registration, registrationCloseDate) : competitionStatusLabel(status, endDate);

  return (
    <Card
      sx={{
        height: '100%', overflow: 'hidden', borderRadius: 4, border: 'none',
        transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg' },
        '&:hover .cc-arrow': { transform: 'translateX(4px)' },
        '&:hover .cc-bg': { transform: 'scale(1.04)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/competitions/${slug}`}
        sx={{ position: 'relative', height: '100%', minHeight: { xs: 380, md: 420 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'stretch', color: '#fff', overflow: 'hidden', '&:hover': { backgroundColor: 'transparent' } }}
      >
        <Box
          className="cc-bg"
          aria-hidden
          sx={{
            position: 'absolute', inset: 0, transition: 'transform 600ms ease',
            background: image
              ? `center / cover no-repeat url(${image})`
              : 'linear-gradient(150deg, #1a3550 0%, #25476a 45%, #2e7db5 85%, #38aae1 100%)',
          }}
        />
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(16,32,52,0.05) 0%, rgba(16,32,52,0.45) 38%, rgba(16,32,52,0.93) 72%, rgba(16,32,52,0.98) 100%)' }} />
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 999, fontSize: 12, fontWeight: 800, bgcolor: live ? 'rgba(20,90,50,0.78)' : 'rgba(16,32,52,0.72)', border: '1px solid', borderColor: live ? 'rgba(110,220,150,0.6)' : 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
            {live && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#5BE38D' }} />}
            {state || 'Competition'}
          </Box>
        </Box>
        <Box sx={{ position: 'relative', p: { xs: 2.5, md: 3 } }}>
          <Typography component="span" sx={{ fontSize: 11.5, fontWeight: 900, letterSpacing: '0.1em', color: 'secondary.light' }}>{kicker}</Typography>
          <Typography component="h3" sx={{ fontSize: { xs: '1.35rem', md: '1.5rem' }, fontWeight: 900, lineHeight: 1.2, mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </Typography>
          {summary && (
            <Typography sx={{ fontSize: 14.5, opacity: 0.88, mt: 1, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{summary}</Typography>
          )}
          {metaLine && <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 1.5, opacity: 0.95 }}>{metaLine}</Typography>}
          <Box sx={{ mt: 1.75, pt: 1.75, borderTop: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, opacity: 0.9 }}>{dates || 'Dates to be confirmed'}</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 800, fontSize: '0.9rem', color: 'secondary.light', flexShrink: 0 }}>
              {live ? 'Register' : 'View'}
              <ArrowForwardIcon className="cc-arrow" sx={{ fontSize: 18, transition: 'transform 200ms ease' }} />
            </Box>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
