import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/**
 * Locations (25 Nov 2026): the website's hubs grouped by town, each with the bootcamps and pathways
 * running there (GET /api/public/locations[/:slug]).
 *   town: { slug, town, county, online, places: [hub…], bootcamps: […], pathways: […] }
 */
export function useLocations() {
  return useQuery({
    queryKey: ['public-locations'],
    queryFn: publicApi.listLocations,
    staleTime: 5 * 60 * 1000,
    select: (list) => (Array.isArray(list) ? list : []),
  });
}

export function useLocation(slug) {
  return useQuery({
    queryKey: ['public-location', slug],
    queryFn: () => publicApi.getLocation(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });
}
