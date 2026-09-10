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
 * Dynamic routes — /pathways/:slug, /projects/:slug, /store/:slug and
 * /bootcamps/:slug — are all discovered from the public API
 * (/api/public/{pathways,projects,store,bootcamps}), or from local fixtures when
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

// ---- 1. discover routes -----------------------------------------------------

// List routes whose content comes from /api/public/*. In a real (non-mock) build
// we only prerender these — and their detail pages — if the API is actually
// reachable, otherwise we'd bake a "couldn't load" / empty page into static HTML.
// Skipped routes still work as a normal client-rendered SPA via the index.html
// fallback.
const DATA_DRIVEN_STATIC = new Set(['/pathways', '/projects', '/store', '/bootcamps']);

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

async function main() {
  ensureDist();

  let puppeteer;
  try {
    ({ default: puppeteer } = await import('puppeteer'));
  } catch {
    console.warn('[prerender] puppeteer not installed — skipping prerender. Run `npm i` to enable it.');
    return;
  }

  const [pathwaySlugs, projectSlugs, storeSlugs, bootcampSlugs] = await Promise.all([
    getApiSlugs('/api/public/pathways', '../src/mocks/fixtures/pathways.js', 'pathways'),
    getApiSlugs('/api/public/projects', '../src/mocks/fixtures/projects.js', 'projects'),
    getApiSlugs('/api/public/store', '../src/mocks/fixtures/store.js', 'storeList'),
    getApiSlugs('/api/public/bootcamps', '../src/mocks/fixtures/bootcamps.js', 'bootcampList'),
  ]);

  // Static routes: prerender all, except the data-driven ones when the API is
  // unreachable in a real build (they'd snapshot an empty/error state).
  const staticRoutes = STATIC_ROUTES.map((r) => r.path).filter((p) => {
    if (apiReachable || !DATA_DRIVEN_STATIC.has(p)) return true;
    console.warn(`[prerender] skipping ${p} — API unreachable, leaving it as a client-rendered SPA route.`);
    return false;
  });

  const routes = [
    ...staticRoutes,
    ...pathwaySlugs.map((s) => `/pathways/${s}`),
    ...projectSlugs.map((s) => `/projects/${s}`),
    ...storeSlugs.map((s) => `/store/${s}`),
    ...bootcampSlugs.map((s) => `/bootcamps/${s}`),
  ];

  if (!useMock && !apiReachable) {
    console.warn(
      `[prerender] NOTE: ${apiUrl} was unreachable. Static pages are prerendered; the Pathways, ` +
        `Projects, Store and Bootcamps sections (list + detail) ship as SPA-only HTML. ` +
        `Re-run the build once the API is live.`,
    );
  }

  const server = await startServer();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

  let ok = 0;
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      // Snapshot the light theme deterministically — the client adjusts to the
      // visitor's real preference on hydration (src/theme/colorMode.js).
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for the app to signal it has mounted and settled all data fetches
      // (window.__APP_READY__, set in src/utils/prerenderSignal.js).
      const ready = await page
        .waitForFunction(() => window.__APP_READY__ === true, { timeout: READY_TIMEOUT_MS, polling: 100 })
        .then(() => true)
        .catch(() => false);
      if (!ready) {
        console.warn(`[prerender] ${route}: __APP_READY__ not reached in ${READY_TIMEOUT_MS}ms — snapshotting anyway`);
      }
      await new Promise((r) => setTimeout(r, SETTLE_WAIT_MS));

      const html = await page.content();
      const outDir = route === '/' ? DIST : path.join(DIST, route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
      await page.close();
      ok += 1;
      console.log(`[prerender] ${route} -> ${path.relative(DIST, path.join(outDir, 'index.html'))}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`[prerender] done — ${ok}/${routes.length} routes written`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
