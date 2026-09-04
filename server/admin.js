/**
 * Minimal admin view for form submissions. Basic-auth protected.
 *
 *   GET /admin           — HTML table of leads + contacts, newest first
 *   GET /admin/leads.json — raw leads array (for export / migration)
 *   GET /admin/contacts.json — raw contacts array
 *
 * Enable by setting ADMIN_PASSWORD (and optionally ADMIN_USER, default "admin").
 * With no ADMIN_PASSWORD the whole /admin tree returns 404.
 */
import crypto from 'node:crypto';

function timingSafeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function requireAuth(req, res) {
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASSWORD || '';
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [u, p] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
    if (u && p && timingSafeEqual(u, user) && timingSafeEqual(p, pass)) return true;
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="Digifunzi admin", charset="UTF-8"');
  res.status(401).send('Authentication required.');
  return false;
}

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function table(title, rows, columns) {
  if (!rows.length) return `<h2>${esc(title)}</h2><p class="empty">None yet.</p>`;
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
  const body = rows
    .slice()
    .reverse()
    .map(
      (r) =>
        `<tr>${columns.map((c) => `<td>${esc(c.get(r))}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<h2>${esc(title)} <span class="count">(${rows.length})</span></h2>
    <div class="wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function adminRouter({ readAll }) {
  return async function admin(req, res) {
    if (!process.env.ADMIN_PASSWORD) return res.status(404).send('Not found.');
    if (!requireAuth(req, res)) return;

    const sub = req.path.replace(/^\/+/, '');

    if (sub === 'leads.json') {
      return res.json(await readAll('leads'));
    }
    if (sub === 'contacts.json') {
      return res.json(await readAll('contacts'));
    }
    if (sub !== '' && sub !== 'index.html') {
      return res.status(404).send('Not found.');
    }

    const [leads, contacts] = await Promise.all([readAll('leads'), readAll('contacts')]);

    const fmt = (iso) => (iso ? new Date(iso).toLocaleString('en-GB') : '');

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Digifunzi — submissions</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; max-width: 1100px; }
  h1 { margin: 0 0 4px; }
  .sub { color: #666; margin: 0 0 24px; }
  h2 { margin: 32px 0 8px; }
  .count, .empty { color: #888; font-weight: 400; }
  .wrap { overflow-x: auto; border: 1px solid #ccc4; border-radius: 8px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #ccc4; vertical-align: top; }
  th { background: #8881; position: sticky; top: 0; }
  tr:last-child td { border-bottom: 0; }
  td { max-width: 320px; overflow-wrap: anywhere; }
  .links a { margin-right: 16px; }
</style></head><body>
<h1>Form submissions</h1>
<p class="sub">Standalone JSON store · newest first · <span class="links">
  <a href="/admin/leads.json">leads.json</a>
  <a href="/admin/contacts.json">contacts.json</a>
</span></p>
${table('Enrolments & enquiries (leads)', leads, [
  { label: 'When', get: (r) => fmt(r.createdAt) },
  { label: 'Parent', get: (r) => r.parentName },
  { label: 'Email', get: (r) => r.parentEmail },
  { label: 'Phone', get: (r) => r.parentPhone },
  { label: 'Learner', get: (r) => [r.learnerName, r.learnerAge].filter(Boolean).join(', ') },
  { label: 'Interested in', get: (r) => r.interestedIn },
  { label: 'Reference', get: (r) => r.referenceId },
  { label: 'Note', get: (r) => r.note },
  { label: 'Status', get: (r) => r.status },
])}
${table('Contact messages', contacts, [
  { label: 'When', get: (r) => fmt(r.createdAt) },
  { label: 'Name', get: (r) => r.name },
  { label: 'Email', get: (r) => r.email },
  { label: 'Phone', get: (r) => r.phone },
  { label: 'Message', get: (r) => r.message },
  { label: 'Status', get: (r) => r.status },
])}
</body></html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  };
}
