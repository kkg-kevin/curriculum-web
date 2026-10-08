/** Small date helpers for display. All output is en-GB / Kenya-friendly. */

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtNoYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

function parse(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// The API's dates are plain "YYYY-MM-DD" strings, so comparing them as text against today is
// safe and matches how public-bootcamp.service.js works out a run's status server-side.
export const todayStr = () => new Date().toISOString().slice(0, 10);

const dayOf = (value) => (value ? String(value).slice(0, 10) : '');

/** True once an event's last day is behind us. An event with no end date never "ends". */
export function hasEnded(endDate, today = todayStr()) {
  const end = dayOf(endDate);
  return Boolean(end) && end < today;
}

/**
 * Sort for anything with { startDate, endDate, name }: what's still on or coming first (soonest
 * start first, undated last), then what has ended (most recent first). Name breaks ties so the
 * order never jumps between fetches.
 */
export function byUpcomingFirst(a, b, today = todayStr()) {
  const aEnded = hasEnded(a.endDate, today);
  const bEnded = hasEnded(b.endDate, today);
  if (aEnded !== bEnded) return aEnded ? 1 : -1;
  const byName = String(a.name || '').localeCompare(String(b.name || ''));
  if (aEnded) return dayOf(b.endDate).localeCompare(dayOf(a.endDate)) || byName;
  const aStart = dayOf(a.startDate);
  const bStart = dayOf(b.startDate);
  if (aStart !== bStart) {
    if (!aStart) return 1;
    if (!bStart) return -1;
    return aStart.localeCompare(bStart);
  }
  return byName;
}

export function formatDate(value) {
  const d = parse(value);
  return d ? fmt.format(d) : '';
}

export function formatDateRange(start, end) {
  const s = parse(start);
  const e = parse(end);
  if (!s && !e) return '';
  if (s && !e) return `From ${fmt.format(s)}`;
  if (!s && e) return `Until ${fmt.format(e)}`;
  const sameYear = s.getFullYear() === e.getFullYear();
  return `${sameYear ? fmtNoYear.format(s) : fmt.format(s)} – ${fmt.format(e)}`;
}
