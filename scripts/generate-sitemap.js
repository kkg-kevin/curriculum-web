/**
 * Writes dist/sitemap.xml and dist/robots.txt at build time (spec §7).
 *
 * Runs AFTER prerender.js in the pipeline (see package.json `postbuild`).
 *
 * Static routes come from src/config/site.js. Dynamic detail routes —
 * /pathways/:slug, /projects/:slug, /store/:slug, /bootcamps/:slug — are taken
 * from whatever prerender.js actually wrote under dist/<section>/*, NOT a fresh
 * API call.
 * prerender is the single authority on what shipped: if its API fetch failed and
 * it skipped those pages, they must not be in the sitemap either (a sitemap URL
 * pointing at an un-prerendered SPA shell is worse than an absent one). Under
 * VITE_USE_MOCK the fixtures' slugs are used instead, matching what prerender does.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIST, ensureDist, getConfig } from './_shared.js';
import { STATIC_ROUTES } from '../src/config/site.js';

const { siteUrl, useMock } = getConfig();

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

async function getSectionSlugs(section, mockFixture, mockExport) {
  if (useMock) {
    const mod = await import(mockFixture);
    return (mod[mockExport] || []).map((x) => x.slug).filter(Boolean);
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

  const [pathwaySlugs, projectSlugs, storeSlugs, bootcampSlugs] = await Promise.all([
    getSectionSlugs('pathways', '../src/mocks/fixtures/pathways.js', 'pathways'),
    getSectionSlugs('projects', '../src/mocks/fixtures/projects.js', 'projects'),
    getSectionSlugs('store', '../src/mocks/fixtures/store.js', 'storeList'),
    getSectionSlugs('bootcamps', '../src/mocks/fixtures/bootcamps.js', 'bootcampList'),
  ]);

  for (const slug of pathwaySlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/pathways/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
  }
  for (const slug of projectSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/projects/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
  }
  for (const slug of storeSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/store/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
  }
  for (const slug of bootcampSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/bootcamps/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
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
      `${projectSlugs.length} projects, ${storeSlugs.length} store items, ${bootcampSlugs.length} bootcamps) + robots.txt`,
  );
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
