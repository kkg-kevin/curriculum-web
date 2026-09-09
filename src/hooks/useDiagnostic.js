import { useMutation, useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * GET /api/public/diagnostics/:slug/availability — `{ diagnosticAvailable, minAge, maxAge }`.
 * A fallback for the pathway-detail CTA when the detail response doesn't already embed a
 * `diagnostic` object (newer backends do). Never errors (WEBSITE_INTEGRATION_CONTRACT.md §3.8) —
 * an unknown pathway or one with no public diagnostic both just resolve to unavailable.
 *
 * `options.enabled` lets the caller skip this call entirely (e.g. the detail response already
 * carried the diagnostic info).
 */
export function useDiagnosticAvailability(slug, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['diagnostic-availability', slug],
    queryFn: () => publicApi.getDiagnosticAvailability(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * GET /api/public/diagnostics/:slug?age= — the question set for that age.
 * Only enabled once an age has been entered; a 404 means no diagnostic is
 * offerable for that pathway/age combination right now.
 */
export function useDiagnostic(slug, age) {
  return useQuery({
    queryKey: ['diagnostic', slug, age],
    queryFn: () => publicApi.getDiagnostic(slug, age),
    enabled: Boolean(slug) && Number.isFinite(age),
    staleTime: 0,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}

/** POST /api/public/diagnostics/:slug/submit — grades synchronously, returns the report. */
export function useSubmitDiagnostic(slug) {
  return useMutation({
    mutationFn: (payload) => publicApi.submitDiagnostic(slug, payload),
  });
}

/**
 * GET /api/public/diagnostics/attempts/:attemptId — the permanent shareable report.
 * Drives the standalone /pathways/:slug/diagnostic/report/:attemptId page. A 404 (unknown
 * id) is terminal — don't retry it.
 */
export function useDiagnosticReport(attemptId) {
  return useQuery({
    queryKey: ['diagnostic-report', attemptId],
    queryFn: () => publicApi.getDiagnosticReport(attemptId),
    enabled: Boolean(attemptId),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
