import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { formatDate } from '../../utils/dates.js';
import { entryOptions, registerTarget } from '../../utils/competitions.js';

// "Register now" for a track: its outside form, or our registration page; disabled with the
// reason while registration isn't open.
export function RegisterButton({ slug, track, registration, size, fullWidth, color = 'primary', sx }) {
  if (!registration?.open) {
    return (
      <Button variant="contained" disabled size={size} fullWidth={fullWidth} sx={sx}>
        {registration?.opensOn ? `Opens ${formatDate(registration.opensOn)}` : 'Registration closed'}
      </Button>
    );
  }
  const target = registerTarget(slug, track);
  return target.external ? (
    <Button component="a" href={target.href} target="_blank" rel="noopener noreferrer" variant="contained" color={color} endIcon={<OpenInNewIcon />} size={size} fullWidth={fullWidth} sx={sx}>
      Register now
    </Button>
  ) : (
    <Button component={RouterLink} to={target.to} variant="contained" color={color} endIcon={<ArrowForwardIcon />} size={size} fullWidth={fullWidth} sx={sx}>
      Register now
    </Button>
  );
}

// The ways in and their fees: "Individual · KES 1,500", "Team (2–4) · KES 5,000".
export function EntryFees({ track, dense }) {
  const options = entryOptions(track);
  if (!options.length) return null;
  return (
    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: dense ? '1fr' : { xs: '1fr', sm: `repeat(${options.length}, minmax(0, 1fr))` } }}>
      {options.map((o) => (
        <Box key={o.type} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: (t) => alpha(o.type === 'group' ? t.palette.secondary.main : t.palette.primary.main, 0.08), minWidth: 0 }}>
          {o.type === 'group' ? <GroupsRoundedIcon sx={{ color: 'secondary.dark', flexShrink: 0 }} /> : <PersonRoundedIcon sx={{ color: 'primary.dark', flexShrink: 0 }} />}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{o.label}</Typography>
            <Typography sx={{ fontWeight: 900, lineHeight: 1.3 }}>{o.fee}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{o.detail}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
