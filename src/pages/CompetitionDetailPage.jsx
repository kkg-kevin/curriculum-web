import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { FORMAT_LABEL, CADENCE_LABEL } from '../components/cards/CompetitionCard.jsx';
import { usePublicCompetition } from '../hooks/usePublicCompetitions.js';
import { formatDateRange } from '../utils/dates.js';

const ACCENT = '#25476a';
const ACCENT_MID = '#2e7db5';
const TRACK_GREEN = '#2E7D32';

const STATUS_LABEL = { open: 'Registration open', closed: 'Registration closed' };

// A track's Register button. An external http(s) URL opens in a new tab; a bare/relative value
// (e.g. "/enroll?…") is an in-app route; nothing falls back to the generic enquiry.
function registerTarget(url, competitionName) {
  if (!url) {
    return {
      to: `/contact?subject=${encodeURIComponent(`${competitionName} — entry details`)}`,
      external: false,
    };
  }
  if (/^https?:\/\//i.test(url)) return { href: url, external: true };
  return { to: url, external: false };
}

function TrackCard({ track, competitionName }) {
  const reg = registerTarget(track.registerUrl, competitionName);
  const knowMore = track.knowMoreUrl && /^https?:\/\//i.test(track.knowMoreUrl) ? track.knowMoreUrl : null;

  return (
    <Box
      component="article"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: { xs: 3, md: 3.5 },
        bgcolor: 'background.paper',
        height: '100%',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <Typography variant="h3" component="h3" sx={{ mb: 0.5 }}>
        {track.name}
      </Typography>
      {track.subtitle && (
        <Typography sx={{ color: TRACK_GREEN, fontWeight: 700, mb: 1.5 }}>{track.subtitle}</Typography>
      )}
      {track.description && (
        <Typography sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {track.description}
        </Typography>
      )}

      {track.highlights?.length > 0 && (
        <Box component="ul" sx={{ m: 0, mb: 3, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
          {track.highlights.map((h, i) => (
            <Box component="li" key={`${h}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
              <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
              <Typography variant="body2">{h}</Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {knowMore && (
          <Button
            component="a"
            href={knowMore}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            sx={{ color: ACCENT, borderColor: ACCENT }}
          >
            Know more
          </Button>
        )}
        {reg.external ? (
          <Button
            component="a"
            href={reg.href}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            endIcon={<OpenInNewIcon />}
          >
            Register now
          </Button>
        ) : (
          <Button component={RouterLink} to={reg.to} variant="contained" endIcon={<ArrowForwardIcon />}>
            Register now
          </Button>
        )}
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
          error={{
            message: notFound
              ? 'This competition doesn’t exist or isn’t running right now.'
              : error?.message,
          }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/competitions" variant="outlined">
            View all competitions
          </Button>
        </Box>
      </Container>
    );
  }

  const { name, edition, level, format, cadence, startDate, endDate, coverImage, status, description, tracks = [] } =
    data;

  const dates = formatDateRange(startDate, endDate);
  const enquireTo = `/contact?subject=${encodeURIComponent(`${name} — entry details`)}`;

  return (
    <>
      <SeoHead
        title={`${name} — Digifunzi Competition`}
        description={(description || `Enter a team for ${name}.`).slice(0, 155)}
      />
      <JsonLd data={organizationSchema()} />

      {/* header band */}
      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderTop: '4px solid',
          borderTopColor: ACCENT,
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/competitions" underline="hover" color="inherit">
              Competitions
            </Link>
            <Typography color="text.primary">{name}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, flexWrap: { xs: 'wrap', md: 'nowrap' }, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {edition && <Chip label={edition} sx={{ bgcolor: `${ACCENT}1A`, color: 'text.primary', fontWeight: 600 }} />}
                {level && <Chip variant="outlined" label={level} sx={{ fontWeight: 600 }} />}
                {format && <Chip variant="outlined" label={FORMAT_LABEL[format]} sx={{ fontWeight: 600 }} />}
                {cadence && <Chip variant="outlined" label={CADENCE_LABEL[cadence]} sx={{ fontWeight: 600 }} />}
              </Box>

              <Typography variant="h1" component="h1" sx={{ mb: 1.5 }}>
                {name}
              </Typography>

              {(dates || status) && (
                <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary' }}>
                  {[dates, STATUS_LABEL[status]].filter(Boolean).join(' · ')}
                </Typography>
              )}

              <Button component={RouterLink} to={enquireTo} variant="contained" size="large" sx={{ mt: 3 }}>
                Ask about entering
              </Button>
            </Box>

            {coverImage && (
              <Box sx={{ width: { xs: '100%', md: 380 }, flexShrink: 0 }}>
                <SmartImage src={coverImage} alt={name} ratio="4 / 3" />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Section>
        {description && (
          <Box sx={{ maxWidth: 760, mb: 6 }}>
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              About {name}
            </Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {description}
            </Typography>
          </Box>
        )}

        {tracks.length > 0 ? (
          <>
            <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
              {tracks.length === 1 ? 'The track' : 'Tracks'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 620 }}>
              Each learner or team picks one track to enter. Choose the one that fits their age and
              interests.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 3, md: 3.5 },
                gridTemplateColumns: { xs: '1fr', md: tracks.length === 1 ? '1fr' : 'repeat(2, 1fr)' },
              }}
            >
              {tracks.map((t) => (
                <TrackCard key={t.id} track={t} competitionName={name} />
              ))}
            </Box>
          </>
        ) : (
          <Box sx={{ maxWidth: 720 }}>
            <Typography sx={{ color: 'text.secondary' }}>
              Track details for this edition aren&apos;t published yet — send an enquiry and we&apos;ll
              share them as soon as they&apos;re confirmed.
            </Typography>
          </Box>
        )}
      </Section>

      <CTABanner
        heading={`Enter a team for ${name}`}
        body="Tell us your learners’ ages and which track interests them — we’ll share entry details, dates and what to prepare."
        primary={{ label: 'Ask about entering', to: enquireTo }}
        secondary={{ label: 'All competitions', to: '/competitions' }}
      />
    </>
  );
}
