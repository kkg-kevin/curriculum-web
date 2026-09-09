import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The Store section (`/store`) reads `GET /api/public/store` — the designated curriculum
 * admin's shared `inventory` items flipped "For sale" in the portal's Inventory panel. Shape
 * per item:
 *   { id, slug, name, tagline, storeCategory, badge, stockStatus, image, price, highlightCount }
 * where price is { amount, currency, unit, note, compareAt } or null.
 * The detail endpoint adds description, highlights[], includes[], specs[], gallery[].
 *
 * Defence-in-depth: drop rows with no slug/name, de-dupe by slug, stable-sort by name so card
 * order doesn't jump between fetches.
 */
function normalise(list) {
  if (!Array.isArray(list)) return [];
  const bySlug = new Map();
  for (const it of list) {
    if (!it?.slug || !it?.name) continue;
    if (!bySlug.has(it.slug)) bySlug.set(it.slug, it);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** GET /api/public/store — the for-sale inventory items. */
export function usePublicStore() {
  return useQuery({
    queryKey: ['public-store'],
    queryFn: publicApi.listStoreItems,
    staleTime: 5 * 60 * 1000,
    select: normalise,
  });
}

/** GET /api/public/store/:slug */
export function usePublicStoreItem(slug) {
  return useQuery({
    queryKey: ['public-store-item', slug],
    queryFn: () => publicApi.getStoreItem(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
