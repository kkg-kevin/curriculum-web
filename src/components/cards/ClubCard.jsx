import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FramedImage from '../media/FramedImage.jsx';
import ClubLogo from '../hubs/ClubLogo.jsx';
import { clubPath, scheduleLabel } from '../../utils/clubs.js';
import { formatKsh, periodUnit } from '../../content/homeSchooling.js';

/**
 * One card on the Estate Tech Clubs page (`/estate-tech-clubs`). `hub` is the list entry from
 * GET /api/public/hubs ({ id, name, hubTypeLabel, deliveryLabel, isVirtual, town, schedule });
 * `profile` is its full profile from GET /api/public/hubs/:id once loaded (photo, address) — the
 * card shows the brand band and the town until then. Links to the club's own page.
 * `fromPrice` is the cheapest package on offer there — { amount, billingPeriod } (none = the club
 * takes enquiries only).
 */
export default function ClubCard({ hub, profile, fromPrice }) {
  // A photo of the space, never the logo (that's the badge beside the name).
  const photo = profile?.photos?.[0];
  const where = hub.isVirtual ? 'Online' : profile?.address || hub.town;
  const when = scheduleLabel(hub.schedule);
  const kicker = [hub.hubTypeLabel, hub.deliveryLabel].filter(Boolean).join(' · ').toUpperCase();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg', borderColor: 'primary.main' },
        '&:hover .club-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={clubPath(hub)}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%', '&:hover': { backgroundColor: 'transparent' } }}
      >
        {/* A photo of the space, clean (no title over it), shown whole. No photo yet: the brand
            panel with the club's logo, the same shape, so a row of cards lines up. */}
        <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
          <FramedImage
            src={photo}
            alt={hub.name}
            fallback={
              <Box
                aria-hidden
                sx={{
                  aspectRatio: '16 / 10',
                  display: 'grid',
                  placeItems: 'center',
                  background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
                }}
              >
                <ClubLogo src={profile?.photo} name={hub.name} size={84} sx={{ borderColor: 'transparent' }} />
              </Box>
            }
          />
        </Box>

        <CardContent sx={{ p: 2.5, display: 'grid', gap: 1.25, flexGrow: 1, alignContent: 'start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ClubLogo src={profile?.photo} name={hub.name} size={44} />
            <Box sx={{ minWidth: 0 }}>
              {kicker && (
                <Typography component="span" sx={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'primary.main' }}>
                  {kicker}
                </Typography>
              )}
              <Typography component="h2" sx={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.25 }}>
                {hub.name}
              </Typography>
            </Box>
          </Box>
          {where && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <PlaceIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.2 }} />
              <Typography variant="body2" color="text.secondary">{where}</Typography>
            </Box>
          )}
          {when && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary">{when}</Typography>
            </Box>
          )}
          {fromPrice && (
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              From {formatKsh(fromPrice.amount)} <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>/ {periodUnit(fromPrice.billingPeriod)} · join online</Box>
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 'auto', pt: 1, color: 'primary.main', fontWeight: 700 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>View club</Typography>
            <ArrowForwardIcon className="club-arrow" sx={{ fontSize: 18, transition: 'transform 200ms ease' }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
