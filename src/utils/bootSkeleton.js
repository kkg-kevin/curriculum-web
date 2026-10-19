/**
 * Lifts the start-up skeleton (index.html's #boot-skeleton, shown while <html> has the
 * .app-booting class) once the page is ready to look at — the app has mounted, its page chunk
 * has loaded and its first data has arrived (window.__APP_READY__, see prerenderSignal.js) — or
 * after `maxWaitMs` at the latest, so a slow API never leaves a visitor looking at grey shapes.
 */
export function revealWhenReady(maxWaitMs = 6000) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (!root.classList.contains('app-booting')) return;
  const started = Date.now();
  const timer = window.setInterval(() => {
    if (window.__APP_READY__ === true || Date.now() - started > maxWaitMs) {
      root.classList.remove('app-booting');
      window.clearInterval(timer);
    }
  }, 50);
}
