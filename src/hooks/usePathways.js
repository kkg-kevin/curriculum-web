import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * Defence-in-depth for the pathways list. The curriculum system is multi-tenant;
 * `GET /api/public/pathways` is meant to return one designated admin's catalogue,
 * but a misconfigured backend (PUBLIC_CONTENT_ADMIN_ID unset / pointed at the
 * wrong tenant) has in the past leaked several admins' templates at once —
 * duplicate names on the same computed slug, half of them with `courseCount: 0`
 * stubs. This normaliser keeps the UI sane regardless:
 *   - drop entries with no resolvable courses (a stub, or a detail route that 404s)
 *   - collapse duplicate slugs, keeping the one with the most courses
 *   - stable sort by name so card order doesn't jump between fetches
 */
export function dedupePathways(list) {
  if (!Array.isArray(list)) return [];
  const bySlug = new Map();
  for (const p of list) {
    if (!p?.slug || !(p.courseCount > 0)) continue;
    const seen = bySlug.get(p.slug);
    if (!seen || (p.courseCount || 0) > (seen.courseCount || 0)) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** GET /api/public/pathways — the Learning Pathways listing. */
export function usePathways() {
  return useQuery({
    queryKey: ['pathways'],
    queryFn: publicApi.listPathways,
    staleTime: 5 * 60 * 1000,
    select: dedupePathways,
  });
}

/** GET /api/public/pathways/:slug */
export function usePathway(slug) {
  return useQuery({
    queryKey: ['pathway', slug],
    queryFn: () => publicApi.getPathway(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
