import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';

/**
 * Scroll-triggered entrance. Wraps children in a box that fades + rises into
 * place the first time it enters the viewport. Pure CSS transition driven by a
 * single IntersectionObserver — no motion library, no layout thrash.
 *
 * - `delay`   ms before the transition starts (stagger siblings with this)
 * - `y`       px to travel up from (default 16)
 * - `as`      element/component for the wrapper (default 'div')
 * - `once`    stop observing after the first reveal (default true)
 *
 * Collapses to an immediate, static render under `prefers-reduced-motion` and
 * when IntersectionObserver is unavailable (SSR / prerender), so content is
 * always present for crawlers.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  as = 'div',
  once = true,
  sx,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Box
      ref={ref}
      component={as}
      sx={{
        transition:
          'opacity 620ms cubic-bezier(0.22,1,0.36,1), transform 620ms cubic-bezier(0.22,1,0.36,1)',
        transitionDelay: `${delay}ms`,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translate3d(0, ${y}px, 0)`,
        willChange: 'opacity, transform',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          opacity: 1,
          transform: 'none',
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
