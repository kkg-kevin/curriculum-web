import { slugify } from '../../utils/slugify.js';
import { hubs } from './hubs.js';
import { bootcampList } from './bootcamps.js';
import { pathways } from './pathways.js';

/**
 * Offline mock for GET /api/public/locations[/:slug] — the hubs grouped by town, as the server's
 * public-location.service.js does: a hub's town is the first part of its "City, County", an
 * online-only hub's is "Online". The first bootcamp and pathway run everywhere, so each town page
 * has something under every heading in an offline build.
 */
const townOf = (h) => (h.isVirtual ? 'Online' : String(h.town || '').split(',')[0].trim());

function build() {
  const byTown = new Map();
  for (const h of hubs) {
    const town = townOf(h);
    if (!town) continue;
    const slug = slugify(town);
    if (!byTown.has(slug)) {
      byTown.set(slug, { slug, town, county: h.isVirtual ? '' : String(h.town || '').split(',')[1]?.trim() || '', online: h.isVirtual, places: [] });
    }
    byTown.get(slug).places.push({
      id: h.id, name: h.name, slug: slugify(h.name), typeLabel: h.hubTypeLabel, deliveryMode: h.deliveryMode,
      deliveryLabel: h.deliveryLabel, address: h.isVirtual ? '' : h.town, mapLink: '', schedule: h.schedule,
      logo: null, photos: [], summary: `${h.name} is a Digifunzi ${h.hubTypeLabel.toLowerCase()} where young learners build robots, games and apps.`,
    });
  }
  const b = bootcampList[0];
  const p = pathways[0];
  return [...byTown.values()].map((t) => ({
    ...t,
    bootcamps: b ? [{ slug: b.slug, name: b.name, tagline: b.tagline, audience: b.audience || 'learners', ageMin: b.ageMin, ageMax: b.ageMax, startDate: b.startDate, endDate: b.endDate, coverImage: b.coverImage, places: [t.places[0].name] }] : [],
    pathways: p ? [{ slug: p.slug, name: p.name, image: p.image || null, from: null, billingPeriod: null, places: [t.places[0].name] }] : [],
  })).sort((a, b2) => (a.online - b2.online) || (b2.places.length - a.places.length) || a.town.localeCompare(b2.town));
}

export const locations = build();

export function locationDetail(slug) {
  return locations.find((t) => t.slug === slugify(slug)) || null;
}
