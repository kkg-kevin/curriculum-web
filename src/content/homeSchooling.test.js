import { describe, it, expect } from 'vitest';
import {
  bestPackageFor, cheapestPrice, fromLabel, homeSchoolingEnquiryPath, maxChildrenOffered, packageEnquiryNote, perChildAmount, perChildBaseline, periodUnit, priceForPackage, sharedPeriodWord,
} from './homeSchooling.js';

const one = { slug: 'one-child', name: 'One child', childrenIncluded: 1, amount: 8000, billingPeriod: 'monthly', allowExtraChildren: false, extraChildAmount: null, maxChildren: 1 };
const three = { slug: 'three-children', name: 'Three children', childrenIncluded: 3, amount: 15000, billingPeriod: 'monthly', allowExtraChildren: false, extraChildAmount: null, maxChildren: 3 };
const five = { slug: 'five-children', name: 'Five children', childrenIncluded: 5, amount: 24000, billingPeriod: 'monthly', allowExtraChildren: true, extraChildAmount: 7000, maxChildren: 20 };
const packages = [one, three, five];

// The curriculum system reads the FIRST "<n> child(ren)" in the enquiry note (lead.service.js).
const notedCount = (note) => Number(note.match(/(\d+)\+?\s+child(?:ren)?\b/i)?.[1]);

describe('priceForPackage', () => {
  it('charges the package price for up to the included children', () => {
    expect(priceForPackage(three, 2)).toEqual({ childCount: 3, amount: 15000, billingPeriod: 'monthly' });
  });
  it('adds extra children only where the package allows it', () => {
    expect(priceForPackage(five, 7)).toEqual({ childCount: 7, amount: 38000, billingPeriod: 'monthly' });
    expect(priceForPackage(three, 4)).toBeNull();
    expect(priceForPackage(five, 21)).toBeNull();
  });
});

describe('bestPackageFor', () => {
  it('picks the cheapest package that covers the family', () => {
    expect(bestPackageFor(packages, 1).pkg.slug).toBe('one-child');
    expect(bestPackageFor(packages, 2).pkg.slug).toBe('three-children');
    expect(bestPackageFor(packages, 4).pkg.slug).toBe('five-children');
    expect(bestPackageFor(packages, 8).price.amount).toBe(45000);
  });
  it('returns null when nothing fits', () => {
    expect(bestPackageFor([one, three], 4)).toBeNull();
  });
});

describe('helpers', () => {
  it('works out the largest family and the per-child price', () => {
    expect(maxChildrenOffered(packages)).toBe(20);
    expect(perChildAmount(three)).toBe(5000);
  });
  it('only adds the child count to an enquiry link that names a package', () => {
    expect(homeSchoolingEnquiryPath('five-children', 7)).toBe('/enroll?interestedIn=home_schooling&enquiry=1&package=five-children&children=7');
    expect(homeSchoolingEnquiryPath(undefined, 7)).toBe('/enroll?interestedIn=home_schooling&enquiry=1');
  });
});

describe('packageEnquiryNote', () => {
  it("leads with the family's own child count so the system reads it first", () => {
    const note = packageEnquiryNote(five, 7);
    expect(notedCount(note)).toBe(7);
    expect(note).toContain('KSh 38,000');
  });
  it('falls back to the included children when no valid count is given', () => {
    expect(notedCount(packageEnquiryNote(three))).toBe(3);
    expect(notedCount(packageEnquiryNote(three, 9))).toBe(3);
  });
});

describe('packages on different billing periods', () => {
  const weekly = { slug: 'weekly', name: 'Weekly', childrenIncluded: 1, amount: 1500, billingPeriod: 'weekly', allowExtraChildren: false, extraChildAmount: null, maxChildren: 1 };
  const yearly = { slug: 'yearly', name: 'Yearly', childrenIncluded: 1, amount: 80000, billingPeriod: 'annually', allowExtraChildren: false, extraChildAmount: null, maxChildren: 1 };

  it('compares what each comes to over a month', () => {
    // 1,500 a week ≈ 6,500 a month; 80,000 a year ≈ 6,667 a month; both beat 8,000 a month.
    expect(bestPackageFor([one, weekly, yearly], 1).pkg.slug).toBe('weekly');
    expect(cheapestPrice([one, yearly])).toEqual({ amount: 80000, billingPeriod: 'annually' });
  });

  it('names the period and only compares per-child prices on the same period', () => {
    expect(periodUnit(weekly)).toBe('week');
    expect(fromLabel(cheapestPrice([weekly]))).toBe('From KSh 1,500 a week');
    expect(perChildBaseline([one, three, weekly], three)).toBe(8000);
    expect(perChildBaseline([one, three, weekly], weekly)).toBe(1500);
    expect(sharedPeriodWord([one, three])).toBe('monthly');
    expect(sharedPeriodWord([one, weekly])).toBe(null);
  });
});
