import { describe, it, expect } from 'vitest';
import { clubSignupSchema } from '../forms/schemas.js';
import { packagesForClub } from '../../hooks/usePublicClubs.js';
import { clubJoinPath } from '../../utils/clubs.js';

const valid = {
  packageSlug: 'one-child',
  parent: { name: 'Jane Wanjiru', email: 'jane@example.com', phone: '0712345678', password: 'parentpass1', confirmPassword: 'parentpass1' },
  children: [
    { firstName: 'Amina', lastName: 'W', gender: 'female', dateOfBirth: '2016-05-01', currentGrade: 'Grade 4', username: 'amina.w12', password: 'childpass1' },
  ],
  consent: true,
  hp_field: '',
};
const issues = (data) => {
  const result = clubSignupSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('clubSignupSchema', () => {
  it('accepts a complete sign-up with no home address', () => {
    expect(issues(valid)).toEqual([]);
  });
  it('requires matching parent passwords and consent', () => {
    expect(issues({ ...valid, parent: { ...valid.parent, confirmPassword: 'different1' } })).toContain('parent.confirmPassword');
    expect(issues({ ...valid, consent: false })).toContain('consent');
  });
  it('requires each child to have their own username', () => {
    const children = [valid.children[0], { ...valid.children[0], username: 'AMINA.W12' }];
    expect(issues({ ...valid, children })).toContain('children.1.username');
  });
});

describe('packagesForClub', () => {
  const packages = [
    { slug: 'everywhere', allClubs: true, hubIds: [] },
    { slug: 'kahawa-only', allClubs: false, hubIds: ['hub-a'] },
  ];
  it('offers every-club packages and the club’s own', () => {
    expect(packagesForClub(packages, 'hub-a').map((p) => p.slug)).toEqual(['everywhere', 'kahawa-only']);
    expect(packagesForClub(packages, 'hub-b').map((p) => p.slug)).toEqual(['everywhere']);
    expect(packagesForClub(packages, undefined)).toEqual([]);
  });
});

describe('clubJoinPath', () => {
  it('builds the club’s sign-up address', () => {
    const hub = { name: 'Kahawa Sukari Estate Tech Club' };
    expect(clubJoinPath(hub)).toBe('/estate-tech-clubs/kahawa-sukari-estate-tech-club/join');
    expect(clubJoinPath(hub, 'one-child', 2)).toBe('/estate-tech-clubs/kahawa-sukari-estate-tech-club/join?package=one-child&children=2');
  });
});
