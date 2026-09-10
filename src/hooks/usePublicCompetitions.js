import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The Competitions section (`/competitions`) reads `GET /api/public/competitions` — the
 * designated admin's `competitions` records flipped "Show on the website" with status
 * Open/Closed (WEBSITE_INTEGRATION_CONTRACT.md §3.13). List item shape:
 *   { id, slug, name, edition, level, format, cadence, startDate, endDate, coverImage,
 *     status, trackCount }
 * The detail endpoint adds `description` (plain text) and `tracks[]`, each:
 *   { id, name, subtitle, description, highlights[], registerUrl, knowMoreUrl }
 *
 * Defence-in-depth: drop anything with no slug/name, de-dupe by slug, stable-sort by name.
 */
function normalise(list) {
  if (!Array.isArray(list)) return [];
  const bySlug = new Map();
  for (const c of list) {
    if (!c?.slug || !c?.name) continue;
    if (!bySlug.has(c.slug)) bySlug.set(c.slug, c);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** GET /api/public/competitions — the public competitions listing. */
export function usePublicCompetitions() {
  return useQuery({
    queryKey: ['public-competitions'],
    queryFn: publicApi.listCompetitions,
    staleTime: 5 * 60 * 1000,
    select: normalise,
  });
}

/** GET /api/public/competitions/:idOrSlug */
export function usePublicCompetition(idOrSlug) {
  return useQuery({
    queryKey: ['public-competition', idOrSlug],
    queryFn: () => publicApi.getCompetition(idOrSlug),
    enabled: Boolean(idOrSlug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
