import { MEDIA_BASE_URL } from '../config/env.js';

/**
 * Resolve a media reference from the API to a URL the browser can load.
 *
 * The curriculum system stores `coverImage` (and similar) as EITHER an absolute
 * URL (`https://…/x.png`, or a `data:` URI) OR a server-relative upload path
 * (`/uploads/covers/x.png`). See SYSTEM_INTEGRATION.md §"coverImage". Absolute
 * values pass through untouched; relative ones are joined onto MEDIA_BASE_URL
 * (the API origin by default, where `/uploads` is served).
 *
 * @param {string | null | undefined} ref
 * @returns {string | null} a loadable URL, or null when there is nothing to show
 */
export function resolveMediaUrl(ref) {
  if (!ref || typeof ref !== 'string') return null;
  const trimmed = ref.trim();
  if (!trimmed) return null;
  if (/^(https?:)?\/\//i.test(trimmed) || /^data:/i.test(trimmed)) return trimmed;
  return `${MEDIA_BASE_URL}/${trimmed.replace(/^\//, '')}`;
}
