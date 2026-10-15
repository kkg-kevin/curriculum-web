import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import PlaceIcon from '@mui/icons-material/Place';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Section from '../common/Section.jsx';
import MediaGallery from '../media/MediaGallery.jsx';
import { ClubPhotoPlaceholder } from './ClubLogo.jsx';
import HubMap from './HubMap.jsx';
import { groupAmenities, PRICING_MODEL_LABEL } from './amenities.js';
import { PROSE_MAX_WIDTH } from '../../theme/layout.js';

/**
 * One hub's profile from GET /api/public/hubs/:id — photo gallery, description, amenities,
 * bookable spaces and a "Get in touch" card. Shared by a bootcamp's hub page
 * (HubDetailPage, /bootcamps/:slug/hubs/:hubId) and an Estate Tech Club's own page
 * (EstateTechClubPage, /estate-tech-clubs/:slug), which differ only in their header band,
 * the button under the contact details (`sideAction`) and the call to action below.
 */
export default function HubProfile({ hub, sideAction = null, aboutHeading = 'About this hub' }) {
  const amenityGroups = groupAmenities(hub.amenities);

  return (
  <Section py={{ xs: 5, md: 7 }}>
    <Box sx={{ display: 'flex', gap: { xs: 5, md: 6 }, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* main column */}
      <Box sx={{ flex: '1 1 480px', minWidth: 0 }}>
        {/* Photos of the space only — the hub's logo (`photo`) is a brand mark, shown beside its
            name in the page header, never stretched into a photo frame. No photos yet: the
            brand panel with the logo, so the layout holds. */}
        <Box sx={{ mb: 5 }}>
          <MediaGallery
            images={hub.photos}
            alt={hub.name}
            fallback={<ClubPhotoPlaceholder logo={hub.photo} name={hub.name} />}
          />
        </Box>

        {hub.description && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
              {aboutHeading}
            </Typography>
            <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.75, fontSize: { md: '1.05rem' } }}>
              {hub.description}
            </Typography>
          </Box>
        )}

        {amenityGroups.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h4" component="h2">
                Amenities
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 3 }}>
              {amenityGroups.map((group) => (
                <Box key={group.key}>
                  {amenityGroups.length > 1 && (
                    <Typography
                      variant="overline"
                      sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em', mb: 1.25 }}
                    >
                      {group.label}
                    </Typography>
                  )}
                  <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' } }}>
                    {group.items.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <Box
                          key={item.value}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              flexShrink: 0,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              color: 'primary.dark',
                            }}
                          >
                            {Icon ? <Icon sx={{ fontSize: 18 }} /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {hub.spaces?.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Spaces available
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {hub.spaces.map((s, i) => (
                <Box
                  key={`${s.name}-${i}`}
                  sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                  {(s.building || s.floor || s.room) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {[s.building, s.floor, s.room && `Room ${s.room}`].filter(Boolean).join(' · ')}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EventSeatIcon sx={{ fontSize: 18 }} />
                      {s.minCapacity}–{s.maxCapacity} learners
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: 'primary.dark' }}>
                      {s.pricingModel === 'free' ? 'Free' : `KES ${s.rate}`}
                      {s.pricingModel !== 'free' && (
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500, ml: 0.5 }}>
                          {s.priceUnit || PRICING_MODEL_LABEL[s.pricingModel]}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Where it is — an embedded map of the address (none for an online club). */}
        {!hub.isVirtual && <HubMap name={hub.name} address={hub.address} mapLink={hub.mapLink} mapPin={hub.mapPin} />}
      </Box>

      {/* side column — contact card */}
      <Box sx={{ flex: '1 1 280px', minWidth: 260, maxWidth: { xs: '100%', md: 340 }, position: { md: 'sticky' }, top: { md: 100 } }}>
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Get in touch
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.75 }}>
            {hub.address && (
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                <PlaceIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
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
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                <MapIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Link href={hub.mapLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>
                  View on map
                </Link>
              </Box>
            )}
            {hub.contactPerson && (
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2">{hub.contactPerson}</Typography>
              </Box>
            )}
            {hub.phone && (
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Link href={`tel:${hub.phone}`} color="inherit" underline="hover">{hub.phone}</Link>
              </Box>
            )}
            {hub.email && (
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Link href={`mailto:${hub.email}`} color="inherit" underline="hover">{hub.email}</Link>
              </Box>
            )}
            {(hub.operatingHours?.opensAt || hub.operatingHours?.days?.length > 0) && (
              <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
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

          {sideAction}
        </Box>
      </Box>
    </Box>
  </Section>
  );
}
