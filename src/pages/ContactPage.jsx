import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';
import { ORG, phoneUrl, whatsAppUrl } from '../config/site.js';

function ContactLine({ icon: Icon, children }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
      <Icon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
      <Typography color="text.secondary">{children}</Typography>
    </Box>
  );
}

/**
 * Contact page. The form posts to /api/public/contact by default; flip
 * `useLeadsEndpoint` if the backend consolidates on /api/public/leads (spec §4.5).
 *
 * Accepts an optional `?subject=` query param so entry points elsewhere (e.g.
 * a competition card's "Ask about entering") can pre-fill the message field
 * with context — same pattern as EnrollPage's `course` param.
 */
export default function ContactPage() {
  const [params] = useSearchParams();
  const subject = params.get('subject');
  const phone = phoneUrl();
  const whatsApp = whatsAppUrl('Hello Digifunzi, I have a question.');

  return (
    <>
      <SeoHead
        title="Contact Us"
        description="Get in touch with the Digifunzi team about robotics and STEM programmes for your family or school in Kenya."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title="Contact us"
        lead="Questions about a course, a bootcamp, Quarky, or bringing Digifunzi to your school? Send us a message."
      />

      <Section>
        <Box sx={{ display: 'grid', gap: { xs: 6, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, maxWidth: 1100, mx: 'auto' }}>
          <Box>
            <ContactForm
              useLeadsEndpoint={false}
              defaultMessage={subject ? `Re: ${subject}\n\n` : ''}
            />
          </Box>
          <Box>
            <Box
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: 'surface.subtle',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom>
                Other ways to reach us
              </Typography>
              <Box sx={{ mt: 2 }}>
                <ContactLine icon={EmailIcon}>
                  <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
                </ContactLine>
                {/* Phone and WhatsApp only appear once real numbers are set in config/site.js. */}
                {phone && (
                  <ContactLine icon={PhoneIcon}>
                    <a href={phone}>{ORG.telephone}</a>
                  </ContactLine>
                )}
                {whatsApp && (
                  <ContactLine icon={WhatsAppIcon}>
                    <a href={whatsApp} target="_blank" rel="noopener noreferrer">
                      Chat with us on WhatsApp
                    </a>
                  </ContactLine>
                )}
                <ContactLine icon={LocationOnIcon}>
                  {ORG.address.addressLocality}, {ORG.address.addressCountry}
                </ContactLine>
                <ContactLine icon={AccessTimeIcon}>We usually reply within one working day.</ContactLine>
              </Box>
            </Box>

            <Typography variant="h4" component="h2" gutterBottom>
              Prefer a specific programme?
            </Typography>
            <Typography color="text.secondary">
              For enrolment enquiries, use the{' '}
              <RouterLink to="/enroll" style={{ color: 'inherit', fontWeight: 600 }}>
                Enroll a learner
              </RouterLink>{' '}
              form instead — it captures your child’s age and interests so our team can follow up faster.
            </Typography>
          </Box>
        </Box>
      </Section>
    </>
  );
}
