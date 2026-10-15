import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * "Location" card on a club's (hub's) page: an embedded Google Map — Google's keyless embed
 * (maps?q=…&output=embed), so there is no API key to set up or pay for — and a link to open it in
 * Google Maps (the hub's own map link from the portal when it has one; otherwise a search).
 *
 * What the map shows, most exact first: `mapPin` from the API (read from the hub's map link) —
 * its coordinates, or the place name it names plus the address — else the typed address.
 * Coordinates give a pin on the exact spot; an address Google can't find gives only the area.
 *
 * Nothing for an online club or a hub without an address. The map is Google's own frame, loaded
 * only when scrolled near (loading="lazy"); the privacy page says Google may set its own cookies.
 */
export default function HubMap({ name, address, mapLink, mapPin }) {
  if (!address && !mapPin) return null;
  const inKenya = (text) => (/kenya/i.test(text) ? text : `${text}, Kenya`);
  const query =
    mapPin?.lat !== undefined && mapPin?.lng !== undefined
      ? `${mapPin.lat},${mapPin.lng}`
      : mapPin?.query
        ? inKenya([mapPin.query, address].filter(Boolean).join(', '))
        : inKenya(address);
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  const open = mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <Box
      component="section"
      aria-labelledby="hub-location"
      sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <Typography id="hub-location" variant="h4" component="h2" sx={{ mb: 2 }}>
        Location
      </Typography>
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: { xs: '4 / 3', sm: '16 / 9' }, borderRadius: 2, overflow: 'hidden', bgcolor: 'surface.imagePlaceholder' }}>
        <Box
          component="iframe"
          title={`Map of ${name}`}
          src={embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {address || name}
        </Typography>
        <Link href={open} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: '0.9rem' }}>
          Open in Google Maps <OpenInNewIcon sx={{ fontSize: 16 }} />
        </Link>
      </Box>
    </Box>
  );
}
