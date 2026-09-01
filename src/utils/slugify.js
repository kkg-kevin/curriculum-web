/**
 * Turn a human name into a URL-safe slug: "Intro to Robotics!" -> "intro-to-robotics".
 *
 * NOTE: the real slug should come from the backend (spec §5 — the /api/public/*
 * endpoints must return a `slug` field derived server-side). This client-side copy
 * is only used by the mock API layer and as a defensive fallback if a payload
 * arrives without one. Keep the algorithm in sync with the server's slugify util.
 */
export function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
