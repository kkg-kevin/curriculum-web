import { useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const navSx = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#fff',
  bgcolor: 'rgba(255,255,255,0.12)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' },
};

/**
 * Full-screen view of a gallery's images (MediaGallery opens it on click): the whole image as
 * large as the screen allows, arrows / arrow keys / swipe to move, Esc or × to close.
 * `urls` are already resolved.
 */
export default function Lightbox({ urls, index, onIndex, onClose, alt }) {
  const touchX = useRef(null);
  const open = index !== null;
  const many = urls.length > 1;
  const go = (step) => onIndex((index + step + urls.length) % urls.length);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-label={`${alt} — full-screen images`}
      PaperProps={{ sx: { bgcolor: 'rgba(8,14,26,0.96)', backgroundImage: 'none' } }}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
    >
      {open && (
        <Box
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (!many || touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }}
          sx={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center', p: { xs: 2, md: 8 } }}
        >
          <Box
            component="img"
            src={urls[index]}
            alt={many ? `${alt} — image ${index + 1} of ${urls.length}` : alt}
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1 }}
          />
          <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' } }}>
            <CloseIcon />
          </IconButton>
          {many && (
            <>
              <IconButton aria-label="Previous image" onClick={() => go(-1)} sx={{ ...navSx, left: { xs: 8, md: 24 } }}>
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
              <IconButton aria-label="Next image" onClick={() => go(1)} sx={{ ...navSx, right: { xs: 8, md: 24 } }}>
                <ChevronRightIcon fontSize="large" />
              </IconButton>
              <Typography sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                {index + 1} / {urls.length}
              </Typography>
            </>
          )}
        </Box>
      )}
    </Dialog>
  );
}
