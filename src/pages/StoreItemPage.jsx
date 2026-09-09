import { useParams, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import CatalogItemDetail, {
  BundledProjectsSection,
} from '../components/catalog/CatalogItemDetail.jsx';
import { getStoreItem, PRICING_IS_PLACEHOLDER } from '../content/store.js';
import { getProject } from '../content/projects.js';

/**
 * Store item detail (`/store/:slug`) — static content (src/content/store.js).
 * The page body is the shared CatalogItemDetail so it never drifts from the
 * Projects section's detail pages. A bundle also lists the projects it includes,
 * linked through to `/projects/:slug`.
 */
export default function StoreItemPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const item = getStoreItem(slug);

  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SeoHead title="Item not found" noindex />
        <ErrorBlock error={{ message: 'This item doesn’t exist or has been removed.' }} />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/store" variant="outlined">
            Back to the store
          </Button>
        </Box>
      </Container>
    );
  }

  const bundled = (item.bundledProjects || []).map(getProject).filter(Boolean);

  return (
    <>
      <SeoHead title={`${item.name} — Digifunzi Store`} description={item.summary} type="product" />
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
          sectionLabel: 'Store',
          sectionTo: '/store',
          ctaSecondary: { label: 'Browse the store', to: '/store' },
        }}
        extra={bundled.length ? <BundledProjectsSection projects={bundled} /> : null}
      />
    </>
  );
}
