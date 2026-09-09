import { describe, it, expect } from 'vitest';
import { dedupePathways } from './usePathways.js';

describe('dedupePathways', () => {
  it('collapses duplicate slugs, keeping the entry with the most courses', () => {
    const out = dedupePathways([
      { slug: 'robotics', name: 'Robotics', courseCount: 0 },
      { slug: 'robotics', name: 'Robotics', courseCount: 4 },
      { slug: 'data-ai', name: 'Data & AI', courseCount: 3 },
    ]);
    expect(out).toHaveLength(2);
    expect(out.find((p) => p.slug === 'robotics').courseCount).toBe(4);
  });

  it('drops entries with no resolvable courses (stubs / detail routes that 404)', () => {
    const out = dedupePathways([
      { slug: 'empty', name: 'Empty', courseCount: 0 },
      { slug: 'real', name: 'Real', courseCount: 2 },
    ]);
    expect(out.map((p) => p.slug)).toEqual(['real']);
  });

  it('sorts by name for stable card order', () => {
    const out = dedupePathways([
      { slug: 'z', name: 'Zeta', courseCount: 1 },
      { slug: 'a', name: 'Alpha', courseCount: 1 },
    ]);
    expect(out.map((p) => p.name)).toEqual(['Alpha', 'Zeta']);
  });

  it('is null/shape safe', () => {
    expect(dedupePathways(null)).toEqual([]);
    expect(dedupePathways(undefined)).toEqual([]);
    expect(dedupePathways([{ name: 'no slug', courseCount: 3 }])).toEqual([]);
  });
});
