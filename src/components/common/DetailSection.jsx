import { useId } from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * One section inside a detail page's body — "About this bootcamp", "Amenities", "Location"… —
 * so every detail page uses the same heading size, icon treatment and spacing. Lighter than the
 * marketing SectionHeading (that one is display-scale, for the home page's big bands).
 *
 * - `title`    the heading (an <h2>)
 * - `icon`     an icon element, shown in a small tinted tile before the title
 * - `eyebrow`  a small label above the title ("Curriculum")
 * - `lead`     one supporting line under the title
 * - `action`   something on the heading's right (a link, a button)
 *
 * `DetailHeading` is the heading block on its own, for a section whose wrapper is laid out by the
 * page itself; `tight` when the page puts its own paragraph straight under it.
 */
export function DetailHeading({ title, icon, eyebrow, lead, action, id, tight = false, sx }) {
  return (
    <Box sx={sx}>
      {eyebrow && (
        <Typography variant="overline" component="p" sx={{ display: 'block', color: 'text.secondary', mb: 0.75, lineHeight: 1.4 }}>
          {eyebrow}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: lead || tight ? 1 : 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          {icon && (
            <Box
              aria-hidden
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.1),
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
            </Box>
          )}
          <Typography id={id} variant="h4" component="h2" sx={{ fontSize: { xs: '1.2rem', md: '1.35rem' } }}>
            {title}
          </Typography>
        </Box>
        {action}
      </Box>
      {lead && (
        <Typography sx={{ color: 'text.secondary', mb: 2.5, maxWidth: 680, lineHeight: 1.65 }}>
          {lead}
        </Typography>
      )}
    </Box>
  );
}

export default function DetailSection({ title, icon, eyebrow, lead, action, id, children, sx }) {
  const autoId = useId();
  const headingId = id || `section-${autoId.replace(/:/g, '')}`;

  return (
    <Box component="section" aria-labelledby={headingId} sx={{ mb: { xs: 5, md: 7 }, '&:last-child': { mb: 0 }, ...sx }}>
      <DetailHeading id={headingId} title={title} icon={icon} eyebrow={eyebrow} lead={lead} action={action} />
      {children}
    </Box>
  );
}
