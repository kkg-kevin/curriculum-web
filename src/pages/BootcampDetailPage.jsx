import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EventIcon from '@mui/icons-material/Event';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { FORMAT_LABEL } from '../components/cards/BootcampCard.jsx';
import BootcampPathwayCard from '../components/cards/BootcampPathwayCard.jsx';
import HubPreviewCard from '../components/hubs/HubPreviewCard.jsx';
import CoursePricingRoadmap from '../components/pathway/CoursePricingRoadmap.jsx';
import { usePublicBootcamp } from '../hooks/usePublicBootcamps.js';
import { formatPrice, ageLabel } from '../utils/format.js';
import { formatDateRange } from '../utils/dates.js';

const RUN_STATUS_LABEL = { upcoming: 'Upcoming', active: 'Running now' };

// A lighter section heading than the site's default display-scale h2 (clamp up to 2.7rem/750
// weight — right for marketing sections, too loud for a detail page's own internal section
// rhythm). Same "small overline + smaller heading" pattern the Curriculum section already used,
// applied consistently to every section on this page for a calmer scan.
function SectionHeading({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {icon}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
    </Box>
  );
}

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
    highlights = [], upcomingRuns = [], coursePricing = [], priceNotes = [], curriculum, pathwayDiagnostics = [],
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

      {/* header band — identity only (name/tagline/chips/photo). Price, what's included, and the
          booking CTA all live once in the sticky sidebar below, instead of being duplicated in
          both the header and a "Book" card at the very bottom of the page. */}
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
            <Typography color="text.primary">{name}</Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 3, md: 5 },
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
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
            </Box>

            {coverImage && (
              <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
                <SmartImage src={coverImage} alt={name} ratio="4 / 3" />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Section>
        <Box sx={{ display: 'flex', gap: { xs: 0, md: 6 }, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* main column */}
          <Box sx={{ flex: '1 1 480px', minWidth: 0, maxWidth: 760 }}>
            {description && (
              <Box sx={{ mb: 7 }}>
                <SectionHeading>About this bootcamp</SectionHeading>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    whiteSpace: 'pre-line',
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
              </Box>
            )}

            {highlights.length > 0 && (
              <Box sx={{ mb: 7 }}>
                <SectionHeading icon={<CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main' }} />}>
                  What you&apos;ll build
                </SectionHeading>
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

            {/* Running at — every hub this bootcamp currently runs at, resolved server-side into
                a richer projection (photo/address/contact) than the old "Upcoming runs" list
                carried — see public-bootcamp.service.js's projectHub(). */}
            {upcomingRuns.length > 0 && (
              <Box sx={{ mb: 7 }}>
                <SectionHeading icon={<EventIcon sx={{ fontSize: 20, color: 'primary.main' }} />}>
                  Running at
                </SectionHeading>

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
              </Box>
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
                <Box sx={{ mb: 7 }}>
                  {selected ? (
                    <>
                      <Button
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => setSelectedPathwayKey(null)}
                        sx={{ mb: 2, px: 1 }}
                      >
                        Back to pathways
                      </Button>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                          {selected.pathwayName || 'Other courses'}
                        </Typography>
                        {selectedPathwayDiagnostic && (
                          <Button
                            component={RouterLink}
                            to={`/pathways/${selectedPathwayDiagnostic.pathwaySlug}/diagnostic?bootcamp=${encodeURIComponent(slug)}`}
                            variant="outlined"
                            sx={{ color: selectedPathwayDiagnostic.pathwayColor || 'primary.main', borderColor: selectedPathwayDiagnostic.pathwayColor || 'primary.main' }}
                          >
                            Take the diagnostic
                          </Button>
                        )}
                      </Box>
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
                      <SectionHeading>Pathways in this bootcamp</SectionHeading>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, mt: -1 }}>
                        {coursePricing.length > 0
                          ? 'Individual course prices, and diagnostics where available, by pathway.'
                          : "Take a diagnostic for the pathway you're interested in."}
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
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
                </Box>
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
              <Box>
                <Typography
                  variant="overline"
                  sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em', mb: 0.5 }}
                >
                  Curriculum
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <MenuBookIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                    {curriculum.name}
                  </Typography>
                </Box>
                {curriculum.description && (
                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      mb: 3,
                      maxWidth: 680,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {curriculum.description}
                  </Typography>
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
              </Box>
            )}
          </Box>

          {/* sticky booking sidebar — price, what's included, and the ONE "Enquire to book" CTA
              on the page, always in view instead of requiring a scroll back up or down to find
              it (previously duplicated in the header AND a "Book" card at the very bottom). */}
          <Box sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: { xs: '100%', md: 340 }, position: { md: 'sticky' }, top: { md: 24 } }}>
            {selectedHubRun && (
              <HubPreviewCard
                hubId={selectedHubRun.hub.id}
                run={selectedHubRun}
                onClose={() => setSelectedHubRun(null)}
              />
            )}
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.15 }}>
                {priceLabel}
              </Typography>

              {priceNotes.length > 0 && (
                <Box component="ul" sx={{ m: 0, mt: 2, p: 0, listStyle: 'none', display: 'grid', gap: 0.75 }}>
                  {priceNotes.map((note, i) => (
                    <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                      <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main', flexShrink: 0, mt: '3px' }} />
                      <Typography variant="body2" color="text.secondary">
                        {note}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Button
                component={RouterLink}
                to={enquireTo}
                variant="contained"
                size="large"
                fullWidth
                disableElevation
                sx={{ mt: 2.5 }}
              >
                Enquire to book
              </Button>

              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
                No online checkout yet — we&apos;ll confirm dates and how to secure a place.
              </Typography>
            </Box>
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
