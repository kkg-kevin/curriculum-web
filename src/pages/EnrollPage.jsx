import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import EnrollForm from '../components/forms/EnrollForm.jsx';
import PathwayEnrollForm from '../components/forms/PathwayEnrollForm.jsx';
import { usePathway } from '../hooks/usePathways.js';
import PathwayEnrolJourney from '../components/pathway/PathwayEnrolJourney.jsx';
import { getProject } from '../content/projects.js';
import { LoadingBlock } from '../components/common/StateViews.jsx';
import { childrenLabel, packageEnquiryNote, priceForPackage } from '../content/homeSchooling.js';
import { usePublicHomeLearningPackage } from '../hooks/usePublicHomeLearning.js';

const VALID_INTEREST = ['pathway', 'bootcamp', 'project', 'quarky', 'home_schooling', 'competition', 'general'];

/**
 * Standalone enroll / purchase-enquiry page. Accepts optional query params so
 * buttons elsewhere can pre-fill context:
 *   - interest / interestedIn — which programme type
 *   - ref / referenceId       — slug of the pathway / project / store item
 *   - enquiry=1               — render the lighter enquiry form variant
 *                               (learner name/age optional) — set by Projects & Store pages
 *   - flow=pathway            — enrolling into a pathway (from a pathway page / the
 *                               diagnostic): the FULL enrol form + the "Type of learning hub"
 *                               picker with that hub's schedule
 *   - course                  — an age-based starting-course suggestion (pathway page)
 *   - package                 — a Home Schooling package slug (with interestedIn=home_schooling),
 *                               looked up from the curriculum system and sent as referenceId
 *   - children                — how many children the family has (the Home Schooling price
 *                               calculator); ignored unless the package can take that many
 *   - club                    — an Estate Tech Club's name (its page's Enquire button): shown as
 *                               what the enquiry is about and pre-filled in the message
 */
