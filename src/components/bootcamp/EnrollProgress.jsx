import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

/**
 * Where a parent is in a bootcamp's enrolment (BootcampEnrollPage): "Date of birth → Short
 * diagnostic → Enrol & pay" (no diagnostic step when the bootcamp has none). Steps before `active`
 * show a tick, `active` is highlighted, later ones are muted. Fits a phone: three short labels
 * under their numbers.
 */
export default function EnrollProgress({ steps, active }) {
  return (
    <Box
      component="ol"
      aria-label="Enrolment steps"
      sx={{
        listStyle: 'none', m: 0, p: 0, mt: { xs: 2.5, md: 3 },
        display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, maxWidth: 560,
      }}
    >
      {steps.map((label, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <Box
            component="li"
            key={label}
            aria-current={current ? 'step' : undefined}
            sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.75 }}
          >
            {/* The line to the next step, behind the numbers. */}
            {i < steps.length - 1 && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute', top: 15, left: 'calc(50% + 20px)', right: 'calc(-50% + 20px)', height: 2, borderRadius: 1,
                  bgcolor: done ? 'primary.main' : 'divider',
                }}
              />
            )}
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
                border: '2px solid',
                borderColor: done || current ? 'primary.main' : 'divider',
                bgcolor: done ? 'primary.main' : current ? 'background.paper' : 'transparent',
                color: done ? 'primary.contrastText' : current ? 'primary.main' : 'text.secondary',
                boxShadow: current ? (t) => `0 0 0 4px ${t.palette.primary.main}22` : 'none',
              }}
            >
              {done ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : i + 1}
            </Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: current ? 700 : 500, color: current ? 'text.primary' : 'text.secondary', lineHeight: 1.3, px: 0.5 }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
