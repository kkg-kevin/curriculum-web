/**
 * Writes dist/sitemap.xml and dist/robots.txt at build time (spec §7).
 *
 * Static routes come from src/config/site.js. Dynamic detail routes
 * (/bootcamps/:slug, /projects/:slug) are pulled from the live public API —
 * or, when VITE_USE_MOCK=true, from the local fixtures so the build still works
 * before the real endpoints exist.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIST, ensureDist, getConfig } from './_shared.js';
import { STATIC_ROUTES } from '../src/config/site.js';

const { siteUrl, apiUrl, useMock } = getConfig();

async function getSlugs(resource) {
  if (useMock) {
    const mod = await import(`../src/mocks/fixtures/${resource}.js`);
    return (mod[resource] || []).map((x) => x.slug).filter(Boolean);
  }
  try {
    const res = await fetch(`${apiUrl}/api/public/${resource}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    return (Array.isArray(list) ? list : []).map((x) => x.slug).filter(Boolean);
  } catch (err) {
    // In a real build, skip rather than risk baking stale/fake URLs into the sitemap.
    console.warn(`[sitemap] could not fetch ${resource} from ${apiUrl}: ${err.message}. Skipping its detail URLs.`);
    return [];
  }
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

  const [bootcampSlugs, projectSlugs] = await Promise.all([getSlugs('bootcamps'), getSlugs('projects')]);

  for (const slug of bootcampSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/bootcamps/${slug}`, changefreq: 'weekly', priority: 0.7, lastmod: today }));
  }
  for (const slug of projectSlugs) {
    entries.push(urlEntry({ loc: `${siteUrl}/projects/${slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today }));
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
    `[sitemap] wrote ${entries.length} URLs (${STATIC_ROUTES.length} static, ${bootcampSlugs.length} bootcamps, ${projectSlugs.length} projects) + robots.txt`,
  );
}

main().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
