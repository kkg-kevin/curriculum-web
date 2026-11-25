import { describe, it, expect } from 'vitest';
import { hubLocationPath, listWords, locationPath, townCounts, townDescription, townHeadings } from './locations.js';

const thika = {
  slug: 'thika', town: 'Thika', county: 'Kiambu', online: false,
  places: [{ name: 'Kivulini Estate Tech Club' }, { name: 'Thika Gateway Tech Club' }],
  bootcamps: [{ name: 'Create & Play Bootcamp' }],
  pathways: [],
};

describe('locations', () => {
  it('makes a town address the way the server names towns', () => {
    expect(locationPath('Kahawa Sukari')).toBe('/locations/kahawa-sukari');
    expect(hubLocationPath({ town: 'Thika, Kiambu' })).toBe('/locations/thika');
    expect(hubLocationPath({ town: 'Kiambu' })).toBe('/locations/kiambu');
    expect(hubLocationPath({ isVirtual: true, town: 'Online' })).toBe('/locations/online');
    expect(hubLocationPath({ town: '' })).toBe(null);
  });
  it('says what a town has', () => {
    expect(townCounts(thika)).toBe('2 places · 1 bootcamp');
    expect(listWords(['A', 'B', 'C'])).toBe('A, B and C');
    expect(listWords(['A'])).toBe('A');
  });
  it('titles and describes a town from its records only', () => {
    expect(townHeadings(thika).title).toBe('Coding & Robotics Classes for Kids in Thika');
    expect(townHeadings({ ...thika, online: true }).h1).toBe('Online coding, robotics & AI classes for kids');
    expect(townDescription(thika)).toBe(
      'Digifunzi in Thika: Kivulini Estate Tech Club and Thika Gateway Tech Club. Holiday bootcamps: Create & Play Bootcamp. See days, hours and how to join.',
    );
  });
});
