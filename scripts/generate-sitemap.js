/**
 * Writes dist/sitemap.xml and dist/robots.txt at build time (spec §7).
 *
 * Runs AFTER prerender.js in the pipeline (see package.json `postbuild`).
 *
 * Static routes come from src/config/site.js. Dynamic detail routes —
 * /pathways/:slug, /store/:slug, /store/projects/:slug, /bootcamps/:slug — are taken
 * from whatever prerender.js actually wrote under dist/<section>/*, NOT a fresh
 * API call.
 * prerender is the single authority on what shipped: if its API fetch failed and
 * it skipped those pages, they must not be in the sitemap either (a sitemap URL
 * pointing at an un-prerendered SPA shell is worse than an absent one). Under
 * VITE_USE_MOCK the fixtures' slugs are used instead, matching what prerender does.
 *
 * Any page whose prerendered HTML says noindex (an empty Store, say) is left out too: listing a
 * URL you've asked search engines not to index is a contradictory signal.
 *
 * Entries carry only <loc>. Google ignores <changefreq> and <priority>, and trusts <lastmod> only
 * when it is a real change date — the build date stamped on every URL is not, and the public API
 * has no per-page change date to offer (a pathway changes whenever any of its courses does).
 *
 * With SITE_NOINDEX=true (the Dev site — .env.dev) it also appends an X-Robots-Tag: noindex header
 * to dist/.htaccess, so no page or file of that site appears in search results. robots.txt stays
 * open on purpose: a crawler that robots.txt blocks never fetches a page, so it never sees the
 * noindex that drops the page from the index.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIST, ensureDist, getConfig } from './_shared.js';
import { STATIC_ROUTES } from '../src/config/site.js';
import { slugify } from '../src/utils/slugify.js';

const { siteUrl, useMock, env } = getConfig();
const siteNoindex = env.SITE_NOINDEX === 'true';

/** Slugs prerender.js actually wrote HTML for — dist/<section>/<slug>/index.html. */
function prerenderedSlugs(section) {
  const dir = path.join(DIST, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'index.html')))
    .map((d) => d.name)
    .sort();
}

// A learning hub (an Estate Tech Club) has no slug of its own — its address is made from its
// name, as in prerender.js and src/utils/clubs.js.
async function getSectionSlugs(section, mockFixture, mockExport, toSlug = (x) => x.slug) {
  if (useMock) {
    const mod = await import(mockFixture);
    return (mod[mockExport] || []).map(toSlug).filter(Boolean);
  }
  const slugs = prerenderedSlugs(section);
  if (slugs.length === 0) {
    console.warn(
      `[sitemap] no dist/${section}/*/index.html found — prerender.js skipped them ` +
        '(API was unreachable at build time). Leaving those detail URLs out of the sitemap; ' +
        're-run the build once the API is reachable.',
    );
  }
  return slugs;
}

/** True when the prerendered page for this route asks not to be indexed. */
function isNoindex(routePath) {
  const file = path.join(DIST, routePath, 'index.html');
  if (!fs.existsSync(file)) return false;
  return /<meta[^>]+name="robots"[^>]+noindex/i.test(fs.readFileSync(file, 'utf8'));
}

/**
 * Absolute URL in the trailing-slash form the host serves (dist/<route>/index.html makes it 301
 * `/x` → `/x/`) — same rule as pageUrl() in src/utils/seo.js, which the canonical tags use, so
 * every sitemap URL matches its page's canonical and none of them is a redirect.
 */
function pageUrl(routePath) {
  const clean = routePath.replace(/\/+$/, '');
  return clean ? `${siteUrl}${clean}/` : `${siteUrl}/`;
}

function urlEntry(loc) {
  return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
}

const HTACCESS_NOINDEX_MARK = '# SITE_NOINDEX';

/** Appends the site-wide noindex header to dist/.htaccess, once (a re-run must not add it twice). */
function addNoindexHeader() {
  const file = path.join(DIST, '.htaccess');
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (current.includes(HTACCESS_NOINDEX_MARK)) return;
  const block = [
    '',
    `${HTACCESS_NOINDEX_MARK} — added by scripts/generate-sitemap.js: this build is not the public`,
    '# website, so no page or file of it may appear in search results.',
    '<IfModule mod_headers.c>',
    '  Header always set X-Robots-Tag "noindex, nofollow"',
    '</IfModule>',
    '',
  ].join('\n');
  fs.writeFileSync(file, current + block, 'utf8');
}

async function main() {
  ensureDist();

  const [pathwaySlugs, projectSlugs, storeSlugs, bootcampSlugs, competitionSlugs, clubSlugs] = await Promise.all([
    getSectionSlugs('pathways', '../src/mocks/fixtures/pathways.js', 'pathways'),
    getSectionSlugs('store/projects', '../src/mocks/fixtures/projects.js', 'projects'),
    getSectionSlugs('store', '../src/mocks/fixtures/store.js', 'storeList'),
    getSectionSlugs('bootcamps', '../src/mocks/fixtures/bootcamps.js', 'bootcampList'),
    getSectionSlugs('competitions', '../src/mocks/fixtures/competitions.js', 'competitionList'),
    getSectionSlugs('estate-tech-clubs', '../src/mocks/fixtures/hubs.js', 'hubs', (x) => slugify(x.name)),
  ]);

  // `sitemap: false` routes (deliberately noindex, e.g. /enroll) are prerendered but not listed.
  const routes = [
    ...STATIC_ROUTES.filter((r) => r.sitemap !== false).map((r) => r.path),
    ...pathwaySlugs.map((s) => `/pathways/${s}`),
    ...storeSlugs.map((s) => `/store/${s}`),
    ...projectSlugs.map((s) => `/store/projects/${s}`),
    ...bootcampSlugs.map((s) => `/bootcamps/${s}`),
    ...competitionSlugs.map((s) => `/competitions/${s}`),
    ...clubSlugs.map((s) => `/estate-tech-clubs/${s}`),
  ];
  const skipped = routes.filter((r) => isNoindex(r));
  const entries = routes.filter((r) => !skipped.includes(r)).map((r) => urlEntry(pageUrl(r)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');
  if (siteNoindex) addNoindexHeader();

  console.log(
    `[sitemap] wrote ${entries.length} URLs (${pathwaySlugs.length} pathways, ${projectSlugs.length} projects, ` +
      `${storeSlugs.length} store items, ${bootcampSlugs.length} bootcamps, ${competitionSlugs.length} competitions, ` +
      `${clubSlugs.length} estate tech clubs, ` +
      `the rest static) + robots.txt`,
  );
  if (skipped.length > 0) console.log(`[sitemap] left out as noindex: ${skipped.join(', ')}`);
  if (siteNoindex) console.log('[sitemap] SITE_NOINDEX=true — every response carries X-Robots-Tag: noindex');
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
