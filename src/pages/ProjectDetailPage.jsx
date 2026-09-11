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
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePublicProject } from '../hooks/usePublicProjects.js';
import { formatPrice, ageLabel } from '../utils/format.js';

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

// One numbered step in the project's build journey (a milestone).
function BuildStep({ index, total, step }) {
  const isLast = index === total - 1;
  return (
    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: '#fff',
            bgcolor: 'primary.main',
            zIndex: 1,
          }}
        >
          {index + 1}
        </Box>
        {!isLast && (
          <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', minHeight: 20, mt: 0.5 }} />
        )}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 3.5, minWidth: 0 }}>
        <Typography variant="h5" component="h3">
          {step.name}
        </Typography>
        {step.description && (
          <Typography sx={{ color: 'text.secondary', mt: 0.5, whiteSpace: 'pre-line' }}>
            {step.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error, refetch } = usePublicProject(slug);

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
        <SeoHead title="Project not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This project doesn’t exist or isn’t for sale right now.' : error?.message }}
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

  const {
    name, tagline, description, overview, level, ageMin, ageMax, coverImage, price,
    deliverables = [], milestones = [], requirements = [],
  } = data;

  const age = ageLabel(ageMin, ageMax);
  const priceLabel = price ? formatPrice(price) : 'Enquire for pricing';
  const enquireTo = `/enroll?interestedIn=project&referenceId=${encodeURIComponent(slug)}`;

  return (
    <>
      <SeoHead
        title={`${name} — Digifunzi Project`}
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
              kind: 'project',
            },
            `/projects/${slug}`,
            { pricingIsPlaceholder: true },
          ),
        ]}
      />

      {/* header band */}
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
            <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
              Projects
            </Link>
            <Typography color="text.primary">{name}</Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 3, md: 5 },
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {level && (
                  <Chip
                    label={LEVEL_LABEL[level]}
                    sx={{ bgcolor: (t) => alpha(t.palette.primary.dark, 0.102), color: 'text.primary', fontWeight: 600 }}
                  />
                )}
                {age && (
                  <Chip variant="outlined" label={age} sx={{ fontWeight: 600 }} />
                )}
                {milestones.length > 0 && (
                  <Chip
                    variant="outlined"
                    label={`${milestones.length} ${milestones.length === 1 ? 'step' : 'steps'}`}
                    sx={{ fontWeight: 600 }}
                  />
                )}
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

              {/* price + enquire */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  maxWidth: 420,
                }}
              >
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: 'primary.dark' }}>
                  {priceLabel}
                </Typography>
                {price?.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {price.note}
                  </Typography>
                )}
                <Button
                  component={RouterLink}
                  to={enquireTo}
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Enquire to buy
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  No online checkout yet — we&apos;ll confirm the price, arrange payment and unlock it
                  for your learner.
                </Typography>
              </Box>
            </Box>

            {coverImage && (
              <Box sx={{ width: { xs: '100%', md: 380 }, flexShrink: 0 }}>
                <SmartImage src={coverImage} alt={name} ratio="4 / 3" />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Section>
        {(description || overview) && (
          <Box sx={{ maxWidth: 760, mb: 6 }}>
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              About this project
            </Typography>
            {description && (
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                {description}
              </Typography>
            )}
            {overview && (
              <Typography
                sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7, mt: 2 }}
              >
                {overview}
              </Typography>
            )}
          </Box>
        )}

        {milestones.length > 0 && (
          <Box sx={{ maxWidth: 820, mb: 6 }}>
            <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
              The build, step by step
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 640 }}>
              Worked through in order — each step builds on the last, and ends with something
              working.
            </Typography>
            {milestones.map((m, i) => (
              <BuildStep key={`${m.name}-${i}`} index={i} total={milestones.length} step={m} />
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', md: deliverables.length && requirements.length ? '1fr 1fr' : '1fr' },
            maxWidth: 900,
          }}
        >
          {deliverables.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BuildCircleIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h4" component="h2">
                  What you&apos;ll build
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
                {deliverables.map((d, i) => (
                  <Box component="li" key={`${d.name}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{d.name}</Typography>
                      {d.description && (
                        <Typography variant="body2" color="text.secondary">
                          {d.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {requirements.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Inventory2Icon sx={{ color: 'primary.main' }} />
                <Typography variant="h4" component="h2">
                  What you&apos;ll need
                </Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
                {requirements.map((r, i) => (
                  <Box component="li" key={`${r}-${i}`} sx={{ display: 'flex', gap: 1.25 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0, mt: 0.25 }} />
                    <Typography>{r}</Typography>
                  </Box>
                ))}
              </Box>
              <Button
                component={RouterLink}
                to="/store"
                variant="text"
                size="small"
                sx={{ mt: 1.5 }}
              >
                Browse robots & kits →
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 6, maxWidth: 900 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h4" component="p" gutterBottom>
                Get {name} for your learner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {priceLabel}
                {price?.note ? ` · ${price.note}` : ''}
              </Typography>
            </Box>
            <Button component={RouterLink} to={enquireTo} variant="contained" size="large">
              Enquire to buy
            </Button>
          </Box>
        </Box>
      </Section>

      <CTABanner
        heading="Buying projects for a class?"
        body="Tell us how many learners you have — we'll put together a classroom licence quote."
        primary={{ label: 'Request a quote', to: '/contact?subject=Classroom%20project%20licence' }}
        secondary={{ label: 'Browse all projects', to: '/projects' }}
      />
    </>
  );
}
