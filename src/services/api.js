/**
 * Single axios instance for the public API. Mirrors client/src/services/api.js's
 * pattern (one instance, base URL from env) but carries NO auth — this site never
 * receives a JWT (spec §2, §8).
 *
 * While VITE_USE_MOCK=true, requests are served from src/mocks/ instead of the
 * network, via a custom axios adapter.
 */
import axios from 'axios';
import { API_URL, USE_MOCK } from '../config/env.js';
import { mockAdapter } from '../mocks/mockApi.js';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

if (USE_MOCK) {
  api.defaults.adapter = mockAdapter;
  console.info(
    '[api] OFFLINE MODE (VITE_USE_MOCK=true) — data from src/mocks/ fixtures, ' +
      'form submissions not stored. Point VITE_API_URL at the curriculum system\'s ' +
      'backend and set VITE_USE_MOCK=false to use live data. See SYSTEM_INTEGRATION.md.',
  );
}

/**
 * Normalise errors so UI code has one shape to handle.
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject({ status, message, raw: error });
  },
);

export default api;

// ---- Public API surface (spec §4) --------------------------------------------

export const publicApi = {
  listPathways: () => api.get('/api/public/pathways').then((r) => r.data),
  getPathway: (slug) => api.get(`/api/public/pathways/${encodeURIComponent(slug)}`).then((r) => r.data),

  // Projects = the designated admin's `type: "project"` assessments marked "For sale" in the
  // Assessment Builder (WEBSITE_INTEGRATION_CONTRACT.md §3.3/§3.4). Not the old bootcamp/project
  // catalog (removed 4 Sep 2026) — a different, deliberate feature.
  listProjects: () => api.get('/api/public/projects').then((r) => r.data),
  getProject: (slug) => api.get(`/api/public/projects/${encodeURIComponent(slug)}`).then((r) => r.data),

  // Store = the designated admin's shared `inventory` items flipped "For sale" in the portal's
  // Inventory panel (WEBSITE_INTEGRATION_CONTRACT.md §3.5/§3.6). Physical goods — the Quarky
  // robot, kits, accessories.
  listStoreItems: () => api.get('/api/public/store').then((r) => r.data),
  getStoreItem: (slug) => api.get(`/api/public/store/${encodeURIComponent(slug)}`).then((r) => r.data),

  // Bootcamps = the designated admin's Program curricula (short-run cohorts) flipped "List on
  // the website" in the portal's Program view (WEBSITE_INTEGRATION_CONTRACT.md §3.1/§3.2).
  // Reintroduced 10 Sep 2026 as a for-sale flag on the existing Program concept — not the old
  // `public_bootcamps` marketing table removed 4 Sep 2026.
  listBootcamps: () => api.get('/api/public/bootcamps').then((r) => r.data),
  getBootcamp: (slug) => api.get(`/api/public/bootcamps/${encodeURIComponent(slug)}`).then((r) => r.data),

  /** Enroll + Contact share this endpoint, differentiated by `interestedIn` (spec §4.5). */
  submitLead: (payload) => api.post('/api/public/leads', payload).then((r) => r.data),

  /** Optional simpler general-inquiry variant (spec §4.5). */
  submitContact: (payload) => api.post('/api/public/contact', payload).then((r) => r.data),

  // ---- Public diagnostics (WEBSITE_INTEGRATION_CONTRACT.md §3.8, §4.3) ----------

  /** GET /api/public/diagnostics/:pathwayIdOrSlug/availability — never errors. */
  getDiagnosticAvailability: (pathwayIdOrSlug) =>
    api
      .get(`/api/public/diagnostics/${encodeURIComponent(pathwayIdOrSlug)}/availability`)
      .then((r) => r.data),

  /** GET /api/public/diagnostics/:pathwayIdOrSlug?age= — question set for that age. */
  getDiagnostic: (pathwayIdOrSlug, age) =>
    api
      .get(`/api/public/diagnostics/${encodeURIComponent(pathwayIdOrSlug)}`, { params: { age } })
      .then((r) => r.data),

  /**
   * GET /api/public/diagnostics/attempts/:attemptId — the permanent, shareable graded report.
   * `attemptId` is the opaque uuid the submit response returned. 404 for an unknown id.
   */
  getDiagnosticReport: (attemptId) =>
    api
      .get(`/api/public/diagnostics/attempts/${encodeURIComponent(attemptId)}`)
      .then((r) => r.data),

  /**
   * POST /api/public/diagnostics/:pathwayIdOrSlug/submit — grades synchronously and returns the
   * report (+ a permanent `attemptId`). Body is just `{ answers, childName?, childAge }` — no
   * contact info; no lead is created here.
   */
  submitDiagnostic: (pathwayIdOrSlug, payload) =>
    api
      .post(`/api/public/diagnostics/${encodeURIComponent(pathwayIdOrSlug)}/submit`, payload)
      .then((r) => r.data),
};
