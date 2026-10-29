import { useMemo } from 'react';
import { usePublicStore } from './usePublicStore.js';
import { usePublicProjects } from './usePublicProjects.js';

/**
 * Everything the Store sells, in one list: the goods (GET /api/public/store) and the guided build
 * projects (GET /api/public/projects). Each entry:
 *   { key, kind: 'store_item' | 'project', category, slug, name, tagline, price, data }
 * where `category` is a good's storeCategory (kit | bundle | accessory) or 'projects', and `data`
 * is the row as its card wants it.
 *
 * One section failing doesn't empty the Store — the other still shows; `isError` is only set when
 * nothing could be loaded at all.
 */
export function useStoreCatalog() {
  const store = usePublicStore();
  const projects = usePublicProjects();

  const entries = useMemo(() => [
    ...(store.data || []).map((it) => ({
      key: `store_item:${it.slug}`, kind: 'store_item', category: it.storeCategory || 'other',
      slug: it.slug, name: it.name, tagline: it.tagline || '', price: it.price, data: it,
    })),
    ...(projects.data || []).map((p) => ({
      key: `project:${p.slug}`, kind: 'project', category: 'projects',
      slug: p.slug, name: p.name, tagline: p.tagline || '', price: p.price, data: p,
    })),
  ], [store.data, projects.data]);

  return {
    entries,
    isLoading: store.isLoading || projects.isLoading,
    isError: store.isError && projects.isError,
    error: store.error || projects.error,
    refetch: () => { store.refetch(); projects.refetch(); },
  };
}
