import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * The enrolment flow's "Type" picker reads the designated curriculum admin's ACTIVE,
 * NON-SCHOOL learning hubs (co-working space / innovation lab / makerspace / tech club) and
 * their operational schedule.
 *
 *   useHubTypes()      -> [{ type, label, hubCount }]
 *   useHubsByType(type) -> [{ id, name, hubType, hubTypeLabel, town,
 *                            schedule: { opensAt, closesAt, days[] } }]
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
