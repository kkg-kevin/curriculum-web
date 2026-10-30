import { useEffect, useRef } from 'react';

/**
 * For multi-step flows (sign-ups, checkout, enrolment, diagnostics): each time `stepKey` changes —
 * Next, Back, an "Edit" link, the result after submitting — bring the top of the flow back into
 * view, just under the sticky header, once the new step has rendered. The person starts reading
 * the new step from its heading instead of wherever they had scrolled to on the last one.
 *
 * - Not on first render: arriving on the page is handled by MainLayout's scroll to the top.
 * - Scrolls only when the flow's top isn't already in view near the top of the screen.
 * - Smooth, unless the visitor asked for reduced motion.
 * - Focus moves to the flow (without scrolling again), so keyboard and screen-reader users start
 *   at the new step too.
 *
 * Returns a ref for the flow's outer element.
 */
export default function useScrollToFlowTop(stepKey) {
  const ref = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    const header = document.querySelector('header.MuiAppBar-root') || document.querySelector('header');
    const offset = (header ? header.getBoundingClientRect().height : 72) + 16;
    const elTop = el.getBoundingClientRect().top;
    const inView = elTop >= offset - 1 && elTop <= window.innerHeight * 0.35;
    if (!inView) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, elTop + window.scrollY - offset), behavior: reduce ? 'auto' : 'smooth' });
    }
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.style.outline = 'none';
    }
    el.focus({ preventScroll: true });
  }, [stepKey]);

  return ref;
}
