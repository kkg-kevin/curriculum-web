import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import DetailHero from '../components/common/DetailHero.jsx';
import JsonLd, { organizationSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import DetailLayout from '../components/common/DetailLayout.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import PathwayCourseStep from '../components/pathway/PathwayCourseStep.jsx';
import { usePathway } from '../hooks/usePathways.js';
import { ageLabel } from '../utils/format.js';
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
 * One developmental stage of a pathway (`/pathways/:slug/:stageSlug`), reached from its card on the
 * pathway's page: what the stage is, its ages, its courses in order, and how to start — enrol, or
 * take the short diagnostic when this stage offers one. Links back to the pathway and on to the
 * stages either side. Data: GET /api/public/pathways/:slug (its `stages[]`).
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
  const ages = ageLabel(stage.minAge, stage.maxAge);
  const courses = stage.courses || [];
  const diagnostic = stage.diagnostic?.available ? stage.diagnostic : null;
  const enrollTo = `/enroll?flow=pathway&referenceId=${encodeURIComponent(slug)}`;
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
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={`Stage ${index + 1} of ${stages.length}`} sx={{ bgcolor: `${accent}1A`, color: 'text.primary', fontWeight: 700 }} />
          {ages && <Chip label={ages} sx={{ bgcolor: `${accent}1A`, color: 'text.primary', fontWeight: 600 }} />}
          <Chip
            label={`${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
            sx={{ bgcolor: `${accent}1A`, color: 'text.primary', fontWeight: 600 }}
          />
        </Box>

        <Typography variant="overline" component="p" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
          {pathwayName} pathway
        </Typography>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          {stageName}
        </Typography>
        {stage.description && (
          <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 760, whiteSpace: 'pre-line' }}>
            {stage.description}
          </Typography>
        )}

        <Box sx={{ ...actionRowSx, mt: 3 }}>
          <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
            Enroll in this pathway
          </Button>
          {diagnostic && (
            <Button component={RouterLink} to={`/pathways/${slug}/diagnostic`} variant="outlined" size="large">
              Take the diagnostic
            </Button>
          )}
        </Box>
      </DetailHero>

      <Section>
        <DetailLayout
          aside={
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Is this the right stage?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {diagnostic
                  ? `${stageName} is for ${ages ? ages.toLowerCase() : 'its age group'}. The short diagnostic checks where a learner should start — at this stage or another — and which course.`
                  : `${stageName} is for ${ages ? ages.toLowerCase() : 'its age group'}. Register interest and our team will place the learner at the right stage and course for their age and experience.`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
                  Enroll
                </Button>
                {diagnostic && (
                  <Button component={RouterLink} to={`/pathways/${slug}/diagnostic`} variant="outlined" size="large">
                    Take the diagnostic
                  </Button>
                )}
              </Box>
              <Button component={RouterLink} to={`/pathways/${slug}`} startIcon={<ArrowBackRoundedIcon />} sx={{ mt: 2, px: 0 }}>
                All stages of {pathwayName}
              </Button>
            </Box>
          }
        >
          <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
            The courses
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 5, maxWidth: 720 }}>
            Worked through in order — each one builds on the last.
          </Typography>

          {courses.map((course, i) => (
            <PathwayCourseStep key={`${course.name}-${i}`} index={i} total={courses.length} course={course} accent={accent} />
          ))}

          {(previous || next) && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
              {previous && <StageLink pathwaySlug={slug} stage={previous} number={index} direction="previous" />}
              {next && <StageLink pathwaySlug={slug} stage={next} number={index + 2} direction="next" />}
            </Box>
          )}
        </DetailLayout>
      </Section>
    </>
  );
}
