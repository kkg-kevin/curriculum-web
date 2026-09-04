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
      'form submissions not stored. Run the real API (npm run api) and set ' +
      'VITE_USE_MOCK=false. See SYSTEM_INTEGRATION.md.',
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
  listBootcamps: () => api.get('/api/public/bootcamps').then((r) => r.data),
  getBootcamp: (slug) => api.get(`/api/public/bootcamps/${encodeURIComponent(slug)}`).then((r) => r.data),

  listProjects: () => api.get('/api/public/projects').then((r) => r.data),
  getProject: (slug) => api.get(`/api/public/projects/${encodeURIComponent(slug)}`).then((r) => r.data),

  listPathways: () => api.get('/api/public/pathways').then((r) => r.data),
  getPathway: (slug) => api.get(`/api/public/pathways/${encodeURIComponent(slug)}`).then((r) => r.data),

  /** Enroll + Contact share this endpoint, differentiated by `interestedIn` (spec §4.5). */
  submitLead: (payload) => api.post('/api/public/leads', payload).then((r) => r.data),

  /** Optional simpler general-inquiry variant (spec §4.5). */
  submitContact: (payload) => api.post('/api/public/contact', payload).then((r) => r.data),
};
