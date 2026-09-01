import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/** GET /api/public/bootcamps (spec §4.1) */
export function useBootcamps() {
  return useQuery({
    queryKey: ['bootcamps'],
    queryFn: publicApi.listBootcamps,
    staleTime: 5 * 60 * 1000,
  });
}

/** GET /api/public/bootcamps/:slug */
export function useBootcamp(slug) {
  return useQuery({
    queryKey: ['bootcamp', slug],
    queryFn: () => publicApi.getBootcamp(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
