import { useMutation, useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * Estate Tech Club packages — GET /api/public/clubs/packages: the packages the team publishes from
 * the curriculum system's Billing → Packages → Tech Clubs. Same shape as the Home Schooling
 * packages (see usePublicHomeLearning.js), plus where each is offered:
 *   { ...package, hubIds: string[], allClubs: boolean }
 * already sorted in the order the team set.
 *
 * Defence-in-depth: drop rows with no slug/name or no price, de-dupe by slug (keeping the API's
 * order).
 */
function normalise(list) {
  if (!Array.isArray(list)) return [];
  const bySlug = new Map();
  for (const pkg of list) {
    if (!pkg?.slug || !pkg?.name || !Number.isFinite(Number(pkg.monthlyAmount))) continue;
    if (!bySlug.has(pkg.slug)) {
      bySlug.set(pkg.slug, {
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : [],
        hubIds: Array.isArray(pkg.hubIds) ? pkg.hubIds : [],
        allClubs: Boolean(pkg.allClubs),
      });
    }
  }
  return [...bySlug.values()];
}

/** Every published club package (for all clubs). */
export function useClubPackages() {
  return useQuery({
    queryKey: ['public-club-packages'],
    queryFn: publicApi.listClubPackages,
    staleTime: 5 * 60 * 1000,
    select: normalise,
  });
}

/** The packages offered at one club (by hub id). */
export function packagesForClub(packages, hubId) {
  if (!hubId) return [];
  return (packages || []).filter((pkg) => pkg.allClubs || pkg.hubIds.includes(hubId));
}

/** POST /api/public/clubs/signups — a family joins a club (see ClubSignupForm). */
export function useClubSignup() {
  return useMutation({ mutationFn: (payload) => publicApi.submitClubSignup(payload) });
}
