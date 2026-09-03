import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/** GET /api/public/pathways — the Learning Pathways listing. */
export function usePathways() {
  return useQuery({
    queryKey: ['pathways'],
    queryFn: publicApi.listPathways,
    staleTime: 5 * 60 * 1000,
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
