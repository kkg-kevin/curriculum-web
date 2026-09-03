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
 * Dynamic routes (/bootcamps/:slug, /projects/:slug, /pathways/:slug) are
 * discovered from the public API, or from local fixtures when VITE_USE_MOCK=true.
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

// Routes whose content comes from /api/public/*. In a real (non-mock) build we
// only prerender these if the API is actually reachable — otherwise we'd bake a
// "couldn't load" error page into static HTML. Skipped routes still work as a
// normal client-rendered SPA via the index.html fallback.
const DATA_DRIVEN_STATIC = new Set(['/bootcamps', '/projects', '/pathways']);

let apiReachable = useMock; // mock adapter always "reachable"

async function getSlugs(resource) {
  if (useMock) {
    const mod = await import(`../src/mocks/fixtures/${resource}.js`);
    return (mod[resource] || []).map((x) => x.slug).filter(Boolean);
  }
  try {
    const res = await fetch(`${apiUrl}/api/public/${resource}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    apiReachable = true;
    return (Array.isArray(list) ? list : []).map((x) => x.slug).filter(Boolean);
  } catch (err) {
    console.warn(`[prerender] could not list ${resource} from ${apiUrl}: ${err.message}.`);
    return [];
  }
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

  const [bootcampSlugs, projectSlugs, pathwaySlugs] = await Promise.all([
    getSlugs('bootcamps'),
    getSlugs('projects'),
    getSlugs('pathways'),
  ]);

  // Static routes: prerender all, except the data-driven ones when the API is
  // unreachable in a real build (they'd snapshot an error state).
  const staticRoutes = STATIC_ROUTES.map((r) => r.path).filter((p) => {
    if (apiReachable || !DATA_DRIVEN_STATIC.has(p)) return true;
    console.warn(`[prerender] skipping ${p} — API unreachable, leaving it as a client-rendered SPA route.`);
    return false;
  });

  const routes = [
    ...staticRoutes,
    ...bootcampSlugs.map((s) => `/bootcamps/${s}`),
    ...projectSlugs.map((s) => `/projects/${s}`),
    ...pathwaySlugs.map((s) => `/pathways/${s}`),
  ];

  if (!useMock && !apiReachable) {
    console.warn(
      `[prerender] NOTE: ${apiUrl}/api/public/* was unreachable. Static/content pages are prerendered; ` +
        `Bootcamps/Projects pages ship as SPA-only HTML. Re-run the build once the API is live.`,
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
