/**
 * In-code mock for the /api/public/* contract.
 *
 * Active only when VITE_USE_MOCK=true — a fully-offline fallback with no API.
 * The normal standalone setup is the real server/ API (see SYSTEM_INTEGRATION.md
 * and README "Standalone mode"); this mock mirrors its shapes so tests and the
 * offline mode stay honest.
 *
 * Wired into the axios instance as an adapter in src/services/api.js.
 */
import { bootcamps, bootcampDetail } from './fixtures/bootcamps.js';
import { projects, projectDetail } from './fixtures/projects.js';
import { pathways, pathwayDetail } from './fixtures/pathways.js';
import {
  diagnosticAvailability,
  diagnosticQuestionSet,
  gradeDiagnostic,
  diagnosticAttemptReport,
} from './fixtures/diagnostics.js';

// Simulated latency so dev exercises loading states; disabled under test.
const IS_TEST =
  typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST);
const LATENCY_MS = IS_TEST ? 0 : 350;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function ok(data, config, status = 200) {
  return {
    data,
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    headers: {},
    config,
    request: {},
  };
}

function fail(status, message, config) {
  const err = new Error(message);
  // GET 404s return { message }; POST 400s return the admin API's Zod error
  // envelope { success:false, message, errors } (SYSTEM_INTEGRATION.md §3.1).
  const data = status === 400 ? { success: false, message, errors: [] } : { message };
  err.response = { data, status, statusText: message, headers: {}, config };
  err.config = config;
  err.isAxiosError = true;
  return Promise.reject(err);
}

/**
 * Axios adapter signature: (config) => Promise<AxiosResponse>.
 * We only need to match the handful of routes the site calls.
 */
