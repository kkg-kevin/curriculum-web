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
import EventIcon from '@mui/icons-material/Event';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { FORMAT_LABEL } from '../components/cards/BootcampCard.jsx';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { formatPrice, ageLabel } from '../utils/format.js';
import { formatDateRange } from '../utils/dates.js';

const ACCENT = '#25476a';
const ACCENT_MID = '#2e7db5';

const RUN_STATUS_LABEL = { upcoming: 'Upcoming', active: 'Running now' };

export default function BootcampDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicBootcamp(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="rounded" height={260} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Bootcamp not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This bootcamp doesn’t exist or isn’t open for bookings right now.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/bootcamps" variant="outlined">
            View all bootcamps
          </Button>
        </Box>
      </Container>
    );
  }

  const {
    name, tagline, description, format, duration, ageMin, ageMax, coverImage, price,
    highlights = [], upcomingRuns = [],
  } = data;

  const age = ageLabel(ageMin, ageMax);
  const priceLabel = price ? formatPrice(price) : 'Enquire for pricing';
  const enquireTo = `/enroll?interestedIn=bootcamp&referenceId=${encodeURIComponent(slug)}`;

  return (
    <>
      <SeoHead
        title={`${name} — Digifunzi Bootcamp`}
        description={(tagline || description || '').slice(0, 155)}
        type="product"
      />
      <JsonLd
        data={[
          organizationSchema(),
          productSchema(
            {
              name,
              slug,
              summary: tagline || description,
              description,
              image: coverImage,
              price: price ? { amount: price.amount, currency: price.currency } : null,
              kind: 'bootcamp',
            },
            `/bootcamps/${slug}`,
            { pricingIsPlaceholder: true },
          ),
        ]}
      />

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
            <Link component={RouterLink} to="/bootcamps" underline="hover" color="inherit">
              Bootcamps
            </Link>
            <Typography color="text.primary">{name}</Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 3, md: 5 },
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {format && (
                  <Chip
                    label={FORMAT_LABEL[format]}
                    sx={{ bgcolor: `${ACCENT}1A`, color: 'text.primary', fontWeight: 600 }}
                  />
                )}
                {duration && <Chip variant="outlined" label={duration} sx={{ fontWeight: 600 }} />}
                {age && <Chip variant="outlined" label={age} sx={{ fontWeight: 600 }} />}
              </Box>

              <Typography variant="h1" component="h1" sx={{ mb: 1.5 }}>
                {name}
              </Typography>
              {tagline && (
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 620 }}
                >
                  {tagline}
                </Typography>
              )}

              {/* price + enquire */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  maxWidth: 420,
                }}
              >
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: ACCENT }}>
                  {priceLabel}
                </Typography>
                {price?.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {price.note}
                  </Typography>
                )}
                <Button
                  component={RouterLink}
                  to={enquireTo}
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Enquire to book
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  No online checkout yet — we&apos;ll confirm the next run&apos;s dates, the price and
                  how to secure a place.
                </Typography>
              </Box>
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
              About this bootcamp
            </Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {description}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: {
              xs: '1fr',
              md: highlights.length && upcomingRuns.length ? '1fr 1fr' : '1fr',
            },
            maxWidth: 900,
          }}
        >
          {highlights.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircleIcon sx={{ color: ACCENT_MID }} />
                <Typography variant="h4" component="h2">
                  What you&apos;ll build
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
                {highlights.map((h, i) => (
                  <Box component="li" key={`${h}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography>{h}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {upcomingRuns.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EventIcon sx={{ color: ACCENT_MID }} />
                <Typography variant="h4" component="h2">
                  Upcoming runs
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
                {upcomingRuns.map((run, i) => (
                  <Box
                    component="li"
                    key={`${run.hubName}-${run.startDate}-${i}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {run.hubName || 'Location to be confirmed'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateRange(run.startDate, run.endDate) || 'Dates to be confirmed'}
                      {run.status && RUN_STATUS_LABEL[run.status]
                        ? ` · ${RUN_STATUS_LABEL[run.status]}`
                        : ''}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Send an enquiry and we&apos;ll hold a place on the run that suits you.
              </Typography>
            </Box>
          )}
        </Box>

        {upcomingRuns.length === 0 && (
          <Box sx={{ maxWidth: 900, mt: highlights.length ? 4 : 0 }}>
            <Typography variant="body2" color="text.secondary">
              Dates for the next run aren&apos;t published yet — send an enquiry and we&apos;ll let
              you know the moment they are.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 6, maxWidth: 900 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h4" component="p" gutterBottom>
                Book {name} for your learner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {priceLabel}
                {price?.note ? ` · ${price.note}` : ''}
              </Typography>
            </Box>
            <Button component={RouterLink} to={enquireTo} variant="contained" size="large">
              Enquire to book
            </Button>
          </Box>
        </Box>
      </Section>

      <CTABanner
        heading="Booking for a school or club?"
        body="Tell us how many learners you have and which bootcamp you're interested in — we'll put together a group quote and dates that work."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20bootcamp%20enquiry' }}
        secondary={{ label: 'Browse all bootcamps', to: '/bootcamps' }}
      />
    </>
  );
}
