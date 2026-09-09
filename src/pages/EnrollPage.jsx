import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import EnrollForm from '../components/forms/EnrollForm.jsx';
import { getStoreItem } from '../content/store.js';
import { getProject } from '../content/projects.js';

const VALID_INTEREST = ['bootcamp', 'project', 'quarky', 'general'];

/**
 * Standalone enroll / purchase-enquiry page. Accepts optional query params so
 * buttons elsewhere can pre-fill context:
 *   - interest / interestedIn — which programme type
 *   - ref / referenceId       — slug of the bootcamp / pathway / project / store item
 *   - enquiry=1               — render the lighter enquiry form variant
 *                               (learner name/age optional) — set by Projects & Store pages
 *   - course                  — an age-based starting-course suggestion (pathway page)
 */
export default function EnrollPage() {
  const [params] = useSearchParams();
  const interestParam = params.get('interestedIn') || params.get('interest');
  const defaultInterest = VALID_INTEREST.includes(interestParam) ? interestParam : 'general';
  const referenceId = params.get('referenceId') || params.get('ref') || null;
  const suggestedCourse = params.get('course') || null;

  // A project or store-item reference (or an explicit ?enquiry=1) switches to the
  // lighter enquiry variant — buying isn't always about one named child. `getProject` only
  // knows the hardcoded catalog; a project from the API (interestedIn=project + a referenceId)
  // is treated as an enquiry too, even without a local match — the Enquiries card resolves the
  // slug to a name server-side.
  const catalogItem = referenceId
    ? getProject(referenceId) || getStoreItem(referenceId)
    : null;
  const isApiProjectEnquiry = defaultInterest === 'project' && Boolean(referenceId) && !catalogItem;
  const isEnquiry = params.get('enquiry') === '1' || Boolean(catalogItem) || isApiProjectEnquiry;

  const referenceLabel = catalogItem
    ? catalogItem.name
    : suggestedCourse
      ? `${suggestedCourse} (suggested starting course)`
      : undefined;

  return (
    <>
      <SeoHead
        title={isEnquiry ? 'Purchase Enquiry' : 'Enroll a Learner'}
        description={
          isEnquiry
            ? 'Ask about buying a Digifunzi project, robot or classroom bundle. Our team will confirm pricing and arrange payment.'
            : 'Register your interest in a Digifunzi robotics or coding programme. Our team will follow up to arrange a place for your child.'
        }
        noindex
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title={isEnquiry ? 'Send an enquiry' : 'Enroll a learner'}
        lead={
          isEnquiry
            ? 'Tell us what you’re interested in and we’ll confirm the price, arrange payment and get you set up. No account or commitment needed to ask.'
            : 'Tell us about your child and what you’re interested in. This isn’t a payment or a binding sign-up — our team will get in touch to talk through options and next steps.'
        }
      />

      <Section>
        <Box sx={{ maxWidth: 640 }}>
          <EnrollForm
            variant={isEnquiry ? 'enquiry' : 'enroll'}
            defaultInterest={defaultInterest}
            referenceId={referenceId}
            referenceLabel={referenceLabel}
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
