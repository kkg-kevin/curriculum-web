import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { groupAmenities, PRICING_MODEL_LABEL } from '../components/hubs/amenities.js';
import { usePublicHub } from '../hooks/usePublicHubs.js';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { formatDateRange } from '../utils/dates.js';

const RUN_STATUS_LABEL = { upcoming: 'Upcoming', active: 'Running now' };

/**
 * /bootcamps/:slug/hubs/:hubId — the full profile for one hub a bootcamp runs at. Reached by
 * clicking a hub in BootcampDetailPage's "Running at" list; the bootcamp slug in the URL is only
 * there to build the breadcrumb/back-link (the hub data itself comes from its own
 * GET /api/public/hubs/:id call and doesn't depend on the bootcamp).
 */
export default function HubDetailPage() {
  const { slug, hubId } = useParams();
  const [searchParams] = useSearchParams();
  const { data: hub, isLoading, isError, error, refetch } = usePublicHub(hubId);
  // Only used for the bootcamp's name in the breadcrumb / back link — a cheap cache hit since
  // the visitor just came from that page. Dates for this specific run travel as query params
  // (BootcampDetailPage sets them when linking here) since a hub can run several bootcamps.
  const { data: bootcamp } = usePublicBootcamp(slug);

  const runStartDate = searchParams.get('start') || '';
  const runEndDate = searchParams.get('end') || '';
  const runStatus = searchParams.get('status') || '';

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={320} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError || !hub) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Hub not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This hub doesn’t exist or isn’t currently active.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={slug ? `/bootcamps/${slug}` : '/bootcamps'} variant="outlined">
            {slug ? 'Back to the bootcamp' : 'View all bootcamps'}
          </Button>
        </Box>
      </Container>
    );
  }

  const gallery = hub.photos?.length ? hub.photos : hub.photo ? [hub.photo] : [];
  const amenityGroups = groupAmenities(hub.amenities);

  return (
    <>
      <SeoHead title={`${hub.name} — Digifunzi`} description={(hub.description || '').slice(0, 155)} noindex />
      <JsonLd data={[organizationSchema()]} />

      {/* header band */}
      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderTop: '4px solid',
          borderTopColor: 'primary.dark',
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
            {slug && (
              <Link component={RouterLink} to={`/bootcamps/${slug}`} underline="hover" color="inherit">
                {bootcamp?.name || 'Bootcamp'}
              </Link>
            )}
            <Typography color="text.primary">{hub.name}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
            <Typography variant="h1" component="h1">
              {hub.name}
            </Typography>
            {runStatus && RUN_STATUS_LABEL[runStatus] && (
              <Chip
                label={RUN_STATUS_LABEL[runStatus]}
                sx={{
                  fontWeight: 700,
                  bgcolor: (t) => alpha(runStatus === 'active' ? t.palette.success.main : t.palette.info.main, 0.12),
                  color: runStatus === 'active' ? 'success.dark' : 'info.dark',
                }}
              />
            )}
          </Box>

          {(runStartDate || runEndDate) && (
            <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {formatDateRange(runStartDate, runEndDate) || 'Dates to be confirmed'}
            </Typography>
          )}
        </Container>
      </Box>

      <Section>
        <Box sx={{ display: 'flex', gap: { xs: 5, md: 6 }, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* main column */}
          <Box sx={{ flex: '1 1 480px', minWidth: 0, maxWidth: 760 }}>
            {/* photo gallery */}
            {gallery.length > 0 ? (
              <Box sx={{ display: 'flex', gap: '4px', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 2, mb: 4 }}>
                <Box sx={{ flex: gallery.length > 1 ? '2 1 0' : '1 1 0', minWidth: 0 }}>
                  <SmartImage src={gallery[0]} alt={hub.name} ratio="16 / 9" rounded={false} />
                </Box>
                {gallery.length > 1 && (
                  <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'grid', gridTemplateRows: gallery.length > 2 ? '1fr 1fr' : '1fr', gap: '4px' }}>
                    {gallery.slice(1, 3).map((src, i) => (
                      <Box key={src + i} sx={{ position: 'relative', overflow: 'hidden' }}>
                        <SmartImage src={src} alt={hub.name} ratio="1 / 1" rounded={false} />
                        {i === 1 && gallery.length > 3 && (
                          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center' }}>
                            <Typography sx={{ color: '#fff', fontWeight: 700 }}>+{gallery.length - 3} more</Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 2,
                  mb: 4,
                  display: 'grid',
                  placeItems: 'center',
                  background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
                }}
              >
                <EventIcon sx={{ color: '#fff', opacity: 0.85, fontSize: 48 }} />
              </Box>
            )}

            {hub.description && (
              <Box sx={{ mb: 6 }}>
                <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
                  About this hub
                </Typography>
                <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                  {hub.description}
                </Typography>
              </Box>
            )}

            {amenityGroups.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Amenities
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gap: 3 }}>
                  {amenityGroups.map((group) => (
                    <Box key={group.key}>
                      {amenityGroups.length > 1 && (
                        <Typography
                          variant="overline"
                          sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em', mb: 1.25 }}
                        >
                          {group.label}
                        </Typography>
                      )}
                      <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' } }}>
                        {group.items.map((item) => {
                          const Icon = item.Icon;
                          return (
                            <Box
                              key={item.value}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                                  color: 'primary.dark',
                                }}
                              >
                                {Icon ? <Icon sx={{ fontSize: 18 }} /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.label}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {hub.spaces?.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                  Spaces available
                </Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                  {hub.spaces.map((s, i) => (
                    <Box
                      key={`${s.name}-${i}`}
                      sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                      {(s.building || s.floor || s.room) && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {[s.building, s.floor, s.room && `Room ${s.room}`].filter(Boolean).join(' · ')}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EventSeatIcon sx={{ fontSize: 18 }} />
                          {s.minCapacity}–{s.maxCapacity} learners
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: 'primary.dark' }}>
                          {s.pricingModel === 'free' ? 'Free' : `KES ${s.rate}`}
                          {s.pricingModel !== 'free' && (
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500, ml: 0.5 }}>
                              {s.priceUnit || PRICING_MODEL_LABEL[s.pricingModel]}
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* side column — contact card */}
          <Box sx={{ flex: '1 1 280px', minWidth: 260, maxWidth: { xs: '100%', md: 340 }, position: { md: 'sticky' }, top: { md: 100 } }}>
            <Box sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Get in touch
              </Typography>
              <Box sx={{ display: 'grid', gap: 1.75 }}>
                {hub.address && (
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                    <PlaceIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      {hub.address}
                      {hub.mapLink && (
                        <>
                          {' · '}
                          <Link href={hub.mapLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            View on map
                          </Link>
                        </>
                      )}
                    </Typography>
                  </Box>
                )}
                {!hub.address && hub.mapLink && (
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                    <MapIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Link href={hub.mapLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>
                      View on map
                    </Link>
                  </Box>
                )}
                {hub.contactPerson && (
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                    <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">{hub.contactPerson}</Typography>
                  </Box>
                )}
                {hub.phone && (
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                    <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Link href={`tel:${hub.phone}`} color="inherit" underline="hover">{hub.phone}</Link>
                  </Box>
                )}
                {hub.email && (
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Link href={`mailto:${hub.email}`} color="inherit" underline="hover">{hub.email}</Link>
                  </Box>
                )}
                {(hub.operatingHours?.opensAt || hub.operatingHours?.days?.length > 0) && (
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                    <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
                    <Box>
                      {hub.operatingHours.opensAt && hub.operatingHours.closesAt && (
                        <Typography variant="body2">{hub.operatingHours.opensAt} – {hub.operatingHours.closesAt}</Typography>
                      )}
                      {hub.operatingHours.days?.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {hub.operatingHours.days.map((d) => (
                            <Chip key={d} size="small" label={d} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {slug && (
                <Button
                  component={RouterLink}
                  to={`/bootcamps/${slug}`}
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Back to {bootcamp?.name || 'the bootcamp'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Section>

      <CTABanner
        heading="Ready to enquire about this bootcamp?"
        body="Send us your details and we'll get back to you with everything you need to know."
        primary={{
          label: 'Enquire now',
          to: slug ? `/enroll?interestedIn=bootcamp&referenceId=${encodeURIComponent(slug)}` : '/contact',
        }}
        secondary={{ label: 'Talk to us', to: '/contact' }}
      />
    </>
  );
}
