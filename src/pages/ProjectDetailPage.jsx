import { useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { courseSchema, organizationSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import { LoadingBlock, ErrorBlock } from '../components/common/StateViews.jsx';
import EnrollForm from '../components/forms/EnrollForm.jsx';
import { useProject } from '../hooks/useProjects.js';
import { ageLabel } from '../utils/format.js';
import { resolveMediaUrl } from '../utils/media.js';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const { data, isLoading, isError, error, refetch } = useProject(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <LoadingBlock label="Loading project…" />
      </Container>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Project not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This project doesn’t exist or has been removed.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/projects" variant="outlined">
            View all projects
          </Button>
        </Box>
      </Container>
    );
  }

  const { name, description, coverImage, ageMin, ageMax, sessionCount, requirements = [], modules = [] } = data;

  return (
    <>
      <SeoHead
        title={name}
        description={description?.slice(0, 155)}
        type="article"
        image={resolveMediaUrl(coverImage) || undefined}
      />
      <JsonLd data={[organizationSchema(), courseSchema(data, pathname)]} />

      <Box sx={{ backgroundColor: 'surface.subtle', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
              Projects
            </Link>
            <Typography color="text.primary">{name}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {ageLabel(ageMin, ageMax) && <Chip variant="outlined" label={ageLabel(ageMin, ageMax)} />}
            {sessionCount > 0 && <Chip variant="outlined" label={`${sessionCount} sessions`} />}
          </Box>

          <Typography variant="h1" component="h1">
            {name}
          </Typography>
        </Container>
      </Box>

      <Section>
        <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' } }}>
          <Box>
            <SmartImage src={coverImage} alt={`${name} course`} eager sx={{ mb: 3 }} />

            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              About this course
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-line', color: 'text.secondary', mb: 4 }}>{description}</Typography>

            {modules.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  Syllabus outline
                </Typography>
                <Box component="ol" sx={{ pl: 3, color: 'text.secondary', '& li': { mb: 0.5 } }}>
                  {modules.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Full session content is available to enrolled learners in the Digifunzi portal.
                </Typography>
              </>
            )}

            {requirements.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  What you’ll need
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: 'text.secondary', '& li': { mb: 0.5 } }}>
                  {requirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </Box>
              </>
            )}
          </Box>

          <Box>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 88 },
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom>
                Enroll in this course
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Share your details and our team will get you set up for the next term.
              </Typography>
              <EnrollForm defaultInterest="project" referenceId={data.slug} referenceLabel={name} />
            </Box>
          </Box>
        </Box>
      </Section>
    </>
  );
}
