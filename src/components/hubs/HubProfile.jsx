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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import Section from '../common/Section.jsx';
import DetailSection from '../common/DetailSection.jsx';
import MediaGallery from '../media/MediaGallery.jsx';
import { ClubPhotoPlaceholder } from './ClubLogo.jsx';
import HubMap from './HubMap.jsx';
import { groupAmenities, PRICING_MODEL_LABEL } from './amenities.js';
import { PROSE_MAX_WIDTH } from '../../theme/layout.js';

/**
 * One hub's profile from GET /api/public/hubs/:id — photo gallery, description, bookable spaces,
 * amenities, a map and a "Get in touch" card. Shared by a bootcamp's hub page
 * (HubDetailPage, /bootcamps/:slug/hubs/:hubId) and an Estate Tech Club's own page
 * (EstateTechClubPage, /estate-tech-clubs/:slug), which differ only in their header band,
 * the button under the contact details (`sideAction`) and the call to action below.
 *
 * Layout: the gallery with the contact card beside it (the card stays in view while the rest
 * scrolls), then the details. On a phone the contact card comes straight after the gallery, so
 * the phone number and the enquiry button are near the top rather than below the map.
 */

// The rows of the contact card: an icon, then the line.
function ContactRow({ Icon, children, alignTop = false }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: alignTop ? 'flex-start' : 'center', minWidth: 0 }}>
      <Icon aria-hidden sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0, mt: alignTop ? 0.2 : 0 }} />
      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children}</Box>
    </Box>
  );
}

function ContactCard({ hub, sideAction, sideTop, hideHours }) {
  const hours = hideHours ? null : hub.operatingHours;
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'surface.ring',
        bgcolor: 'surface.card',
        boxShadow: 'shadow.md',
      }}
    >
      {sideTop}
      <Typography variant="h4" component="h2" sx={{ fontSize: '1.1rem', mb: 2 }}>
        Get in touch
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.75 }}>
        {hub.address && (
          <ContactRow Icon={PlaceIcon} alignTop>
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
          </ContactRow>
        )}
        {!hub.address && hub.mapLink && (
          <ContactRow Icon={MapIcon}>
            <Link href={hub.mapLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>
              View on map
            </Link>
          </ContactRow>
        )}
        {hub.contactPerson && (
          <ContactRow Icon={PersonIcon}>
            <Typography variant="body2">{hub.contactPerson}</Typography>
          </ContactRow>
        )}
        {hub.phone && (
          <ContactRow Icon={PhoneIcon}>
            <Link href={`tel:${hub.phone.replace(/\s/g, '')}`} color="inherit" underline="hover" variant="body2">
              {hub.phone}
            </Link>
          </ContactRow>
        )}
        {hub.email && (
          <ContactRow Icon={EmailIcon}>
            <Link href={`mailto:${hub.email}`} color="inherit" underline="hover" variant="body2">
              {hub.email}
            </Link>
          </ContactRow>
        )}
        {(hours?.opensAt || hours?.days?.length > 0) && (
          <ContactRow Icon={AccessTimeIcon} alignTop>
            {hours.opensAt && hours.closesAt && (
              <Typography variant="body2">
                {hours.opensAt} – {hours.closesAt}
              </Typography>
            )}
            {hours.days?.length > 0 && (
              <Box component="ul" aria-label="Open on" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {hours.days.map((d) => (
                  <li key={d}>
                    <Chip size="small" label={d} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
                  </li>
                ))}
              </Box>
            )}
          </ContactRow>
        )}
      </Box>

      {sideAction}
    </Box>
  );
}

