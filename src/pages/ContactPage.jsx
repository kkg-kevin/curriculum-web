import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';
import { ORG } from '../config/site.js';

/**
 * Contact page. The form posts to /api/public/contact by default; flip
 * `useLeadsEndpoint` if the backend consolidates on /api/public/leads (spec §4.5).
 */
export default function ContactPage() {
  return (
    <>
      <SeoHead
        title="Contact Digifunzi"
        description="Get in touch with the Digifunzi team about robotics and STEM programmes for your family or school in Kenya."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title="Contact us"
        lead="Questions about a course, a bootcamp, Quarky, or bringing Digifunzi to your school? Send us a message."
      />

      <Section>
        <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box sx={{ maxWidth: 520 }}>
            <ContactForm useLeadsEndpoint={false} />
          </Box>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Other ways to reach us
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Email: <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Phone: {ORG.telephone}
            </Typography>
            <Typography color="text.secondary">
              {ORG.address.addressLocality}, {ORG.address.addressCountry}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Contact details are placeholders pending confirmation.
            </Typography>
          </Box>
        </Box>
      </Section>
    </>
  );
}
