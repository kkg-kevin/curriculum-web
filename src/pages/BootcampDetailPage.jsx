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
import JsonLd, { eventSchema, organizationSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import { LoadingBlock, ErrorBlock } from '../components/common/StateViews.jsx';
import EnrollForm from '../components/forms/EnrollForm.jsx';
import { useBootcamp } from '../hooks/useBootcamps.js';
import { formatDateRange } from '../utils/dates.js';

const STATUS_COLOR = { upcoming: 'primary', active: 'success', completed: 'default' };

export default function BootcampDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const { data, isLoading, isError, error, refetch } = useBootcamp(slug);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <LoadingBlock label="Loading bootcamp…" />
      </Container>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Bootcamp not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This bootcamp doesn’t exist or has been removed.' : error?.message }}
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

  const { name, description, coverImage, status, startDate, endDate, educationLevel, gradeFrom, gradeTo, classes = [], courses = [] } = data;

  return (
    <>
      <SeoHead
        title={name}
        description={description?.slice(0, 155)}
        type="article"
        image={coverImage || undefined}
      />
      <JsonLd data={[organizationSchema(), eventSchema(data, pathname)]} />

      <Box sx={{ backgroundColor: 'surface.subtle', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 4, md: 6 } }}>
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

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={status} color={STATUS_COLOR[status] || 'default'} />
            {educationLevel && <Chip variant="outlined" label={educationLevel} />}
            {(gradeFrom || gradeTo) && (
              <Chip variant="outlined" label={[gradeFrom, gradeTo].filter(Boolean).join(' – ')} />
            )}
          </Box>

          <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
            {name}
          </Typography>
          {(startDate || endDate) && (
            <Typography variant="h4" component="p" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {formatDateRange(startDate, endDate)}
            </Typography>
          )}
        </Container>
      </Box>

      <Section>
        <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' } }}>
          <Box>
            <SmartImage src={coverImage} alt={`${name} bootcamp`} eager sx={{ mb: 3 }} />
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              About this bootcamp
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-line', color: 'text.secondary', mb: 4 }}>{description}</Typography>

            {courses.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  Courses covered
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {courses.map((c) => (
                    <Chip
                      key={c.slug || c.name}
                      label={c.name}
                      component={c.slug ? RouterLink : 'div'}
                      to={c.slug ? `/projects/${c.slug}` : undefined}
                      clickable={Boolean(c.slug)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}

            {classes.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  Groups
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: 'text.secondary' }}>
                  {classes.map((c) => (
                    <li key={c}>{c}</li>
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
                {status === 'completed' ? 'Register interest for the next run' : 'Enroll in this bootcamp'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Send us your details and our team will confirm a place and next steps.
              </Typography>
              <EnrollForm defaultInterest="bootcamp" referenceId={data.id} referenceLabel={name} />
            </Box>
          </Box>
        </Box>
      </Section>
    </>
  );
}
