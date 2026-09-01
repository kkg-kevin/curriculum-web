import { NavLink } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Logo from '../common/Logo.jsx';
import ColorModeToggle from '../common/ColorModeToggle.jsx';

export default function MobileMenu({ open, onClose, links }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 280 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Logo onClick={onClose} />
        <IconButton aria-label="Close menu" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box component="nav" aria-label="Primary" sx={{ px: 1 }}>
        <List>
          {links.map((link) => (
            <ListItemButton
              key={link.to}
              component={NavLink}
              to={link.to}
              onClick={onClose}
              sx={{ '&.active .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 } }}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
          <ListItemButton component={NavLink} to="/contact" onClick={onClose}>
            <ListItemText primary="Contact" />
          </ListItemButton>
        </List>
      </Box>

      <Box sx={{ px: 1, mt: 'auto' }}>
        <Divider sx={{ mb: 1 }} />
        <ColorModeToggle variant="row" />
      </Box>

      <Box sx={{ p: 2 }}>
        <Button component={NavLink} to="/enroll" onClick={onClose} variant="contained" fullWidth>
          Enroll a learner
        </Button>
      </Box>
    </Drawer>
  );
}
