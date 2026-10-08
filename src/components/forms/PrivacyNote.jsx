import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

/**
 * The small line under every form's submit button: what the details are used for (`children`),
 * then a link to the Privacy Policy. Opens in a new tab so a half-filled form isn't lost.
 */
export default function PrivacyNote({ children, sx }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={sx}>
      {children}{' '}
      <Link component={RouterLink} to="/privacy" target="_blank" rel="noopener" underline="always">
        Privacy Policy
      </Link>
      .
    </Typography>
  );
}
