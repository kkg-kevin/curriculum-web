import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

/** Consistent page title block for listing / content pages. */
export default function PageHeader({ title, lead, children }) {
  return (
    <Box
      sx={{
        backgroundColor: 'surface.subtle',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h1" component="h1" sx={{ mb: lead ? 2 : 0 }}>
          {title}
        </Typography>
        {lead && (
          <Typography variant="h3" component="p" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 760 }}>
            {lead}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
}
