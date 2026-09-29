import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChildIcons from './ChildIcons.jsx';
import { childrenLabel, formatKsh, homeSchoolingSignupPath, perChildAmount } from '../../content/homeSchooling.js';

function Point({ icon: Icon = CheckCircleRoundedIcon, children }) {
  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
      <Icon sx={{ fontSize: 20, mt: '1px', color: 'success.main', flexShrink: 0 }} />
      <Typography variant="body2" sx={{ color: 'text.primary' }}>{children}</Typography>
    </Box>
  );
}

/**
 * One Home Schooling package. A package with a badge (set by the team in the curriculum system)
 * is the featured one: ribboned, outlined in brand blue and lifted.
 * `highestPerChild` is the highest per-child price on offer, for the "save per child" line.
 */
export default function PackageCard({ pkg, highestPerChild }) {
  const featured = Boolean(pkg.badge);
  const perChild = perChildAmount(pkg);
  const saving = highestPerChild - perChild;
  const points = pkg.features.length ? pkg.features : [`Home learning for ${childrenLabel(pkg.childrenIncluded)}`];

  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
        border: featured ? '2px solid' : '1px solid',
        borderColor: featured ? 'primary.main' : 'surface.ring',
        bgcolor: 'surface.card',
        boxShadow: featured ? 'shadow.glow' : 'shadow.md',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        transform: { md: featured ? 'translateY(-10px)' : 'none' },
        '@media (hover: hover)': {
          '&:hover': { transform: { md: featured ? 'translateY(-14px)' : 'translateY(-4px)' }, boxShadow: featured ? 'shadow.glow' : 'shadow.lg' },
        },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            px: 2,
            py: 0.6,
            borderRadius: 999,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            boxShadow: 'shadow.md',
          }}
        >
          {pkg.badge}
        </Box>
      )}

      <Box sx={{ p: { xs: 3, sm: 3.5 }, pt: featured ? { xs: 4, sm: 4.5 } : undefined, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          <Box sx={{ px: 1.25, py: 0.5, borderRadius: 999, bgcolor: 'surface.subtle', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
            <ChildIcons count={pkg.childrenIncluded} size={18} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{childrenLabel(pkg.childrenIncluded)}</Typography>
          </Box>
        </Box>

        <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>{pkg.name}</Typography>
        {pkg.summary && <Typography variant="body2" color="text.secondary">{pkg.summary}</Typography>}

        <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography component="p" sx={{ fontSize: { xs: '2.3rem', sm: '2.6rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', color: featured ? 'primary.main' : 'text.primary' }}>
            {formatKsh(pkg.monthlyAmount)}
          </Typography>
          <Typography color="text.secondary">/ month</Typography>
        </Box>

        <Box sx={{ mt: 1, minHeight: 26, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {pkg.childrenIncluded > 1 && (
            <Typography variant="body2" color="text.secondary">{formatKsh(perChild)} per child</Typography>
          )}
          {saving > 0 && (
            <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, color: 'success.dark', bgcolor: (t) => `${t.palette.success.main}1f` }}>
              Save {formatKsh(saving)} per child
            </Box>
          )}
        </Box>

        <Box sx={{ my: 2.5, borderTop: '1px dashed', borderColor: 'divider' }} />

        <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 1 }}>What’s included</Typography>
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 3, display: 'grid', gap: 1.25 }}>
          {points.map((point) => <Point key={point}>{point}</Point>)}
          {pkg.allowExtraChildren && pkg.extraChildAmount != null && (
            <Point icon={AddCircleOutlineRoundedIcon}>
              Add more children for {formatKsh(pkg.extraChildAmount)} / month each (up to {pkg.maxChildren})
            </Point>
          )}
        </Box>

        <Button
          component={RouterLink}
          to={homeSchoolingSignupPath(pkg.slug)}
          variant={featured ? 'contained' : 'outlined'}
          color={featured ? 'secondary' : 'primary'}
          size="large"
          endIcon={<ArrowForwardIcon />}
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Choose {pkg.name}
        </Button>
      </Box>
    </Box>
  );
}