function AmenityPanel({ groups }) {
  const many = groups.length > 1;
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2.5, md: 3 },
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'surface.ring',
        bgcolor: 'surface.card',
      }}
    >
      {groups.map((group) => (
        <Box key={group.key} sx={{ minWidth: 0 }}>
          {many && (
            <Typography variant="overline" component="h3" sx={{ display: 'block', color: 'text.secondary', mb: 1.25, lineHeight: 1.4 }}>
              {group.label}
            </Typography>
          )}
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
            {group.items.map((item) => {
              const Icon = item.Icon;
              return (
                <Box component="li" key={item.value} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: 'primary.dark',
                    }}
                  >
                    {Icon ? <Icon sx={{ fontSize: 17 }} /> : <AutoAwesomeIcon sx={{ fontSize: 15 }} />}
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
  );
}

function SpaceCard({ space: s }) {
  const free = s.pricingModel === 'free';
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'surface.ring',
        bgcolor: 'surface.card',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1rem' }}>
        {s.name}
      </Typography>
      {(s.building || s.floor || s.room) && (
        <Typography variant="body2" color="text.secondary">
          {[s.building, s.floor, s.room && `Room ${s.room}`].filter(Boolean).join(' · ')}
        </Typography>
      )}
      {/* Pushes the capacity and price to the bottom, so cards side by side line up. */}
      <Box aria-hidden sx={{ flexGrow: 1, minHeight: 12 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EventSeatIcon aria-hidden sx={{ fontSize: 18, alignSelf: 'center' }} />
          {s.minCapacity}–{s.maxCapacity} learners
        </Typography>
        {/* The amount and its unit stay together on one line. */}
        <Typography sx={{ fontWeight: 700, color: 'primary.dark', whiteSpace: 'nowrap' }}>
          {free ? 'Free' : `KES ${s.rate}`}
          {!free && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 500, ml: 0.5 }}>
              {s.priceUnit || PRICING_MODEL_LABEL[s.pricingModel]}
            </Typography>
          )}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Optional, for an Estate Tech Club page (a bootcamp's hub page passes none of them):
 *   sideTop        — shown at the top of the contact card (the club's price and Join button)
 *   hideHours      — leave the venue's opening hours out of the contact card
 *   hideSpaces     — leave out "Spaces available" (desk pricing means nothing to a parent)
 *   beforeDetails  — sections before About (prices, how joining works)
 *   afterDetails   — sections after the map (FAQs)
 *   compactMap     — a shorter map
 */
export default function HubProfile({
  hub, sideAction = null, aboutHeading = 'About this hub',
  sideTop = null, hideHours = false, hideSpaces = false, beforeDetails = null, afterDetails = null, compactMap = false,
}) {
  const amenityGroups = groupAmenities(hub.amenities);

  return (
    <Section py={{ xs: 5, md: 7 }}>
      <Box
        sx={{
          display: 'grid',
          columnGap: 6,
          rowGap: { xs: 4, md: 6 },
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
          gridTemplateAreas: { xs: '"gallery" "contact" "details"', md: '"gallery contact" "details contact"' },
          alignItems: 'start',
        }}
      >
        {/* Photos of the space only — the hub's logo (`photo`) is a brand mark, shown beside its
            name in the page header, never stretched into a photo frame. No photos yet: the
            brand panel with the logo, so the layout holds. */}
        <Box sx={{ gridArea: 'gallery', minWidth: 0 }}>
          <MediaGallery
            images={hub.photos}
            alt={hub.name}
            ratio="16 / 9"
            fallback={<ClubPhotoPlaceholder logo={hub.photo} name={hub.name} />}
          />
        </Box>

        <Box component="aside" aria-label="Contact details" sx={{ gridArea: 'contact', position: { md: 'sticky' }, top: { md: 100 }, alignSelf: 'start', minWidth: 0 }}>
          <ContactCard hub={hub} sideAction={sideAction} sideTop={sideTop} hideHours={hideHours} />
        </Box>

        <Box sx={{ gridArea: 'details', minWidth: 0 }}>
          {beforeDetails}

          {hub.description && (
            <DetailSection title={aboutHeading} icon={<InfoOutlinedIcon />}>
              <Typography sx={{ color: 'text.secondary', whiteSpace: 'pre-line', maxWidth: PROSE_MAX_WIDTH, lineHeight: 1.75, fontSize: { md: '1.05rem' } }}>
                {hub.description}
              </Typography>
            </DetailSection>
          )}

          {/* What can be booked, and for how much — before the amenities, since it's what a
              family decides on. */}
          {!hideSpaces && hub.spaces?.length > 0 && (
            <DetailSection title="Spaces available" icon={<MeetingRoomIcon />}>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {hub.spaces.map((s, i) => (
                  <SpaceCard key={`${s.name}-${i}`} space={s} />
                ))}
              </Box>
            </DetailSection>
          )}

          {amenityGroups.length > 0 && (
            <DetailSection title="Amenities" icon={<AutoAwesomeIcon />}>
              <AmenityPanel groups={amenityGroups} />
            </DetailSection>
          )}

          {/* Where it is — an embedded map of the address (none for an online club). */}
          {!hub.isVirtual && <HubMap name={hub.name} address={hub.address} mapLink={hub.mapLink} mapPin={hub.mapPin} compact={compactMap} />}

          {afterDetails}
        </Box>
      </Box>
    </Section>
  );
}
