import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Container from '@mui/material/Container';
import SmartImage from '../components/common/SmartImage.jsx';
import PriceTag from '../components/catalog/PriceTag.jsx';
import QuickAddButton from '../components/catalog/QuickAddButton.jsx';
import StoreAssurances from '../components/store/StoreAssurances.jsx';
import HowBuyingWorks from '../components/store/HowBuyingWorks.jsx';
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
      <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

// The good the header puts forward: one with its own badge (e.g. "Core kit"), on sale, with a
// photo and a price — else the first good with a photo and a price.
function pickFeatured(entries) {
  const goods = entries.filter((e) => e.kind === 'store_item' && e.data.image && priceOf(e) != null && (e.data.stockStatus || 'available') !== 'coming_soon');
  return goods.find((e) => e.data.badge) || goods[0] || null;
}

// The featured good, beside the Store's heading: its photo shown whole, name, price, Add to cart.
function FeaturedSpotlight({ entry }) {
  const it = entry.data;
  const to = storeItemPath(it.slug);
  return (
    <Box
      sx={{
        borderRadius: 4, overflow: 'hidden', bgcolor: 'surface.card', border: '1px solid', borderColor: 'surface.ring',
        boxShadow: 'shadow.lg', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' },
      }}
    >
      <Box component={RouterLink} to={to} aria-label={it.name} sx={{ display: 'block', bgcolor: 'common.white', position: 'relative' }}>
        <SmartImage src={it.image} alt={it.name} ratio="1 / 1" rounded={false} fit="contain" eager sx={{ bgcolor: 'common.white', p: 2, boxSizing: 'border-box', height: { xs: 220, sm: '100%' }, aspectRatio: { xs: 'auto', sm: '1 / 1' } }} />
        <Box component="span" sx={{ position: 'absolute', top: 12, left: 12, px: 1.1, py: 0.35, borderRadius: 999, fontSize: 11.5, fontWeight: 800, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
          {it.badge || 'Featured'}
        </Box>
      </Box>
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: 'primary.main', textTransform: 'uppercase' }}>Featured</Typography>
        <Typography component={RouterLink} to={to} sx={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.25, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          {it.name}
        </Typography>
        {it.tagline && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>{it.tagline}</Typography>}
        <PriceTag price={it.price} size="sm" sx={{ mt: 0.5 }} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <QuickAddButton kind="store_item" item={{ id: it.id, slug: it.slug, name: it.name, image: it.image, price: it.price }} sx={{ minHeight: 40 }} />
          <Button component={RouterLink} to={to} size="small" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 700, minHeight: 40 }}>Details</Button>
        </Box>
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
 *
 * Reads top to bottom (Nov 2026): a header — what the Store is, quick ways in, and a featured
 * kit — then the promises (pay your way, pickup or delivery…), a toolbar that stays under the site
 * header while the shelves scroll, the shelves, "How buying works", and the school-quote banner.
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
  const featured = useMemo(() => (ready ? pickFeatured(entries) : null), [entries, ready]);

  // From the header's buttons: that category, then down to the shelves.
  const showCategory = (key) => {
    setCategory(key);
    window.requestAnimationFrame(() => document.getElementById('shelves')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

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

      {/* the header: what the Store is, the quick ways in, and a featured kit */}
      <Box
        sx={{
          position: 'relative', overflow: 'hidden', borderBottom: '1px solid', borderColor: 'divider',
          background: (t) => `radial-gradient(900px 380px at 85% -10%, ${t.palette.surface.heroGlow} 0%, transparent 60%), linear-gradient(180deg, ${t.palette.surface.subtle} 0%, ${t.palette.background.default} 100%)`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'grid', gap: { xs: 3.5, md: 5 }, alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: featured ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr' } }}>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '0.12em', color: 'primary.main', textTransform: 'uppercase', mb: 1.5 }}>
                The Digifunzi Store
              </Typography>
              <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 620 }}>
                Robots, kits and build projects for curious minds
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: 560 }}>
                The same hands-on kit our educators teach with, and guided projects your child works through at their own pace and keeps for life.
              </Typography>
              {ready && count > 0 && (
                <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mt: 3 }}>
                  {counts.kit > 0 && (
                    <Button variant="contained" size="large" onClick={() => showCategory('kit')} endIcon={<ArrowForwardRoundedIcon />}>Shop robots &amp; kits</Button>
                  )}
                  {counts.projects > 0 && (
                    <Button variant="outlined" size="large" onClick={() => showCategory('projects')}>Browse projects</Button>
                  )}
                </Box>
              )}
            </Box>
            {/* Not on a phone: there it would only repeat the first card, just below. */}
            {featured && <Box sx={{ display: { xs: 'none', md: 'block' } }}><FeaturedSpotlight entry={featured} /></Box>}
          </Box>
        </Container>
      </Box>

      <Section sx={{ pt: { xs: 3, md: 4 }, pb: { xs: 6, md: 8 } }}>
        <StoreAssurances sx={{ mb: { xs: 4, md: 5 } }} />

        <Box id="shelves" sx={{ scrollMarginTop: { xs: 72, md: 88 } }} />

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
            {/* the toolbar — stays under the site header while the shelves scroll */}
            <Box
              sx={{
                position: 'sticky', top: { xs: 60, md: 72 }, zIndex: 5,
                mx: { xs: -2, sm: -3, lg: -5 }, px: { xs: 2, sm: 3, lg: 5 }, py: 1.5, mb: 2,
                bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider',
                display: 'flex', flexWrap: 'wrap', gap: 1.5,
                alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between',
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              <Box
                sx={{ display: 'flex', gap: 1, overflowX: 'auto', flexWrap: { xs: 'nowrap', md: 'wrap' }, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
                role="tablist"
                aria-label="Categories"
              >
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
                      sx={{ fontWeight: 700, flexShrink: 0 }}
                    />
                  ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <TextField
                  size="small"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search kits and projects"
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

            <Typography color="text.secondary" sx={{ fontSize: 14, fontWeight: 600, mb: 2 }} aria-live="polite">
              {list.length === count ? `${count} ${count === 1 ? 'item' : 'items'}` : `Showing ${list.length} of ${count}`}
              {query.trim() ? ` for “${query.trim()}”` : ''}
            </Typography>

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

      {ready && count > 0 && (
        <Section tone="subtle" py={{ xs: 6, md: 9 }}>
          <HowBuyingWorks />
        </Section>
      )}

      <CTABanner
        heading="Buying for a school or club?"
        body="Tell us how many learners you have and which kits or projects you're interested in — we'll put together a quote with classroom pricing."
        primary={{ label: 'Request a quote', to: '/contact?subject=School%20store%20enquiry' }}
        secondary={{ label: 'See our school programme', to: '/schools' }}
      />
    </>
  );
}