export async function mockAdapter(config) {
  await delay(LATENCY_MS);

  const method = (config.method || 'get').toLowerCase();
  // In the adapter, config.url is the request path and config.baseURL is separate.
  // Join them the way axios would, then reduce to the /api/public/... path.
  const rawUrl = /^https?:\/\//i.test(config.url || '')
    ? config.url
    : `${(config.baseURL || '').replace(/\/$/, '')}/${(config.url || '').replace(/^\//, '')}`;
  const url = new URL(rawUrl, 'http://mock.local');
  const path = url.pathname.replace(/^.*?(\/api\/public\/)/, '$1');
  // axios keeps a GET's query object in config.params rather than serialising it into
  // config.url itself (that only happens on the real network layer) — merge it in here so
  // handlers below can read query params via url.searchParams either way.
  for (const [key, val] of Object.entries(config.params || {})) {
    if (val != null) url.searchParams.set(key, val);
  }

  // ---- GET /api/public/bootcamps ----
  if (method === 'get' && path === '/api/public/bootcamps') {
    return ok(bootcamps, config);
  }

  // ---- GET /api/public/bootcamps/:idOrSlug ----
  let m = path.match(/^\/api\/public\/bootcamps\/([^/]+)$/);
  if (method === 'get' && m) {
    const detail = bootcampDetail(decodeURIComponent(m[1]));
    return detail ? ok(detail, config) : fail(404, 'Bootcamp not found', config);
  }

  // ---- GET /api/public/projects ----
  if (method === 'get' && path === '/api/public/projects') {
    return ok(projects, config);
  }

  // ---- GET /api/public/projects/:idOrSlug ----
  m = path.match(/^\/api\/public\/projects\/([^/]+)$/);
  if (method === 'get' && m) {
    const detail = projectDetail(decodeURIComponent(m[1]));
    return detail ? ok(detail, config) : fail(404, 'Project not found', config);
  }

  // ---- GET /api/public/pathways ----
  if (method === 'get' && path === '/api/public/pathways') {
    return ok(pathways, config);
  }

  // ---- GET /api/public/pathways/:idOrSlug ----
  m = path.match(/^\/api\/public\/pathways\/([^/]+)$/);
  if (method === 'get' && m) {
    const detail = pathwayDetail(decodeURIComponent(m[1]));
    return detail ? ok(detail, config) : fail(404, 'Pathway not found', config);
  }

  // ---- POST /api/public/leads ----
  // Mirrors server/lib: 201 + { ok, success, message, data }, 400 on invalid,
  // honeypot (companyWebsite non-empty) → silent fake success, nothing stored.
  if (method === 'post' && path === '/api/public/leads') {
    const body = safeParse(config.data);
    if (body?.companyWebsite?.trim()) {
      return ok({ ok: true, success: true, message: 'Thanks! Our team will be in touch.' }, config, 201);
    }
    if (!body?.parentEmail || !body?.parentName) {
      return fail(400, 'parentName and parentEmail are required', config);
    }
    console.warn(
      '[mockApi] OFFLINE MODE (VITE_USE_MOCK=true) — lead NOT stored, only logged. ' +
        'Run the real API (npm run api) and set VITE_USE_MOCK=false to store it.',
      body,
    );
    return ok(
      {
        ok: true,
        success: true,
        message: 'Thanks! Our team will be in touch to arrange next steps.',
        data: { id: 'mock-lead-0000', ...body, status: 'new', createdAt: new Date().toISOString() },
      },
      config,
      201,
    );
  }

  // ---- POST /api/public/contact ----
  if (method === 'post' && path === '/api/public/contact') {
    const body = safeParse(config.data);
    if (body?.companyWebsite?.trim()) {
      return ok({ ok: true, success: true, message: 'Message received.' }, config, 201);
    }
    if (!body?.email || !body?.message) {
      return fail(400, 'email and message are required', config);
    }
    console.warn(
      '[mockApi] OFFLINE MODE (VITE_USE_MOCK=true) — contact message NOT stored, only logged. ' +
        'Run the real API (npm run api) and set VITE_USE_MOCK=false to store it.',
      body,
    );
    return ok(
      {
        ok: true,
        success: true,
        message: 'Thanks — your message has been received and our team will be in touch.',
        data: { id: 'mock-lead-0001', ...body, status: 'new', createdAt: new Date().toISOString() },
      },
      config,
      201,
    );
  }

  // ---- GET /api/public/diagnostics/attempts/:attemptId ----
  // Before the /:pathwayIdOrSlug patterns so the literal "attempts" segment isn't captured as a slug.
  m = path.match(/^\/api\/public\/diagnostics\/attempts\/([^/]+)$/);
  if (method === 'get' && m) {
    const report = diagnosticAttemptReport(decodeURIComponent(m[1]));
    return report ? ok(report, config) : fail(404, 'Report not found', config);
  }

  // ---- GET /api/public/diagnostics/:pathwayIdOrSlug/availability ----
  m = path.match(/^\/api\/public\/diagnostics\/([^/]+)\/availability$/);
  if (method === 'get' && m) {
    return ok(diagnosticAvailability(decodeURIComponent(m[1])), config);
  }

  // ---- GET /api/public/diagnostics/:pathwayIdOrSlug?age= ----
  m = path.match(/^\/api\/public\/diagnostics\/([^/]+)$/);
  if (method === 'get' && m) {
    const age = url.searchParams.get('age');
    const set = diagnosticQuestionSet(decodeURIComponent(m[1]), age);
    return set ? ok(set, config) : fail(404, 'No public diagnostic available', config);
  }

  // ---- POST /api/public/diagnostics/:pathwayIdOrSlug/submit ----
  // No contact info — just { answers, childName?, childAge }. Grades and returns the report;
  // creates no lead. Enrolment happens separately via POST /api/public/leads.
  m = path.match(/^\/api\/public\/diagnostics\/([^/]+)\/submit$/);
  if (method === 'post' && m) {
    const body = safeParse(config.data);
    if (!body?.childAge) {
      return fail(400, 'childAge is required', config);
    }
    console.warn(
      '[mockApi] OFFLINE MODE (VITE_USE_MOCK=true) — diagnostic attempt NOT stored, only graded ' +
        'client-side against a placeholder answer key. Run the real API and set ' +
        'VITE_USE_MOCK=false for real grading.',
      body,
    );
    return ok(
      { ok: true, success: true, message: "Here's how it went!", data: gradeDiagnostic(body.answers, body) },
      config,
      201,
    );
  }

  return fail(404, `No mock handler for ${method.toUpperCase()} ${path}`, config);
}

function safeParse(data) {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
