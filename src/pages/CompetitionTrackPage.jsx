import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import CompetitionHero, { HeroPill } from '../components/competitions/CompetitionHero.jsx';
import { DetailHeading } from '../components/common/DetailSection.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import DetailLayout, { AsideCard } from '../components/common/DetailLayout.jsx';
import { usePublicCompetition } from '../hooks/usePublicCompetitions.js';
import { formatDate, formatDateRange } from '../utils/dates.js';
import { safeHtml } from '../utils/safeHtml.js';
import { titleWithKind } from '../utils/seo.js';
import { agesText, hasRich, registrationLine, teamSizeText } from '../utils/competitions.js';
import { PROSE_MAX_WIDTH } from '../theme/layout.js';
import { EntryFees, RegisterButton } from '../components/competitions/trackBits.jsx';

/**
 * A competition track's own page (20 Nov 2026) — /competitions/:slug/tracks/:trackSlug, opened by
 * the track card's Know More: a strip of the key facts (ages, individual / team, team size, fees),
 * then whatever staff filled in — overview, what participants do, rules, how it's judged, prizes,
 * dates, resources and questions — with Register now in the side panel (under the content on
 * phones, plus a bar at the bottom of the screen).
 */

function Rich({ html }) {
  return (
    <Box
      sx={{ color: 'text.secondary', lineHeight: 1.75, maxWidth: PROSE_MAX_WIDTH, '& p': { mt: 0, mb: 1.5 }, '& ul, & ol': { pl: 3, mb: 1.5 }, '& a': { color: 'primary.main' } }}
      dangerouslySetInnerHTML={{ __html: safeHtml(html) }}
    />
  );
}

function Block({ title, icon, children }) {
  return (
    <Box component="section" sx={{ mb: 6 }}>
      <DetailHeading title={title} icon={icon} tight />
      <Box sx={{ mt: 2 }}>{children}</Box>
    </Box>
  );
}

