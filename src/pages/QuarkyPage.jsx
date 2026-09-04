import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MemoryIcon from '@mui/icons-material/Memory';
import WifiIcon from '@mui/icons-material/Wifi';
import SensorsIcon from '@mui/icons-material/Sensors';
import CableIcon from '@mui/icons-material/Cable';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SchoolIcon from '@mui/icons-material/School';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { quarky } from '../content/quarky.js';

// Quarky has no product photo yet (content.image is explicitly TODO). Rather
// than show SmartImage's generic wordmark fallback on a page whose whole job
// is to sell one product, render a designed hero panel in its place.
const SPEC_ICONS = {
  Programming: MemoryIcon,
  Connectivity: WifiIcon,
  Sensors: SensorsIcon,
  Expansion: CableIcon,
  Power: BatteryChargingFullIcon,
  'Recommended age': SchoolIcon,
};

function QuarkyHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        aspectRatio: '4 / 3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (t) =>
          `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 55%, ${t.palette.brand.blue[400]} 100%)`,
        boxShadow: 'shadow.lg',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1.6px)',
          backgroundSize: '22px 22px',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-30%',
          left: '-10%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22) 0%, transparent 66%)',
          pointerEvents: 'none',
        }}
      />
      <SmartToyIcon aria-hidden sx={{ fontSize: { xs: 140, sm: 180 }, color: '#fff', position: 'relative' }} />
    </Box>
  );
}

/**
 * Static content page — no API call (spec §4.4, Option A).
 * Quarky has no representation in the main system's database.
 */
export default function QuarkyPage() {
  const { pathname } = useLocation();

  return (
    <>
      <SeoHead
        title="Quarky — The Learning Robot for Classrooms"
        description="Quarky is Digifunzi’s rugged, beginner-friendly learning robot: wire sensors, drive motors and write real code. Used across our courses and available to schools and families in Kenya."
        type="product"
      />
      <JsonLd
        data={[
          organizationSchema(),
          productSchema(quarky, pathname),
          ...(quarky.faqs?.length ? [faqSchema(quarky.faqs)] : []),
        ]}
      />

      <PageHeader title={quarky.name} lead={quarky.tagline} />

      <Section>
        <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'start' }}>
          {quarky.image ? (
            <SmartImage src={quarky.image} alt="The Quarky learning robot" eager ratio="4 / 3" />
          ) : (
            <QuarkyHero />
          )}
          <Box>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>{quarky.description}</Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Highlights
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {quarky.highlights.map((h) => (
                <Box key={h} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                  <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', mt: 0.25, flexShrink: 0 }} />
                  <Typography color="text.secondary">{h}</Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="body2" sx={{ mt: 3, fontWeight: 600 }}>
              {quarky.priceNote}
            </Typography>
          </Box>
        </Box>
      </Section>

      <Section tone="subtle">
        <Typography variant="h2" component="h2" sx={{ mb: 4 }}>
          Specifications
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          }}
        >
          {quarky.specs.map((s) => {
            const SpecIcon = SPEC_ICONS[s.label];
            return (
            <Box
              key={s.label}
              sx={{
                p: 2.5,
                display: 'flex',
                gap: 1.75,
                alignItems: 'flex-start',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              {SpecIcon && (
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  <SpecIcon sx={{ fontSize: 20 }} />
                </Box>
              )}
              <Box>
                <Typography variant="overline" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography>{s.value}</Typography>
              </Box>
            </Box>
            );
          })}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Specifications are indicative and subject to confirmation.
        </Typography>
      </Section>

      <Section>
        <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
          Where Quarky is used
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 5 }}>
          {quarky.usedIn.map((u) => (
            <Chip key={u} label={u} variant="outlined" />
          ))}
        </Box>

        <Divider sx={{ mb: 5 }} />

        <Typography variant="h2" component="h2" sx={{ mb: 3 }}>
          Common questions
        </Typography>
        <Box sx={{ display: 'grid', gap: 3, maxWidth: 760 }}>
          {quarky.faqs.map((f) => (
            <Box key={f.q}>
              <Typography variant="h4" component="h3" gutterBottom>
                {f.q}
              </Typography>
              <Typography color="text.secondary">{f.a}</Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <CTABanner
        heading="Bring Quarky to your classroom"
        body="Ask us about class sets, teacher training and pricing for your school."
        primary={{ label: 'Request a quote', to: '/contact' }}
        secondary={{ label: 'See our courses', to: '/projects' }}
      />
    </>
  );
}
