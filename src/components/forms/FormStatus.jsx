import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

/**
 * Shared success/error banner for the forms.
 *
 * The wrapper is always rendered with aria-live so screen readers announce the
 * result the moment it appears — a bare conditional <Alert> is inserted after
 * the live region is first read and can be missed. (No role="status" here so it
 * doesn't read as a loading indicator to the prerender readiness check.)
 */
export default function FormStatus({ status, successMessage, error }) {
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <Box aria-live="polite" aria-atomic="true" sx={{ '&:empty': { display: 'none' } }}>
      {isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage || 'Thanks! We’ll be in touch soon.'}
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'We couldn’t send that. Please try again, or email us directly.'}
        </Alert>
      )}
    </Box>
  );
}
