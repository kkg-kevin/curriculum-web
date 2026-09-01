/**
 * In-code mock for the /api/public/* contract (spec §4).
 * Active when VITE_USE_MOCK=true. Returns fixture data with a small simulated
 * latency so loading states are exercised in dev.
 *
 * Wired into the axios instance as an adapter in src/services/api.js.
 */
import { bootcamps, bootcampDetail } from './fixtures/bootcamps.js';
import { projects, projectDetail } from './fixtures/projects.js';

// Simulated latency so dev exercises loading states; disabled under test.
const IS_TEST =
  typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST);
const LATENCY_MS = IS_TEST ? 0 : 350;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function ok(data, config) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  };
}

function fail(status, message, config) {
  const err = new Error(message);
  err.response = { data: { message }, status, statusText: message, headers: {}, config };
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

  // ---- POST /api/public/leads ----
  if (method === 'post' && path === '/api/public/leads') {
    const body = safeParse(config.data);
    // Mimic the server's minimal validation.
    if (!body?.parentEmail || !body?.parentName) {
      return fail(422, 'parentName and parentEmail are required', config);
    }
    console.info('[mockApi] lead captured:', body);
    return ok({ ok: true, message: 'Thanks! Our team will be in touch shortly.' }, config);
  }

  // ---- POST /api/public/contact ----
  if (method === 'post' && path === '/api/public/contact') {
    const body = safeParse(config.data);
    if (!body?.email || !body?.message) {
      return fail(422, 'email and message are required', config);
    }
    console.info('[mockApi] contact message:', body);
    return ok({ ok: true, message: 'Message received. We usually reply within one working day.' }, config);
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
