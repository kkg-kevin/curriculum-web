import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, pathwayCourseSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePathway } from '../hooks/usePathways.js';
import { ageLabel } from '../utils/format.js';
import StartingPointFinder from '../components/pathways/StartingPointFinder.jsx';

const FALLBACK_ACCENT = '#25476a';

function PathwayStep({ index, total, course, accent }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const age = ageLabel(course.ageMin, course.ageMax);

  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative' }}>
      {/* rail: number bubble + connecting line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: '#fff',
            bgcolor: accent,
            zIndex: 1,
          }}
        >
          {index + 1}
        </Box>
        {!isLast && (
          <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 24, mt: 0.5 }} />
        )}
      </Box>

      {/* step body */}
      <Box sx={{ pb: isLast ? 0 : 4, minWidth: 0 }}>
        {isFirst && (
          <Typography
            variant="overline"
            sx={{ color: accent, fontWeight: 700, letterSpacing: '0.08em' }}
          >
            Start here
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {course.coverImage && (
            <Box sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}>
              <SmartImage src={course.coverImage} alt={`${course.name}`} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h4" component="h3" gutterBottom>
              {course.name}
            </Typography>
            {age && <Chip size="small" variant="outlined" label={age} sx={{ mb: 1 }} />}
            {course.description && (
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
                {course.description}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function PathwayDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const { data, isLoading, isError, error, refetch } = usePathway(slug);

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
  const enrollTo = `/enroll?interestedIn=project&referenceId=${encodeURIComponent(slug)}`;

  return (
    <>
      <SeoHead title={`${name} Pathway`} description={description?.slice(0, 155)} type="article" />
      <JsonLd data={[organizationSchema(), pathwayCourseSchema(data, pathname)]} />

      {/* header band with the pathway's colour accent */}
      <Box
        sx={{
          backgroundColor: 'surface.subtle',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderTop: '4px solid',
          borderTopColor: accent,
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/pathways" underline="hover" color="inherit">
              Pathways
            </Link>
            <Typography color="text.primary">{name}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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

          <Button
            component={RouterLink}
            to={enrollTo}
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
          >
            Enroll in this pathway
          </Button>
        </Container>
      </Box>

      <Section>
        <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
          The pathway
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 5, maxWidth: 720 }}>
          Courses are worked through in order — each one builds on the last. A learner can start at
          the beginning or, after a short diagnostic, join further along.
        </Typography>

        <Box sx={{ maxWidth: 820 }}>
          {courses.map((course, i) => (
            <PathwayStep
              key={`${course.name}-${i}`}
              index={i}
              total={courses.length}
              course={course}
              accent={accent}
            />
          ))}
        </Box>

        <Box sx={{ mt: 6, maxWidth: 820 }}>
          <StartingPointFinder
            pathwaySlug={slug}
            pathwayName={name}
            courses={courses}
            accent={accent}
          />
        </Box>

        <Box
          sx={{
            mt: 4,
            maxWidth: 820,
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
            Not sure yet? Use the starting-point tool above, or register interest now and our team
            will get the learner set up at the right step for their age and experience.
          </Typography>
          <Button component={RouterLink} to={enrollTo} variant="contained" size="large">
            Enroll in this pathway
          </Button>
        </Box>
      </Section>
    </>
  );
}
