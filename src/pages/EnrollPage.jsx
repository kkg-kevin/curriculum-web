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
 * Standalone enroll page. Accepts optional query params so "Enroll" buttons
 * elsewhere can pre-fill context:
 *   - interest / interestedIn — which programme type
 *   - ref / referenceId       — slug of the bootcamp / course / pathway it came from
 * Both spellings are accepted (the Pathway detail page links here with
 * interestedIn / referenceId; other detail pages embed the form directly).
 */
export default function EnrollPage() {
  const [params] = useSearchParams();
  const interestParam = params.get('interestedIn') || params.get('interest');
  const defaultInterest = VALID_INTEREST.includes(interestParam) ? interestParam : 'general';
  const referenceId = params.get('referenceId') || params.get('ref') || null;
  // Set by the pathway page's "Find your starting point" widget (age-based
  // placement, client-side only — see StartingPointFinder.jsx).
  const suggestedCourse = params.get('course') || null;

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
          <EnrollForm
            defaultInterest={defaultInterest}
            referenceId={referenceId}
            referenceLabel={suggestedCourse ? `${suggestedCourse} (suggested starting course)` : undefined}
            defaultMessage={
              suggestedCourse ? `Suggested starting course based on age: ${suggestedCourse}` : undefined
            }
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Prefer to talk first? Use the <a href="/contact">contact form</a> and we’ll call you back.
          </Typography>
        </Box>
      </Section>
    </>
  );
}
