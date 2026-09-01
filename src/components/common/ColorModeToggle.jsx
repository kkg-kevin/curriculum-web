import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import ComputerIcon from '@mui/icons-material/ComputerOutlined';
import { useColorMode } from '../../theme/ColorModeProvider.jsx';

const NEXT_LABEL = {
  light: 'Switch to dark theme',
  dark: 'Match system theme',
  system: 'Switch to light theme',
};

const ICON = {
  light: LightModeIcon,
  dark: DarkModeIcon,
  system: ComputerIcon,
};

/**
 * Colour-mode control. Cycles light → dark → system.
 *
 * variant="icon"  — compact icon button (desktop header)
 * variant="row"   — full-width labelled row (mobile menu)
 */
export default function ColorModeToggle({ variant = 'icon' }) {
  const { pref, cycle } = useColorMode();
  const Icon = ICON[pref];
  const label = NEXT_LABEL[pref];
  const current = pref === 'system' ? 'System' : pref === 'dark' ? 'Dark' : 'Light';

  if (variant === 'row') {
    return (
      <Box
        component="button"
        type="button"
        onClick={cycle}
        aria-label={label}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          px: 2,
          py: 1.25,
          border: 0,
          background: 'transparent',
          color: 'text.primary',
          cursor: 'pointer',
          font: 'inherit',
          textAlign: 'left',
          borderRadius: 1,
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Icon fontSize="small" />
        <Typography component="span">Theme</Typography>
        <Typography component="span" sx={{ ml: 'auto', color: 'text.secondary' }}>
          {current}
        </Typography>
      </Box>
    );
  }

  return (
    <Tooltip title={label}>
      <IconButton onClick={cycle} aria-label={label} color="inherit" size="small">
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
