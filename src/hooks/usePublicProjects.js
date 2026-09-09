import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The Projects section (`/projects`) reads `GET /api/public/projects` — the designated
 * curriculum admin's `type: "project"` assessments that were flipped "For sale" in the
 * Assessment Builder. Shape per item:
 *   { id, slug, name, tagline, level, ageMin, ageMax, coverImage, price, deliverableCount,
 *     milestoneCount }
 * The detail endpoint adds description/overview (plain text), deliverables[], milestones[],
 * requirements[].
 *
 * Defence-in-depth: a misconfigured backend could in theory return odd rows — drop anything
 * with no slug, de-dupe by slug, stable-sort by name so card order doesn't jump between fetches.
 */
function normalise(list) {
  if (!Array.isArray(list)) return [];
  const bySlug = new Map();
  for (const p of list) {
    if (!p?.slug || !p?.name) continue;
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** GET /api/public/projects — the for-sale projects listing. */
export function usePublicProjects() {
  return useQuery({
    queryKey: ['public-projects'],
    queryFn: publicApi.listProjects,
    staleTime: 5 * 60 * 1000,
    select: normalise,
  });
}

/** GET /api/public/projects/:slug */
export function usePublicProject(slug) {
  return useQuery({
    queryKey: ['public-project', slug],
    queryFn: () => publicApi.getProject(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
