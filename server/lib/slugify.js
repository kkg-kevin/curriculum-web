/**
 * URL-safe slug: "Intro to Robotics!" -> "intro-to-robotics".
 * Kept in sync with src/utils/slugify.js so mock and server agree.
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
