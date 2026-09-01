/**
 * Lets scripts/prerender.js know when the page has settled — React mounted, the
 * code-split page chunk resolved (no Suspense fallback showing), and no React
 * Query fetches in flight — so it snapshots real content, not a loading spinner.
 *
 * In a normal browser this is a harmless no-op flag on window.
 */
export function installPrerenderSignal(queryClient) {
  if (typeof window === 'undefined') return;

  window.__APP_READY__ = false;

  const check = () => {
    const mounted = document.querySelector('#root')?.childElementCount > 0;
    const anyFetching = queryClient
      .getQueryCache()
      .getAll()
      .some((q) => q.state.fetchStatus === 'fetching');
    // LoadingBlock / route Suspense fallback both render role="status".
    const stillLoading = Boolean(document.querySelector('[role="status"]'));
    window.__APP_READY__ = mounted && !anyFetching && !stillLoading;
  };

  // Re-evaluate on every cache change, on DOM mutations (Suspense resolving),
  // plus a periodic safety tick.
  queryClient.getQueryCache().subscribe(check);
  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const interval = window.setInterval(check, 150);

  // Stop watching after a while; a real user session doesn't need this.
  window.setTimeout(() => {
    window.clearInterval(interval);
    observer.disconnect();
  }, 20000);

  check();
}
