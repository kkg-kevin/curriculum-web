import { describe, it, expect } from 'vitest';
import { homeSchoolingSignupSchema, isGoogleMapsUrl } from './schemas.js';
import { homeSchoolingSignupPath } from '../../content/homeSchooling.js';

const valid = {
  packageSlug: 'three-children',
  parent: { name: 'Jane Wanjiru', email: 'jane@example.com', phone: '0712345678', password: 'parentpass1', confirmPassword: 'parentpass1' },
  children: [
    { firstName: 'Amina', lastName: 'W', gender: 'female', dateOfBirth: '2016-05-01', currentGrade: 'Grade 4', username: 'amina.w12', password: 'childpass1' },
    { firstName: 'Baraka', lastName: 'W', gender: 'male', dateOfBirth: '', currentGrade: '', username: 'baraka.w34', password: 'childpass1' },
  ],
  home: { county: 'Nairobi', subCounty: '', town: 'Kangemi', addressLine: 'House 12', landmark: '', mapUrl: 'https://maps.app.goo.gl/abc' },
  consent: true,
  hp_field: '',
};
const issues = (data) => {
  const result = homeSchoolingSignupSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('homeSchoolingSignupSchema', () => {
  it('accepts a complete sign-up', () => {
    expect(issues(valid)).toEqual([]);
  });
  it('requires matching parent passwords', () => {
    expect(issues({ ...valid, parent: { ...valid.parent, confirmPassword: 'different1' } })).toContain('parent.confirmPassword');
  });
  it('requires each child to have their own username', () => {
    const children = [valid.children[0], { ...valid.children[1], username: 'AMINA.W12' }];
    expect(issues({ ...valid, children })).toContain('children.1.username');
  });
  it('requires consent and the core home details', () => {
    expect(issues({ ...valid, consent: false })).toContain('consent');
    expect(issues({ ...valid, home: { ...valid.home, town: '' } })).toContain('home.town');
  });
  it('only takes Google Maps links (or nothing)', () => {
    expect(issues({ ...valid, home: { ...valid.home, mapUrl: 'https://evil.example/maps' } })).toContain('home.mapUrl');
    expect(issues({ ...valid, home: { ...valid.home, mapUrl: '' } })).toEqual([]);
    expect(isGoogleMapsUrl('https://www.google.com/maps/place/Nairobi')).toBe(true);
  });
});

describe('homeSchoolingSignupPath', () => {
  it('carries the package and child count', () => {
    expect(homeSchoolingSignupPath('five-children', 7)).toBe('/home-schooling/signup?package=five-children&children=7');
    expect(homeSchoolingSignupPath()).toBe('/home-schooling/signup');
  });
});
