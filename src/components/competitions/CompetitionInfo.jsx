import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { DetailHeading } from '../common/DetailSection.jsx';
import { formatDate } from '../../utils/dates.js';
import { agesText, money, MODE_LABEL, teamSizeText } from '../../utils/competitions.js';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';

/**
 * "Competition information" (20 Nov 2026) — straight after the description: who can enter, how
 * (individuals and/or teams, with the team sizes the tracks allow), where, the key dates as a
 * timeline, prizes and anything else staff added. Each card shows only when it has something.
 */

function InfoCard({ icon, title, children, wide }) {
  return (
    <Box sx={{ gridColumn: { md: wide ? '1 / -1' : 'auto' }, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.light', color: 'primary.dark', flexShrink: 0, '& svg': { fontSize: 20 } }}>{icon}</Box>
        <Typography variant="h4" component="h3" sx={{ fontSize: '1.05rem' }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}

const Line = ({ children, strong }) => (
  <Typography variant="body2" sx={{ color: strong ? 'text.primary' : 'text.secondary', fontWeight: strong ? 700 : 400, lineHeight: 1.6 }}>{children}</Typography>
);

// Team sizes across the tracks that take teams: "2–4 per team" or "2–5 per team, by track".
function teamSizes(tracks) {
  const groups = tracks.filter((t) => t.entry?.group).map((t) => t.entry);
  if (!groups.length) return '';
  const min = Math.min(...groups.map((e) => e.teamMin));
  const max = Math.max(...groups.map((e) => e.teamMax));
  const same = groups.every((e) => e.teamMin === groups[0].teamMin && e.teamMax === groups[0].teamMax);
  return same ? teamSizeText(groups[0]) : `${min}–${max} per team, depending on the track`;
}

// Everything the section shows, worked out once — the light section below and the panel on the
// header's picture read the same.
export function infoParts(competition) {
  const { info = {}, tracks = [], registrationOpenDate, registrationCloseDate, startDate, endDate } = competition;
  const dates = [
    registrationOpenDate && { label: 'Registration opens', date: registrationOpenDate },
    registrationCloseDate && { label: 'Registration closes', date: registrationCloseDate },
    startDate && { label: 'Competition starts', date: startDate },
    ...(info.milestones || []).filter((m) => m.label),
    endDate && { label: 'Competition ends', date: endDate },
  ].filter(Boolean).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  const parts = {
    info,
    ages: agesText(info.ageMin, info.ageMax),
    modes: info.entryModes || [],
    sizes: teamSizes(tracks),
    dates,
  };
  // Entry fees — the same for every track (info.fees from the API).
  const f = info.fees || {};
  parts.fees = [
    parts.modes.includes('individual') && { label: 'Individual', amount: money(f.individual ?? 0, f.currency) },
    parts.modes.includes('group') && { label: 'Team', amount: money(f.team ?? 0, f.currency), note: 'one fee for the whole team' },
  ].filter(Boolean);
  parts.hasAnything = Boolean(parts.ages || info.eligibilityNote || parts.modes.length || info.mode || dates.length || info.prizes?.length || info.extras?.length);
  return parts;
}

/**
 * The same information as a panel on the header's picture (20 Nov 2026, user: "on the right side of
 * the image, so below it we get straight to the tracks"): frosted dark glass, a row per subject
 * (icon · heading · lines), then the key dates as a compact timeline.
 */
export function CompetitionInfoPanel({ competition }) {
  const { info, ages, modes, sizes, dates, fees, hasAnything } = infoParts(competition);
  if (!hasAnything) return null;
  const Row = ({ icon, title, children }) => (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1.5, '&:not(:first-of-type)': { borderTop: '1px solid rgba(255,255,255,0.12)' } }}>
      <Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.12)', color: 'secondary.light', '& svg': { fontSize: 19 } }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', mb: 0.25 }}>{title}</Typography>
        {children}
      </Box>
    </Box>
  );
  const Strong = ({ children }) => <Typography sx={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.45, color: '#fff' }}>{children}</Typography>;
  const Soft = ({ children }) => <Typography sx={{ fontSize: 13.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.8)' }}>{children}</Typography>;
  return (
    <Box
      component="section"
      aria-labelledby="competition-info"
      sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: 'rgba(12,26,44,0.72)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 18px 40px rgba(0,0,0,0.3)', color: '#fff' }}
    >
      <Typography id="competition-info" component="h2" sx={{ fontSize: 17, fontWeight: 900, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoRoundedIcon sx={{ fontSize: 20, color: 'secondary.light' }} /> Competition information
      </Typography>
      <Box>
        {(ages || info.eligibilityNote) && (
          <Row icon={<CakeRoundedIcon />} title="Who can enter">
            {ages && <Strong>{ages}</Strong>}
            {info.eligibilityNote && <Soft>{info.eligibilityNote}</Soft>}
          </Row>
        )}
        {modes.length > 0 && (
          <Row icon={<GroupsRoundedIcon />} title="How you can enter">
            {modes.includes('individual') && <Strong>On your own: one participant</Strong>}
            {modes.includes('group') && <Strong>As a team{sizes ? `: ${sizes}` : ''}</Strong>}
          </Row>
        )}
        {fees.length > 0 && (
          <Row icon={<PaymentsRoundedIcon />} title="Entry fees · every track">
            {fees.map((x) => (
              <Typography key={x.label} sx={{ fontSize: 14.5, lineHeight: 1.5, color: '#fff' }}>
                <strong>{x.label} · {x.amount}</strong>{x.note && x.amount !== 'Free' ? <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}> ({x.note})</Box> : null}
              </Typography>
            ))}
          </Row>
        )}
        {info.mode && (
          <Row icon={<PlaceRoundedIcon />} title="Where">
            <Strong>{MODE_LABEL[info.mode]}</Strong>
            {info.venue && <Soft>{info.venue}</Soft>}
          </Row>
        )}
        {info.prizes?.length > 0 && (
          <Row icon={<EmojiEventsRoundedIcon />} title="Prizes">
            {info.prizes.map((p, i) => <Soft key={i}>{p}</Soft>)}
          </Row>
        )}
        {info.extras?.map((x, i) => (
          <Row key={i} icon={<InfoRoundedIcon />} title={x.label}><Soft>{x.value}</Soft></Row>
        ))}
        {dates.length > 0 && (
          <Row icon={<EventRoundedIcon />} title="Key dates">
            <Box component="ol" sx={{ listStyle: 'none', m: 0, mt: 0.75, p: 0 }}>
              {dates.map((d, i) => (
                <Box component="li" key={`${d.label}-${i}`} sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flexShrink: 0 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'secondary.main', mt: 0.6 }} />
                    {i < dates.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'rgba(255,255,255,0.2)', my: 0.25 }} />}
                  </Box>
                  <Box sx={{ pb: i < dates.length - 1 ? 1 : 0, display: 'flex', flexWrap: 'wrap', columnGap: 1, alignItems: 'baseline' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: '#fff' }}>{d.label}</Typography>
                    {d.date && <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{formatDate(d.date)}</Typography>}
                  </Box>
                </Box>
              ))}
            </Box>
          </Row>
        )}
      </Box>
    </Box>
  );
}

