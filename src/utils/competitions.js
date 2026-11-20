/**
 * Competitions on the website (20 Nov 2026): how a track is entered and what it costs, worded the
 * same everywhere — the track cards, the track's own page and the registration form.
 * A track (from GET /api/public/competitions/:slug) carries
 *   entry: { individual, group, teamMin, teamMax, individualPrice, teamPrice, currency }
 *   ageMin / ageMax, slug, registerUrl (set = an outside form; empty = our own registration).
 */

import { formatDate } from './dates.js';

export const ENTRY_WORD = { individual: 'Individuals', group: 'Teams' };
export const MODE_LABEL = { online: 'Online', in_person: 'In person', both: 'Online and in person' };

export function money(amount, currency = 'KES') {
  if (amount == null) return null;
  if (Number(amount) === 0) return 'Free';
  return `${currency} ${Number(amount).toLocaleString('en-KE')}`;
}

export function agesText(min, max) {
  if (min != null && max != null) return `Ages ${min}–${max}`;
  if (min != null) return `Ages ${min}+`;
  if (max != null) return `Up to age ${max}`;
  return '';
}

export function teamSizeText(entry) {
  if (!entry) return '';
  return entry.teamMin === entry.teamMax ? `${entry.teamMin} per team` : `${entry.teamMin}–${entry.teamMax} per team`;
}

/** The ways a track can be entered, each with its fee: [{ type, label, fee, detail }]. */
export function entryOptions(track) {
  const e = track?.entry || {};
  const out = [];
  if (e.individual) out.push({ type: 'individual', label: 'Individual', fee: money(e.individualPrice ?? 0, e.currency), detail: 'One participant' });
  if (e.group) out.push({ type: 'group', label: 'Team', fee: money(e.teamPrice ?? 0, e.currency), detail: teamSizeText(e) + ' · one fee per team' });
  return out;
}

/** Where a track's Register Now goes: its outside form, else our registration page. */
export function registerTarget(competitionSlug, track) {
  const url = track?.registerUrl || '';
  if (/^https?:\/\//i.test(url)) return { href: url, external: true };
  return { to: `/competitions/${competitionSlug}/register?track=${encodeURIComponent(track.id)}`, external: false };
}

export const trackPath = (competitionSlug, track) => `/competitions/${competitionSlug}/tracks/${track.slug || track.id}`;

/** Is a rich-text field worth showing? (TipTap leaves "<p></p>" when emptied.) */
export const hasRich = (html) => Boolean(String(html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());

const dayMs = 24 * 60 * 60 * 1000;
const kenyaToday = () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Whole days from today (Kenyan calendar) to a "YYYY-MM-DD" date; negative once it's passed. */
export function daysUntil(date) {
  if (!date) return null;
  return Math.round((Date.parse(`${String(date).slice(0, 10)}T00:00:00Z`) - Date.parse(`${kenyaToday()}T00:00:00Z`)) / dayMs);
}

/** The registration line for a pill: "Registration open · closes in 12 days" / "… closes today". */
export function registrationLine(registration, closeDate) {
  if (!registration?.open) return registration?.opensOn ? `Registration opens ${formatDate(registration.opensOn)}` : 'Registration closed';
  const d = daysUntil(closeDate);
  if (d == null) return 'Registration open';
  if (d <= 0) return 'Registration open · closes today';
  if (d === 1) return 'Registration open · closes tomorrow';
  return `Registration open · closes in ${d} days`;
}
