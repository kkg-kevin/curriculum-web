import { useMemo } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { EmptyBlock } from '../components/common/StateViews.jsx';
import CatalogItemCard from '../components/catalog/CatalogItemCard.jsx';
import {
  storeItems,
  storeItemsByCategory,
  activeStoreCategories,
  PRICING_IS_PLACEHOLDER,
} from '../content/store.js';

const GRID_SX = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
};

/**
 * Store (`/store`) — PHYSICAL goods only: the Quarky robot, classroom bundles,
 * accessories. Projects you buy (digital, course-style) are their own section
 * (`/projects`).
 *
 * Static content (Option A — src/content/store.js). No API call. `?category=`
 * filters the grid.
 */
export default function StoreListPage() {
  const [params, setParams] = useSearchParams();
  const categories = activeStoreCategories();
  const requested = params.get('category');
  const active = categories.some((c) => c.key === requested) ? requested : 'all';

  const items = useMemo(() => storeItemsByCategory(active), [active]);

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
            storeItems.map((it) => ({ name: it.name, url: `/store/${it.slug}` })),
            { name: 'Digifunzi Store' },
          ),
        ]}
      />

      <PageHeader
        title="Store"
        lead="The hardware side of Digifunzi — the Quarky robot, classroom bundles and add-ons. For guided build projects you buy and keep, see Projects."
      />

      <Section>
        {PRICING_IS_PLACEHOLDER && (
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
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4, alignItems: 'center' }}>
          {categories.map((c) => (
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

        {items.length === 0 ? (
          <EmptyBlock
            title="Nothing in this category yet"
            body="Check back soon, or get in touch and tell us what you're after."
          />
        ) : (
          <Box sx={GRID_SX}>
            {items.map((item) => (
              <CatalogItemCard key={item.slug} item={item} to={`/store/${item.slug}`} />
            ))}
          </Box>
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
