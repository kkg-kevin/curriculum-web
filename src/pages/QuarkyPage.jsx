import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, productSchema, faqSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import SmartImage from '../components/common/SmartImage.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { quarky } from '../content/quarky.js';

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
          <SmartImage src={quarky.image} alt="The Quarky learning robot" eager ratio="4 / 3" />
          <Box>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>{quarky.description}</Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Highlights
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary', '& li': { mb: 0.75 } }}>
              {quarky.highlights.map((h) => (
                <li key={h}>{h}</li>
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
          {quarky.specs.map((s) => (
            <Box
              key={s.label}
              sx={{ p: 2.5, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Typography variant="overline" color="text.secondary">
                {s.label}
              </Typography>
              <Typography>{s.value}</Typography>
            </Box>
          ))}
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
