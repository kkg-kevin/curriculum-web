import { useQueries, useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The enrolment flow's "Type" picker reads the designated curriculum admin's ACTIVE,
 * NON-SCHOOL learning hubs (co-working space / innovation lab / makerspace / tech club) and
 * their operational schedule.
 *
 *   useHubTypes()      -> [{ type, label, hubCount }]
 *   useHubsByType(type) -> [{ id, name, hubType, hubTypeLabel, deliveryMode, deliveryLabel,
 *                            isVirtual, town, schedule: { opensAt, closesAt, days[] } }]
 *                          (town is "Online" for a virtual hub)
 */

// Mirrors the backend's TYPE_LABELS (public-hub.service.js) — used for the lead note when the
// hubs list isn't on hand.
export const HUB_TYPE_LABELS = {
  co_working_space: 'Co-working space',
  innovation_lab: 'Innovation lab',
  makerspace: 'Makerspace',
  tech_club: 'Tech club',
};

/** GET /api/public/hubs/types — the choosable hub types + a count of active hubs each. */
export function useHubTypes() {
  return useQuery({
    queryKey: ['public-hub-types'],
    queryFn: publicApi.listHubTypes,
    staleTime: 5 * 60 * 1000,
    select: (list) => (Array.isArray(list) ? list : []),
  });
}

/** GET /api/public/hubs?type=<type> — only enabled once a type is chosen. */
export function useHubsByType(type) {
  return useQuery({
    queryKey: ['public-hubs', type || 'all'],
    queryFn: () => publicApi.listHubs(type),
    enabled: Boolean(type),
    staleTime: 5 * 60 * 1000,
    select: (list) => (Array.isArray(list) ? list : []),
  });
}

/**
 * GET /api/public/hubs — every active, non-school hub, any type: the Estate Tech Clubs page
 * (/estate-tech-clubs) and each club's own page, which finds its hub here by name (utils/clubs.js).
 * Same cache entry as useHubsByType with no type.
 */
export function usePublicHubList() {
  return useQuery({
    queryKey: ['public-hubs', 'all'],
    queryFn: () => publicApi.listHubs(),
    staleTime: 5 * 60 * 1000,
    select: (list) => (Array.isArray(list) ? list : []),
  });
}

/**
 * GET /api/public/hubs/:id for several hubs at once — the Estate Tech Clubs cards show each
 * club's photo and address, which only the full profile carries. Shares usePublicHub's cache, so
 * opening a club afterwards is instant. Returns { [id]: profile } for the ones loaded so far.
 */
export function usePublicHubProfiles(ids) {
  return useQueries({
    queries: (ids || []).map((id) => ({
      queryKey: ['public-hub', id],
      queryFn: () => publicApi.getHub(id),
      staleTime: 5 * 60 * 1000,
      retry: (count, err) => err?.status !== 404 && count < 2,
    })),
    combine: (results) =>
      Object.fromEntries((ids || []).map((id, i) => [id, results[i]?.data]).filter(([, profile]) => profile)),
  });
}

/**
 * GET /api/public/hubs/:id — one hub's full profile, for the "Running at" hub detail page
 * (/bootcamps/:slug/hubs/:hubId). A different, richer projection than the two above (see
 * public-bootcamp.service.js's projectHub): description, photo gallery, amenities, operating
 * hours, contact info, and its bookable spaces with capacity/pricing.
 */
export function usePublicHub(id) {
  return useQuery({
    queryKey: ['public-hub', id],
    queryFn: () => publicApi.getHub(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
