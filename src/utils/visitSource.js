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

// This visit's record, also held here: a browser that blocks storage (WhatsApp's in-app browser,
// privacy browsers) still sends it — and an affiliate's link — with a form filled in this visit.
let memory = null;

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : memory;
  } catch {
    return memory;
  }
}

function write(visit) {
  memory = visit;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(visit));
  } catch {
    /* storage blocked — kept for this visit only */
  }
}

// An affiliate's code from a link (?ref=AMINA24): letters and digits, upper case, 4–20 long.
const cleanRef = (v) => {
  const code = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code.length >= 4 && code.length <= 20 ? code : undefined;
};
const freshRef = (visit) => Boolean(visit?.ref && visit.refAt && Date.now() - Date.parse(visit.refAt) < KEEP_DAYS * 864e5);

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

/**
 * Records this visit as the first one, unless an earlier one from the last 30 days is kept.
 * An affiliate's link (?ref=CODE, modules/affiliates/ in the system) is added to the kept visit —
 * it beats an ordinary visit (Google, typed address), but the first affiliate within 30 days keeps
 * the credit: a second affiliate's link doesn't take it over.
 */
export function captureVisitSource() {
  if (typeof window === 'undefined') return;
  const kept = read();
  const fresh = kept?.firstVisitAt && Date.now() - Date.parse(kept.firstVisitAt) < KEEP_DAYS * 864e5;
  const params = new window.URLSearchParams(window.location.search);
  const ref = cleanRef(params.get('ref'));
  if (fresh) {
    if (ref && !freshRef(kept)) write({ ...kept, ref, refAt: new Date().toISOString() });
    else memory = kept;
    return;
  }
  const visit = {
    landingPage: clip(window.location.pathname),
    referrer: clip(externalReferrer()),
    utmSource: clip(params.get('utm_source')),
    utmMedium: clip(params.get('utm_medium')),
    utmCampaign: clip(params.get('utm_campaign')),
    firstVisitAt: new Date().toISOString(),
    ...(ref ? { ref, refAt: new Date().toISOString() } : {}),
  };
  // A record older than 30 days still holds a recent affiliate's link: keep that.
  if (!ref && freshRef(kept)) Object.assign(visit, { ref: kept.ref, refAt: kept.refAt });
  write(visit);
}

/** The affiliate code from a link followed in the last 30 days, or null — sign-up forms show it. */
export function referralCodeFromLink() {
  const visit = read();
  return freshRef(visit) ? visit.ref : null;
}

/** The kept first visit, as the header value api.js sends with a form, or null. */
export function visitSourceHeader() {
  const visit = read();
  if (!visit?.landingPage) return null;
  return encodeURIComponent(JSON.stringify(visit));
}
