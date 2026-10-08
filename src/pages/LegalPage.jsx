import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import { ORG } from '../config/site.js';
import { privacyPolicy, termsOfUse } from '../content/legal.js';
import { NARROW_COLUMN } from '../theme/layout.js';

const DOCS = { privacy: privacyPolicy, terms: termsOfUse };

// `{email}` in the copy becomes a mailto link to ORG.email.
function withEmail(text) {
  const parts = text.split('{email}');
  return parts.flatMap((part, i) =>
    i < parts.length - 1
      ? [part, <a key={i} href={`mailto:${ORG.email}`}>{ORG.email}</a>]
      : [part],
  );
}

function Paragraphs({ items = [] }) {
  return items.map((p) => (
    <Typography key={p} color="text.secondary" sx={{ mb: 1.5 }}>
      {withEmail(p)}
    </Typography>
  ));
}

/**
 * One plain reading page for a legal document — the Privacy Policy (/privacy) and the Terms of
 * Use (/terms). `doc` names which: 'privacy' | 'terms' (content/legal.js).
 */
export default function LegalPage({ doc: docKey }) {
  const doc = DOCS[docKey];
  return (
    <>
      <SeoHead title={doc.title} description={doc.description} />
      <PageHeader title={doc.title} lead={doc.intro} />

      <Section>
        <Box sx={{ maxWidth: NARROW_COLUMN, mx: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last updated {doc.updated}
          </Typography>

          {doc.sections.map((s) => (
            <Box key={s.heading} component="section" sx={{ mb: 4 }}>
              <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>
                {s.heading}
              </Typography>
              <Paragraphs items={s.paragraphs} />
              {s.bullets && (
                <Box component="ul" sx={{ pl: 3, mt: 0, mb: 1.5, color: 'text.secondary', '& li': { mb: 0.75 } }}>
                  {s.bullets.map((b) => (
                    <Typography key={b} component="li">
                      {withEmail(b)}
                    </Typography>
                  ))}
                </Box>
              )}
              <Paragraphs items={s.after} />
            </Box>
          ))}
        </Box>
      </Section>
    </>
  );
}
