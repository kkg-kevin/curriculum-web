import { describe, it, expect } from 'vitest';
import { slugify } from './slugify.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Intro to Robotics')).toBe('intro-to-robotics');
  });

  it('strips punctuation and collapses separators', () => {
    expect(slugify('AI & Coding: Accelerator!!')).toBe('ai-coding-accelerator');
  });

  it('trims leading/trailing separators', () => {
    expect(slugify('  --Hello--  ')).toBe('hello');
  });

  it('handles empty / nullish input', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify(undefined)).toBe('');
  });

  it('is idempotent', () => {
    const once = slugify('Creative Electronics Camp');
    expect(slugify(once)).toBe(once);
  });
});
