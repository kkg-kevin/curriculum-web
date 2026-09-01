import { useState } from 'react';
import Box from '@mui/material/Box';

/**
 * Image with a graceful fallback and lazy-loading by default (spec §7 —
 * page speed is a ranking factor, and cover images may be null from the API).
 *
 * Props: src, alt (REQUIRED — always write real alt text), ratio (e.g. '16/9'),
 * eager (set true only for above-the-fold hero images).
 */
export default function SmartImage({ src, alt, ratio = '16 / 9', eager = false, rounded = true, sx }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        overflow: 'hidden',
        borderRadius: rounded ? 2 : 0,
        backgroundColor: 'surface.imagePlaceholder',
        backgroundImage: showFallback
          ? (t) =>
              `linear-gradient(135deg, ${t.palette.surface.imageFrom} 0%, ${t.palette.surface.imageTo} 100%)`
          : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {showFallback ? (
        <Box
          aria-hidden="true"
          sx={{ color: 'primary.main', opacity: 0.4, fontWeight: 800, fontSize: '2rem' }}
        >
          Digifunzi
        </Box>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </Box>
  );
}
