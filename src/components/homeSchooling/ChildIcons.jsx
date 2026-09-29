import Box from '@mui/material/Box';
import EmojiPeopleRoundedIcon from '@mui/icons-material/EmojiPeopleRounded';

const MAX_SHOWN = 5;

/** A row of little figures — one per child — so "3 children" reads at a glance. */
export default function ChildIcons({ count, size = 22, color = 'primary.main' }) {
  const shown = Math.min(count, MAX_SHOWN);
  return (
    <Box component="span" aria-hidden sx={{ display: 'inline-flex', alignItems: 'center', color }}>
      {Array.from({ length: shown }, (_, i) => (
        <EmojiPeopleRoundedIcon key={i} sx={{ fontSize: size, ml: i === 0 ? 0 : -0.5 }} />
      ))}
      {count > MAX_SHOWN && (
        <Box component="span" sx={{ ml: 0.5, fontSize: size * 0.6, fontWeight: 800 }}>+{count - MAX_SHOWN}</Box>
      )}
    </Box>
  );
}
