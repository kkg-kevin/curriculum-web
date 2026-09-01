import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }} role="status">
      <CircularProgress />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

export function ErrorBlock({ error, onRetry }) {
  const message = error?.message || 'Something went wrong.';
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" gutterBottom>
        We couldn’t load this
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  );
}

export function EmptyBlock({ title = 'Nothing here yet', body }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {body && <Typography color="text.secondary">{body}</Typography>}
    </Box>
  );
}