export default function EnrollPage() {
  const [params] = useSearchParams();
  const interestParam = params.get('interestedIn') || params.get('interest');
  const defaultInterest = VALID_INTEREST.includes(interestParam) ? interestParam : 'general';
  const referenceId = params.get('referenceId') || params.get('ref') || null;
  const suggestedCourse = params.get('course') || null;
  const isHomeSchooling = defaultInterest === 'home_schooling';
  const packageSlug = isHomeSchooling ? params.get('package') : null;
  // The chosen package, straight from the curriculum system. An unknown / no-longer-published
  // slug just falls back to a general Home Schooling enquiry.
  const packageQuery = usePublicHomeLearningPackage(packageSlug);
  const homeSchoolingPackage = packageQuery.data || null;
  const childrenParam = Number(params.get('children'));
  const familyChildren = homeSchoolingPackage && Number.isInteger(childrenParam) && priceForPackage(homeSchoolingPackage, childrenParam)
    ? childrenParam
    : null;
  const isPathwayFlow = params.get('flow') === 'pathway';
  // A priced pathway that runs at chosen hubs is enrolled and paid for here (PathwayEnrollForm);
  // any other pathway still sends an enquiry (EnrollForm).
  const pathwayQuery = usePathway(isPathwayFlow ? referenceId : null);
  // Sold online: subscription plans and hubs to choose from — PathwayEnrollForm; otherwise an
  // enquiry (EnrollForm).
  const paidPathway = isPathwayFlow && (pathwayQuery.data?.plans || []).length > 0 && (pathwayQuery.data.hubs || []).length > 0 ? pathwayQuery.data : null;
  const clubName = (params.get('club') || '').trim().slice(0, 120);

  // A project / store reference (or an explicit ?enquiry=1) switches to the lighter enquiry
  // variant — buying isn't always about one named child. A pathway enrol (`flow=pathway`) is
  // never an enquiry: it's a real "enrol my child" with the hub-type picker.
  const catalogItem = referenceId ? getProject(referenceId) : null;
  const isApiEnquiry =
    !isPathwayFlow &&
    Boolean(referenceId) &&
    !catalogItem &&
    ['project', 'quarky', 'general'].includes(defaultInterest);
  const isEnquiry =
    !isPathwayFlow &&
    (params.get('enquiry') === '1' || Boolean(catalogItem) || isApiEnquiry);

  const referenceLabel = catalogItem
    ? catalogItem.name
    : suggestedCourse
      ? `${suggestedCourse} (suggested starting course)`
      : clubName || undefined;

  // The enquiry (not paid) form — also what a pathway's journey ends in when it isn't priced. A
  // diagnostic taken on the way is noted on the enquiry.
  const enquiryForm = (defaults = {}, attemptId = null) => {
    const baseMessage = homeSchoolingPackage
      ? packageEnquiryNote(homeSchoolingPackage, familyChildren)
      : isHomeSchooling
        ? 'I am interested in Home Schooling. Please contact me to discuss package options.'
        : suggestedCourse
          ? `Suggested starting course based on age: ${suggestedCourse}`
          : clubName ? `I'm interested in the ${clubName}.` : undefined;
    const note = attemptId ? `Took the website diagnostic (attempt ${attemptId}).` : null;
    return (
      <EnrollForm
        key={homeSchoolingPackage?.slug || 'form'}
        variant={isEnquiry ? 'enquiry' : 'enroll'}
        withHub={isPathwayFlow}
        defaultHubId={isPathwayFlow ? params.get('hubId') : null}
        defaultInterest={defaultInterest}
        referenceId={homeSchoolingPackage ? homeSchoolingPackage.slug : referenceId}
        referenceLabel={homeSchoolingPackage
          ? `Home Schooling — ${homeSchoolingPackage.name} (${childrenLabel(familyChildren || homeSchoolingPackage.childrenIncluded)})`
          : isHomeSchooling ? 'Home Schooling' : referenceLabel}
        defaultMessage={[note, baseMessage].filter(Boolean).join('\n') || undefined}
        defaults={defaults}
      />
    );
  };

  return (
    <>
      <SeoHead
        title={isHomeSchooling ? 'Home Schooling Enquiry' : isEnquiry ? 'Purchase Enquiry' : 'Enroll a Learner'}
        description={
          isHomeSchooling
            ? 'Enquire about Digifunzi Home Schooling family packages.'
            : isEnquiry
            ? 'Ask about buying a Digifunzi project, robot or classroom bundle. Our team will confirm pricing and arrange payment.'
            : 'Register your interest in a Digifunzi robotics or coding programme. Our team will follow up to arrange a place for your child.'
        }
        noindex
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title={isHomeSchooling ? 'Home Schooling enquiry' : isEnquiry ? 'Send an enquiry' : 'Enroll a learner'}
        lead={
          isHomeSchooling
            ? 'Tell us about your family and preferred package. Our team will follow up with details. This enquiry does not commit you to a payment.'
            : isEnquiry
            ? 'Tell us what you’re interested in and we’ll confirm the price, arrange payment and get you set up. No account or commitment needed to ask.'
            : isPathwayFlow
              ? paidPathway
                ? 'Start with the learner’s date of birth — if there’s a diagnostic for their age, a short quiz places them at the right course (you can skip it). Then choose a hub, add your details and pay.'
                : 'Start with the learner’s date of birth — if there’s a diagnostic for their age, a short quiz places them at the right course (you can skip it). Then pick where they would attend and add your details; our team will get in touch to arrange a place.'
              : 'Tell us about your child and what you’re interested in. This isn’t a payment or a binding sign-up — our team will get in touch to talk through options and next steps.'
        }
      />

      <Section>
        {/* A pathway enrolment uses a wider page: its diagnostic result and the enrolment sit side
            by side (PathwayEnrolJourney); everything else keeps a reading width. */}
        <Box sx={{ maxWidth: isPathwayFlow ? 1180 : 640, mx: 'auto' }}>
          {packageSlug && packageQuery.isLoading ? <LoadingBlock label="Loading package…" /> : isPathwayFlow && referenceId && pathwayQuery.isLoading ? <LoadingBlock label="Loading pathway…" /> : isPathwayFlow && pathwayQuery.data && !params.get('attempt') ? (
            // Every pathway enrolment starts with the learner's date of birth and, when there is
            // one for their age, the diagnostic — then the enrolment itself.
            <PathwayEnrolJourney pathway={pathwayQuery.data} slug={referenceId} stageSlug={params.get('stage')}>
              {(start) => (paidPathway ? (
                <PathwayEnrollForm
                  pathway={paidPathway}
                  defaultHubId={params.get('hubId')}
                  defaultPlanId={params.get('plan')}
                  attemptId={start.attemptId}
                  defaultLearnerName={start.childName}
                  defaultLearnerDateOfBirth={start.dateOfBirth}
                  defaultParentName={start.parentName}
                  defaultParentPhone={start.parentPhone}
                />
              ) : enquiryForm({ parentName: start.parentName, parentPhone: start.parentPhone, learnerName: start.childName, learnerDateOfBirth: start.dateOfBirth }, start.attemptId))}
            </PathwayEnrolJourney>
          ) : paidPathway ? (
            <Box sx={{ maxWidth: 720, mx: 'auto' }}><PathwayEnrollForm
              pathway={paidPathway}
              defaultHubId={params.get('hubId')}
              defaultPlanId={params.get('plan')}
              attemptId={params.get('attempt')}
              defaultLearnerName={params.get('childName') || ''}
              defaultLearnerDateOfBirth={params.get('dob') || ''}
            /></Box>
          ) : <Box sx={{ maxWidth: isPathwayFlow ? 720 : 'none', mx: 'auto' }}>{enquiryForm({ learnerName: params.get('childName') || '', learnerDateOfBirth: params.get('dob') || '' }, params.get('attempt'))}</Box>}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, maxWidth: 720, mx: 'auto' }}>
            Prefer to talk first? Use the <a href="/contact">contact form</a> and we’ll call you back.
          </Typography>
        </Box>
      </Section>
    </>
  );
}
