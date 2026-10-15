import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FramedImage from './FramedImage.jsx';
import Lightbox from './Lightbox.jsx';
import { resolveMediaUrl } from '../../utils/media.js';

const arrowSx = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  bgcolor: 'rgba(15,37,69,0.55)',
  color: '#fff',
  backdropFilter: 'blur(4px)',
  '&:hover': { bgcolor: 'rgba(15,37,69,0.8)' },
};

/**
 * The images of a bootcamp or an Estate Tech Club: one large framed image (FramedImage — shown
 * whole, on a blur of itself, never cropped), ‹ › on its sides and a strip of thumbnails under it
 * when there's more than one, arrow keys and swipe; a click opens it full screen (Lightbox).
 * `images` may hold empty entries (a bootcamp with no cover) — they're skipped. With none,
 * `fallback` is shown instead.
 */
export default function MediaGallery({ images, alt, ratio = '16 / 10', fallback = null }) {
  const urls = [...new Set((images || []).map(resolveMediaUrl).filter(Boolean))];
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(null);
  const touchX = useRef(null);
  if (urls.length === 0) return fallback;

  const many = urls.length > 1;
  const current = Math.min(index, urls.length - 1);
  const go = (step) => setIndex((current + step + urls.length) % urls.length);

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} — images`}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
    >
      <Box
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (!many || touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'shadow.md',
          '&:hover .gallery-zoom': { opacity: 1 },
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => setZoomed(current)}
          aria-label="View full size"
          sx={{ display: 'block', width: '100%', p: 0, m: 0, border: 0, bgcolor: 'transparent', cursor: 'zoom-in' }}
        >
          {/* Every image is in the page (the first eagerly); only the current one is visible. */}
          <Box sx={{ position: 'relative', width: '100%', aspectRatio: ratio }}>
            {urls.map((url, i) => (
              <Box
                key={url}
                aria-hidden={i !== current}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: i === current ? 1 : 0,
                  transition: 'opacity 300ms ease',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              >
                <FramedImage src={url} alt={many ? `${alt} — image ${i + 1} of ${urls.length}` : alt} ratio={ratio} eager={i === 0} />
              </Box>
            ))}
          </Box>
          <Box
            className="gallery-zoom"
            aria-hidden
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              bgcolor: 'rgba(15,37,69,0.6)',
              opacity: { xs: 1, md: 0 },
              transition: 'opacity 200ms ease',
            }}
          >
            <ZoomInIcon sx={{ fontSize: 16 }} />
            {many ? `${current + 1} / ${urls.length}` : 'View'}
          </Box>
        </Box>

        {many && (
          <>
            <IconButton aria-label="Previous image" onClick={() => go(-1)} sx={{ ...arrowSx, left: 10 }}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton aria-label="Next image" onClick={() => go(1)} sx={{ ...arrowSx, right: 10 }}>
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>

      {many && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1.25 }}>
          {urls.map((url, i) => (
            <Box
              key={url}
              component="button"
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1} of ${urls.length}`}
              aria-current={i === current ? 'true' : undefined}
              sx={{
                flex: '0 0 auto',
                width: { xs: 64, sm: 84 },
                p: 0,
                border: '2px solid',
                borderColor: i === current ? 'primary.main' : 'transparent',
                borderRadius: 1.5,
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: 'transparent',
                opacity: i === current ? 1 : 0.7,
                transition: 'opacity 150ms ease, border-color 150ms ease',
                '&:hover': { opacity: 1 },
              }}
            >
              <FramedImage src={url} alt="" ratio={ratio} />
            </Box>
          ))}
        </Box>
      )}

      <Lightbox urls={urls} index={zoomed} onIndex={setZoomed} onClose={() => setZoomed(null)} alt={alt} />
    </Box>
  );
}
