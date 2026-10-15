import { useState } from 'react';
import Box from '@mui/material/Box';
import { resolveMediaUrl } from '../../utils/media.js';

const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/**
 * A hub's logo (its single profile image, `photo`) as a small rounded square on white, the way a
 * brand mark is shown — never stretched into a photo frame. Without one: the hub's initials.
 */
export default function ClubLogo({ src, name, size = 56, sx }) {
  const [failed, setFailed] = useState(false);
  const url = resolveMediaUrl(src);
  const frame = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: 2,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'shadow.sm',
    ...sx,
  };

  if (!url || failed) {
    return (
      <Box
        aria-hidden
        sx={{
          ...frame,
          color: '#fff',
          fontWeight: 800,
          fontSize: size * 0.36,
          background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
        }}
      >
        {initials(name)}
      </Box>
    );
  }
  return (
    <Box sx={{ ...frame, bgcolor: '#fff' }}>
      <Box
        component="img"
        src={url}
        alt={`${name} logo`}
        onError={() => setFailed(true)}
        sx={{ width: '86%', height: '86%', objectFit: 'contain' }}
      />
    </Box>
  );
}

/**
 * Where a club's photos would go when it has none yet: the brand gradient with its logo in the
 * middle, in the gallery's own shape, so the page keeps its layout instead of an empty gap.
 */
export function ClubPhotoPlaceholder({ logo, name, ratio = '16 / 10' }) {
  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: ratio,
        borderRadius: 3,
        display: 'grid',
        placeItems: 'center',
        background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
        boxShadow: 'shadow.md',
      }}
    >
      <ClubLogo src={logo} name={name} size={112} sx={{ borderColor: 'transparent' }} />
    </Box>
  );
}
