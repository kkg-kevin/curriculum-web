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
import { PAGE_MAX_WIDTH, PAGE_GUTTER } from '../../theme/layout.js';

export const NAV_LINKS = [
  { label: 'Bootcamps', to: '/bootcamps' },
  { label: 'Home Schooling', to: '/home-schooling' },
  { label: 'Estate Tech Clubs', to: '/estate-tech-clubs' },
  { label: 'Schools', to: '/schools' },
  { label: 'Pathways', to: '/pathways' },
];

// Below this the full row of links no longer fits on one line, so the menu button takes over.
const FULL_NAV_MIN_WIDTH = 1024;

// Tighter than the theme's pill buttons, and never wrapping — "Home Schooling" used to break
// onto two lines.
const navLinkSx = {
  color: 'text.primary',
  px: { xs: 1.25, lg: 1.75 },
  py: 0.75,
  minWidth: 0,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  '&.active': { color: 'primary.main', fontWeight: 700 },
};

// The Enroll call to action — a compact pill the same height as a link's hover area, so it stands
// out by colour rather than filling the whole bar.
const enrollSx = { whiteSpace: 'nowrap', minHeight: 40, py: 0.75, px: 2.75, fontSize: '0.92rem' };

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(FULL_NAV_MIN_WIDTH));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
    >
      {/* Three zones — logo | links | actions. The outer two share the leftover width equally
          (1fr each), which keeps the links in the true centre of the bar however wide it is,
          instead of bunched against the right edge. */}
      <Toolbar
        sx={{
          maxWidth: PAGE_MAX_WIDTH,
          width: '100%',
          mx: 'auto',
          px: PAGE_GUTTER,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr auto' : '1fr auto 1fr',
          alignItems: 'center',
          columnGap: { xs: 2, lg: 4 },
          minHeight: { xs: 60, md: 72 },
        }}
      >
        {/* A flex box, not a plain block: as inline content the logo picked up line-height space
            below it and sat higher than the links and icons. */}
        <Box sx={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </Box>

        {!isMobile && (
          <Box
            component="nav"
            aria-label="Primary"
            // The links spread out as the bar gets wider.
            sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, lg: 1.5, xl: 2.5 } }}
          >
            {NAV_LINKS.map((link) => (
              <Button key={link.to} component={NavLink} to={link.to} sx={navLinkSx}>
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
          {!isMobile && (
            <Button component={NavLink} to="/enroll" variant="contained" sx={enrollSx}>
              Enroll
            </Button>
          )}
          <ColorModeToggle />
          {isMobile && (
            <IconButton edge="end" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </AppBar>
  );
}
