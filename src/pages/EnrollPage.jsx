import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import EnrollForm from '../components/forms/EnrollForm.jsx';

const VALID_INTEREST = ['bootcamp', 'project', 'quarky', 'general'];

/**
 * Standalone enroll page. Accepts optional ?interest= and ?ref= query params
 * so "Enroll" buttons elsewhere can pre-fill context.
 */
export default function EnrollPage() {
  const [params] = useSearchParams();
  const interestParam = params.get('interest');
  const defaultInterest = VALID_INTEREST.includes(interestParam) ? interestParam : 'general';
  const referenceId = params.get('ref') || null;

  return (
    <>
      <SeoHead
        title="Enroll a Learner"
        description="Register your interest in a Digifunzi robotics or coding programme. Our team will follow up to arrange a place for your child."
        noindex
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title="Enroll a learner"
        lead="Tell us about your child and what you’re interested in. This isn’t a payment or a binding sign-up — our team will get in touch to talk through options and next steps."
      />

      <Section>
        <Box sx={{ maxWidth: 640 }}>
          <EnrollForm defaultInterest={defaultInterest} referenceId={referenceId} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Prefer to talk first? Use the <a href="/contact">contact form</a> and we’ll call you back.
          </Typography>
        </Box>
      </Section>
    </>
  );
}
