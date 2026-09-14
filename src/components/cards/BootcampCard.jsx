import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import SmartImage from '../common/SmartImage.jsx';
import { formatPrice, ageLabel } from '../../utils/format.js';
import { formatDateRange, formatDate } from '../../utils/dates.js';

export const FORMAT_LABEL = {
  holiday: 'Holiday',
  weekend: 'Weekend',
  after_school: 'After school',
  online: 'Online',
};

// Dates are plain "YYYY-MM-DD" strings — lexicographic comparison against today is safe and
// matches the convention public-bootcamp.service.js's deploymentStatus already uses server-side.
const todayStr = () => new Date().toISOString().slice(0, 10);

// Registration always shows on the card when either date is set — a bootcamp whose window
// hasn't opened yet (the common case right after an admin schedules a new run) is exactly the
// situation a parent most wants a heads-up about, so "not open yet" is its own clear state
// rather than being suppressed. Three states, each with its own label/colour:
//   upcoming — hasn't opened yet: "Registration opens {date}"
//   open     — opens/no-open-date set, hasn't closed: "Registration closes {date}" (amber once
//              within a week of closing, green otherwise)
//   closed   — past the close date: "Registration closed"
function registrationStatus(openDate, closeDate) {
  if (!openDate && !closeDate) return null;
  const today = todayStr();
  if (openDate && today < openDate) {
    return { state: 'upcoming', date: openDate };
  }
  if (closeDate && today > closeDate) {
    return { state: 'closed', date: closeDate };
  }
  if (!closeDate) return null;
  const daysLeft = Math.ceil((new Date(closeDate) - new Date(today)) / 86400000);
  return { state: 'open', date: closeDate, closingSoon: daysLeft <= 7 };
}

/**
 * One card in the Bootcamps grid (`/bootcamps`). A bootcamp is a short, intensive Event the
 * curriculum team flipped "List on the website" — a full build packed into a week or two, with
 * a showcase at the end. Same visual language as ProjectCard — a brand-blue band with a
 * "BOOTCAMP · HOLIDAY" kicker and the name as the hero — closing on the PRICE. Links to
 * /bootcamps/:slug.
 *
 * Data shape: { slug, name, tagline, format, duration, ageMin, ageMax, coverImage, price,
 * priceNotes, startDate, endDate, registrationOpenDate, registrationCloseDate, highlightCount }
 * (see usePublicBootcamps.js).
 */
export default function BootcampCard({ bootcamp }) {
  const {
    slug, name, tagline, format, duration, ageMin, ageMax, coverImage, price, priceNotes = [],
    startDate, endDate, registrationOpenDate, registrationCloseDate,
  } = bootcamp;

  const age = ageLabel(ageMin, ageMax);
  const priceLabel = price ? formatPrice(price) : 'Enquire for pricing';
  const kicker = ['Bootcamp', format && FORMAT_LABEL[format]].filter(Boolean).join(' · ').toUpperCase();
  const metaLine = [duration, age].filter(Boolean).join(' · ') || 'A short, intensive build';
  const dateRange = formatDateRange(startDate, endDate);
  const registration = registrationStatus(registrationOpenDate, registrationCloseDate);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition:
          'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'shadow.lg',
          borderColor: 'primary.main',
        },
        '&:hover .bc-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/bootcamps/${slug}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        {/* header — the cover photo if there is one, else the brand band */}
        {coverImage ? (
          <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
            <SmartImage src={coverImage} alt={name} ratio="16 / 10" rounded={false} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(15,37,69,0) 45%, rgba(15,37,69,0.78) 100%)',
              }}
            />
            <Box sx={{ position: 'absolute', left: 20, right: 20, bottom: 14, color: '#fff' }}>
              <Typography
                component="span"
                sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)' }}
              >
                {kicker}
              </Typography>
              <Typography
                component="h3"
                sx={{
                  fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25, mt: 0.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {name}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              position: 'relative',
              height: 138,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 2.5,
              overflow: 'hidden',
              color: '#fff',
              background: (t) =>
                `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: '-20%',
                top: '-55%',
                width: '80%',
                paddingBottom: '80%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
            <Typography
              component="span"
              sx={{
                position: 'relative', fontSize: 11, fontWeight: 800, letterSpacing: '0.09em',
                color: 'rgba(255,255,255,0.82)', mb: 0.75,
              }}
            >
              {kicker}
            </Typography>
            <Typography
              component="h3"
              sx={{
                position: 'relative', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {name}
            </Typography>
          </Box>
        )}

        {/* body */}
        <CardContent
          sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.6,
              minHeight: '4.8em',
            }}
          >
            {tagline || 'A short, intensive holiday programme — a full build packed into a week or two.'}
          </Typography>

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>
              {metaLine}
            </Typography>

            {dateRange && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <EventIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {dateRange}
                </Typography>
              </Box>
            )}

            {registration && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.25,
                  px: 1,
                  py: 0.375,
                  borderRadius: 5,
                  bgcolor: (t) =>
                    alpha(
                      registration.state === 'closed'
                        ? t.palette.text.disabled
                        : registration.state === 'upcoming'
                        ? t.palette.info.main
                        : registration.closingSoon
                        ? t.palette.warning.main
                        : t.palette.success.main,
                      0.12
                    ),
                }}
              >
                <HourglassTopIcon
                  sx={{
                    fontSize: 13,
                    color:
                      registration.state === 'closed'
                        ? 'text.disabled'
                        : registration.state === 'upcoming'
                        ? 'info.main'
                        : registration.closingSoon
                        ? 'warning.main'
                        : 'success.main',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color:
                      registration.state === 'closed'
                        ? 'text.disabled'
                        : registration.state === 'upcoming'
                        ? 'info.dark'
                        : registration.closingSoon
                        ? 'warning.dark'
                        : 'success.dark',
                  }}
                >
                  {registration.state === 'closed' && 'Registration closed'}
                  {registration.state === 'upcoming' && `Registration opens ${formatDate(registration.date)}`}
                  {registration.state === 'open' &&
                    `Registration ${registration.closingSoon ? 'closes' : 'open until'} ${formatDate(registration.date)}`}
                </Typography>
              </Box>
            )}
          </Box>

          {/* footer — price on the left, "View" on the right, like the Store / Project cards */}
          <Box
            sx={{
              mt: 'auto',
              pt: 2.5,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: price ? '1.05rem' : '0.9rem',
                  fontWeight: 800,
                  color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.dark),
                  lineHeight: 1.2,
                }}
              >
                {priceLabel}
              </Typography>
              {priceNotes.length > 0 && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>
                  {priceNotes[0]}
                  {priceNotes.length > 1 ? ` +${priceNotes.length - 1} more` : ''}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 700,
                fontSize: '0.875rem',
                color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main),
                flexShrink: 0,
              }}
            >
              View
              <ArrowForwardIcon
                className="bc-arrow"
                sx={{ fontSize: 18, transition: 'transform 200ms ease' }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
