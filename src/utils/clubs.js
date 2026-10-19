import { slugify } from './slugify.js';

/**
 * Estate Tech Clubs (/estate-tech-clubs) — every active, non-school learning hub the curriculum
 * system publishes (GET /api/public/hubs). A hub has no slug of its own, so its page address is
 * made from its name: "Kahawa Sukari Estate Tech Club" -> /estate-tech-clubs/kahawa-sukari-estate-tech-club.
 * scripts/prerender.js and scripts/generate-sitemap.js build the same addresses with the same
 * slugify — keep them in step. Renaming a hub in the portal changes its address.
 */
export const CLUBS_PATH = '/estate-tech-clubs';

export const clubSlug = (hub) => slugify(hub?.name);

export const clubPath = (hub) => `${CLUBS_PATH}/${clubSlug(hub)}`;

/** The club's sign-up form, optionally with a package and number of children chosen. */
export function clubJoinPath(hub, packageSlug, children) {
  const base = `${clubPath(hub)}/join`;
  if (!packageSlug) return base;
  return `${base}?package=${encodeURIComponent(packageSlug)}${children ? `&children=${Number(children)}` : ''}`;
}

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** The hub's opening days in week order (the portal stores them in the order they were ticked). */
export function sortDays(days) {
  return [...(days || [])].filter((d) => WEEK.includes(d)).sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b));
}

/** "Mon–Fri", "Sat", "Mon, Wed, Fri" — a run of three or more days in a row is shortened. */
export function daysLabel(days) {
  const sorted = sortDays(days);
  if (sorted.length === 0) return '';
  const idx = sorted.map((d) => WEEK.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  const short = (d) => d.slice(0, 3);
  if (consecutive && sorted.length >= 3) return `${short(sorted[0])}–${short(sorted.at(-1))}`;
  return sorted.map(short).join(', ');
}

/** "Mon–Fri · 08:00–17:00", or whichever half is known. */
export function scheduleLabel(schedule) {
  if (!schedule) return '';
  const days = daysLabel(schedule.days);
  const hours = schedule.opensAt && schedule.closesAt ? `${schedule.opensAt}–${schedule.closesAt}` : '';
  return [days, hours].filter(Boolean).join(' · ');
}

/** "Ages 6–14", "Ages 6+", "Up to age 14", or '' — from a club's details for parents. */
export function agesLabel(details) {
  const min = details?.ageMin;
  const max = details?.ageMax;
  if (min != null && max != null) return `Ages ${min}–${max}`;
  if (min != null) return `Ages ${min}+`;
  if (max != null) return `Up to age ${max}`;
  return '';
}

/** The club's sessions as lines: [{ day: 'Saturday', times: '09:00–11:00' }] (days in week order,
 *  one line per day). Empty when the club hasn't set its session times. */
export function sessionLines(details) {
  const byDay = new Map();
  for (const s of details?.sessions || []) {
    if (!byDay.has(s.day)) byDay.set(s.day, []);
    byDay.get(s.day).push(`${s.startsAt}–${s.endsAt}`);
  }
  return sortDays([...byDay.keys()]).map((day) => ({ day, times: byDay.get(day).join(', ') }));
}

/** One line for the header: "Sat 09:00–11:00 · Wed 16:00–17:30", or '' when no sessions are set. */
export function sessionsLabel(details) {
  return sessionLines(details).map(({ day, times }) => `${day.slice(0, 3)} ${times}`).join(' · ');
}
