import Box from '@mui/material/Box';
import Section from '../common/Section.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import FaqList from '../common/FaqList.jsx';
import JsonLd, { faqSchema } from '../seo/JsonLd.jsx';
import { faqs } from '../../content/home.js';

/**
 * "Questions parents ask" — the answers a family needs before they enquire. Same two-column
 * layout as the Home Schooling page's FAQ. The questions are also published as FAQPage
 * structured data, which Google only wants when the Q&A is visible on the page — it is.
 */
export default function HomeFaq() {
  if (faqs.length === 0) return null;
  return (
    <Section dots>
      <JsonLd data={faqSchema(faqs)} />
      <Box sx={{ display: 'grid', gap: { xs: 4, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '4fr 7fr' }, alignItems: 'start' }}>
        <SectionHeading
          eyebrow="Questions"
          title="Questions parents ask"
          lead="The things families want to know before they get in touch. Anything else, just ask."
        />
        <Box>
          <FaqList faqs={faqs} />
        </Box>
      </Box>
    </Section>
  );
}
