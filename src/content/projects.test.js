import { describe, it, expect } from 'vitest';
import {
  projects,
  getProject,
  projectsByLevel,
  activeProjectLevels,
  PROJECT_LEVELS,
} from './projects.js';

const LEVEL_KEYS = PROJECT_LEVELS.map((l) => l.key).filter((k) => k !== 'all');

describe('projects catalogue', () => {
  it('every project has the fields the Projects pages read', () => {
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(typeof p.name).toBe('string');
      expect(p.kind).toBe('project');
      expect(p.nature).toBe('digital');
      expect(LEVEL_KEYS).toContain(p.level);
      expect(typeof p.track).toBe('string');
      expect(typeof p.summary).toBe('string');
      expect(typeof p.price.amount).toBe('number');
      expect(Array.isArray(p.highlights)).toBe(true);
      expect(Array.isArray(p.faqs)).toBe(true);
    }
  });

  it('slugs are unique', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('getProject resolves a known slug and returns null otherwise', () => {
    expect(getProject('line-following-robot-project')?.name).toBe('Line-Following Robot');
    expect(getProject('nope')).toBeNull();
  });

  it('projectsByLevel filters; "all" returns everything', () => {
    expect(projectsByLevel('all')).toHaveLength(projects.length);
    const beginner = projectsByLevel('beginner');
    expect(beginner.every((p) => p.level === 'beginner')).toBe(true);
  });

  it('activeProjectLevels only lists levels that have a project', () => {
    const active = activeProjectLevels();
    expect(active[0].key).toBe('all');
    for (const l of active) {
      if (l.key === 'all') continue;
      expect(projects.some((p) => p.level === l.key)).toBe(true);
    }
  });
});
