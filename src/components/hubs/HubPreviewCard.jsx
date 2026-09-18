import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SmartImage from '../common/SmartImage.jsx';
import { usePublicHub } from '../../hooks/usePublicHubs.js';
import { formatDateRange } from '../../utils/dates.js';

const RUN_STATUS_LABEL = { upcoming: 'Upcoming', active: 'Running now' };

/**
 * In-place preview of a hub a bootcamp runs at — opened by clicking a "Running at" card on
 * BootcampDetailPage instead of navigating to the full /bootcamps/:slug/hubs/:hubId page (which
 * forced a back-navigation to return to the bootcamp). Renders in the sticky sidebar, right next
 * to the booking box, and closes via the X or by clicking the same "Running at" card again.
 */
export default function HubPreviewCard({ hubId, run, onClose }) {
  const { data: hub, isLoading, isError } = usePublicHub(hubId);

  return (
    <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: isLoading ? 1.5 : 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {hub?.name || 'Hub details'}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close hub preview" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </Box>
      )}

      {isError && !isLoading && (
        <Typography variant="body2" color="text.secondary">
          Couldn&apos;t load this hub&apos;s details right now.
        </Typography>
      )}

      {hub && !isLoading && (
        <>
          {hub.photo ? (
            <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
              <SmartImage src={hub.photo} alt={hub.name} ratio="16 / 9" rounded={false} />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: 2,
                mb: 2,
                display: 'grid',
                placeItems: 'center',
                background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
              }}
            >
              <EventIcon sx={{ color: '#fff', opacity: 0.85, fontSize: 32 }} />
            </Box>
          )}

          {run?.status && RUN_STATUS_LABEL[run.status] && (
            <Chip
              size="small"
              label={RUN_STATUS_LABEL[run.status]}
              sx={{
                mb: 1.5,
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: (t) => alpha(run.status === 'active' ? t.palette.success.main : t.palette.info.main, 0.12),
                color: run.status === 'active' ? 'success.dark' : 'info.dark',
              }}
            />
          )}

          {(run?.startDate || run?.endDate) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {formatDateRange(run.startDate, run.endDate) || 'Dates to be confirmed'}
            </Typography>
          )}

          {hub.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {hub.description}
            </Typography>
          )}

          <Box sx={{ display: 'grid', gap: 1.25 }}>
            {hub.address && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <PlaceIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.2 }} />
                <Typography variant="body2">
                  {hub.address}
                  {hub.mapLink && (
                    <>
                      {' · '}
                      <Link href={hub.mapLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        View on map
                      </Link>
                    </>
                  )}
                </Typography>
              </Box>
            )}
            {!hub.address && hub.mapLink && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <MapIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Link href={hub.mapLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>
                  View on map
                </Link>
              </Box>
            )}
            {hub.contactPerson && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PersonIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">{hub.contactPerson}</Typography>
              </Box>
            )}
            {hub.phone && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <PhoneIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Link href={`tel:${hub.phone}`} color="inherit" underline="hover" variant="body2">{hub.phone}</Link>
              </Box>
            )}
            {hub.email && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <EmailIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Link href={`mailto:${hub.email}`} color="inherit" underline="hover" variant="body2">{hub.email}</Link>
              </Box>
            )}
            {(hub.operatingHours?.opensAt || hub.operatingHours?.days?.length > 0) && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 18, mt: 0.2 }} />
                <Box>
                  {hub.operatingHours.opensAt && hub.operatingHours.closesAt && (
                    <Typography variant="body2">{hub.operatingHours.opensAt} – {hub.operatingHours.closesAt}</Typography>
                  )}
                  {hub.operatingHours.days?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {hub.operatingHours.days.map((d) => (
                        <Chip key={d} size="small" label={d} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
