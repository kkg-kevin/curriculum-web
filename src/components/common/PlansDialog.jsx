import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PackageCard from '../homeSchooling/PackageCard.jsx';

/**
 * "See plans" from a list card (a pathway, an Estate Tech Club): the full plan cards — period
 * switch, price box, what's included, Choose — over the list, so a family can see the price and
 * choose without opening the page first. `linkFor(pkg, period)` is where each Choose goes;
 * `fallbackFeature` — a line, or (pkg) => line, for a package that lists no features.
 * Full screen on a phone.
 */
export default function PlansDialog({ open, onClose, title, lead, plans, linkFor, fallbackFeature, actionLabel }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const single = (plans || []).length === 1;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={phone}
      fullWidth
      maxWidth={single ? 'xs' : 'md'}
      aria-labelledby="plans-dialog-title"
      PaperProps={{ sx: { borderRadius: phone ? 0 : 5, bgcolor: 'background.default', backgroundImage: 'none' } }}
    >
      <Box sx={{ p: { xs: 2.5, sm: 3 }, pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography id="plans-dialog-title" variant="h5" component="h2" sx={{ fontWeight: 800 }}>{title}</Typography>
          {lead && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{lead}</Typography>}
        </Box>
        <IconButton onClick={onClose} aria-label="Close" sx={{ flexShrink: 0, mt: -0.5 }}><CloseRoundedIcon /></IconButton>
      </Box>
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          pt: { xs: 2.5, sm: 3 },
          display: 'grid',
          gap: 3,
          gridTemplateColumns: single ? '1fr' : { xs: '1fr', sm: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' },
          alignItems: 'stretch',
        }}
      >
        {(plans || []).map((plan) => (
          <PackageCard
            key={plan.id || plan.slug}
            pkg={plan}
            linkFor={(period) => linkFor(plan, period)}
            fallbackFeature={typeof fallbackFeature === 'function' ? fallbackFeature(plan) : fallbackFeature}
            actionLabel={actionLabel}
          />
        ))}
      </Box>
    </Dialog>
  );
}
