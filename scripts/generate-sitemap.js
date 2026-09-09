/**
 * Writes dist/sitemap.xml and dist/robots.txt at build time (spec §7).
 *
 * Runs AFTER prerender.js in the pipeline (see package.json `postbuild`).
 *
 * Static routes come from src/config/site.js. Dynamic detail routes:
 *   - /pathways/:slug — taken from whatever prerender.js actually wrote under
 *     dist/pathways/*, NOT a fresh API call. prerender is the single authority on
 *     what shipped: if its API fetch failed and it skipped those pages, they must
 *     not be in the sitemap either (a sitemap URL pointing at an un-prerendered
 *     SPA shell is worse than an absent one). Under VITE_USE_MOCK the fixtures'
 *     slugs are used instead, matching what prerender does.
 *   - /projects/:slug and /store/:slug — read straight from
 *     src/content/{projects,store}.js (hand-authored static catalogues, no API).
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIST, ensureDist, getConfig } from './_shared.js';
import { STATIC_ROUTES } from '../src/config/site.js';
import { projects } from '../src/content/projects.js';
import { storeItems } from '../src/content/store.js';

const { siteUrl, useMock } = getConfig();

/** Slugs prerender.js actually wrote HTML for — dist/pathways/<slug>/index.html. */
function prerenderedPathwaySlugs() {
  const dir = path.join(DIST, 'pathways');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'index.html')))
    .map((d) => d.name)
    .sort();
}

async function getPathwaySlugs() {
  if (useMock) {
    const mod = await import('../src/mocks/fixtures/pathways.js');
    return (mod.pathways || []).map((x) => x.slug).filter(Boolean);
  }
  const slugs = prerenderedPathwaySlugs();
  if (slugs.length === 0) {
    console.warn(
      '[sitemap] no dist/pathways/*/index.html found — prerender.js skipped them ' +
        '(API was unreachable at build time). Leaving pathway detail URLs out of the sitemap; ' +
        're-run the build once the API is reachable.',
    );
  }
  return slugs;
}

function urlEntry({ loc, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority != null ? `    <priority>${priority.toFixed(1)}</priority>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function main() {
  ensureDist();

  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  for (const r of STATIC_ROUTES) {
    entries.push(
      urlEntry({
        loc: `${siteUrl}${r.path === '/' ? '/' : r.path}`,
        changefreq: r.changefreq,
        priority: r.priority,
        lastmod: today,
      }),
    );
  }

  const pathwaySlugs = await getPathwaySlugs();
  const projectSlugs = projects.map((x) => x.slug).filter(Boolean);
  const storeSlugs = storeItems.map((x) => x.slug).filter(Boolean);

  for (const slug of pathwaySlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/pathways/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
  }
  for (const slug of projectSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/projects/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
  }
  for (const slug of storeSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/store/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
  }

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

  console.log(
    `[sitemap] wrote ${entries.length} URLs (${STATIC_ROUTES.length} static, ${pathwaySlugs.length} pathways, ` +
      `${projectSlugs.length} projects, ${storeSlugs.length} store items) + robots.txt`,
  );
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
