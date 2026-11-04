import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import { isSoldOnline, subscriptionShort } from '../utils/pathwayPrice.js';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SeoHead from '../components/seo/SeoHead.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import DetailLayout, { AsideCard } from '../components/common/DetailLayout.jsx';
import ExpandableText from '../components/common/ExpandableText.jsx';
import FactPills from '../components/common/FactPills.jsx';
import StageLadder from '../components/pathway/StageLadder.jsx';
import HowEnrollingWorks from '../components/pathway/HowEnrollingWorks.jsx';
import PathwayEnrolBar from '../components/pathway/PathwayEnrolBar.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import PathwayCourseStep from '../components/pathway/PathwayCourseStep.jsx';
import { usePathway } from '../hooks/usePathways.js';
import { stageAgeLabel } from '../utils/pathwayAges.js';
import { actionRowSx } from '../components/common/ActionRow.jsx';

const FALLBACK_ACCENT = '#25476a';

/** A neighbouring stage — "← Stage 1 · Junior Coders Academy" / "Stage 3 · … →". */
function StageLink({ pathwaySlug, stage, number, direction }) {
  const back = direction === 'previous';
  return (
    <Button
      component={RouterLink}
      to={`/pathways/${pathwaySlug}/${stage.slug}`}
      variant="outlined"
      startIcon={back ? <ArrowBackRoundedIcon /> : null}
      endIcon={back ? null : <ArrowForwardRoundedIcon />}
      sx={{ justifyContent: back ? 'flex-start' : 'flex-end', textAlign: back ? 'left' : 'right', flex: '1 1 240px', py: 1.25 }}
    >
      <Box component="span" sx={{ display: 'block', minWidth: 0 }}>
        <Box component="span" sx={{ display: 'block', fontSize: 12, fontWeight: 600, opacity: 0.75 }}>
          {back ? 'Previous stage' : 'Next stage'} · Stage {number}
        </Box>
        <Box component="span" sx={{ display: 'block', fontWeight: 800 }}>{stage.name || 'More courses'}</Box>
      </Box>
    </Button>
  );
}

/**
 * One developmental stage of a pathway (`/pathways/:slug/:stageSlug`), reached from the stage
 * ladder on the pathway's page: what the stage is, its ages, its courses in order, and how to
 * start — enrolling in this stage begins with its short diagnostic when it offers one. The ladder
 * links to the other stages; the price and Enrol stay in view (side panel / bottom bar on a phone).
 * Data: GET /api/public/pathways/:slug (its `stages[]`).
 */
