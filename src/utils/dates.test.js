import { describe, it, expect } from 'vitest';
import { hasEnded, byUpcomingFirst, ageOn } from './dates.js';

const TODAY = '2026-10-08';

describe('hasEnded', () => {
  it('is true only once the last day is behind us', () => {
    expect(hasEnded('2026-09-30', TODAY)).toBe(true);
    expect(hasEnded('2026-10-08', TODAY)).toBe(false); // still on its last day
    expect(hasEnded('2026-11-30', TODAY)).toBe(false);
  });

  it('treats a missing end date as never ending', () => {
    expect(hasEnded(null, TODAY)).toBe(false);
    expect(hasEnded('', TODAY)).toBe(false);
  });

  it('accepts a full ISO timestamp', () => {
    expect(hasEnded('2026-09-30T21:00:00.000Z', TODAY)).toBe(true);
  });
});

describe('byUpcomingFirst', () => {
  const sorted = (list) => [...list].sort((a, b) => byUpcomingFirst(a, b, TODAY)).map((x) => x.name);

  it('puts what is on or coming first, soonest start first, then what has ended', () => {
    expect(
      sorted([
        { name: 'Ended in Aug', startDate: '2026-08-01', endDate: '2026-08-31' },
        { name: 'December', startDate: '2026-12-08', endDate: '2026-12-12' },
        { name: 'Ended in Sept', startDate: '2026-09-20', endDate: '2026-09-30' },
        { name: 'November', startDate: '2026-11-16', endDate: '2026-12-18' },
      ]),
    ).toEqual(['November', 'December', 'Ended in Sept', 'Ended in Aug']);
  });

  it('puts undated items after dated upcoming ones, by name', () => {
    expect(
      sorted([
        { name: 'B undated' },
        { name: 'A undated' },
        { name: 'Dated', startDate: '2026-11-16', endDate: '2026-12-18' },
      ]),
    ).toEqual(['Dated', 'A undated', 'B undated']);
  });
});

describe('ageOn', () => {
  it('counts whole years, the birthday itself included', () => {
    expect(ageOn('2016-10-22', '2026-10-22')).toBe(10);
    expect(ageOn('2016-10-23', '2026-10-22')).toBe(9);
    expect(ageOn('2016-02-29', '2026-03-01')).toBe(10);
  });
  it('is null for a missing, unreadable or future date', () => {
    expect(ageOn('', '2026-10-22')).toBeNull();
    expect(ageOn('22/10/2016', '2026-10-22')).toBeNull();
    expect(ageOn('2027-01-01', '2026-10-22')).toBeNull();
  });
});
