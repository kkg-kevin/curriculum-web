import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import JsonLd, { organizationSchema, pathwayCourseSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePathway } from '../hooks/usePathways.js';
import { useDiagnosticAvailability } from '../hooks/useDiagnostic.js';
import PathwayCourseStep from '../components/pathway/PathwayCourseStep.jsx';
import StageCard from '../components/pathway/StageCard.jsx';
import DetailLayout from '../components/common/DetailLayout.jsx';
import { RelatedPathways } from '../components/common/Related.jsx';
import { actionRowSx } from '../components/common/ActionRow.jsx';

const FALLBACK_ACCENT = '#25476a';

export default function PathwayDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
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

  const { name, description, color, courses = [] } = data;
  const accent = color || FALLBACK_ACCENT;
  // The pathway's developmental stages (age groups), youngest first — each a card leading to its
  // own page of courses. A pathway with no named stages (or an older backend sending only the
  // flat `courses` list) shows its courses here instead.
  const stages = (data.stages || []).filter((st) => st.slug);
  const byStage = stages.length > 0 && stages.some((st) => st.name);
  const enrollTo = `/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}`;

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

      {/* header band with the pathway's colour accent */}
      <DetailHero accent={accent} crumbs={[{ label: 'Home', to: '/' }, { label: 'Pathways', to: '/pathways' }, { label: name }]}>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {byStage && (
              <Chip label={`${stages.length} stages`} sx={{ bgcolor: `${accent}1A`, color: 'text.primary', fontWeight: 600 }} />
            )}
            <Chip
              label={`${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
              sx={{ bgcolor: `${accent}1A`, color: 'text.primary', fontWeight: 600 }}
            />
          </Box>

          <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
            {name}
          </Typography>
          <Typography
            variant="h4"
            component="p"
            sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 760, whiteSpace: 'pre-line' }}
          >
            {description}
          </Typography>

          <Box sx={{ ...actionRowSx, mt: 3 }}>
            <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
              Enroll in this pathway
            </Button>
            {diagnostic?.available && (
              <Button
                component={RouterLink}
                to={`/pathways/${slug}/diagnostic`}
                variant="outlined"
                size="large"
              >
                Take the diagnostic
              </Button>
            )}
          </Box>
      </DetailHero>

      <Section>
        <DetailLayout
          aside={
            <Box
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to start {name}?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {diagnostic?.available
                  ? 'Register interest and our team will get the learner set up — or take the short diagnostic first for an instant learner-profile report showing where to start.'
                  : 'Register interest now and our team will get the learner set up at the right step for their age and experience.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
                  Enroll in this pathway
                </Button>
                {diagnostic?.available && (
                  <Button
                    component={RouterLink}
                    to={`/pathways/${slug}/diagnostic`}
                    variant="outlined"
                    size="large"
                  >
                    Take the diagnostic
                  </Button>
                )}
              </Box>
            </Box>
          }
        >
          {byStage ? (
            <>
              <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
                Developmental stages
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 720 }}>
                {name} runs through {stages.length} stages, each for its own age group with its own courses. Pick a
                stage to see its courses.
                {diagnostic?.available
                  ? ' Not sure which one? The short diagnostic places a learner at the right stage and course.'
                  : ' Our team places each learner at the right stage for their age and experience.'}
              </Typography>
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' } }}>
                {stages.map((stage, i) => (
                  <StageCard key={stage.slug} pathwaySlug={slug} stage={stage} index={i} accent={accent} />
                ))}
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
                The pathway
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 5, maxWidth: 720 }}>
                Courses are worked through in order — each one builds on the last.
                {diagnostic?.available
                  ? ' A learner can start at the beginning or, after a short diagnostic, join further along.'
                  : ' A learner starts at the beginning, or our team places them further along based on their age and experience.'}
              </Typography>
              {courses.map((course, i) => (
                <PathwayCourseStep key={`${course.name}-${i}`} index={i} total={courses.length} course={course} accent={accent} />
              ))}
            </>
          )}
        </DetailLayout>
      </Section>

      <RelatedPathways currentSlug={slug} />
    </>
  );
}