export default function PathwayStagePage() {
  const { slug, stageSlug } = useParams();
  const { pathname } = useLocation();
  const { data, isLoading, isError, error, refetch } = usePathway(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="text" width={260} height={28} />
        <Skeleton variant="text" width="55%" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="rounded" height={280} sx={{ mt: 4, borderRadius: 2 }} />
      </Container>
    );
  }

  const stages = data?.stages || [];
  const index = stages.findIndex((st) => st.slug === stageSlug);
  const stage = index >= 0 ? stages[index] : null;

  if (isError || !stage) {
    const notFound = !stage || error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Stage not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This stage doesn’t exist or has been removed.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to={data ? `/pathways/${slug}` : '/pathways'} variant="outlined">
            {data ? `Back to ${data.name}` : 'View all pathways'}
          </Button>
        </Box>
      </Container>
    );
  }

  const { name: pathwayName } = data;
  const accent = data.color || FALLBACK_ACCENT;
  const stageName = stage.name || 'More courses';
  const ages = stageAgeLabel(stage.minAge, stage.maxAge);
  const courses = stage.courses || [];
  const diagnostic = stage.diagnostic?.available ? stage.diagnostic : null;
  // Enrolling from a stage: that stage's diagnostic and ages come first (PathwayEnrolJourney).
  const enrollTo = `/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}&stage=${encodeURIComponent(stage.slug)}`;
  // What it costs: the pathway's cheapest plan ("From KSh 3,000 / month") — every stage is included.
  const stagePrice = isSoldOnline(data) ? subscriptionShort(data.subscription) : null;
  const hubs = data.hubs || [];
  const places = [...new Set(hubs.map((h) => (h.town || '').split(',')[0].trim()).filter(Boolean))];
  const paidEnrol = isSoldOnline(data);
  const enrolLabel = paidEnrol ? 'Enrol & pay' : 'Enrol in this stage';
  const previous = index > 0 ? stages[index - 1] : null;
  const next = index < stages.length - 1 ? stages[index + 1] : null;
  const seoDescription = stage.description || `${stageName}${ages ? ` (${ages.toLowerCase()})` : ''}: ${courses.length} courses in the ${pathwayName} pathway.`;

  return (
    <>
      <SeoHead title={`${stageName} — ${pathwayName} Pathway`} description={seoDescription} type="article" />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Pathways', path: '/pathways' },
            { name: pathwayName, path: `/pathways/${slug}` },
            { name: stageName, path: pathname },
          ]),
        ]}
      />

      <DetailHero
        accent={accent}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Pathways', to: '/pathways' },
          { label: pathwayName, to: `/pathways/${slug}` },
          { label: stageName },
        ]}
      >
        <Typography variant="overline" component="p" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>
          {pathwayName} · Stage {index + 1} of {stages.length}
        </Typography>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          {stageName}
        </Typography>
        {stage.description && (
          <ExpandableText lines={4} sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, color: 'text.secondary', maxWidth: 760, whiteSpace: 'pre-line', mb: 2.5 }}>
            {stage.description}
          </ExpandableText>
        )}
        <FactPills
          items={[
            { key: 'ages', Icon: CakeOutlinedIcon, label: ages },
            { key: 'courses', Icon: MenuBookOutlinedIcon, label: `${courses.length} ${courses.length === 1 ? 'course' : 'courses'}` },
            { key: 'price', Icon: LocalOfferOutlinedIcon, label: stagePrice },
            { key: 'places', Icon: PlaceOutlinedIcon, label: places.join(' · ') },
          ]}
        />

        <Box sx={{ ...actionRowSx, mt: 3 }}>
          <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
            {enrolLabel}
          </Button>
        </Box>
      </DetailHero>

      <Section>
        <DetailLayout
          aside={
            <AsideCard>
              <Typography variant="h4" component="h2">
                Is this the right stage?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {diagnostic
                  ? `${stageName} is for ${ages ? ages.toLowerCase() : 'its age group'}. Enrolling starts with its short quiz, which checks the course they should start at — you can skip it.`
                  : `${stageName} is for ${ages ? ages.toLowerCase() : 'its age group'}. They start at the course that fits their age.`}
              </Typography>
              {stagePrice && <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{stagePrice}</Typography>}
              <Button component={RouterLink} to={enrollTo} variant="contained" size="large" fullWidth>
                {enrolLabel}
              </Button>
              <Button component={RouterLink} to={`/pathways/${slug}`} startIcon={<ArrowBackRoundedIcon />} sx={{ alignSelf: 'flex-start', px: 0 }}>
                All stages of {pathwayName}
              </Button>
            </AsideCard>
          }
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: { xs: 6, md: 7 } }}>
            {stages.length > 1 && (
              <StageLadder
                stages={stages}
                activeSlug={stage.slug}
                hrefFor={(st) => `/pathways/${slug}/${st.slug}`}
                label={`Stages of ${pathwayName}`}
              />
            )}

            <Box component="section" aria-labelledby="stage-courses">
              <Typography id="stage-courses" variant="h3" component="h2" sx={{ mb: 1 }}>
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

            <HowEnrollingWorks paid={paidEnrol} diagnostic={Boolean(diagnostic)} places={places} />

            {(previous || next) && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                {previous && <StageLink pathwaySlug={slug} stage={previous} number={index} direction="previous" />}
                {next && <StageLink pathwaySlug={slug} stage={next} number={index + 2} direction="next" />}
              </Box>
            )}
          </Box>
        </DetailLayout>
      </Section>

      <PathwayEnrolBar to={enrollTo} label={enrolLabel} price={stagePrice} note={[stageName, ages].filter(Boolean).join(' · ')} />
    </>
  );
}
