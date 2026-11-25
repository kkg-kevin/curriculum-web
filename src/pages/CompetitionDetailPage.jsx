import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import CompetitionHero, { HeroPill, heroBackground } from '../components/competitions/CompetitionHero.jsx';
import { DetailHeading } from '../components/common/DetailSection.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema, eventSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { CADENCE_LABEL, competitionStatusLabel, entryModesLabel } from '../components/cards/CompetitionCard.jsx';
import { CompetitionInfoPanel, infoParts } from '../components/competitions/CompetitionInfo.jsx';
import CoursePricingRoadmap from '../components/pathway/CoursePricingRoadmap.jsx';
import { usePublicCompetition } from '../hooks/usePublicCompetitions.js';
import { formatDateRange } from '../utils/dates.js';
import { resolveMediaUrl } from '../utils/media.js';
import { safeHtml } from '../utils/safeHtml.js';
import { titleWithKind } from '../utils/seo.js';
import { agesText, hasRich, registrationLine, trackPath } from '../utils/competitions.js';
import { RegisterButton } from '../components/competitions/trackBits.jsx';
import { PROSE_MAX_WIDTH } from '../theme/layout.js';
import { RelatedCompetitions } from '../components/common/Related.jsx';

function TrackCard({ slug, track, index, registration, coverImage }) {
  const ages = agesText(track.ageMin, track.ageMax);
  const hasPage = hasRich(track.overview) || hasRich(track.whatToDo) || hasRich(track.rules) || track.judging?.length || track.faqs?.length || track.prizes?.length || track.timeline?.length || track.resources?.length;
  return (
    <Box
      component="article"
      sx={{
        display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 3,
        bgcolor: 'background.paper', height: '100%', overflow: 'hidden',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      {/* The track's picture as the card's header, its name on top (the competition's picture
          when the track has none of its own; the brand gradient when neither has one). */}
      <Box sx={{ position: 'relative', minHeight: { xs: 190, md: 220 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { xs: 2.5, md: 3 }, color: '#fff', background: track.coverImage || coverImage ? `linear-gradient(180deg, rgba(16,32,52,0.15) 0%, rgba(16,32,52,0.55) 45%, rgba(16,32,52,0.94) 100%), center / cover no-repeat url(${resolveMediaUrl(track.coverImage || coverImage)})` : heroBackground(null) }}>
        <Typography variant="overline" sx={{ color: 'secondary.light', fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1.4 }}>Track {index + 1}{ages ? ` · ${ages}` : ''}</Typography>
        <Typography variant="h3" component="h3" sx={{ color: '#fff', fontWeight: 900, mt: 0.25 }}>{track.name}</Typography>
        {track.subtitle && <Typography sx={{ color: 'rgba(255,255,255,0.88)', fontWeight: 700, mt: 0.25 }}>{track.subtitle}</Typography>}
      </Box>
      <Box sx={{ p: { xs: 3, md: 3.5 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {track.description && (
          <Typography sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7, whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH }}>
            {track.description}
          </Typography>
        )}
        {track.highlights?.length > 0 && (
          <Box component="ul" sx={{ m: 0, mb: 2.5, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
            {track.highlights.map((h, i) => (
              <Box component="li" key={`${h}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                <Typography variant="body2">{h}</Typography>
              </Box>
            ))}
          </Box>
        )}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <RegisterButton slug={slug} track={track} registration={registration} />
          {(hasPage || track.knowMoreUrl) && (
            <Button component={RouterLink} to={trackPath(slug, track)} variant="outlined" sx={{ color: 'primary.dark', borderColor: 'primary.dark' }}>
              Know more
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function CompetitionDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicCompetition(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={220} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="rounded" height={220} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Competition not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This competition doesn’t exist or isn’t running right now.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/competitions" variant="outlined">View all competitions</Button>
        </Box>
      </Container>
    );
  }

  const {
    name, edition, level, cadence, startDate, endDate, coverImage, status, description, descriptionHtml,
    tracks = [], coursePricing = [], registration, registrationCloseDate, info = {},
  } = data;

  const dates = formatDateRange(startDate, endDate);
  const statusLabel = competitionStatusLabel(status, endDate);
  const enquireTo = `/contact?subject=${encodeURIComponent(`${name}: entry details`)}`;
  const entryLabel = entryModesLabel(data);
  const canRegister = Boolean(registration?.open) && tracks.length > 0;
  const aboutHtml = hasRich(descriptionHtml) ? safeHtml(descriptionHtml) : '';
  const hasInfo = infoParts(data).hasAnything;

  return (
    <>
      <SeoHead
        title={titleWithKind(name, 'Competition')}
        description={description || `Register for ${name}.`}
        about="A Digifunzi coding and robotics competition for kids in Kenya. See the tracks and register online."
        image={resolveMediaUrl(coverImage) || undefined}
      />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Competitions', path: '/competitions' },
            { name, path: `/competitions/${slug}` },
          ]),
          eventSchema({ name, description, startDate, endDate, image: resolveMediaUrl(coverImage), path: `/competitions/${slug}` }),
        ]}
      />

      <CompetitionHero
        image={coverImage}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Competitions', to: '/competitions' }, { label: name }]}
        overline={['Competition', edition, level].filter(Boolean).join(' · ')}
        title={name}
        description={aboutHtml || null}
        lead={aboutHtml ? null : description || null}
        // The competition's information sits in a panel on the right of the picture (user, 20 Nov
        // 2026), so the key facts aren't repeated beside the title — only when there's no panel.
        aside={hasInfo ? <CompetitionInfoPanel competition={data} /> : null}
        facts={hasInfo ? [] : [
          { icon: <EventRoundedIcon />, title: dates || 'Dates to be confirmed', line: statusLabel },
          { icon: <GroupsRoundedIcon />, title: [entryLabel, agesText(info.ageMin, info.ageMax)].filter(Boolean).join(' · '), line: cadence ? CADENCE_LABEL[cadence] : null },
          tracks.length > 0 && { icon: <EmojiEventsIcon />, title: `${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'} to choose from` },
        ]}
        badges={<HeroPill tone={registration?.open ? 'live' : 'muted'}>{registrationLine(registration, registrationCloseDate)}</HeroPill>}
        actions={canRegister ? (
          <>
            <Button component="a" href="#tracks" variant="contained" color="secondary" size="large" sx={{ fontWeight: 900, px: 4, minHeight: 52 }}>Choose a track and register</Button>
            <Button component={RouterLink} to={enquireTo} size="large" sx={{ color: '#fff', fontWeight: 800, minHeight: 52 }}>Ask a question</Button>
          </>
        ) : (
          <Button component={RouterLink} to={enquireTo} variant="contained" color="secondary" size="large" sx={{ fontWeight: 900, px: 4, minHeight: 52 }}>Ask about entering</Button>
        )}
      />

      <Section>
        <Box>

          <Box id="tracks" sx={{ scrollMarginTop: 96 }}>
            {tracks.length > 0 ? (
              <>
                <DetailHeading title={tracks.length === 1 ? 'The track' : 'Tracks'} icon={<EmojiEventsIcon />} tight />
                <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 620 }}>
                  Each participant or team enters one track. Choose the one that fits their age and interests. Know More has the full details.
                </Typography>
                <Box sx={{ display: 'grid', gap: { xs: 3, md: 3.5 }, gridTemplateColumns: { xs: '1fr', md: tracks.length === 1 ? 'minmax(0, 720px)' : 'repeat(2, minmax(0, 1fr))', lg: tracks.length >= 3 ? 'repeat(3, minmax(0, 1fr))' : undefined } }}>
                  {tracks.map((t, i) => <TrackCard key={t.id} slug={slug} track={t} index={i} registration={registration} coverImage={coverImage} />)}
                </Box>
              </>
            ) : (
              <Box sx={{ maxWidth: 720 }}>
                <Typography sx={{ color: 'text.secondary' }}>
                  Track details for this edition aren&apos;t published yet. Send an enquiry and we&apos;ll share them as soon as they&apos;re confirmed.
                </Typography>
              </Box>
            )}
          </Box>

          {coursePricing.length > 0 && (
            <Box sx={{ mt: 6, maxWidth: 900 }}>
              <DetailHeading title="Course pricing" icon={<PaymentsIcon />} tight />
              <Typography sx={{ color: 'text.secondary', mb: 4 }}>Individual course prices within this competition&apos;s curriculum.</Typography>
              <Box sx={{ display: 'grid', gap: 5 }}>
                {coursePricing.map((section, i) => (
                  <Box key={section.pathwayId || `ungrouped-${i}`}>
                    {section.pathwayName && (
                      <Typography variant="overline" sx={{ display: 'block', color: section.pathwayColor || 'primary.dark', fontWeight: 800, letterSpacing: '0.06em', mb: 2 }}>
                        {section.pathwayName}
                      </Typography>
                    )}
                    <CoursePricingRoadmap courses={section.courses} accent={section.pathwayColor || undefined} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Section>

      <RelatedCompetitions currentSlug={slug} />

      <CTABanner
        heading={canRegister ? `Register for ${name}` : `Enter ${name}`}
        body={canRegister ? 'On your own or as a team: pick a track, register in a few minutes and pay the entry fee online.' : 'Tell us your learners’ ages and which track interests them, and we’ll share entry details, dates and what to prepare.'}
        primary={canRegister ? { label: 'See the tracks', to: `/competitions/${slug}#tracks` } : { label: 'Ask about entering', to: enquireTo }}
        secondary={{ label: 'All competitions', to: '/competitions' }}
      />
    </>
  );
}
