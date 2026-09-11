import { useParams, Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock } from '../components/common/StateViews.jsx';
import PriceTag from '../components/catalog/PriceTag.jsx';
import { usePublicStoreItem } from '../hooks/usePublicStore.js';

const CATEGORY_LABEL = { kit: 'Robots & kits', bundle: 'Bundle', accessory: 'Accessory' };
const STOCK_LABEL = { available: 'Available now', preorder: 'Pre-order', coming_soon: 'Coming soon' };

// The lead API's `interestedIn` enum accepts bootcamp | project | quarky | general. A kit maps
// to "quarky"; bundles/accessories to "general". The exact item still travels in referenceId,
// which the Enquiries card resolves to the item name server-side.
function interestFor(storeCategory) {
  return storeCategory === 'kit' ? 'quarky' : 'general';
}

export default function StoreItemPage() {
  const { slug } = useParams();
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

  return (
    <>
      <SeoHead
        title={`${name} — Digifunzi Store`}
        description={(tagline || description || '').slice(0, 155)}
        type="product"
      />
      <JsonLd
        data={[
          organizationSchema(),
          productSchema(
            {
              name,
              description: description || tagline,
              image,
              price: price ? { amount: price.amount, currency: price.currency } : null,
              status: notAvailable ? stockStatus : 'available',
            },
            `/store/${slug}`,
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
            <Link component={RouterLink} to="/store" underline="hover" color="inherit">
              Store
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
                {storeCategory && (
                  <Chip
                    label={CATEGORY_LABEL[storeCategory] || storeCategory}
                    sx={{ bgcolor: (t) => alpha(t.palette.primary.dark, 0.102), color: 'text.primary', fontWeight: 600 }}
                  />
                )}
                <Chip
                  variant={notAvailable ? 'outlined' : 'filled'}
                  color={notAvailable ? 'default' : 'success'}
                  label={STOCK_LABEL[stockStatus] || 'Available now'}
                  sx={{ fontWeight: 600 }}
                />
                {badge && <Chip variant="outlined" label={badge} sx={{ fontWeight: 600 }} />}
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
                <PriceTag price={price} size="lg" />
                {price?.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {price.note}
                  </Typography>
                )}
                <Button
                  component={RouterLink}
                  to={notAvailable ? contactTo : enquireTo}
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {notAvailable ? 'Notify me when available' : 'Enquire to buy'}
                </Button>
                <Button component={RouterLink} to={contactTo} variant="text" size="small" fullWidth sx={{ mt: 0.5 }}>
                  Ask a question first
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  No online checkout yet — we&apos;ll confirm the price, arrange payment and get it to
                  you, usually within one working day.
                </Typography>
              </Box>
            </Box>

            {galleryImages.length > 0 && (
              <Box sx={{ width: { xs: '100%', md: 380 }, flexShrink: 0 }}>
                <SmartImage src={galleryImages[0]} alt={name} ratio="4 / 3" />
                {galleryImages.length > 1 && (
                  <Box
                    sx={{
                      mt: 1.5,
                      display: 'grid',
                      gap: 1,
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    }}
                  >
                    {galleryImages.slice(1).map((src, i) => (
                      <SmartImage key={src} src={src} alt={`${name} — view ${i + 2}`} ratio="1 / 1" />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Section>
        {description && (
          <Box sx={{ maxWidth: 760, mb: 6 }}>
            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              About this{storeCategory === 'bundle' ? ' bundle' : ''}
            </Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {description}
            </Typography>
          </Box>
        )}

        {highlights.length > 0 && (
          <Box sx={{ maxWidth: 760, mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Highlights
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.25 }}>
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
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              What you get
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                maxWidth: 820,
              }}
            >
              {includes.map((inc, i) => (
                <Box
                  key={`${inc}-${i}`}
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
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
            <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
              Specifications
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                maxWidth: 820,
              }}
            >
              {specs.map((s, i) => (
                <Box
                  key={`${s.label}-${i}`}
                  sx={{
                    p: 2.5,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    {s.label}
                  </Typography>
                  <Typography>{s.value}</Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Details are indicative and subject to confirmation.
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ maxWidth: 900 }}>
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
                {notAvailable ? `Get notified about ${name}` : `Get ${name}`}
              </Typography>
              <PriceTag price={price} size="sm" />
            </Box>
            <Button
              component={RouterLink}
              to={notAvailable ? contactTo : enquireTo}
              variant="contained"
              size="large"
            >
              {notAvailable ? 'Notify me' : 'Enquire to buy'}
            </Button>
          </Box>
        </Box>
      </Section>

      <CTABanner
        heading="Buying for a school or club?"
        body="Tell us how many learners you have — we'll put together a quote with classroom pricing."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20store%20enquiry' }}
        secondary={{ label: 'Browse the store', to: '/store' }}
      />
    </>
  );
}
