import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Logo from '../common/Logo.jsx';
import ColorModeToggle from '../common/ColorModeToggle.jsx';
import MobileMenu from './MobileMenu.jsx';

export const NAV_LINKS = [
  { label: 'Bootcamps', to: '/bootcamps' },
  { label: 'Competitions', to: '/competitions' },
  { label: 'Projects', to: '/projects' },
  { label: 'Pathways', to: '/pathways' },
  { label: 'Quarky', to: '/quarky' },
  { label: 'About', to: '/about' },
];

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
    >
      <Toolbar sx={{ maxWidth: 'lg', width: '100%', mx: 'auto', gap: 2 }}>
        <Logo />
        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <Box component="nav" aria-label="Primary" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.to}
                component={NavLink}
                to={link.to}
                sx={{
                  color: 'text.primary',
                  '&.active': { color: 'primary.main', fontWeight: 700 },
                }}
              >
                {link.label}
              </Button>
            ))}
            <Button component={NavLink} to="/contact" variant="text" sx={{ color: 'text.primary' }}>
              Contact
            </Button>
            <Button component={NavLink} to="/enroll" variant="contained" sx={{ ml: 1 }}>
              Enroll
            </Button>
            <Box sx={{ ml: 0.5 }}>
              <ColorModeToggle />
            </Box>
          </Box>
        )}

        {isMobile && (
          <>
            <ColorModeToggle />
            <IconButton edge="end" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          </>
        )}
      </Toolbar>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </AppBar>
  );
}
