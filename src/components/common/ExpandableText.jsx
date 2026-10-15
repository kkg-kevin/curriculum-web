import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

/**
 * Text clamped to `lines` lines with a "Read more" / "Show less" toggle. The toggle only appears
 * when the text is actually cut off at the current width (measured, not guessed from its
 * length), so a short description never shows a button that does nothing. The full text is
 * always in the page — clamping is only CSS — so search engines and screen readers get all of it.
 */
export default function ExpandableText({ children, lines = 3, sx, ...props }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return undefined;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [expanded, children, lines]);

  return (
    <>
      <Typography
        ref={ref}
        {...props}
        sx={{
          ...sx,
          // The toggle sits right under the text and takes over its bottom margin.
          ...(overflowing || expanded ? { mb: 0 } : {}),
          ...(expanded
            ? {}
            : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
        }}
      >
        {children}
      </Typography>
      {(overflowing || expanded) && (
        <Link
          component="button"
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          sx={{ display: 'inline-block', mt: 0.75, mb: sx?.mb ?? 0, fontWeight: 700 }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </Link>
      )}
    </>
  );
}
