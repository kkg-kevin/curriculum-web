/**
 * Digifunzi landing — standalone API.
 *
 * Serves the same /api/public/* contract the curriculum system exposes, backed
 * by JSON files in data/. Form submissions are appended to data/leads.json and
 * data/contacts.json. A password-protected /admin view lists them.
 *
 * When you migrate to a database / the curriculum system, point the React app's
 * VITE_API_URL there instead — no page changes needed.
 *
 * Env (all optional, see .env.server.example):
 *   PORT               default 5050
 *   PUBLIC_SITE_URL    comma-separated allowed browser origins for CORS
 *   ADMIN_USER         basic-auth user for /admin      (default "admin")
 *   ADMIN_PASSWORD     basic-auth password for /admin   (REQUIRED to enable /admin)
 *   DATA_DIR           override data/ location
 *   CONTENT_DIR        override data/content/ location
 *   SERVE_STATIC       "true" to also serve the built SPA from dist/ (single-process deploy)
 */
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  listBootcamps,
  getBootcamp,
  listProjects,
  getProject,
  listPathways,
  getPathway,
} from './lib/content.js';
import { append, readAll } from './lib/jsonStore.js';
import { validateLead, validateContact } from './lib/validate.js';
import { adminRouter } from './admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 5050;

const app = express();
app.set('trust proxy', 1); // behind Truehost / cPanel proxy
app.use(express.json({ limit: '32kb' }));

// ---- CORS ---------------------------------------------------------------
// Allow-list from PUBLIC_SITE_URL (comma-separated). Requests with no Origin
// header (curl, same-process) always pass. Disallowed browser origins simply
// don't get the ACAO header back and the browser blocks them cleanly.
const ALLOWED_ORIGINS = (process.env.PUBLIC_SITE_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---- simple in-memory rate limit for the POST endpoints ----------------
// 20 requests / 15 min / IP, matching the curriculum system.
const RL_WINDOW_MS = 15 * 60 * 1000;
const RL_MAX = 20;
const hits = new Map(); // ip -> [timestamps]

function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RL_WINDOW_MS);
  if (recent.length >= RL_MAX) {
    res.setHeader('Retry-After', String(Math.ceil(RL_WINDOW_MS / 1000)));
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }
  recent.push(now);
  hits.set(ip, recent);
  next();
}

// ---- health -----------------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'standalone-json' }));

// ---- GET /api/public/* (content) ------------------------------------
const send = (res, promise, notFoundMsg) =>
  promise
    .then((data) => (data ? res.json(data) : res.status(404).json({ message: notFoundMsg })))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Content is temporarily unavailable.' });
    });

app.get('/api/public/bootcamps', (_req, res) => send(res, listBootcamps()));
app.get('/api/public/bootcamps/:idOrSlug', (req, res) =>
  send(res, getBootcamp(req.params.idOrSlug), 'Bootcamp not found'),
);
app.get('/api/public/projects', (_req, res) => send(res, listProjects()));
app.get('/api/public/projects/:idOrSlug', (req, res) =>
  send(res, getProject(req.params.idOrSlug), 'Project not found'),
);
app.get('/api/public/pathways', (_req, res) => send(res, listPathways()));
app.get('/api/public/pathways/:idOrSlug', (req, res) =>
  send(res, getPathway(req.params.idOrSlug), 'Pathway not found'),
);

// ---- POST /api/public/leads --------------------------------------
app.post('/api/public/leads', rateLimit, async (req, res) => {
  // Honeypot: bots fill the hidden companyWebsite field. Pretend success.
  if (req.body && typeof req.body.companyWebsite === 'string' && req.body.companyWebsite.trim()) {
    return res.status(201).json({ ok: true, success: true, message: 'Thanks! Our team will be in touch.' });
  }
  const result = validateLead(req.body);
  if (!result.ok) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: result.errors });
  }
  try {
    const stored = await append('leads', result.value);
    console.log(`[leads] new enquiry ${stored.id} — ${stored.parentEmail} (${stored.interestedIn})`);
    return res.status(201).json({
      ok: true,
      success: true,
      message: 'Thanks! Our team will be in touch to arrange next steps.',
      data: stored,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Could not save your enquiry. Please try again.' });
  }
});

// ---- POST /api/public/contact ----------------------------------
app.post('/api/public/contact', rateLimit, async (req, res) => {
  if (req.body && typeof req.body.companyWebsite === 'string' && req.body.companyWebsite.trim()) {
    return res.status(201).json({ ok: true, success: true, message: 'Message received.' });
  }
  const result = validateContact(req.body);
  if (!result.ok) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: result.errors });
  }
  try {
    const stored = await append('contacts', result.value);
    console.log(`[contact] new message ${stored.id} — ${stored.email}`);
    return res.status(201).json({
      ok: true,
      success: true,
      message: 'Thanks — your message has been received and our team will be in touch.',
      data: stored,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Could not send your message. Please try again.' });
  }
});

// ---- /admin (password-protected submissions view) -----------------
app.use('/admin', adminRouter({ readAll }));

// ---- optionally serve the built SPA (single-process deploy) --------
if (process.env.SERVE_STATIC === 'true') {
  const DIST = path.join(ROOT, 'dist');
  if (fs.existsSync(DIST)) {
    // index:false + redirect:false so a route dir like dist/pathways/robotics/
    // isn't auto-redirected — our handler below serves its index.html directly.
    app.use(express.static(DIST, { index: false, redirect: false }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api') || req.path.startsWith('/admin')) return next();
      // prefer a prerendered <route>/index.html, else the SPA shell
      const clean = req.path.replace(/\/+$/, '') || '/';
      const pre = path.join(DIST, clean, 'index.html');
      res.sendFile(fs.existsSync(pre) ? pre : path.join(DIST, 'index.html'));
    });
    console.log(`[static] serving SPA from ${DIST}`);
  } else {
    console.warn('[static] SERVE_STATIC=true but dist/ not found — run `npm run build` first.');
  }
}

app.listen(PORT, () => {
  console.log(`digifunzi-landing API on http://localhost:${PORT}`);
  console.log(`  CORS origins: ${ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS.join(', ') : '(none set — browsers will be blocked; set PUBLIC_SITE_URL)'}`);
  console.log(`  /admin: ${process.env.ADMIN_PASSWORD ? 'enabled' : 'DISABLED (set ADMIN_PASSWORD to enable)'}`);
});
