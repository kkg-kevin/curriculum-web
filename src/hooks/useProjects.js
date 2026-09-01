import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/api.js';

/** GET /api/public/projects (spec §4.2) */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: publicApi.listProjects,
    staleTime: 5 * 60 * 1000,
  });
}

/** GET /api/public/projects/:slug */
export function useProject(slug) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => publicApi.getProject(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => err?.status !== 404 && count < 2,
  });
}
