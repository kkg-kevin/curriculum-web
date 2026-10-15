/**
 * How a visitor first found the site — the first page they landed on, the site that sent them
 * (google.com, facebook.com…) and any utm_* campaign tags on that first link. Kept in this
 * browser only and sent along with a form the visitor chooses to submit (api.js adds it as the
 * X-Visit-Source header), so the portal's Enquiries page can say "Google → /bootcamps/".
 *
 * First visit wins for 30 days: a parent who finds a bootcamp on Google and comes back a week
 * later by typing the address is still credited to Google. Stored nowhere else, never sent on
 * its own, and the privacy page (content/legal.js) says so.
 */

const KEY = 'digifunzi-visit';
const KEEP_DAYS = 30;
const MAX = 300;

const clip = (v) => (v ? String(v).slice(0, MAX) : undefined);

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** The referring site's host, or undefined for a direct visit or a link from this site itself. */
function externalReferrer() {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).host;
    return host && host !== window.location.host ? host : undefined;
  } catch {
    return undefined;
  }
}

/** Records this visit as the first one, unless an earlier one from the last 30 days is kept. */
export function captureVisitSource() {
  if (typeof window === 'undefined') return;
  const kept = read();
  const fresh = kept?.firstVisitAt && Date.now() - Date.parse(kept.firstVisitAt) < KEEP_DAYS * 864e5;
  if (fresh) return;
  const params = new window.URLSearchParams(window.location.search);
  const visit = {
    landingPage: clip(window.location.pathname),
    referrer: clip(externalReferrer()),
    utmSource: clip(params.get('utm_source')),
    utmMedium: clip(params.get('utm_medium')),
    utmCampaign: clip(params.get('utm_campaign')),
    firstVisitAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(visit));
  } catch {
    /* storage blocked — the enquiry simply goes without it */
  }
}

/** The kept first visit, as the header value api.js sends with a form, or null. */
export function visitSourceHeader() {
  const visit = read();
  if (!visit?.landingPage) return null;
  return encodeURIComponent(JSON.stringify(visit));
}
