import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The Bootcamps section (`/bootcamps`) reads `GET /api/public/bootcamps` — the designated
 * admin's Bootcamp module listings flipped `saleStatus: "for_sale"`. Shape per item:
 *   { id, slug, name, tagline, format, duration, ageMin, ageMax, coverImage, price, priceNotes,
 *     highlightCount }
 * `price` is null when the bootcamp is priced by course instead of as a whole (see
 * CreateBootcampPage.jsx's pricing-mode toggle) — priceNotes applies either way. The detail
 * endpoint adds description (plain text), highlights[], coursePricing[], upcomingRuns[]
 * ({ hubName, startDate, endDate, status }), curriculum, and pathwayDiagnostics[]
 * ({ pathwayId, pathwaySlug, pathwayName, pathwayColor }) — the bootcamp's pathways that
 * currently offer a public diagnostic (see server's resolvePathwayDiagnostics; empty when none
 * are assigned or offerable right now).
 *
 * Defence-in-depth: a misconfigured backend could in theory return odd rows — drop anything
 * with no slug, de-dupe by slug, stable-sort by name so card order doesn't jump between fetches.
 */
function normalise(list) {
  if (!Array.isArray(list)) return [];
  const bySlug = new Map();
  for (const b of list) {
    if (!b?.slug || !b?.name) continue;
    if (!bySlug.has(b.slug)) bySlug.set(b.slug, b);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** GET /api/public/bootcamps — the for-sale bootcamps listing. */
export function usePublicBootcamps() {
  return useQuery({
    queryKey: ['public-bootcamps'],
    queryFn: publicApi.listBootcamps,
    staleTime: 5 * 60 * 1000,
    select: normalise,
  });
}

/** GET /api/public/bootcamps/:slug */
export function usePublicBootcamp(slug) {
  return useQuery({
    queryKey: ['public-bootcamp', slug],
    queryFn: () => publicApi.getBootcamp(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
