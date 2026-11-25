import { slugify } from './slugify.js';

/**
 * Locations (25 Nov 2026) — the town pages: /locations (every town) and /locations/<town>.
 * A town's address is made from its name, the same rule as the server's public-location.service.js:
 * a hub's town is its address's city, else its county; an online-only hub's is "Online".
 */
export const LOCATIONS_PATH = '/locations';

export const locationPath = (slugOrTown) => `${LOCATIONS_PATH}/${slugify(slugOrTown)}`;

/**
 * The town page a hub from GET /api/public/hubs belongs to — its `town` is "City, County" (or just
 * the county), "Online" for an online-only hub. null when it has no town.
 */
export function hubLocationPath(hub) {
  const town = hub?.isVirtual ? 'Online' : String(hub?.town || '').split(',')[0].trim();
  return town ? locationPath(town) : null;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** "2 clubs · 1 bootcamp · 1 pathway" — what a town has, for its card. */
export function townCounts(town) {
  return [
    plural(town.places.length, 'place', 'places'),
    town.bootcamps.length ? plural(town.bootcamps.length, 'bootcamp', 'bootcamps') : null,
    town.pathways.length ? plural(town.pathways.length, 'pathway', 'pathways') : null,
  ].filter(Boolean).join(' · ');
}

/** "A, B and C". */
export function listWords(items) {
  const xs = items.filter(Boolean);
  if (xs.length <= 1) return xs[0] || '';
  return `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`;
}

/** The town page's title and main heading, from the town's name. */
export function townHeadings(town) {
  if (town.online) {
    return { title: 'Online Coding, Robotics & AI Classes for Kids', h1: 'Online coding, robotics & AI classes for kids' };
  }
  return { title: `Coding & Robotics Classes for Kids in ${town.town}`, h1: `Coding, robotics & AI classes for kids in ${town.town}` };
}

/**
 * The town page's description, made only from what the town has: its places by name, then its
 * bootcamps and pathways.
 */
export function townDescription(town) {
  const where = town.online ? 'online' : `in ${town.town}`;
  const parts = [`Digifunzi ${where}: ${listWords(town.places.map((p) => p.name))}.`];
  if (town.bootcamps.length) parts.push(`Holiday bootcamps: ${listWords(town.bootcamps.map((b) => b.name))}.`);
  if (town.pathways.length) parts.push(`Pathways: ${listWords(town.pathways.map((p) => p.name))}.`);
  parts.push('See days, hours and how to join.');
  return parts.join(' ');
}
