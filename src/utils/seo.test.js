import { describe, it, expect } from 'vitest';
import { pageUrl, metaDescription, pageDescription, titleWithKind } from './seo.js';
import { SITE_URL } from '../config/env.js';

describe('pageUrl', () => {
  it('keeps the root as a bare slash', () => {
    expect(pageUrl('/')).toBe(`${SITE_URL}/`);
    expect(pageUrl('')).toBe(`${SITE_URL}/`);
  });

  it('always ends a page path with exactly one slash (the form the host serves)', () => {
    expect(pageUrl('/pathways')).toBe(`${SITE_URL}/pathways/`);
    expect(pageUrl('/pathways/')).toBe(`${SITE_URL}/pathways/`);
    expect(pageUrl('/store/quarky//')).toBe(`${SITE_URL}/store/quarky/`);
  });

  it('drops query strings and hashes', () => {
    expect(pageUrl('/enroll?interestedIn=bootcamp#top')).toBe(`${SITE_URL}/enroll/`);
  });

  it('passes absolute URLs through', () => {
    expect(pageUrl('https://example.com/x')).toBe('https://example.com/x');
  });
});

describe('metaDescription', () => {
  it('collapses whitespace and leaves short text alone', () => {
    expect(metaDescription('  Build   a robot.\n In a week. ')).toBe('Build a robot. In a week.');
  });

  it('returns empty for empty input so callers can fall back', () => {
    expect(metaDescription('')).toBe('');
    expect(metaDescription(null)).toBe('');
  });

  it('cuts long text at a word boundary with an ellipsis, within ~155 chars', () => {
    const long = 'Learners design, build and program a robot that sorts waste by colour, '.repeat(4);
    const out = metaDescription(long);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith('…')).toBe(true);
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
    expect(out.slice(0, -1)).not.toMatch(/[\s,]$/);
  });
});

describe('titleWithKind', () => {
  it('appends the kind', () => {
    expect(titleWithKind('Codeavour 8.0', 'Competition')).toBe('Codeavour 8.0 (Competition)');
  });

  it("doesn't repeat a kind the name already states", () => {
    expect(titleWithKind('Digifunzi Holiday Bootcamp', 'Bootcamp')).toBe('Digifunzi Holiday Bootcamp');
  });
});

describe('pageDescription', () => {
  it('keeps a long enough description as it is', () => {
    const long = 'Kids build and code a working robot over five days, then show it to their families at the end of the week on stage.';
    expect(pageDescription(long, 'About sentence.')).toBe(long);
  });
  it('fills a short tagline out with the description, then the page sentence', () => {
    expect(pageDescription(['Build a robot.', 'Five days of coding.'], 'A Digifunzi bootcamp for kids in Kenya.'))
      .toBe('Build a robot. Five days of coding. A Digifunzi bootcamp for kids in Kenya.');
  });
  it('adds a full stop between parts and skips a part already there', () => {
    expect(pageDescription(['Build a robot', 'Build a robot'], 'More.')).toBe('Build a robot. More.');
  });
  it('trims the result like any description', () => {
    const out = pageDescription('Short.', 'x '.repeat(120));
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith('…')).toBe(true);
  });
  it('returns an empty string when there is nothing', () => {
    expect(pageDescription(null, undefined, '')).toBe('');
  });
});
