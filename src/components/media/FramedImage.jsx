import { useState } from 'react';
import Box from '@mui/material/Box';
import { resolveMediaUrl } from '../../utils/media.js';

/**
 * An image in a fixed-shape frame, shown WHOLE: the image itself is contained (never cropped) and
 * the space around it is filled with a blurred, enlarged copy of the same image instead of grey
 * bars. A photo of about the frame's shape simply fills it; a logo, a wide banner or a portrait
 * poster sits whole on its own colours. Admins upload all of these, so every card, gallery and
 * hero uses this rather than a cropping `object-fit: cover`.
 *
 * Renders `fallback` (or nothing) when there's no image or it fails to load.
 */
export default function FramedImage({ src, alt, ratio = '16 / 10', eager = false, rounded = 0, fallback = null, sx }) {
  const [failed, setFailed] = useState(false);
  const url = resolveMediaUrl(src);
  if (!url || failed) return fallback;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        overflow: 'hidden',
        borderRadius: rounded,
        bgcolor: 'surface.imagePlaceholder',
        isolation: 'isolate',
        ...sx,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: '-10%',
          backgroundImage: `url("${url}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(28px) saturate(1.15)',
          opacity: 0.55,
          transform: 'scale(1.1)',
        }}
      />
      <Box
        component="img"
        src={url}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </Box>
  );
}