export default function CompetitionInfo({ competition }) {
  const { info, ages, modes, sizes, dates, fees, hasAnything } = infoParts(competition);
  if (!hasAnything) return null;

  return (
    <Box component="section" aria-labelledby="competition-info" sx={{ mb: 6 }}>
      <DetailHeading id="competition-info" title="Competition information" icon={<InfoRoundedIcon />} tight />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, mt: 2 }}>
        {(ages || info.eligibilityNote) && (
          <InfoCard icon={<CakeRoundedIcon />} title="Who can enter">
            {ages && <Line strong>{ages}</Line>}
            {info.eligibilityNote && <Line>{info.eligibilityNote}</Line>}
          </InfoCard>
        )}
        {modes.length > 0 && (
          <InfoCard icon={<GroupsRoundedIcon />} title="How you can enter">
            {modes.includes('individual') && <Line strong>On your own: one participant</Line>}
            {modes.includes('group') && <Line strong>As a team{sizes ? `: ${sizes}` : ''}</Line>}
            <Line>{modes.length === 2 ? 'Each track says which it takes.' : 'One person registers the whole team.'}</Line>
          </InfoCard>
        )}
        {fees.length > 0 && (
          <InfoCard icon={<PaymentsRoundedIcon />} title="Entry fees">
            {fees.map((x) => <Line key={x.label} strong>{x.label} · {x.amount}{x.note && x.amount !== 'Free' ? ` (${x.note})` : ''}</Line>)}
            <Line>The same for every track.</Line>
          </InfoCard>
        )}
        {info.mode && (
          <InfoCard icon={<PlaceRoundedIcon />} title="Where">
            <Line strong>{MODE_LABEL[info.mode]}</Line>
            {info.venue && <Line>{info.venue}</Line>}
          </InfoCard>
        )}
        {info.prizes?.length > 0 && (
          <InfoCard icon={<EmojiEventsRoundedIcon />} title="Prizes">
            <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
              {info.prizes.map((p, i) => <Box component="li" key={i} sx={{ mb: 0.5 }}><Line>{p}</Line></Box>)}
            </Box>
          </InfoCard>
        )}
        {dates.length > 0 && (
          <InfoCard icon={<EventRoundedIcon />} title="Key dates" wide>
            <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0 }}>
              {dates.map((d, i) => (
                <Box component="li" key={`${d.label}-${i}`} sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14, flexShrink: 0 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main', mt: 0.75, flexShrink: 0 }} />
                    {i < dates.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
                  </Box>
                  <Box sx={{ pb: i < dates.length - 1 ? 2 : 0, minWidth: 0 }}>
                    <Line strong>{d.label}</Line>
                    {d.date && <Line>{formatDate(d.date)}</Line>}
                  </Box>
                </Box>
              ))}
            </Box>
          </InfoCard>
        )}
        {info.extras?.map((x, i) => (
          <InfoCard key={i} icon={<InfoRoundedIcon />} title={x.label}>
            <Line>{x.value}</Line>
          </InfoCard>
        ))}
      </Box>
    </Box>
  );
}
