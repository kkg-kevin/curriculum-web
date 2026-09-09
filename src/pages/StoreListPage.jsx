import { useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import StoreItemCard from '../components/cards/StoreItemCard.jsx';
import { usePublicStore } from '../hooks/usePublicStore.js';

const GRID_SX = {
  display: 'grid',
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
};

const CATEGORIES = [
  { key: 'all', label: 'Everything' },
  { key: 'kit', label: 'Robots & kits' },
  { key: 'bundle', label: 'Bundles' },
  { key: 'accessory', label: 'Accessories' },
];

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.card',
      }}
    >
      <Skeleton variant="rectangular" height={138} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

/**
 * Store (`/store`) — physical goods: the Quarky robot, classroom bundles, accessories. Each
 * item is a shared `inventory` row the curriculum team flipped "For sale" in the portal's
 * Inventory panel — see GET /api/public/store. Guided build projects you buy and keep are
 * their own section (`/projects`).
 *
 * `?category=` filters the grid client-side.
 */
export default function StoreListPage() {
  const { data, isLoading, isError, error, refetch } = usePublicStore();
  const [params, setParams] = useSearchParams();

  const requested = params.get('category');
  const active = CATEGORIES.some((c) => c.key === requested) ? requested : 'all';

  // Only show a category chip if at least one item actually has that store category.
  const availableCategories = useMemo(() => {
    const present = new Set((data || []).map((i) => i.storeCategory).filter(Boolean));
    return CATEGORIES.filter((c) => c.key === 'all' || present.has(c.key));
  }, [data]);

  const list = useMemo(() => {
    const all = data || [];
    return active === 'all' ? all : all.filter((i) => i.storeCategory === active);
  }, [data, active]);

  const setCategory = (key) => {
    setParams(
      (prev) => {
        if (key === 'all') prev.delete('category');
        else prev.set('category', key);
        return prev;
      },
      { replace: true },
    );
  };

  const count = data?.length || 0;

  return (
    <>
      <SeoHead
        title="Store — The Quarky Robot, Kits & Bundles"
        description="Buy the Quarky learning robot, classroom bundles and accessories from Digifunzi. Looking for a guided build project instead? Those are in the Projects section."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            (data || []).map((it) => ({ name: it.name, url: `/store/${it.slug}` })),
            { name: 'Digifunzi Store' },
          ),
        ]}
      />

      <PageHeader
        title="Store"
        lead="The hardware side of Digifunzi — the Quarky robot, classroom bundles and add-ons. For guided build projects you buy and keep, see Projects."
      >
        {!isLoading && !isError && count > 0 && (
          <Box
            sx={{
              mt: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'surface.card',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {count} {count === 1 ? 'item' : 'items'} in the store
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section>
        <Box
          role="note"
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            backgroundColor: 'surface.subtle',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Prices shown are indicative.</strong> Online checkout is coming soon — for now,
            open an item and send an enquiry. We&apos;ll confirm the final price, arrange payment and
            get it to you.
          </Typography>
        </Box>

        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && count === 0 && (
          <EmptyBlock
            title="The store is being stocked"
            body="We're finalising our first kits and bundles. Check back soon — or contact us and we'll tell you what's coming and put together a quote."
          />
        )}

        {!isLoading && !isError && count > 0 && (
          <>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4, alignItems: 'center' }}>
              {availableCategories.length > 2 &&
                availableCategories.map((c) => (
                  <Chip
                    key={c.key}
                    label={c.label}
                    onClick={() => setCategory(c.key)}
                    color={c.key === active ? 'primary' : 'default'}
                    variant={c.key === active ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              <Chip
                component={RouterLink}
                to="/projects"
                clickable
                variant="outlined"
                label="Looking for projects? →"
                sx={{ fontWeight: 600, ml: { sm: 'auto' } }}
              />
            </Box>

            {list.length === 0 ? (
              <EmptyBlock
                title="Nothing in this category yet"
                body="Try another category, or get in touch and tell us what you're after."
              />
            ) : (
              <Box sx={GRID_SX}>
                {list.map((it) => (
                  <StoreItemCard key={it.id} item={it} />
                ))}
              </Box>
            )}
          </>
        )}
      </Section>

      <CTABanner
        heading="Buying for a school or club?"
        body="Tell us how many learners you have and which kits you're interested in — we'll put together a quote with classroom pricing."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20store%20enquiry' }}
        secondary={{ label: 'Browse projects', to: '/projects' }}
      />
    </>
  );
}
