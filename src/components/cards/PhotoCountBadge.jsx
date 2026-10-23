import Box from '@mui/material/Box';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';

/** "5 photos" in the corner of a card's image — only when there's more than one to see. */
export default function PhotoCountBadge({ count }) {
  if (!count || count < 2) return null;
  return (
    <Box
      aria-label={`${count} photos`}
      sx={{
        position: 'absolute', right: 10, bottom: 10, display: 'inline-flex', alignItems: 'center', gap: 0.5,
        px: 1, py: 0.25, borderRadius: 999, bgcolor: 'rgba(15,37,69,0.7)', color: '#fff', fontSize: 12, fontWeight: 700,
        backdropFilter: 'blur(4px)',
      }}
    >
      <PhotoLibraryOutlinedIcon sx={{ fontSize: 15 }} />
      {count}
    </Box>
  );
}
