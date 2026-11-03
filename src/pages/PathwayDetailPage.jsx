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
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
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
import StageLadder from '../components/pathway/StageLadder.jsx';
import HowEnrollingWorks from '../components/pathway/HowEnrollingWorks.jsx';
import PathwayEnrolBar from '../components/pathway/PathwayEnrolBar.jsx';
import DetailLayout, { AsideCard } from '../components/common/DetailLayout.jsx';
import { RelatedPathways } from '../components/common/Related.jsx';
import { actionRowSx } from '../components/common/ActionRow.jsx';
import { priceLabel, priceShort } from '../utils/pathwayPrice.js';
import { formatKsh } from '../cart/format.js';
import { parseAge, pathwayAgeLabel, stageAgeLabel, stageForAge } from '../utils/pathwayAges.js';

const FALLBACK_ACCENT = '#25476a';

/** "Where it runs" — the hubs a family chooses from; sold online, each goes straight to enrolling there. */
function WhereItRuns({ hubs, enrollTo, paidEnrol, accent }) {
  return (
    <Box component="section" aria-labelledby="where-it-runs">
      <Typography id="where-it-runs" variant="h3" component="h2" sx={{ mb: 2.5 }}>
        Where it runs
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } }}>
        {hubs.map((hub) => (
          <Box
            key={hub.id}
            component={RouterLink}
            to={`${enrollTo}&hubId=${encodeURIComponent(hub.id)}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { borderColor: 'primary.main' },
              '&:hover .hub-arrow': { transform: 'translateX(3px)' },
            }}
          >
            <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'surface.subtle' }}>
              <PlaceOutlinedIcon sx={{ color: accent }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.3 }}>{hub.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {[hub.town, hub.deliveryMode !== 'in_person' && hub.town !== 'Online' ? hub.deliveryLabel : null].filter(Boolean).join(' · ') || hub.deliveryLabel}
              </Typography>
            </Box>
            <Typography component="span" variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
              {paidEnrol ? 'Enrol here' : 'Ask here'}
              <ArrowForwardRoundedIcon className="hub-arrow" sx={{ fontSize: 17, transition: 'transform 160ms ease' }} />
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * A pathway's page (`/pathways/:slug`): the picture, name, ages, stages and price up top with one
 * Enrol button; its stages as a ladder — choosing one shows that stage's courses right here
 * (`?stage=`, or the stage for `?age=` from the list page; each stage keeps its own page too);
 * how enrolling works; where it runs. The price and Enrol stay in view — the side panel on a large
 * screen, a bar along the bottom on a phone. Data: GET /api/public/pathways/:slug.
 */
export default function PathwayDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = usePathway(slug);
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
    ? stages.find((st) => st.slug === params.get('stage')) || stageForAge(stages, age) || stages[0]
    : null;
  const stageNumber = stage ? stages.indexOf(stage) + 1 : null;
  const enrollTo = `/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}`;
  // Where it runs (chosen in the curriculum system); the family picks one when they enrol.
  const hubs = data.hubs || [];
  const places = [...new Set(hubs.map((h) => (h.town || '').split(',')[0].trim()).filter(Boolean))];
  // Sold online when it has a price and hubs to choose from: Enrol then takes payment.
  const price = data.price || null;
  const paidEnrol = Boolean(price) && hubs.length > 0;
  const enrolLabel = paidEnrol ? 'Enrol & pay' : 'Enrol';
  const ages = pathwayAgeLabel(data);
  const stageStart = stage?.courses?.[0]?.price;
  const choose = (st) =>
    setParams(
      (prev) => {
        prev.set('stage', st.slug);
        prev.delete('age');
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );

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
            <Box sx={{ ...actionRowSx, mt: 3, alignItems: 'center' }}>
              <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
                {enrolLabel}
              </Button>
              {price && (
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  {priceLabel(price)}
                </Typography>
              )}
            </Box>
          </Box>
          {image && (
            <FramedImage src={image} alt={`${name} pathway`} ratio="16 / 10" rounded={3} eager sx={{ boxShadow: 'shadow.lg' }} />
          )}
        </Box>
      </DetailHero>

      <Section>
        <DetailLayout
          aside={
            <AsideCard>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                  {price ? 'Price' : 'Ready to start?'}
                </Typography>
                {price ? (
                  <>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', lineHeight: 1.2, mt: 0.5 }}>{priceShort(price)}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {price.mode === 'whole'
                        ? 'Per learner, for the whole pathway.'
                        : 'Per course — you pay for the course they start at, by age or quiz result.'}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h4" component="p" sx={{ mt: 0.5 }}>{name}</Typography>
                )}
              </Box>
              <Button component={RouterLink} to={enrollTo} variant="contained" size="large" fullWidth>
                {enrolLabel}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {diagnostic?.available
                  ? 'Starts with a short quiz for their age, so they begin at the right course — you can skip it.'
                  : paidEnrol
                    ? 'They start at the right stage and course for their age.'
                    : 'Send your details and our team gets them set up at the right step.'}
              </Typography>
              <Button component={RouterLink} to="/contact" variant="text" sx={{ alignSelf: 'flex-start', px: 0 }}>
                Questions? Talk to us
              </Button>
            </AsideCard>
          }
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: { xs: 6, md: 7 } }}>
            {byStage ? (
              <Box component="section" aria-labelledby="pathway-stages">
                <Typography id="pathway-stages" variant="h3" component="h2" sx={{ mb: 1 }}>
                  Stages by age
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 720 }}>
                  Each stage has its own courses for its age group. Choose one to see its courses.
                </Typography>
                <StageLadder stages={stages} activeSlug={stage.slug} onSelect={choose} label={`Stages of ${name}`} />

                <Box sx={{ mt: 3, p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2.5 }}>
                    <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
                      <Typography variant="overline" component="p" sx={{ color: 'text.secondary', fontWeight: 800, lineHeight: 1.6 }}>
                        Stage {stageNumber} · {stageAgeLabel(stage.minAge, stage.maxAge) || 'All ages'}
                        {price?.mode === 'by_course' && stageStart != null ? ` · Starts at ${formatKsh(stageStart, price.currency)}` : ''}
                      </Typography>
                      <Typography variant="h4" component="h3">{stage.name || 'More courses'}</Typography>
                      {stage.description && (
                        <ExpandableText lines={3} variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                          {stage.description}
                        </ExpandableText>
                      )}
                    </Box>
                    <Button
                      component={RouterLink}
                      to={`/pathways/${slug}/${stage.slug}`}
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{ flexShrink: 0 }}
                    >
                      Stage page
                    </Button>
                  </Box>
                  <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                    {(stage.courses || []).map((course, i) => (
                      <PathwayCourseStep key={`${stage.slug}-${course.name}-${i}`} index={i} total={stage.courses.length} course={course} accent={accent} />
                    ))}
                  </Box>
                </Box>
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

            <HowEnrollingWorks paid={paidEnrol} diagnostic={Boolean(diagnostic?.available)} places={places} />

            {hubs.length > 0 && <WhereItRuns hubs={hubs} enrollTo={enrollTo} paidEnrol={paidEnrol} accent={accent} />}
          </Box>
        </DetailLayout>
      </Section>

      <RelatedPathways currentSlug={slug} />

      <PathwayEnrolBar
        to={enrollTo}
        label={enrolLabel}
        price={price ? priceShort(price) + (price.mode === 'whole' ? ' / learner' : ' / course') : null}
        note={ages || name}
      />
    </>
  );
}
