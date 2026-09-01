import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { about } from '../content/about.js';

export default function AboutPage() {
  return (
    <>
      <SeoHead
        title="About Us"
        description="Digifunzi is a Kenyan STEM education company teaching children to build with technology through hands-on robotics, coding and electronics."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader title={about.heading} lead={about.lead} />

      <Section>
        <Box sx={{ maxWidth: 760 }}>
          {about.story.map((p) => (
            <Typography key={p} sx={{ mb: 2, color: 'text.secondary' }}>
              {p}
            </Typography>
          ))}
        </Box>
      </Section>

      <Section tone="subtle">
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          Our mission
        </Typography>
        <Typography variant="h3" component="p" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 760, mb: 6 }}>
          {about.mission}
        </Typography>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
          {about.values.map((v) => (
            <Box
              key={v.title}
              sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Typography variant="h4" component="h3" gutterBottom>
                {v.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {v.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Section>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, textAlign: 'center' }}>
          {about.stats.map((s) => (
            <Box key={s.label}>
              <Typography variant="h2" component="p" color="primary.main">
                {s.value}
              </Typography>
              <Typography color="text.secondary">{s.label}</Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Figures to be confirmed.
        </Typography>
      </Section>

      <CTABanner />
    </>
  );
}