export default function CompetitionTrackPage() {
  const { slug, trackSlug } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicCompetition(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={260} height={28} />
        <Skeleton variant="text" width="50%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={260} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  const track = data?.tracks?.find((t) => t.slug === trackSlug || t.id === trackSlug);
  if (isError || !track) {
    const notFound = error?.status === 404 || (data && !track);
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Track not found" noindex />
        <ErrorBlock error={{ message: notFound ? 'This track isn’t part of a competition running right now.' : error?.message }} onRetry={notFound ? undefined : refetch} />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={data ? `/competitions/${slug}` : '/competitions'} variant="outlined">
            {data ? `Back to ${data.name}` : 'View all competitions'}
          </Button>
        </Box>
      </Container>
    );
  }

  const { name: competitionName, registration, startDate, endDate } = data;
  const e = track.entry || {};
  const ages = agesText(track.ageMin, track.ageMax);
  const entryWays = [e.individual && 'Individuals', e.group && 'Teams'].filter(Boolean).join(' or ');
  const totalWeight = (track.judging || []).reduce((n, j) => n + (Number(j.weight) || 0), 0);
  const path = `/competitions/${slug}/tracks/${track.slug}`;
  const timeline = [...(track.timeline || [])].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  const nothingYet = ![track.overview, track.whatToDo, track.rules].some(hasRich) && !track.judging?.length && !track.prizes?.length && !timeline.length && !track.resources?.length && !track.faqs?.length;

  return (
    <>
      <SeoHead
        title={titleWithKind(`${track.name} — ${competitionName}`, 'Competition track')}
        description={track.description || `${track.name}, a track of ${competitionName}.`}
        image={track.coverImage || data.coverImage || undefined}
      />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Competitions', path: '/competitions' },
            { name: competitionName, path: `/competitions/${slug}` },
            { name: track.name, path },
          ]),
        ]}
      />

      <CompetitionHero
        image={track.coverImage || data.coverImage}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Competitions', to: '/competitions' }, { label: competitionName, to: `/competitions/${slug}` }, { label: track.name }]}
        overline={[competitionName, track.subtitle].filter(Boolean).join(' · ')}
        title={track.name}
        lead={track.description || null}
        facts={[
          { icon: <CakeRoundedIcon />, title: ages || 'All ages', line: 'Who can enter' },
          { icon: <GroupsRoundedIcon />, title: entryWays, line: e.group ? teamSizeText(e) : 'One participant' },
          { icon: <EventRoundedIcon />, title: formatDateRange(startDate, endDate) || 'Dates to be confirmed', line: data.registrationCloseDate ? `Registration closes ${formatDate(data.registrationCloseDate)}` : null },
        ]}
        badges={<HeroPill tone={registration?.open ? 'live' : 'muted'}>{registrationLine(registration, data.registrationCloseDate)}</HeroPill>}
        actions={(
          <>
            <RegisterButton slug={slug} track={track} registration={registration} size="large" color="secondary" sx={{ fontWeight: 900, px: 4, minHeight: 52 }} />
            <Button component={RouterLink} to={`/competitions/${slug}#tracks`} size="large" sx={{ color: '#fff', fontWeight: 800, minHeight: 52 }}>Other tracks</Button>
          </>
        )}
      />

      <Section>

        <DetailLayout
          aside={
            <AsideCard>
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>Entry</Typography>
                <Typography variant="h4" component="p">{track.name}</Typography>
              </Box>
              {!track.registerUrl && <EntryFees track={track} dense />}
              <Typography variant="body2" color="text.secondary">
                {registration?.open
                  ? `${e.group ? 'One person registers the whole team. ' : ''}You'll pay the entry fee online straight after registering.`
                  : registration?.opensOn ? `Registration opens on ${formatDate(registration.opensOn)}.` : 'Registration isn’t open right now.'}
              </Typography>
              <RegisterButton slug={slug} track={track} registration={registration} size="large" fullWidth />
            </AsideCard>
          }
        >
          {hasRich(track.overview) && <Block title="Overview" icon={<InfoOutlinedIcon />}><Rich html={track.overview} /></Block>}
          {hasRich(track.whatToDo) && <Block title="What participants do" icon={<BuildRoundedIcon />}><Rich html={track.whatToDo} /></Block>}
          {hasRich(track.rules) && <Block title="Rules" icon={<GavelRoundedIcon />}><Rich html={track.rules} /></Block>}

          {track.judging?.length > 0 && (
            <Block title="How entries are judged" icon={<LeaderboardRoundedIcon />}>
              <Box sx={{ display: 'grid', gap: 2, maxWidth: 760 }}>
                {track.judging.map((j, i) => {
                  const pct = totalWeight > 0 && j.weight != null ? Math.round((Number(j.weight) / totalWeight) * 100) : null;
                  return (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
                        <Typography sx={{ fontWeight: 800 }}>{j.name}</Typography>
                        {j.weight != null && <Typography sx={{ fontWeight: 800, color: 'primary.dark' }}>{j.weight}%</Typography>}
                      </Box>
                      {pct != null && (
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden', mb: 0.75 }}>
                          <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} />
                        </Box>
                      )}
                      {j.description && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{j.description}</Typography>}
                    </Box>
                  );
                })}
              </Box>
            </Block>
          )}

          {track.prizes?.length > 0 && (
            <Block title="Prizes" icon={<EmojiEventsRoundedIcon />}>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, maxWidth: 760 }}>
                {track.prizes.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <EmojiEventsRoundedIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{p}</Typography>
                  </Box>
                ))}
              </Box>
            </Block>
          )}

          {timeline.length > 0 && (
            <Block title="Key dates" icon={<EventRoundedIcon />}>
              <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, maxWidth: 640 }}>
                {timeline.map((m, i) => (
                  <Box component="li" key={i} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 14, flexShrink: 0 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main', mt: 0.75 }} />
                      {i < timeline.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
                    </Box>
                    <Box sx={{ pb: i < timeline.length - 1 ? 2 : 0 }}>
                      <Typography sx={{ fontWeight: 700 }}>{m.label}</Typography>
                      {m.date && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{formatDate(m.date)}</Typography>}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Block>
          )}

          {(track.resources?.length > 0 || track.knowMoreUrl) && (
            <Block title="Resources" icon={<MenuBookRoundedIcon />}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                {track.resources?.map((r, i) => (
                  <Button key={i} component="a" href={r.url} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>{r.label}</Button>
                ))}
                {track.knowMoreUrl && (
                  <Button component="a" href={track.knowMoreUrl} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>More about this track</Button>
                )}
              </Box>
            </Block>
          )}

          {track.faqs?.length > 0 && (
            <Block title="Questions" icon={<HelpOutlineRoundedIcon />}>
              <Box sx={{ maxWidth: 760 }}>
                {track.faqs.map((f, i) => (
                  <Accordion key={i} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:not(:last-of-type)': { borderBottom: 0 }, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 700 }}>{f.question}</Typography></AccordionSummary>
                    <AccordionDetails><Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{f.answer}</Typography></AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Block>
          )}

          {nothingYet && (
            <Typography sx={{ color: 'text.secondary', maxWidth: 640 }}>
              The full details of this track are on their way. Register now to hold a place, or ask us anything about it.
            </Typography>
          )}
        </DetailLayout>
      </Section>

      {/* Phones: Register now stays in reach at the bottom of the screen — and lifts the WhatsApp
          button above it, as the pathway enrol bar does. */}
      <GlobalStyles styles={(t) => ({ [t.breakpoints.down('lg')]: { ':root': { '--floating-bottom-offset': '76px' } } })} />
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, position: 'sticky', bottom: 0, zIndex: 5, gap: 1.5, alignItems: 'center', px: 2, py: 1.25, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', boxShadow: '0 -6px 18px rgba(17,24,39,0.08)' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{entryWays}{ages ? ` · ${ages}` : ''}</Typography>
        </Box>
        <RegisterButton slug={slug} track={track} registration={registration} />
      </Box>
    </>
  );
}
