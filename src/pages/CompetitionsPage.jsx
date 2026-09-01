import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { competitionsIntro, competitions } from '../content/competitions.js';

/**
 * Static content page — no API call (spec §4.3, Option A).
 * There is no competitions model in the main system yet.
 */
export default function CompetitionsPage() {
  return (
    <>
      <SeoHead
        title="STEM & Robotics Competitions for Kids in Kenya"
        description="Friendly, team-based robotics and coding competitions for young learners in Kenya — a real goal to build towards and a stage to present on."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader title={competitionsIntro.heading} lead={competitionsIntro.lead} />

      <Section>
        <Box sx={{ maxWidth: 760, mb: 6 }}>
          {competitionsIntro.body.map((p) => (
            <Typography key={p} sx={{ mb: 2, color: 'text.secondary' }}>
              {p}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gap: 4 }}>
          {competitions.map((c) => (
            <Box
              key={c.id}
              component="article"
              sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Typography variant="h3" component="h2" gutterBottom>
                {c.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip size="small" variant="outlined" label={c.format} />
                <Chip size="small" variant="outlined" label={c.level} />
                <Chip size="small" variant="outlined" label={c.cadence} />
              </Box>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>{c.summary}</Typography>
              <Box component="ul" sx={{ pl: 3, color: 'text.secondary', '& li': { mb: 0.5 } }}>
                {c.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      <CTABanner
        heading="Want your school to enter a team?"
        body="Tell us your learners’ ages and we’ll share the next competition calendar and entry details."
        primary={{ label: 'Get in touch', to: '/contact' }}
        secondary={{ label: 'Explore projects', to: '/projects' }}
      />
    </>
  );
}
