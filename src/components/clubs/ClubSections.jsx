import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import GroupsIcon from '@mui/icons-material/Groups';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LaptopIcon from '@mui/icons-material/Laptop';
import PlaceIcon from '@mui/icons-material/Place';
import RouteIcon from '@mui/icons-material/Route';
import DetailSection from '../common/DetailSection.jsx';
import FaqList from '../common/FaqList.jsx';
import { formatKsh, periodUnit } from '../../content/homeSchooling.js';
import { agesLabel, sessionLines } from '../../utils/clubs.js';

// The parent-facing parts of an Estate Tech Club's page (EstateTechClubPage): quick facts under
// the name, the price summary in the side card, how joining works and FAQs.
// Each part shows only what the club has filled in (portal → Learning Hubs → Club details for
// parents), so a club with nothing set yet still has a tidy page.

const DELIVERY = { in_person: 'In person', virtual: 'Online', hybrid: 'In person or online' };

/** Four small tiles under the club's name: ages, days & times, class size, how it's run. */
export function ClubQuickFacts({ hub, details, fallbackSchedule }) {
  const lines = sessionLines(details);
  const when = lines.length ? lines.map((l) => `${l.day.slice(0, 3)} ${l.times}`).join(' · ') : fallbackSchedule;
  const tiles = [
    { key: 'ages', Icon: ChildCareIcon, label: 'Ages', value: agesLabel(details).replace(/^Ages /, '') },
    { key: 'when', Icon: AccessTimeIcon, label: lines.length ? 'Club sessions' : 'Open', value: when },
    { key: 'size', Icon: GroupsIcon, label: 'Class size', value: details?.classSize ? `Up to ${details.classSize} children` : '' },
    { key: 'how', Icon: hub.isVirtual ? LaptopIcon : PlaceIcon, label: 'How it runs', value: DELIVERY[hub.deliveryMode] || (hub.isVirtual ? 'Online' : 'In person') },
  ].filter((t) => t.value);
  if (!tiles.length) return null;
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: 2.5, display: 'grid', gap: 1.25, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: `repeat(${tiles.length}, minmax(0, 1fr))` } }}>
      {tiles.map(({ key, Icon, label, value }) => (
        <Box component="li" key={key} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', p: 1.5, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'surface.ring', minWidth: 0 }}>
          <Box aria-hidden sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.1) }}>
            <Icon sx={{ fontSize: 19 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{value}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/** Top of the side card: what it costs, when it meets, and Join. Only when the club takes sign-ups. */
// `fromPrice` — the cheapest package's { amount, billingPeriod }.
export function ClubPriceCard({ fromPrice, details, joinPath }) {
  const lines = sessionLines(details);
  return (
    <Box sx={{ mb: 2.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>Membership</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">From</Typography>
        <Typography component="p" sx={{ m: 0, fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1, color: 'primary.main' }}>{formatKsh(fromPrice.amount)}</Typography>
        <Typography variant="body2" color="text.secondary">/ {periodUnit(fromPrice.billingPeriod)}</Typography>
      </Box>
      {lines.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: 1.5, display: 'grid', gap: 0.5 }}>
          {lines.map((l) => (
            <Box component="li" key={l.day} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: '0.875rem' }}>
              <span>{l.day}</span><Box component="span" sx={{ fontWeight: 700 }}>{l.times}</Box>
            </Box>
          ))}
        </Box>
      )}
      <Button component={RouterLink} to={joinPath} variant="contained" color="secondary" fullWidth sx={{ mt: 2 }}>
        Join this club
      </Button>
      <Link href="#packages" underline="hover" sx={{ display: 'block', mt: 1, textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
        See all packages
      </Link>
    </Box>
  );
}

const STEPS = [
  { title: 'Sign up online', body: 'Choose a package and create logins for you and your children — a few minutes.' },
  { title: 'Pay the first month', body: 'Pay in cash to our team. Your logins unlock as soon as we confirm it.' },
  { title: 'We place your child', body: 'Each child joins the club class that suits their age and level.' },
  { title: 'They start learning', body: 'Sessions, assessments and progress reports — all visible in your account.' },
];

/** The four steps from signing up to the first session. */
export function ClubJoinSteps({ joinPath }) {
  return (
    <DetailSection title="How joining works" icon={<RouteIcon />} action={<Button component={RouterLink} to={joinPath} size="small" endIcon={<ArrowForwardIcon />}>Join now</Button>}>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
        {STEPS.map((step, i) => (
          <Box component="li" key={step.title} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'surface.ring', bgcolor: 'surface.card' }}>
            <Box aria-hidden sx={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', mb: 1.25, fontWeight: 800, color: 'primary.contrastText', bgcolor: i === STEPS.length - 1 ? 'secondary.main' : 'primary.main' }}>{i + 1}</Box>
            <Typography component="h3" sx={{ fontWeight: 800, fontSize: '0.98rem', mb: 0.5 }}>{step.title}</Typography>
            <Typography variant="body2" color="text.secondary">{step.body}</Typography>
          </Box>
        ))}
      </Box>
    </DetailSection>
  );
}

/** FAQs: the club's own, then the general ones about joining (when it takes sign-ups). */
export function ClubFaq({ details, canJoin, enquirePath }) {
  const own = (details?.faqs || []).map((f) => ({ q: f.question, a: f.answer }));
  const general = canJoin ? [
    { q: 'How do I pay?', a: 'Signing up creates your first month’s invoice. Pay it in cash to our team; once we confirm the payment, your family’s logins unlock. After that you get one invoice each month.' },
    { q: 'When can my child start?', a: 'As soon as your payment is confirmed we place your child in a club class and they can come to the next session.' },
    { q: 'Can I add another child later?', a: 'Yes. If your package has a free place, add them from My Family in your account. Otherwise contact us and we’ll move you to a package that fits.' },
  ] : [];
  const faqs = [...own, ...general.filter((g) => !own.some((o) => o.q.toLowerCase() === g.q.toLowerCase()))];
  if (!faqs.length) return null;
  return (
    <DetailSection title="Questions parents ask" icon={<HelpOutlineIcon />}>
      <FaqList faqs={faqs} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Something else? <Link component={RouterLink} to={enquirePath} sx={{ fontWeight: 700 }}>Ask us</Link>.
      </Typography>
    </DetailSection>
  );
}
