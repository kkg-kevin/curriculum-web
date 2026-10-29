import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import StoreItemCard from '../components/cards/StoreItemCard.jsx';
import ProjectCard from '../components/cards/ProjectCard.jsx';
import { useStoreCatalog } from '../hooks/useStoreCatalog.js';
import { projectPath, storeItemPath } from '../utils/storePaths.js';
import { CARD_GRID_COLUMNS, shortListSx } from '../theme/layout.js';

const GRID_SX = {
  display: 'grid',
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: CARD_GRID_COLUMNS,
};

const CATEGORIES = [
  { key: 'all', label: 'Everything' },
  { key: 'projects', label: 'Projects' },
  { key: 'kit', label: 'Robots & kits' },
  { key: 'bundle', label: 'Bundles' },
  { key: 'accessory', label: 'Accessories' },
];

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'name', label: 'Name: A to Z' },
];

// "Featured": the goods on sale now, then the projects, then goods not on sale yet — each by name.
const featuredRank = (e) => {
  if (e.kind === 'project') return 1;
  const status = e.data.stockStatus;
  return status && status !== 'available' ? 2 : 0;
};
const priceOf = (e) => (typeof e.price?.amount === 'number' ? e.price.amount : null);

function sortEntries(list, sort) {
  const byName = (a, b) => a.name.localeCompare(b.name);
  const sorted = [...list];
  if (sort === 'name') return sorted.sort(byName);
  if (sort === 'price-asc' || sort === 'price-desc') {
    const dir = sort === 'price-asc' ? 1 : -1;
    // Things without a price ("Contact us for pricing") always go last.
    return sorted.sort((a, b) => {
      const pa = priceOf(a);
      const pb = priceOf(b);
      if (pa == null || pb == null) return (pa == null) - (pb == null) || byName(a, b);
      return (pa - pb) * dir || byName(a, b);
    });
  }
  return sorted.sort((a, b) => featuredRank(a) - featuredRank(b) || byName(a, b));
}

function CardSkeleton() {
  return (
    <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card' }}>
      <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 10', height: 'auto' }} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

/**
 * Store (`/store`) — everything Digifunzi sells, in one place: the goods (the Quarky robot,
 * bundles, accessories — `inventory` rows flipped "For sale" in the portal, GET /api/public/store)
 * and the guided build projects (`type: "project"` assessments flipped "For sale", GET
 * /api/public/projects). Projects had their own /projects section until Oct 2026; it now
 * redirects here with `?category=projects`.
 *
 * `?category=` picks a category; the search box and the sort work on the page only.
 */
export default function StoreListPage() {
  const { entries, isLoading, isError, error, refetch } = useStoreCatalog();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');

  const requested = params.get('category');
  const active = CATEGORIES.some((c) => c.key === requested) ? requested : 'all';

  // How many of each — a category chip only shows when something is in it.
  const counts = useMemo(() => {
    const n = { all: entries.length };
    for (const e of entries) n[e.category] = (n[e.category] || 0) + 1;
    return n;
  }, [entries]);
  const availableCategories = CATEGORIES.filter((c) => counts[c.key]);

  const list = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const inCategory = active === 'all' ? entries : entries.filter((e) => e.category === active);
    const matching = words.length
      ? inCategory.filter((e) => {
          const text = `${e.name} ${e.tagline} ${e.kind === 'project' ? 'project' : ''}`.toLowerCase();
          return words.every((w) => text.includes(w));
        })
      : inCategory;
    return sortEntries(matching, sort);
  }, [entries, active, query, sort]);

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

  const count = entries.length;
  const ready = !isLoading && !isError;

  return (
    <>
      <SeoHead
        title="Store — Quarky Robot, Kits & Guided Build Projects"
        // Nothing for sale yet → an empty page; keep it out of search until there is (sitemap.xml
        // drops any noindex page too — scripts/generate-sitemap.js).
        noindex={ready && count === 0}
        description="Buy the Quarky learning robot, classroom bundles, accessories and guided build projects your child keeps for life. Pay by M-Pesa, bank or cash."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            entries.map((e) => ({ name: e.name, url: e.kind === 'project' ? projectPath(e.slug) : storeItemPath(e.slug) })),
            { name: 'Digifunzi Store' },
          ),
        ]}
      />

      {/* No banner: the page opens straight onto the shelves — a slim title row, the toolbar, then
          the products. How paying and delivery work is on each item's page, beside the buy box. */}
      <Section sx={{ pt: { xs: 3, md: 4 }, pb: { xs: 8, md: 12 } }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap', mb: { xs: 2, md: 2.5 } }}>
          <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' } }}>
            Store
          </Typography>
          {ready && count > 0 && (
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              {count} {count === 1 ? 'item' : 'items'} · robots, kits and guided build projects
            </Typography>
          )}
        </Box>

        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {ready && count === 0 && (
          <EmptyBlock
            title="The store is being stocked"
            body="We're finalising our first kits and projects. Check back soon — or contact us and we'll tell you what's coming and put together a quote."
          />
        )}

        {ready && count > 0 && (
          <>
            {/* the toolbar — categories on the left; search and sort on the right */}
            <Box
              sx={{
                display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3,
                alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between',
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} role="tablist" aria-label="Categories">
                {availableCategories.length > 2 &&
                  availableCategories.map((c) => (
                    <Chip
                      key={c.key}
                      role="tab"
                      aria-selected={c.key === active}
                      label={`${c.label} · ${counts[c.key]}`}
                      onClick={() => setCategory(c.key)}
                      color={c.key === active ? 'primary' : 'default'}
                      variant={c.key === active ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <TextField
                  size="small"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the store"
                  inputProps={{ 'aria-label': 'Search the store' }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
                  sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, minWidth: { sm: 240 } }}
                />
                <TextField
                  select
                  size="small"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  inputProps={{ 'aria-label': 'Sort by' }}
                  sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, minWidth: 190 }}
                >
                  {SORTS.map((s) => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
                </TextField>
              </Box>
            </Box>

            {list.length === 0 ? (
              <Box sx={{ textAlign: 'center' }}>
                <EmptyBlock
                  title={query.trim() ? `Nothing matches “${query.trim()}”` : 'Nothing in this category yet'}
                  body="Try another search or category — or get in touch and tell us what you're after."
                />
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => { setQuery(''); setCategory('all'); }}>
                  Show everything
                </Button>
              </Box>
            ) : (
              <Box sx={{ ...GRID_SX, ...shortListSx(list.length) }}>
                {list.map((e) => (e.kind === 'project'
                  ? <ProjectCard key={e.key} project={e.data} />
                  : <StoreItemCard key={e.key} item={e.data} />))}
              </Box>
            )}
          </>
        )}
      </Section>

      <CTABanner
        heading="Buying for a school or club?"
        body="Tell us how many learners you have and which kits or projects you're interested in — we'll put together a quote with classroom pricing."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20store%20enquiry' }}
        secondary={{ label: 'See our school programme', to: '/schools' }}
      />
    </>
  );
}
