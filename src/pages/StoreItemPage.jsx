import { useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SeoHead from '../components/seo/SeoHead.jsx';
import { DetailHeading } from '../components/common/DetailSection.jsx';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TuneIcon from '@mui/icons-material/Tune';
import JsonLd, { organizationSchema, productSchema, breadcrumbSchema } from '../components/seo/JsonLd.jsx';
import { resolveMediaUrl } from '../utils/media.js';
import MediaGallery from '../components/media/MediaGallery.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import ProductLayout from '../components/store/ProductLayout.jsx';
import ProductBuyPanel from '../components/store/ProductBuyPanel.jsx';
import StickyBuyBar from '../components/store/StickyBuyBar.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import { usePublicStoreItem } from '../hooks/usePublicStore.js';
import { PROSE_MAX_WIDTH } from '../theme/layout.js';
import { RelatedInStore } from '../components/common/Related.jsx';
import { PRICING_IS_PLACEHOLDER } from '../content/catalog.js';

const CATEGORY_LABEL = { kit: 'Robots & kits', bundle: 'Bundle', accessory: 'Accessory' };
const STOCK_LABEL = { available: 'Available now', preorder: 'Pre-order', coming_soon: 'Coming soon' };

// The lead API's `interestedIn` enum accepts bootcamp | project | quarky | general. A kit maps
// to "quarky"; bundles/accessories to "general". The exact item still travels in referenceId,
// which the Enquiries card resolves to the item name server-side.
function interestFor(storeCategory) {
  return storeCategory === 'kit' ? 'quarky' : 'general';
}

/**
 * A good in the Store (`/store/:slug`): the photos and the one buy panel side by side (ProductLayout
 * — the panel stays in view on a large screen), the details under the photos, a buy bar along the
 * bottom once the panel's buttons have scrolled away, then more from the Store.
 */
export default function StoreItemPage() {
  const { slug } = useParams();
  const buyRef = useRef(null);
  const { data, isLoading, isError, error, refetch } = usePublicStoreItem(slug);

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
        <SeoHead title="Item not found" noindex />
        <ErrorBlock
          error={{ message: notFound ? 'This item doesn’t exist or isn’t for sale right now.' : error?.message }}
          onRetry={notFound ? undefined : refetch}
        />
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={RouterLink} to="/store" variant="outlined">
            Back to the store
          </Button>
        </Box>
      </Container>
    );
  }

  const {
    name, tagline, description, storeCategory, badge, stockStatus, image, price,
    highlights = [], includes = [], specs = [], gallery = [],
  } = data;

  const notAvailable = stockStatus && stockStatus !== 'available';
  const galleryImages = [image, ...gallery].filter(Boolean);
  const enquireTo = `/enroll?interestedIn=${interestFor(storeCategory)}&referenceId=${encodeURIComponent(slug)}`;
  const contactTo = `/contact?subject=${encodeURIComponent(`${name} — enquiry`)}`;
  const buyItem = { id: data.id, slug, name, image, price };

  return (
    <>
      <SeoHead
        title={name}
        description={tagline || description}
        image={resolveMediaUrl(image) || undefined}
        type="product"
      />
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Store', path: '/store' },
            { name, path: `/store/${slug}` },
          ]),
          productSchema(
            {
              name,
              description: description || tagline,
              image: resolveMediaUrl(image),
              price: price ? { amount: price.amount, currency: price.currency } : null,
              status: notAvailable ? stockStatus : 'available',
            },
            `/store/${slug}`,
            { pricingIsPlaceholder: PRICING_IS_PLACEHOLDER },
          ),
        ]}
      />

      <ProductLayout
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Store', to: '/store' }, { label: name }]}
        gallery={<MediaGallery images={galleryImages} alt={name} ratio="4 / 3" fallback={<SmartImage src={null} alt={name} ratio="4 / 3" />} />}
        panel={(
          <ProductBuyPanel
            chips={[
              storeCategory && { label: CATEGORY_LABEL[storeCategory] || storeCategory, tone: 'brand' },
              { label: STOCK_LABEL[stockStatus] || 'Available now', tone: notAvailable ? 'muted' : 'good' },
              badge && { label: badge, tone: 'muted' },
            ].filter(Boolean)}
            name={name}
            tagline={tagline}
            kind="store_item"
            item={buyItem}
            status={stockStatus || 'available'}
            enquireTo={enquireTo}
            contactTo={contactTo}
            buyRef={buyRef}
          />
        )}
      >
        {description && (
          <Box sx={{ mb: 6 }}>
            <DetailHeading title={`About this${storeCategory === 'bundle' ? ' bundle' : ''}`} icon={<InfoOutlinedIcon />} />
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.75 }}>
              {description}
            </Typography>
          </Box>
        )}

        {highlights.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <DetailHeading title="Highlights" icon={<AutoAwesomeIcon />} />
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {highlights.map((h, i) => (
                <Box key={`${h}-${i}`} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', mt: 0.25, flexShrink: 0 }} />
                  <Typography color="text.secondary">{h}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {includes.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <DetailHeading title="What's in the box" icon={<Inventory2Icon />} />
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {includes.map((inc, i) => (
                <Box
                  key={`${inc}-${i}`}
                  sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start', bgcolor: 'surface.card', border: '1px solid', borderColor: 'surface.ring', borderRadius: 3 }}
                >
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="body2">{inc}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {specs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <DetailHeading title="Specifications" icon={<TuneIcon />} />
            {/* a spec table: label / value rows, easy to scan */}
            <Box component="dl" sx={{ m: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'surface.ring' }}>
              {specs.map((sp, i) => (
                <Box
                  key={`${sp.label}-${i}`}
                  sx={{
                    display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' }, gap: { xs: 0.25, sm: 2 },
                    px: 2.5, py: 1.75, bgcolor: i % 2 ? 'transparent' : 'surface.card',
                    borderTop: i ? '1px solid' : 0, borderColor: 'divider',
                  }}
                >
                  <Typography component="dt" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.9rem' }}>{sp.label}</Typography>
                  <Typography component="dd" sx={{ m: 0 }}>{sp.value}</Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Details are indicative and subject to confirmation.
            </Typography>
          </Box>
        )}
      </ProductLayout>

      <StickyBuyBar
        watchRef={buyRef}
        kind="store_item"
        item={buyItem}
        buyable={Boolean(price) && stockStatus !== 'coming_soon'}
        status={stockStatus || 'available'}
        enquireTo={stockStatus === 'coming_soon' ? contactTo : enquireTo}
      />

      <RelatedInStore currentKey={`store_item:${slug}`} />

      <CTABanner
        heading="Buying for a school or club?"
        body="Tell us how many learners you have — we'll put together a quote with classroom pricing."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20store%20enquiry' }}
        secondary={{ label: 'Browse the store', to: '/store' }}
      />
    </>
  );
}
