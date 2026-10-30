import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlaceIcon from '@mui/icons-material/Place';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import FramedImage from '../media/FramedImage.jsx';
import { formatDateRange } from '../../utils/dates.js';
import { ageLabel, formatPrice } from '../../utils/format.js';
import { FORMAT_LABEL } from '../cards/BootcampCard.jsx';

function Fact({ Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
      <Icon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>{label}</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

/**
 * The bootcamp a parent is enrolling in, beside the enrolment steps (BootcampEnrollPage): its cover,
 * the facts they decide on (dates, where, ages, format), the price, and what happens next — a short
 * diagnostic when the bootcamp has one, then enrolment and payment. Everything shown comes from
 * GET /api/public/bootcamps/:slug; a fact that isn't set is left out.
 */
export default function EnrollSummary({ bootcamp, hasDiagnostic }) {
  const { name, tagline, coverImage, startDate, endDate, ageMin, ageMax, format, duration, price, upcomingRuns = [] } = bootcamp;
  const where = upcomingRuns.length === 1 ? upcomingRuns[0].hub?.name : upcomingRuns.length > 1 ? `${upcomingRuns.length} locations — choose when you enrol` : '';
  const facts = [
    { key: 'dates', Icon: ScheduleIcon, label: 'Dates', value: formatDateRange(startDate, endDate) },
    { key: 'where', Icon: PlaceIcon, label: upcomingRuns.length > 1 ? 'Running at' : 'Where', value: where },
    { key: 'age', Icon: ChildCareIcon, label: 'Suitable for', value: ageLabel(ageMin, ageMax) },
    { key: 'format', Icon: TimerOutlinedIcon, label: 'Format', value: [format && FORMAT_LABEL[format], duration].filter(Boolean).join(' · ') },
  ].filter((f) => f.value);
  const next = hasDiagnostic
    ? ['A short quiz for their age — marked straight away', 'See how they did, and where they’ll start', 'Enrol, create their login and pay']
    : ['Enter your details and create their login', 'Pay, in whichever way suits you'];

  return (
    <Box
      component="aside"
      aria-label={`About ${name}`}
      sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}
    >
      <FramedImage src={coverImage} alt={name} ratio="16 / 9" />
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'grid', gap: 2.25 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>You’re enrolling in</Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 800, lineHeight: 1.25 }}>{name}</Typography>
          {tagline && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{tagline}</Typography>}
        </Box>

        {facts.length > 0 && <Box sx={{ display: 'grid', gap: 1.5 }}>{facts.map(({ key, ...fact }) => <Fact key={key} {...fact} />)}</Box>}

        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">Price</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: price ? '1.25rem' : '0.95rem' }}>
            {price ? formatPrice(price) : 'Confirmed when you enrol'}
          </Typography>
        </Box>

        <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'surface.subtle' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>What happens next</Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.75 }}>
            {next.map((line) => <Typography component="li" variant="body2" color="text.secondary" key={line}>{line}</Typography>)}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
