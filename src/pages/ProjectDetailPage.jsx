import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import CatalogItemDetail from '../components/catalog/CatalogItemDetail.jsx';
import { getProject, PRICING_IS_PLACEHOLDER } from '../content/projects.js';

/**
 * Project detail (`/projects/:slug`) — static content (src/content/projects.js).
 * The page body is the shared CatalogItemDetail so it never drifts from the
 * Store's item pages.
 */
export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const item = getProject(slug);

  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Project not found" noindex />
        <ErrorBlock error={{ message: 'This project doesn’t exist or has been removed.' }} />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/projects" variant="outlined">
            View all projects
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <SeoHead title={`${item.name} — Digifunzi Project`} description={item.summary} type="product" />
      <JsonLd
        data={[
          organizationSchema(),
          productSchema(item, pathname, { pricingIsPlaceholder: PRICING_IS_PLACEHOLDER }),
          ...(item.faqs?.length ? [faqSchema(item.faqs)] : []),
        ]}
      />

      <CatalogItemDetail
        item={item}
        nav={{
          sectionLabel: 'Projects',
          sectionTo: '/projects',
          ctaSecondary: { label: 'Browse all projects', to: '/projects' },
        }}
      />
    </>
  );
}
