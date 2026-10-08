import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

/**
 * A stack of question/answer accordions, the first one open. `faqs` is [{ q, a }] with plain-text
 * answers — the same array can go straight into faqSchema() (components/seo/JsonLd.jsx).
 */
export default function FaqList({ faqs }) {
  return faqs.map((faq, i) => (
    <Accordion
      key={faq.q}
      defaultExpanded={i === 0}
      disableGutters
      elevation={0}
      sx={{ bgcolor: 'surface.card', border: '1px solid', borderColor: 'surface.ring', borderRadius: '14px !important', mb: 1.5, '&::before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 2.5, py: 0.5 }}>
        <Typography component="h3" sx={{ fontWeight: 700 }}>{faq.q}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
        <Typography color="text.secondary">{faq.a}</Typography>
      </AccordionDetails>
    </Accordion>
  ));
}
