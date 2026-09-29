import { useMutation, useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The Home Schooling page (`/home-schooling`) reads `GET /api/public/home-learning/packages` —
 * the packages the team publishes from the curriculum system's Home Learning → Packages. Shape:
 *   { id, slug, name, summary, description, childrenIncluded, monthlyAmount, currency,
 *     allowExtraChildren, extraChildAmount, maxChildren, features[], badge }
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
    if (!bySlug.has(pkg.slug)) bySlug.set(pkg.slug, { ...pkg, features: Array.isArray(pkg.features) ? pkg.features : [] });
  }
  return [...bySlug.values()];
}

/** GET /api/public/home-learning/packages — the published packages. */
export function usePublicHomeLearningPackages() {
  return useQuery({
    queryKey: ['public-home-learning-packages'],
    queryFn: publicApi.listHomeLearningPackages,
    staleTime: 5 * 60 * 1000,
    select: normalise,
  });
}

/** GET /api/public/home-learning/packages/:slug — one package (the enquiry form's ?package=). */
export function usePublicHomeLearningPackage(slug) {
  return useQuery({
    queryKey: ['public-home-learning-package', slug],
    queryFn: () => publicApi.getHomeLearningPackage(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}

/** POST /api/public/home-learning/signups — the family's self sign-up (see HomeSchoolingSignupForm). */
export function useHomeLearningSignup() {
  return useMutation({ mutationFn: (payload) => publicApi.submitHomeLearningSignup(payload) });
}
