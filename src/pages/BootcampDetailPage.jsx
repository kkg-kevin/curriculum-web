import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EventIcon from '@mui/icons-material/Event';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RouteIcon from '@mui/icons-material/Route';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema, eventSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import DetailSection from '../components/common/DetailSection.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import ExpandableText from '../components/common/ExpandableText.jsx';
import MediaGallery from '../components/media/MediaGallery.jsx';
import FactPills from '../components/common/FactPills.jsx';
import PlaceIcon from '@mui/icons-material/Place';
import PaymentsIcon from '@mui/icons-material/Payments';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { FORMAT_LABEL } from '../components/cards/BootcampCard.jsx';
import BootcampPathwayCard from '../components/cards/BootcampPathwayCard.jsx';
import HubPreviewCard from '../components/hubs/HubPreviewCard.jsx';
import CoursePricingRoadmap from '../components/pathway/CoursePricingRoadmap.jsx';
import BootcampGames from '../components/bootcamp/BootcampGames.jsx';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { formatPrice, ageLabel } from '../utils/format.js';
import { formatDateRange } from '../utils/dates.js';
import { resolveMediaUrl } from '../utils/media.js';
import { titleWithKind } from '../utils/seo.js';
import { PROSE_MAX_WIDTH } from '../theme/layout.js';
import { RelatedBootcamps } from '../components/common/Related.jsx';

const RUN_STATUS_LABEL = { upcoming: 'Upcoming', active: 'Running now' };

