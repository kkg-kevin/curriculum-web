import { describe, it, expect } from 'vitest';
import {
  storeItems,
  getStoreItem,
  storeItemsByCategory,
  activeStoreCategories,
  STORE_CATEGORIES,
} from './store.js';
import { getProject } from './projects.js';

const CATEGORY_KEYS = STORE_CATEGORIES.map((c) => c.key).filter((k) => k !== 'all');

describe('store catalogue (physical goods)', () => {
  it('every item has the fields the catalogue pages read', () => {
    expect(storeItems.length).toBeGreaterThan(0);
    for (const item of storeItems) {
      expect(item.slug).toMatch(/^[a-z0-9-]+$/);
      expect(typeof item.name).toBe('string');
      expect(CATEGORY_KEYS).toContain(item.kind);
      expect(['physical', 'digital']).toContain(item.nature);
      expect(['available', 'preorder', 'coming-soon']).toContain(item.status);
      expect(typeof item.summary).toBe('string');
      expect(typeof item.price.amount).toBe('number');
      expect(Array.isArray(item.highlights)).toBe(true);
    }
  });

  it('contains NO project-kind items (projects are their own section)', () => {
    expect(storeItems.some((i) => i.kind === 'project')).toBe(false);
  });

  it('slugs are unique', () => {
    const slugs = storeItems.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('keeps Quarky reachable at its known slug', () => {
    expect(getStoreItem('quarky')?.name).toBe('Quarky');
  });

  it('getStoreItem returns null for an unknown slug', () => {
    expect(getStoreItem('does-not-exist')).toBeNull();
  });

  it('a bundle references only real project slugs', () => {
    for (const item of storeItems) {
      for (const slug of item.bundledProjects || []) {
        expect(getProject(slug), `bundledProjects slug "${slug}"`).not.toBeNull();
      }
    }
  });

  it('storeItemsByCategory("all") returns everything; a category returns a subset', () => {
    expect(storeItemsByCategory('all')).toHaveLength(storeItems.length);
    const kits = storeItemsByCategory('kit');
    expect(kits.length).toBeGreaterThan(0);
    expect(kits.every((i) => i.kind === 'kit')).toBe(true);
  });

  it('activeStoreCategories only lists categories that have items', () => {
    const active = activeStoreCategories();
    expect(active[0].key).toBe('all');
    for (const c of active) {
      if (c.key === 'all') continue;
      expect(storeItems.some((i) => i.kind === c.key)).toBe(true);
    }
  });
});
