import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

/**
 * The header band every detail page opens with (a bootcamp, a club, a project, a store item, a
 * competition, a pathway): the warm band with a coloured top edge, the breadcrumb trail, then the
 * page's own title block as `children`. One place, so all of them share the same padding, trail
 * and spacing instead of each page rolling its own copy.
 *
 * - `crumbs`  [{ label, to }] from Home to the current page; the last one is the page itself and
 *             takes no `to`.
 * - `accent`  colour of the top edge (a theme path or a hex — a pathway passes its own colour).
 *
 * A plain <div>, not <header>: the print stylesheet hides <header> elements (site chrome).
 */
export default function DetailHero({ crumbs = [], accent = 'primary.dark', children, sx }) {
  const trail = crumbs.slice(0, -1);
  const current = crumbs[crumbs.length - 1];

  return (
    <Box
      sx={{
        backgroundColor: 'surface.subtle',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderTop: '4px solid',
        borderTopColor: accent,
        py: { xs: 3.5, md: 5.5 },
        ...sx,
      }}
    >
      <Container maxWidth="lg">
        {crumbs.length > 0 && (
          <Breadcrumbs
            aria-label="Breadcrumb"
            sx={{
              mb: { xs: 2, md: 2.5 },
              fontSize: '0.9rem',
              color: 'text.secondary',
              '& .MuiBreadcrumbs-ol': { rowGap: 0.25 },
            }}
          >
            {trail.map((c) => (
              <Link key={c.to || c.label} component={RouterLink} to={c.to} underline="hover" color="inherit">
                {c.label}
              </Link>
            ))}
            {current && (
              <Typography component="span" aria-current="page" sx={{ fontSize: 'inherit', fontWeight: 600, color: 'text.primary' }}>
                {current.label}
              </Typography>
            )}
          </Breadcrumbs>
        )}
        {children}
      </Container>
    </Box>
  );
}
