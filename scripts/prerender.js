/**
 * Post-build prerender step (spec §3, §7).
 *
 * A plain Vite SPA ships an empty <div id="root">. Crawlers that don't run JS
 * see nothing. This script:
 *   1. serves the freshly-built dist/ with a tiny static server,
 *   2. visits every route in headless Chrome (Puppeteer),
 *   3. waits for React + react-helmet-async to render,
 *   4. writes the fully-rendered HTML to dist/<route>/index.html.
 *
 * The SPA still hydrates on top of this HTML at runtime, so nothing about the
 * interactive experience changes — crawlers and slow connections just get real
 * content immediately.
 *
 * Alongside the routes it also writes two files public/.htaccess relies on:
 *   - dist/200.html — the bare, un-prerendered SPA shell, copied BEFORE "/" overwrites
 *     dist/index.html with the home page. Served for client-only routes (a pathway added after
 *     the last build, a diagnostic). Without it those URLs got the prerendered HOME page's HTML —
 *     home title, home canonical — until JS ran.
 *   - dist/404.html — the NotFound page, prerendered, served with a real 404 status.
 *
 * Dynamic routes — /pathways/:slug, /projects/:slug, /store/:slug,
 * /bootcamps/:slug and /competitions/:slug — are all discovered from the public API
 * (/api/public/{pathways,projects,store,bootcamps,competitions}), or from local fixtures when
 * VITE_USE_MOCK=true. In a real build, if the API is unreachable, those list +
 * detail pages ship as SPA-only HTML (they'd otherwise snapshot an empty/error
 * state).
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { DIST, ensureDist, getConfig } from './_shared.js';
import { STATIC_ROUTES } from '../src/config/site.js';

const { apiUrl, useMock } = getConfig();
const PORT = 4199;
const READY_TIMEOUT_MS = 15000; // max wait for window.__APP_READY__
const SETTLE_WAIT_MS = 400; // small extra buffer after ready, for Helmet flush
// Any path no route matches renders NotFoundPage; its snapshot is written to dist/404.html.
const NOT_FOUND_ROUTE = '/__prerender-not-found__';

// ---- 1. discover routes -----------------------------------------------------

// List routes whose content comes from /api/public/*. In a real (non-mock) build
// we only prerender these — and their detail pages — if the API is actually
// reachable, otherwise we'd bake a "couldn't load" / empty page into static HTML.
// Skipped routes still work as a normal client-rendered SPA via the index.html
// fallback.
const DATA_DRIVEN_STATIC = new Set(['/pathways', '/projects', '/store', '/bootcamps', '/competitions', '/home-schooling']);

let apiReachable = useMock; // mock adapter always "reachable"

// Generic "list the slugs for an API-backed section" — used for pathways,
// projects and the store, all of which return a bare array of { slug }.
async function getApiSlugs(endpoint, mockFixture, mockExport) {
  if (useMock) {
    const mod = await import(mockFixture);
    return (mod[mockExport] || []).map((x) => x.slug).filter(Boolean);
  }
  // Node's global fetch can flake on the first cold connection to some hosts (undici/TLS
  // race) — a plain retry with a short backoff clears it. Three tries before giving up and
  // shipping that section's pages as SPA-only.
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      apiReachable = true;
      return (Array.isArray(list) ? list : []).map((x) => x.slug).filter(Boolean);
    } catch (err) {
      lastErr = err;
      if (attempt < 3) {
        console.warn(`[prerender] ${endpoint} fetch attempt ${attempt} failed (${err.message}) — retrying…`);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }
  console.warn(`[prerender] could not list ${endpoint} from ${apiUrl} after 3 tries: ${lastErr?.message}.`);
  return [];
}

// ---- 2. minimal static server for dist/ ------------------------------------

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(DIST, urlPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // SPA fallback — let the client router handle the path.
      filePath = path.join(DIST, 'index.html');
    }
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('error');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

// ---- 3. render each route -------------------------------------------------

// index.html's hard-coded fallback <title>/description/OG/Twitter tags stay in the DOM next to
// the ones react-helmet-async adds (marked data-rh), so a snapshot would carry two og:image, two
// descriptions, etc. Drop each fallback that Helmet has a replacement for. Runs in the page.
function dedupeHeadTags() {
  const head = document.head;
  const key = (el) => (el.tagName === 'TITLE' ? 'title' : el.getAttribute('property') || el.getAttribute('name'));
  const managed = new Set([...head.querySelectorAll('[data-rh]')].map(key).filter(Boolean));
  const titles = head.querySelectorAll('title');
  if (titles.length > 1) managed.add('title');
  head.querySelectorAll('title:not([data-rh]), meta:not([data-rh])').forEach((el) => {
    const k = key(el);
    if (!k || !managed.has(k)) return;
    // Keep the last <title> when Helmet reused one without marking it.
    if (k === 'title' && el === titles[titles.length - 1] && !head.querySelector('title[data-rh]')) return;
    el.remove();
  });
}

// Keep the bare SPA shell as 200.html (see header). Only when dist/index.html is still the
// shell — a re-run over an already-prerendered dist must not copy the home page over it.
function saveSpaShell() {
  const indexPath = path.join(DIST, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  if (/<div id="root"><\/div>/.test(html)) {
    fs.writeFileSync(path.join(DIST, '200.html'), html, 'utf8');
    console.log('[prerender] saved SPA shell -> 200.html');
  } else if (!fs.existsSync(path.join(DIST, '200.html'))) {
    console.warn('[prerender] dist/index.html is already prerendered and there is no 200.html — rebuild with `vite build` first.');
  }
}

// A page the API has content for must not snapshot as "not found" (noindex) or as an empty list.
// That happens when Node can reach the API but the headless browser can't — the API's CORS list
// (PUBLIC_SITE_URL) is missing this script's origin, http://localhost:4199 (PORT). Shipping such a
// build tells Google every pathway and bootcamp page doesn't exist, so the build fails instead.
// `sections` maps a list route ('/pathways') to the slugs the API listed for it.
function brokenSnapshot(route, html, sections) {
  // ErrorBlock (src/components/common/StateViews.jsx) — some API call on the page failed.
  if (html.includes('We couldn’t load this')) return 'shows "We couldn’t load this" (an API call failed)';
  const section = Object.keys(sections).find((s) => route.startsWith(`${s}/`));
  if (section) {
    if (/<meta[^>]+name="robots"[^>]+noindex/i.test(html) || /<title[^>]*>[^<]*not found/i.test(html)) {
      return 'rendered as "not found" (noindex)';
    }
    return null;
  }
  const slugs = sections[route] || [];
  if (slugs.length > 0 && !slugs.some((slug) => html.includes(`href="${route}/${slug}`))) {
    return `lists none of the ${slugs.length} item(s) the API returned`;
  }
  return null;
}

async function main() {
  ensureDist();
  saveSpaShell();

  let puppeteer;
  try {
    ({ default: puppeteer } = await import('puppeteer'));
  } catch {
    console.warn('[prerender] puppeteer not installed — skipping prerender. Run `npm i` to enable it.');
    return;
  }

  const [pathwaySlugs, projectSlugs, storeSlugs, bootcampSlugs, competitionSlugs] = await Promise.all([
    getApiSlugs('/api/public/pathways', '../src/mocks/fixtures/pathways.js', 'pathways'),
    getApiSlugs('/api/public/projects', '../src/mocks/fixtures/projects.js', 'projects'),
    getApiSlugs('/api/public/store', '../src/mocks/fixtures/store.js', 'storeList'),
    getApiSlugs('/api/public/bootcamps', '../src/mocks/fixtures/bootcamps.js', 'bootcampList'),
    getApiSlugs('/api/public/competitions', '../src/mocks/fixtures/competitions.js', 'competitionList'),
  ]);

  // Static routes: prerender all, except the data-driven ones when the API is
  // unreachable in a real build (they'd snapshot an empty/error state).
  const staticRoutes = STATIC_ROUTES.map((r) => r.path).filter((p) => {
    if (apiReachable || !DATA_DRIVEN_STATIC.has(p)) return true;
    console.warn(`[prerender] skipping ${p} — API unreachable, leaving it as a client-rendered SPA route.`);
    return false;
  });

  const sections = {
    '/pathways': pathwaySlugs,
    '/projects': projectSlugs,
    '/store': storeSlugs,
    '/bootcamps': bootcampSlugs,
    '/competitions': competitionSlugs,
  };

  const routes = [
    ...staticRoutes,
    ...pathwaySlugs.map((s) => `/pathways/${s}`),
    ...projectSlugs.map((s) => `/projects/${s}`),
    ...storeSlugs.map((s) => `/store/${s}`),
    ...bootcampSlugs.map((s) => `/bootcamps/${s}`),
    ...competitionSlugs.map((s) => `/competitions/${s}`),
    NOT_FOUND_ROUTE,
  ];

  if (!useMock && !apiReachable) {
    console.warn(
      `[prerender] NOTE: ${apiUrl} was unreachable. Static pages are prerendered; the Pathways, ` +
        `Projects, Store, Bootcamps and Competitions sections (list + detail) ship as SPA-only HTML. ` +
        `Re-run the build once the API is live.`,
    );
  }

  const server = await startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  let ok = 0;
  const broken = [];
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      // Snapshot the light theme deterministically — the client adjusts to the
      // visitor's real preference on hydration (src/theme/colorMode.js).
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
      const url = `http://localhost:${PORT}${route}`;
      // API requests can stay active (or fail slowly) while the route mounts. The
      // app-ready signal below already waits for React, route chunks, and queries,
      // so waiting for every browser connection to become idle can hang prerendering.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for the app to signal it has mounted and settled all data fetches
      // (window.__APP_READY__, set in src/utils/prerenderSignal.js) — and for it to STAY settled
      // through the settle wait. The flag can flash true in the moment between a page chunk
      // rendering and its first query starting; a snapshot taken then is the loading skeleton.
      const deadline = Date.now() + READY_TIMEOUT_MS;
      let ready = false;
      while (!ready && Date.now() < deadline) {
        const reached = await page
          .waitForFunction(() => window.__APP_READY__ === true, { timeout: Math.max(deadline - Date.now(), 1), polling: 100 })
          .then(() => true)
          .catch(() => false);
        if (!reached) break;
        await new Promise((r) => setTimeout(r, SETTLE_WAIT_MS));
        ready = await page.evaluate(() => window.__APP_READY__ === true);
      }
      if (!ready) {
        console.warn(`[prerender] ${route}: __APP_READY__ not reached in ${READY_TIMEOUT_MS}ms — snapshotting anyway`);
      }
      await page.evaluate(dedupeHeadTags);

      const html = await page.content();
      const problem = brokenSnapshot(route, html, sections);
      if (problem) broken.push(`${route}: ${problem}`);
      let outFile;
      if (route === NOT_FOUND_ROUTE) outFile = path.join(DIST, '404.html');
      else outFile = path.join(route === '/' ? DIST : path.join(DIST, route), 'index.html');
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, html, 'utf8');
      await page.close();
      ok += 1;
      console.log(`[prerender] ${route} -> ${path.relative(DIST, outFile)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[prerender] done — ${ok}/${routes.length} routes written`);

  if (broken.length > 0) {
    console.error(
      `[prerender] ${broken.length} page(s) came out without their content:\n` +
        broken.map((b) => `  - ${b}`).join('\n') +
        `\n[prerender] The API answered this script but not the browser it drives. Most likely its ` +
        `PUBLIC_SITE_URL setting is missing http://localhost:${PORT} (cPanel → Setup Node.js App → ` +
        `${apiUrl} → Environment variables). Add it, restart the app and build again. ` +
        `Do not upload this build: search engines would read these pages as missing.`,
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
