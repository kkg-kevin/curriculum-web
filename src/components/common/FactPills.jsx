import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

/**
 * The key facts of a bootcamp or club in a page's header — "Mon–Fri · 08:00–17:00", "Thika",
 * "Ages 5–17" — as icon pills that wrap, instead of one long grey sentence.
 * `items` is [{ key, Icon, label, href? }]; empty labels are skipped. A web `href` (a map link)
 * opens in a new tab; a `tel:` one doesn't.
 */
export default function FactPills({ items, sx }) {
  const shown = (items || []).filter((i) => i && i.label);
  if (shown.length === 0) return null;
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: 1, ...sx }}>
      {shown.map(({ key, Icon, label, href }) => {
        const content = (
          <>
            {Icon && <Icon sx={{ fontSize: 18, color: 'primary.main' }} />}
            <span>{label}</span>
          </>
        );
        const pillSx = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'text.primary',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        };
        return (
          <Box component="li" key={key || label}>
            {href ? (
              <Link href={href} target={/^https?:/.test(href) ? '_blank' : undefined} rel="noopener noreferrer" underline="none" sx={{ ...pillSx, '&:hover': { borderColor: 'primary.main' } }}>
                {content}
              </Link>
            ) : (
              <Box sx={pillSx}>{content}</Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
