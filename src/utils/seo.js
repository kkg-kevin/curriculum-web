import { SITE_URL } from '../config/env.js';

/**
 * Absolute public URL for a site path, in the one form the host actually serves.
 *
 * Every prerendered page lives at dist/<route>/index.html, so the host (Apache/LiteSpeed)
 * 301s `/pathways` → `/pathways/`. Canonicals, og:url, sitemap entries and JSON-LD urls all
 * use the trailing-slash form so none of them point at a redirect. Query strings and hashes are
 * dropped — they never identify a distinct page on this site.
 * scripts/generate-sitemap.js mirrors this rule (it can't import this browser module).
 */
export function pageUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = (path.split(/[?#]/)[0] || '/').replace(/\/+$/, '');
  return clean ? `${SITE_URL}${clean.startsWith('/') ? '' : '/'}${clean}/` : `${SITE_URL}/`;
}

const DESCRIPTION_MAX = 155;

/**
 * Normalises text into a meta description: collapses whitespace and, when it runs past what
 * Google displays (~155 chars), cuts at the last word boundary and adds an ellipsis instead of
 * slicing mid-word. Returns '' for empty input so callers can fall back.
 */
export function metaDescription(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= DESCRIPTION_MAX) return clean;
  const cut = clean.slice(0, DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—–-]+$/, '')}…`;
}

/**
 * "<name> — <kind>" for a detail page title, unless the name already says what it is
 * ("Digifunzi Holiday Bootcamp" doesn't need " — Bootcamp" tacked on).
 */
export function titleWithKind(name, kind) {
  if (!name) return kind;
  return name.toLowerCase().includes(kind.toLowerCase()) ? name : `${name} — ${kind}`;
}
