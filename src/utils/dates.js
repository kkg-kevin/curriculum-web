/** Small date helpers for display. All output is en-GB / Kenya-friendly. */

const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtNoYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

function parse(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
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
