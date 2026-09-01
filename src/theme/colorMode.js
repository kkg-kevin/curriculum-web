/**
 * Colour-mode preference: 'light' | 'dark' | 'system'.
 *
 * - Stored in localStorage under THEME_STORAGE_KEY.
 * - 'system' follows the OS via prefers-color-scheme.
 * - The same key + logic is mirrored by the tiny inline script in index.html
 *   (THEME_BOOT_SNIPPET below) so the first paint is already the right colour —
 *   no flash. Keep the two in sync.
 */

export const THEME_STORAGE_KEY = 'digifunzi-color-mode';

/** @typedef {'light'|'dark'|'system'} ColorModePref */

export function getSystemMode() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Read the stored preference; defaults to 'system'. */
export function readStoredPref() {
  if (typeof window === 'undefined') return 'system';
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function writeStoredPref(pref) {
  try {
    if (pref === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* private mode / storage disabled — non-fatal, just won't persist */
  }
}

/** Resolve a preference to the concrete mode to render. */
export function resolveMode(pref) {
  return pref === 'system' ? getSystemMode() : pref;
}

/**
 * Inline <script> for index.html <head>. Runs before React, sets
 * data-color-mode + a background colour on <html> so there's no flash.
 * Must be dependency-free and synchronous.
 */
export const THEME_BOOT_SNIPPET = `
(function () {
  try {
    var KEY = '${THEME_STORAGE_KEY}';
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    var pref = (stored === 'light' || stored === 'dark') ? stored : 'system';
    var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = pref === 'system' ? (sysDark ? 'dark' : 'light') : pref;
    var root = document.documentElement;
    root.setAttribute('data-color-mode', mode);
    root.style.colorScheme = mode;
    root.style.backgroundColor = mode === 'dark' ? '#0B1220' : '#FFFFFF';
  } catch (e) {}
})();
`.trim();
