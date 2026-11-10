import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

/**
 * A Store product page (a good or a project), laid out the way shoppers expect:
 *
 *   large screen   the photos on the left with the details under them; the buy panel on the right,
 *                  staying in view while the details scroll — one buy panel, never two.
 *   phone          photos → buy panel → details, so the price and the button come right after the
 *                  pictures (StickyBuyBar keeps a button in reach further down).
 *
 *   crumbs   [{ label, to }] Home → … → this page (the last has no `to`)
 *   gallery  the photos (or a stand-in)
 *   panel    the buy panel (ProductBuyPanel)
 *   children the details (about, highlights, what's included, specs…)
 */
export default function ProductLayout({ crumbs = [], gallery, panel, children }) {
  const trail = crumbs.slice(0, -1);
  const current = crumbs[crumbs.length - 1];
  return (
    <Box sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        {crumbs.length > 0 && (
          <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: { xs: 2, md: 3 }, fontSize: '0.875rem', color: 'text.secondary' }}>
            {trail.map((c) => (
              <Link key={c.to || c.label} component={RouterLink} to={c.to} underline="hover" color="inherit">{c.label}</Link>
            ))}
            {current && (
              <Typography component="span" aria-current="page" sx={{ fontSize: 'inherit', fontWeight: 600, color: 'text.primary', maxWidth: { xs: 180, sm: 'none' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {current.label}
              </Typography>
            )}
          </Breadcrumbs>
        )}
        <Box
          sx={{
            display: 'grid',
            columnGap: { md: 5, lg: 7 },
            rowGap: { xs: 3, md: 6 },
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.2fr) minmax(340px, 1fr)', lg: 'minmax(0, 1fr) 460px' },
            gridTemplateAreas: { xs: '"gallery" "panel" "details"', md: '"gallery panel" "details panel"' },
          }}
        >
          <Box sx={{ gridArea: 'gallery', minWidth: 0 }}>{gallery}</Box>
          {/* 96px clears the sticky site header. */}
          <Box sx={{ gridArea: 'panel', minWidth: 0, alignSelf: 'start', position: { md: 'sticky' }, top: { md: 96 } }}>{panel}</Box>
          <Box sx={{ gridArea: 'details', minWidth: 0 }}>{children}</Box>
        </Box>
      </Container>
    </Box>
  );
}
