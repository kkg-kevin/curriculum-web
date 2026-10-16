import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SchoolIcon from '@mui/icons-material/School';
import TuneIcon from '@mui/icons-material/Tune';
import SavingsIcon from '@mui/icons-material/Savings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';
import Reveal from '../components/common/Reveal.jsx';
import Clients from '../components/home/Clients.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { programme, features, implementation, quarky } from '../content/schools.js';
import { actionRowSx } from '../components/common/ActionRow.jsx';

const FEATURE_ICONS = {
  curriculum: MenuBookIcon,
  robot: SmartToyIcon,
  training: SchoolIcon,
  flexible: TuneIcon,
  affordable: SavingsIcon,
  competitions: EmojiEventsIcon,
};

const cardSx = {
  height: '100%',
  p: { xs: 3, md: 3.5 },
  borderRadius: 4,
  backgroundColor: 'surface.card',
  border: '1px solid',
  borderColor: 'surface.ring',
  boxShadow: 'shadow.md',
};

/**
 * Schools page — the Robotics, AI & Coding for Schools programme: what it is, what a school
 * gets, how it is rolled out, the Quarky robot it is taught with, and who already runs it.
 * All copy lives in content/schools.js.
 */
export default function SchoolsPage() {
  return (
    <>
      <SeoHead
        title="Robotics, AI & Coding for Schools"
        description="Digifunzi brings robotics, AI and coding into primary and secondary schools: a full curriculum, the Quarky robot, teacher training and technical mentor support."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader title={programme.title} lead={programme.lead}>
        <Box sx={{ mt: 4, ...actionRowSx, justifyContent: 'center' }}>
          <Button component={RouterLink} to={programme.contactTo} variant="contained" size="large">
            Bring it to your school
          </Button>
          <Button component={RouterLink} to="/competitions" variant="outlined" size="large">
            See competitions
          </Button>
        </Box>
      </PageHeader>

      <Section>
        <Box sx={{ display: 'grid', gap: { xs: 3, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '4fr 7fr' }, alignItems: 'start' }}>
          <SectionHeading eyebrow="Our programme" title="21st-century skills, learned by doing" />
          <Box>
            {programme.body.map((p) => (
              <Typography key={p} sx={{ mb: 2, fontSize: '1.08rem', color: 'text.secondary' }}>
                {p}
              </Typography>
            ))}
          </Box>
        </Box>
      </Section>

      <Section tone="subtle">
        <SectionHeading
          eyebrow="What your school gets"
          title="Key features & offerings"
          sx={{ mb: { xs: 5, md: 7 } }}
        />
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[f.icon];
            return (
              <Reveal key={f.title} delay={(i % 3) * 90} sx={{ height: '100%' }}>
                <Box sx={cardSx}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 48,
                      height: 48,
                      mb: 2,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.contrastText',
                      backgroundColor: 'primary.main',
                    }}
                  >
                    <Icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant="h4" component="h3" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography color="text.secondary">{f.body}</Typography>
                </Box>
              </Reveal>
            );
          })}
        </Box>
      </Section>

      <Section dots>
        <Box sx={{ display: 'grid', gap: { xs: 4, md: 8 }, gridTemplateColumns: { xs: '1fr', md: '4fr 7fr' }, alignItems: 'start' }}>
          <SectionHeading eyebrow={implementation.eyebrow} title={implementation.title} lead={implementation.lead} />
          <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {implementation.steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 70}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 2, sm: 3 },
                    py: { xs: 2.5, md: 3 },
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      color: 'secondary.contrastText',
                      backgroundColor: 'secondary.main',
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="h3" sx={{ mb: 0.75 }}>
                      {s.title}
                    </Typography>
                    <Typography color="text.secondary">{s.body}</Typography>
                  </Box>
                </Box>
              </Reveal>
            ))}
          </Box>
        </Box>
      </Section>

      <Section tone="inverse">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 3,
            mb: { xs: 5, md: 7 },
          }}
        >
          <SectionHeading eyebrow={quarky.eyebrow} title={quarky.title} lead={quarky.lead} onColor />
          <Button component={RouterLink} to="/store" variant="contained" color="secondary" size="large">
            See Quarky in the Store
          </Button>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            // Six columns so the five points sit three over two, the bottom pair filling the row.
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
          }}
        >
          {quarky.points.map((p, i) => (
            <Reveal
              key={p.title}
              delay={(i % 3) * 90}
              sx={{ gridColumn: { md: i < 3 ? 'span 2' : 'span 3' } }}
            >
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'surface.inverseBorder',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <Typography variant="h4" component="h3" sx={{ mb: 1, color: 'secondary.main' }}>
                  {p.title}
                </Typography>
                <Typography sx={{ color: 'surface.onColorText' }}>{p.body}</Typography>
              </Box>
            </Reveal>
          ))}
        </Box>
      </Section>

      <Clients />

      <CTABanner
        heading="Bring robotics, AI and coding to your school"
        body="Tell us about your learners and we’ll put a plan and a quote together for your school."
        primary={{ label: 'Talk to us', to: programme.contactTo }}
        secondary={{ label: 'About Digifunzi', to: '/about' }}
      />
    </>
  );
}
