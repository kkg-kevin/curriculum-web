import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import { API_URL } from '../../config/env.js';

/**
 * A person's ticket for a general event, on their registration page (/events/registration/:token):
 * the QR code the team scans at the door (served by the API — the same image as in their emails),
 * the ticket code in big letters for when there's no signal, who it's for and how many it admits.
 * "Print or save as PDF" prints the ticket alone (the browser's print dialog saves a PDF too).
 * Online events get the code without a QR — there's no door.
 */
export const ticketQrUrl = (token) => `${String(API_URL).replace(/\/+$/, '')}/api/public/event-registrations/${encodeURIComponent(token)}/ticket.png`;

export default function EventTicket({ token, code, name, partySize, event }) {
  const online = event.format === 'online';
  return (
    <>
      {/* Printing shows the ticket and nothing else. */}
      <GlobalStyles styles={{
        '@media print': {
          'body *': { visibility: 'hidden' },
          '.event-ticket, .event-ticket *': { visibility: 'visible' },
          '.event-ticket': { position: 'absolute', left: 0, top: 0, width: '100%', boxShadow: 'none !important' },
          '.event-ticket .no-print': { display: 'none !important' },
        },
      }} />
      <Box
        className="event-ticket"
        sx={{
          position: 'relative', borderRadius: 4, overflow: 'hidden', bgcolor: 'surface.card',
          border: '2px dashed', borderColor: 'primary.light', boxShadow: 'shadow.md',
          display: 'grid', gridTemplateColumns: { xs: '1fr', sm: online ? '1fr' : 'minmax(0, 1fr) auto' },
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'grid', gap: 1, alignContent: 'start' }}>
          <Typography sx={{ display: 'flex', gap: 0.75, alignItems: 'center', fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: 'secondary.main' }}>
            <ConfirmationNumberRoundedIcon fontSize="small" /> YOUR TICKET
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 900, lineHeight: 1.25 }}>{event.title}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{event.when}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{event.where}</Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>NAME</Typography>
              <Typography sx={{ fontWeight: 800 }}>{name}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}>ADMITS</Typography>
              <Typography sx={{ fontWeight: 800 }}>{partySize} {partySize === 1 ? 'person' : 'people'}</Typography>
            </Box>
          </Box>
          <Typography sx={{ mt: 1, fontFamily: 'Consolas, "Courier New", monospace', fontSize: { xs: 26, sm: 30 }, fontWeight: 800, letterSpacing: '0.12em', color: 'text.primary' }}>{code}</Typography>
          <Typography variant="body2" color="text.secondary">
            {online ? 'Your ticket code — the join link appears on this page the day before.' : 'Show this QR code at the entrance — or just tell us your ticket code.'}
          </Typography>
          <Box className="no-print" sx={{ mt: 1 }}>
            <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Print or save as PDF</Button>
          </Box>
        </Box>
        {!online && (
          <Box sx={{
            p: { xs: 2.5, sm: 3 }, display: 'grid', placeItems: 'center', bgcolor: 'surface.subtle',
            borderTop: { xs: '2px dashed', sm: 'none' }, borderLeft: { xs: 'none', sm: '2px dashed' }, borderColor: { xs: 'primary.light', sm: 'primary.light' },
          }}>
            <Box component="img" src={ticketQrUrl(token)} alt={`QR code for ticket ${code}`} width={200} height={200} sx={{ width: 200, height: 200, display: 'block', borderRadius: 2, bgcolor: '#fff' }} />
          </Box>
        )}
      </Box>
    </>
  );
}
