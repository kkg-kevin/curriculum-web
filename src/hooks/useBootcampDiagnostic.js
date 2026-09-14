import { useMutation, useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The Bootcamp counterpart to useDiagnostic.js (Pathways) — same feature, scoped to a Bootcamp.
 * See that file's own comments for the per-hook reasoning; identical here except for which
 * publicApi methods/query keys are used.
 */

/** GET /api/public/bootcamp-diagnostics/:slug/availability — never errors. */
export function useBootcampDiagnosticAvailability(slug, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['bootcamp-diagnostic-availability', slug],
    queryFn: () => publicApi.getBootcampDiagnosticAvailability(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** GET /api/public/bootcamp-diagnostics/:slug?age= — the question set for that age. */
export function useBootcampDiagnostic(slug, age) {
  return useQuery({
    queryKey: ['bootcamp-diagnostic', slug, age],
    queryFn: () => publicApi.getBootcampDiagnostic(slug, age),
    enabled: Boolean(slug) && Number.isFinite(age),
    staleTime: 0,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}

/** POST /api/public/bootcamp-diagnostics/:slug/submit — grades synchronously, returns the report. */
export function useSubmitBootcampDiagnostic(slug) {
  return useMutation({
    mutationFn: (payload) => publicApi.submitBootcampDiagnostic(slug, payload),
  });
}

/** GET /api/public/bootcamp-diagnostics/attempts/:attemptId — the permanent shareable report. */
export function useBootcampDiagnosticReport(attemptId) {
  return useQuery({
    queryKey: ['bootcamp-diagnostic-report', attemptId],
    queryFn: () => publicApi.getBootcampDiagnosticReport(attemptId),
    enabled: Boolean(attemptId),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