export default function BootcampDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicBootcamp(slug);
  // The description itself is capped at 150 words in the admin builder (bootcamp.schema.js), so
  // this clamp is a display-side safety net rather than the primary control — a normal
  // ~150-word description shows in full at this line count; only a genuine outlier (or content
  // saved before the cap existed) ever needs the "Read more" toggle.
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  // Which pathway section (by pathwayId, or 'ungrouped' for the pathway-less courses section)
  // is currently expanded in the "Pathway courses" area — null shows the card grid instead.
  const [selectedPathwayKey, setSelectedPathwayKey] = useState(null);
  // Which "Running at" hub is previewed in the sidebar right now (by hub id) — null hides the
  // preview. Clicking the same hub's card again clears it, closing the preview in place instead
  // of navigating to the full /bootcamps/:slug/hubs/:hubId page and back.
  const [selectedHubRun, setSelectedHubRun] = useState(null);
  // The hub preview sits in the sticky side panel on a wide screen; on a narrow one that panel
  // is further up the page than the "Running at" list, so the preview opens under the list.

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
    name, tagline, description, format, duration, ageMin, ageMax, coverImage, images = [], price,
    startDate, endDate,
    highlights = [], upcomingRuns = [], coursePricing = [], priceNotes = [], curriculum, pathwayDiagnostics = [],
    // Games and play that come with the bootcamp — absent on an older API, which reads as none.
    games = [], gamesNote = '',
  } = data;

  // Only the currently expanded pathway's diagnostic (if it has one) — `selectedPathwayKey` is a
  // pathwayId when a real pathway is expanded (see the "Pathways in this bootcamp" section
  // below), null otherwise. Used by the sidebar CTA so it only ever offers ONE diagnostic at a
  // time, matching whichever pathway the visitor is currently looking at, rather than listing
  // every pathway's diagnostic regardless of what's expanded.
  const selectedPathwayDiagnostic = pathwayDiagnostics.find((pd) => pd.pathwayId === selectedPathwayKey) || null;

  // Each coursePricing section's stable key (a pathwayId, or `ungrouped-i` for priced courses not
  // tied to any pathway) — computed once here so both the sidebar price below and the "Pathways in
  // this bootcamp" section further down key/match sections identically, rather than two separate
  // key-generation copies risking drift.
  const keyedCoursePricing = coursePricing.map((section, i) => ({
    ...section,
    key: section.pathwayId || `ungrouped-${i}`,
  }));

  const age = ageLabel(ageMin, ageMax);
  // A bootcamp priced by course/module instead of as a whole has `price: null` — falling straight
  // to "Enquire for pricing" would hide real numbers that DO exist, just spread across the
  // "Pathway courses" section below. Surface the cheapest priced item instead, as a "From X"
  // headline — a course entry priced by module (modules.length > 0) carries no priceAmount of its
  // own (see CoursePricingRoadmap.jsx), so its modules must be checked instead of the course.
  //
  // Scoped to whichever pathway is currently expanded (`selectedPathwayKey`) when one is — so the
  // sidebar price reflects the pathway a visitor is actually looking at, not always the bootcamp's
  // overall cheapest item. Falls back to every pathway's courses when none is selected (the
  // default "browsing" view).
  const pricingScope = selectedPathwayKey
    ? keyedCoursePricing.filter((section) => section.key === selectedPathwayKey)
    : keyedCoursePricing;
  const cheapestCoursePricingItem = pricingScope
    .flatMap((section) => section.courses || [])
    .flatMap((course) => ((course.modules || []).length > 0 ? course.modules : [course]))
    .filter((item) => typeof item.priceAmount === 'number')
    .reduce((cheapest, item) => (!cheapest || item.priceAmount < cheapest.priceAmount ? item : cheapest), null);
  const priceLabel = price
    ? formatPrice(price)
    : cheapestCoursePricingItem
      ? `From ${formatPrice({ amount: cheapestCoursePricingItem.priceAmount, currency: cheapestCoursePricingItem.priceCurrency })}`
      : 'Enquire for pricing';
  const hasIntro = Boolean(description) || highlights.length > 0 || priceNotes.length > 0;

  return (
    <>
      <SeoHead
        title={titleWithKind(name, 'Bootcamp')}
        description={tagline || description}
        image={resolveMediaUrl(coverImage) || undefined}
      />
      {/* A bootcamp is something that happens on dates at a place — one EducationEvent per
          scheduled run at a real hub (Google's event rich result), rather than a Product with a
          placeholder price. Runs without a start date are skipped by eventSchema. */}
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Bootcamps', path: '/bootcamps' },
            { name, path: `/bootcamps/${slug}` },
          ]),
          ...upcomingRuns.map((run) =>
            eventSchema({
              type: 'EducationEvent',
              name: run.hub?.name ? `${name} — ${run.hub.name}` : name,
              description: tagline || description,
              startDate: run.startDate,
              endDate: run.endDate,
              image: resolveMediaUrl(coverImage),
              path: `/bootcamps/${slug}`,
              location: run.hub ? { name: run.hub.name, address: run.hub.address } : null,
            }),
          ),
        ]}
      />

      {/* header band — name/tagline/chips/photo, with the dates, place and price as facts. What
          the price includes is listed with the details below. */}
      <DetailHero crumbs={[{ label: 'Home', to: '/' }, { label: 'Bootcamps', to: '/bootcamps' }, { label: name }]}>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 4, md: 6 },
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              // Top-aligned: centred against a tall image, the title floated in empty space.
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260, pt: { md: 1 } }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {format && (
                  <Chip
                    label={FORMAT_LABEL[format]}
                    sx={{ bgcolor: (t) => alpha(t.palette.primary.dark, 0.102), color: 'text.primary', fontWeight: 600 }}
                  />
                )}
                {duration && <Chip variant="outlined" label={duration} sx={{ fontWeight: 600 }} />}
                {age && <Chip variant="outlined" label={age} sx={{ fontWeight: 600 }} />}
              </Box>

              <Typography variant="h1" component="h1" sx={{ mb: 1.5, fontSize: { xs: '2rem', md: '2.9rem' } }}>
                {name}
              </Typography>
              {tagline && (
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 620, lineHeight: 1.5 }}
                >
                  {tagline}
                </Typography>
              )}

              {/* The facts a parent decides on, and the one action, up front — they used to appear
                  only in the sidebar further down. */}
              <FactPills
                sx={{ mt: 3 }}
                items={[
                  { key: 'dates', Icon: ScheduleIcon, label: formatDateRange(startDate, endDate) },
                  {
                    key: 'where',
                    Icon: PlaceIcon,
                    label:
                      upcomingRuns.length === 1
                        ? upcomingRuns[0].hub?.name
                        : upcomingRuns.length > 1
                          ? `${upcomingRuns.length} locations`
                          : '',
                  },
                  { key: 'price', Icon: PaymentsIcon, label: priceLabel },
                ]}
              />
            </Box>

            {/* The right half: the cover, then the bootcamp's other images (up to 3) — each shown
                whole, with ‹ ›, thumbnails and a full-screen view when there's more than one. */}
            {(coverImage || images.length > 0) && (
              <Box sx={{ width: { xs: '100%', md: '50%' }, flexShrink: 0 }}>
                <MediaGallery images={[coverImage, ...images]} alt={name} />
              </Box>
            )}
          </Box>
      </DetailHero>

      <Section py={{ xs: 5, md: 7 }}>
        <Box
          sx={{
            display: 'grid',
            rowGap: { xs: 5, md: 7 },
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridTemplateAreas: hasIntro ? '"intro" "main"' : '"main"',
            alignItems: 'start',
          }}
        >
          {hasIntro && (
            <Box sx={{ gridArea: 'intro', minWidth: 0 }}>
            {description && (
              <DetailSection title="About this bootcamp" icon={<InfoOutlinedIcon />}>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH,
                    lineHeight: 1.7,
                    ...(descriptionExpanded
                      ? {}
                      : {
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 8,
                          overflow: 'hidden',
                        }),
                  }}
                >
                  {description}
                </Typography>
                {!descriptionExpanded && description.length > 600 && (
                  <Link
                    component="button"
                    type="button"
                    onClick={() => setDescriptionExpanded(true)}
                    sx={{ display: 'inline-block', mt: 1, fontWeight: 700 }}
                  >
                    Read more
                  </Link>
                )}
              </DetailSection>
            )}

            {highlights.length > 0 && (
              <DetailSection title="What you’ll build" icon={<CheckCircleIcon />}>
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
                  {highlights.map((h, i) => (
                    <Box component="li" key={`${h}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                      <Typography>{h}</Typography>
                    </Box>
                  ))}
                </Box>
              </DetailSection>
            )}

            {priceNotes.length > 0 && (
              <DetailSection title="Included in the price" icon={<PaymentsIcon />}>
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
                  {priceNotes.map((note, i) => (
                    <Box component="li" key={`${note}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                      <Typography>{note}</Typography>
                    </Box>
                  ))}
                </Box>
              </DetailSection>
            )}

            </Box>
          )}

          <Box sx={{ gridArea: 'main', minWidth: 0 }}>
            {/* The fun side — right after what they'll build, before the practical details. */}
            <BootcampGames games={games} note={gamesNote} />

            {/* Running at — every hub this bootcamp currently runs at, resolved server-side into
                a richer projection (photo/address/contact) than the old "Upcoming runs" list
                carried — see public-bootcamp.service.js's projectHub(). */}
            {upcomingRuns.length > 0 && (
              <DetailSection title="Running at" icon={<EventIcon />}>

                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                  {upcomingRuns.map((run, i) => {
                    const isSelected = selectedHubRun?.hub.id === run.hub.id;
                    return (
                    <Box
                      key={`${run.hub.id}-${i}`}
                      component="button"
                      type="button"
                      onClick={() => setSelectedHubRun(isSelected ? null : run)}
                      aria-pressed={isSelected}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.75,
                        p: 1.75,
                        minWidth: 0,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: 'background.paper',
                        textDecoration: 'none',
                        color: 'inherit',
                        font: 'inherit',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'border-color 180ms ease, box-shadow 180ms ease',
                        boxShadow: isSelected ? (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.1)}` : 'none',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.1)}`,
                        },
                        '&:focus-visible': {
                          outline: (t) => `2px solid ${t.palette.primary.main}`,
                          outlineOffset: 2,
                        },
                      }}
                    >
                      {run.hub.photo ? (
                        <Box sx={{ width: 64, height: 64, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}>
                          <SmartImage src={run.hub.photo} alt={run.hub.name} ratio="1 / 1" rounded={false} />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 1.5,
                            flexShrink: 0,
                            display: 'grid',
                            placeItems: 'center',
                            background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
                          }}
                        >
                          <EventIcon sx={{ color: '#fff', opacity: 0.85 }} />
                        </Box>
                      )}

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
                            {run.hub.name}
                          </Typography>
                          {run.status && RUN_STATUS_LABEL[run.status] && (
                            <Chip
                              size="small"
                              label={RUN_STATUS_LABEL[run.status]}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: (t) => alpha(run.status === 'active' ? t.palette.success.main : t.palette.info.main, 0.12),
                                color: run.status === 'active' ? 'success.dark' : 'info.dark',
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                          {formatDateRange(run.startDate, run.endDate) || 'Dates to be confirmed'}
                          {run.hub.address ? ` · ${run.hub.address}` : ''}
                        </Typography>
                        {(run.hub.contactPerson || run.hub.phone) && (
                          <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.78rem', mt: 0.25 }}>
                            {[run.hub.contactPerson, run.hub.phone].filter(Boolean).join(' · ')}
                          </Typography>
                        )}
                      </Box>
                      <ChevronRightIcon
                        sx={{
                          color: isSelected ? 'primary.main' : 'text.disabled',
                          flexShrink: 0,
                          transform: isSelected ? 'rotate(90deg)' : 'none',
                          transition: 'transform 180ms ease, color 180ms ease',
                        }}
                      />
                    </Box>
                    );
                  })}
                </Box>
                {selectedHubRun && (
                  <Box sx={{ mt: 2 }}>
                    <HubPreviewCard hubId={selectedHubRun.hub.id} run={selectedHubRun} onClose={() => setSelectedHubRun(null)} />
                  </Box>
                )}
              </DetailSection>
            )}

            {upcomingRuns.length === 0 && (
              <Box sx={{ mb: 7 }}>
                <Typography variant="body2" color="text.secondary">
                  Dates for the next run aren&apos;t published yet — send an enquiry and we&apos;ll let
                  you know the moment they are.
                </Typography>
              </Box>
            )}

            {(coursePricing.length > 0 || pathwayDiagnostics.length > 0) && (() => {
              const keyed = keyedCoursePricing;
              // A pathway can carry a diagnostic with no priced courses at all — e.g. a
              // whole-bootcamp-priced bootcamp (no per-course breakdown, see the Pricing card's
              // mode toggle) still assigns per-pathway diagnostics in the builder. Give it a card
              // too (courses: []) so its diagnostic stays reachable rather than only existing for
              // pathways that happen to also have course pricing.
              const knownPathwayIds = new Set(keyed.map((s) => s.pathwayId).filter(Boolean));
              const diagnosticOnly = pathwayDiagnostics
                .filter((pd) => !knownPathwayIds.has(pd.pathwayId))
                .map((pd) => ({
                  pathwayId: pd.pathwayId,
                  pathwayName: pd.pathwayName,
                  pathwayColor: pd.pathwayColor,
                  courses: [],
                  key: pd.pathwayId,
                }));
              const allSections = [...keyed, ...diagnosticOnly];
              const selected = allSections.find((s) => s.key === selectedPathwayKey) || null;

              return (
                <DetailSection
                  title={selected ? selected.pathwayName || 'Other courses' : 'Pathways in this bootcamp'}
                  icon={<RouteIcon />}
                  lead={
                    selected
                      ? null
                      : coursePricing.length > 0
                        ? 'Individual course prices, and diagnostics where available, by pathway.'
                        : "Take a diagnostic for the pathway you're interested in."
                  }
                  action={
                    selected && selectedPathwayDiagnostic ? (
                      <Button
                        component={RouterLink}
                        to={`/pathways/${selectedPathwayDiagnostic.pathwaySlug}/diagnostic?bootcamp=${encodeURIComponent(slug)}`}
                        variant="outlined"
                        sx={{ color: selectedPathwayDiagnostic.pathwayColor || 'primary.main', borderColor: selectedPathwayDiagnostic.pathwayColor || 'primary.main' }}
                      >
                        Take the diagnostic
                      </Button>
                    ) : null
                  }
                >
                  {selected ? (
                    <>
                      <Button
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => setSelectedPathwayKey(null)}
                        sx={{ mb: 2, px: 1, mt: -1 }}
                      >
                        Back to pathways
                      </Button>
                      {selected.courses.length > 0 ? (
                        <CoursePricingRoadmap courses={selected.courses} accent={selected.pathwayColor || undefined} />
                      ) : (
                        <Typography color="text.secondary">
                          This pathway&apos;s course prices aren&apos;t broken out individually — see the price above.
                        </Typography>
                      )}
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                        {allSections.map((section) => (
                          <BootcampPathwayCard
                            key={section.key}
                            pathway={section}
                            onSelect={() => setSelectedPathwayKey(section.key)}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </DetailSection>
              );
            })()}

            {/* Curriculum & Competencies — shown once for the whole bootcamp (every hub run
                shares the same curriculum), not per run. `curriculum` is null when the bootcamp
                has no linked curriculum. Leads with the curriculum's own NAME as the heading, with
                a small "Curriculum" overline above it (same pattern as the pathway-pricing
                section's own overline) so it reads as what KIND of thing this is, not just a
                second section title. Competencies are compact cards with their description
                always visible (clamped, not hidden behind hover) so the info shows on touch
                devices too. */}
            {curriculum && (
              <DetailSection eyebrow="Curriculum" title={curriculum.name} icon={<MenuBookIcon />}>
                {curriculum.description && (
                  <ExpandableText color="text.secondary" lines={3} sx={{ lineHeight: 1.7, mb: 3, maxWidth: 680, whiteSpace: 'pre-line' }}>
                    {curriculum.description}
                  </ExpandableText>
                )}

                {curriculum.competencies.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    }}
                  >
                    {curriculum.competencies.map((c) => (
                      <Box
                        key={c.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
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
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          }}
                        >
                          <WorkspacePremiumIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>
                            {c.name}
                          </Typography>
                          {c.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.78rem',
                                lineHeight: 1.5,
                                mt: 0.25,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {c.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </DetailSection>
            )}
          </Box>
        </Box>
      </Section>

      <RelatedBootcamps currentSlug={slug} />

      <CTABanner
        heading="Booking for a school or club?"
        body="Tell us how many learners you have and which bootcamp you're interested in — we'll put together a group quote and dates that work."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20bootcamp%20enquiry' }}
        secondary={{ label: 'Browse all bootcamps', to: '/bootcamps' }}
      />
    </>
  );
}
