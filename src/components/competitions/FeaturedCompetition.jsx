import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { resolveMediaUrl } from '../../utils/media.js';
import { formatDateRange } from '../../utils/dates.js';
import { agesText, MODE_LABEL, registrationLine } from '../../utils/competitions.js';
import { entryModesLabel } from '../cards/CompetitionCard.jsx';
import { heroBackground, HeroFact, HeroPill } from './CompetitionHero.jsx';

/**
 * The competition open for registration (else the next one), as the Competitions page's banner
 * (20 Nov 2026) — its picture behind, the details on top, one big button to the tracks; the same
 * look as the next event on the Events page.
 */
export default function FeaturedCompetition({ competition: c }) {
  const image = resolveMediaUrl(c.coverImage);
  const open = Boolean(c.registration?.open);
  return (
    <Box
      component="section"
      aria-label={`Featured competition: ${c.name}`}
      sx={{ position: 'relative', borderRadius: { xs: 4, md: 6 }, overflow: 'hidden', color: '#fff', background: heroBackground(image), px: { xs: 2.5, sm: 4, md: 6 }, py: { xs: 3.5, md: 6 }, minHeight: { md: 420 }, display: 'flex', alignItems: 'center' }}
    >
      <Box sx={{ maxWidth: 760, minWidth: 0 }}>
        <Typography variant="overline" sx={{ display: 'block', color: 'secondary.light', fontWeight: 900, letterSpacing: '0.12em' }}>
          {[open ? 'Now registering' : 'Next competition', c.edition].filter(Boolean).join(' · ')}
        </Typography>
        <Typography variant="h2" component="h2" sx={{ color: '#fff', fontWeight: 900, mt: 0.5, mb: 1.25, lineHeight: 1.1, fontSize: { xs: 30, md: 46 } }}>{c.name}</Typography>
        {c.summary && <Typography sx={{ fontSize: { xs: 16, md: 18.5 }, opacity: 0.92, mb: 2.5, maxWidth: 640, lineHeight: 1.55 }}>{c.summary}</Typography>}
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, mb: 2.5, maxWidth: 640 }}>
          <HeroFact icon={<EventRoundedIcon />} title={formatDateRange(c.startDate, c.endDate) || 'Dates to be confirmed'} />
          <HeroFact icon={<GroupsRoundedIcon />} title={[entryModesLabel(c), agesText(c.ageMin, c.ageMax)].filter(Boolean).join(' · ') || null} />
          {c.mode && <HeroFact icon={<PlaceRoundedIcon />} title={MODE_LABEL[c.mode]} line={c.venue || null} />}
          {c.trackCount > 0 && <HeroFact icon={<EmojiEventsRoundedIcon />} title={`${c.trackCount} ${c.trackCount === 1 ? 'track' : 'tracks'} to choose from`} />}
        </Box>
        <Box sx={{ mb: 3 }}>
          <HeroPill tone={open ? 'live' : 'muted'}>{registrationLine(c.registration, c.registrationCloseDate)}</HeroPill>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to={`/competitions/${c.slug}${open ? '#tracks' : ''}`} variant="contained" color="secondary" size="large" sx={{ fontWeight: 900, px: 4, minHeight: 52 }}>
            {open ? 'Choose a track and register' : 'See the details'}
          </Button>
          <Button component={RouterLink} to={`/competitions/${c.slug}`} size="large" sx={{ color: '#fff', fontWeight: 800, minHeight: 52 }}>What it&rsquo;s about</Button>
        </Box>
      </Box>
    </Box>
  );
}
