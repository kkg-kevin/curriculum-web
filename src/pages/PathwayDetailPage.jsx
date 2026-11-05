import { useEffect, useRef, useState } from 'react';
import { useParams, Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SeoHead from '../components/seo/SeoHead.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import JsonLd, { organizationSchema, pathwayCourseSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import ExpandableText from '../components/common/ExpandableText.jsx';
import FactPills from '../components/common/FactPills.jsx';
import FramedImage from '../components/media/FramedImage.jsx';
import { usePathway } from '../hooks/usePathways.js';
import { useDiagnosticAvailability } from '../hooks/useDiagnostic.js';
import PathwayCourseStep from '../components/pathway/PathwayCourseStep.jsx';
import StageExplorer from '../components/pathway/StageExplorer.jsx';
import PathwayEnrolBar from '../components/pathway/PathwayEnrolBar.jsx';
import PathwayPlans from '../components/pathway/PathwayPlans.jsx';
import { RelatedPathways } from '../components/common/Related.jsx';
import { actionRowSx } from '../components/common/ActionRow.jsx';
import { subscriptionShort, isSoldOnline } from '../utils/pathwayPrice.js';
import { parseAge, pathwayAgeLabel, stageForAge } from '../utils/pathwayAges.js';

const FALLBACK_ACCENT = '#25476a';

/**
 * A pathway's page (`/pathways/:slug`): the picture, name, ages, stages and price up top with one
 * Enrol button; its stages explored in place (StageExplorer — the stages down the left, the chosen
 * one's courses on the right, with Enrol for that stage; an accordion on a phone; `?stage=`, or the
 * stage for `?age=` from the list page — stages have no pages of their own); plans. The
 * price and Enrol stay in reach — a bar along the bottom (on a large screen once the hero's Enrol
 * button has scrolled away). Data: GET /api/public/pathways/:slug.
 */
export default function PathwayDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = usePathway(slug);
  // The hero's Enrol button: once it scrolls out of view, the enrol bar takes over (PathwayEnrolBar).
  const heroCta = useRef(null);
  // The stage chosen just now — shown at once, while the address (?stage=) catches up (a router
  // navigation is deferred); cleared once the address says the same, or changes (back button).
  const [picked, setPicked] = useState(null);
  const urlStage = params.get('stage');
  useEffect(() => { setPicked(null); }, [urlStage]);
  // The detail response now embeds `diagnostic: { available, minAge, maxAge }` (resolved
  // rename-safely via the backend FK). Only fall back to the standalone availability call
  // once the detail has loaded and turns out NOT to carry it (an older backend).
  const { data: diagnosticAvailability } = useDiagnosticAvailability(slug, {
    enabled: Boolean(data) && !data.diagnostic,
  });
  const diagnostic =
    data?.diagnostic ??
    (diagnosticAvailability
      ? {
          available: diagnosticAvailability.diagnosticAvailable,
          minAge: diagnosticAvailability.minAge ?? null,
          maxAge: diagnosticAvailability.maxAge ?? null,
        }
      : null);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={220} height={28} />
        <Skeleton variant="text" width="60%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rounded" height={280} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Pathway not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This pathway doesn’t exist or has been removed.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/pathways" variant="outlined">
            View all pathways
          </Button>
        </Box>
      </Container>
    );
  }

  const { name, description, color, courses = [], image } = data;
  const accent = color || FALLBACK_ACCENT;
  // The pathway's developmental stages (age groups), youngest first. A pathway with no named
  // stages (or an older backend sending only the flat `courses` list) shows its courses instead.
  const stages = (data.stages || []).filter((st) => st.slug);
  const byStage = stages.length > 0 && stages.some((st) => st.name);
  const age = parseAge(params.get('age'));
  const stage = byStage
    ? stages.find((st) => st.slug === (picked || urlStage)) || stageForAge(stages, age) || stages[0]
    : null;
  const enrollTo = `/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}`;
  // Where it runs (chosen in the curriculum system); the family picks one when they enrol.
  const hubs = data.hubs || [];
  const places = [...new Set(hubs.map((h) => (h.town || '').split(',')[0].trim()).filter(Boolean))];
  // Sold online when it has subscription plans and hubs to choose from: Enrol then takes payment.
  const plans = data.plans || [];
  const subscription = data.subscription || null;
  const paidEnrol = isSoldOnline(data);
  // The headline price: the cheapest plan's "from".
  const headline = paidEnrol ? subscriptionShort(subscription) : null;
  const enrolLabel = paidEnrol ? 'Enrol & pay' : 'Enrol';
  const ages = pathwayAgeLabel(data);
  const enrolNote = diagnostic?.available
    ? 'Starts with a short quiz for their age, so they begin at the right course — you can skip it.'
    : paidEnrol
      ? 'They start at the right stage and course for their age.'
      : 'Send your details and our team gets them set up at the right step.';
  const choose = (st) => {
    setPicked(st.slug);
    setParams(
      (prev) => {
        prev.set('stage', st.slug);
        prev.delete('age');
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  return (
    <>
      <SeoHead title={`${name} Pathway`} description={description} type="article" />
      <JsonLd
        data={[
          organizationSchema(),
          pathwayCourseSchema(data, pathname),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Pathways', path: '/pathways' },
            { name, path: pathname },
          ]),
        ]}
      />

      <DetailHero accent={accent} crumbs={[{ label: 'Home', to: '/' }, { label: 'Pathways', to: '/pathways' }, { label: name }]}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, md: 5 },
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: image ? 'minmax(0, 1.25fr) minmax(0, 1fr)' : '1fr' },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" component="p" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>
              Learning pathway
            </Typography>
            <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
              {name}
            </Typography>
            {description && (
              <ExpandableText lines={4} sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, color: 'text.secondary', maxWidth: 720, whiteSpace: 'pre-line', mb: 2.5 }}>
                {description}
              </ExpandableText>
            )}
            <FactPills
              items={[
                { key: 'ages', Icon: CakeOutlinedIcon, label: ages },
                { key: 'stages', Icon: LayersOutlinedIcon, label: byStage ? `${stages.length} ${stages.length === 1 ? 'stage' : 'stages'}` : '' },
                { key: 'courses', Icon: MenuBookOutlinedIcon, label: `${courses.length} ${courses.length === 1 ? 'course' : 'courses'}` },
                { key: 'places', Icon: PlaceOutlinedIcon, label: places.join(' · ') },
              ]}
            />
            <Box ref={heroCta} sx={{ ...actionRowSx, mt: 3, alignItems: 'center' }}>
              <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
                {enrolLabel}
              </Button>
              {headline && (
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  {headline}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560 }}>
              {enrolNote}
            </Typography>
          </Box>
          {image && (
            <FramedImage src={image} alt={`${name} pathway`} ratio="16 / 10" rounded={3} eager sx={{ boxShadow: 'shadow.lg' }} />
          )}
        </Box>
      </DetailHero>

      <Section>
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: { xs: 6, md: 7 } }}>
            {byStage ? (
              <Box component="section" aria-labelledby="pathway-stages">
                <Typography id="pathway-stages" variant="h3" component="h2" sx={{ mb: 1 }}>
                  Stages by age
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 720 }}>
                  Each stage has its own courses for its age group. Choose a stage to see its courses, and enrol from there.
                </Typography>
                <StageExplorer stages={stages} activeSlug={stage.slug} onSelect={choose} accent={accent} label={`Stages of ${name}`} enrolTo={enrollTo} enrolLabel={enrolLabel} />
              </Box>
            ) : (
              <Box component="section" aria-labelledby="pathway-courses">
                <Typography id="pathway-courses" variant="h3" component="h2" sx={{ mb: 1 }}>
                  The courses
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
                  Worked through in order — each one builds on the last.
                </Typography>
                <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {courses.map((course, i) => (
                    <PathwayCourseStep key={`${course.name}-${i}`} index={i} total={courses.length} course={course} accent={accent} />
                  ))}
                </Box>
              </Box>
            )}

            {plans.length > 0 && hubs.length > 0 && (
              <Box component="section" aria-labelledby="pathway-plans">
                <Typography id="pathway-plans" variant="h3" component="h2" sx={{ mb: 1 }}>
                  Plans
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 720 }}>
                  Pay as you go — every stage’s courses, self-paced. It renews automatically; if a payment is missed the courses pause and pick up where they left off once it’s paid.
                </Typography>
                <PathwayPlans plans={plans} enrollTo={enrollTo} />
              </Box>
            )}

          </Box>
        </Box>
      </Section>

      <RelatedPathways currentSlug={slug} />

      <PathwayEnrolBar
        watchRef={heroCta}
        to={enrollTo}
        label={enrolLabel}
        price={headline}
        note={ages || name}
      />
    </>
  );
}
