import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Build from '@mui/icons-material/Build';
import Diversity3 from '@mui/icons-material/Diversity3';
import SupportAgent from '@mui/icons-material/SupportAgent';
import CodeIcon from '@mui/icons-material/Code';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RouteIcon from '@mui/icons-material/Route';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { about } from '../content/about.js';

const VALUE_ICONS = { build: Build, diversity: Diversity3, support: SupportAgent };
const PROGRAMME_ICONS = { code: CodeIcon, rocket: RocketLaunchIcon, route: RouteIcon, trophy: EmojiEventsIcon };

const hasStats = about.stats.some((s) => s.value);

export default function AboutPage() {
  return (
    <>
      <SeoHead
        title="About Us"
        description="Digifunzi is a Kenyan STEM education company teaching children to build with technology through hands-on robotics, coding and electronics."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader title={about.heading} lead={about.lead} />

      <Section>
        <Box sx={{ maxWidth: 760 }}>
          {about.story.map((p) => (
            <Typography key={p} sx={{ mb: 2, color: 'text.secondary' }}>
              {p}
            </Typography>
          ))}
        </Box>
      </Section>

      <Section tone="subtle">
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          Our mission
        </Typography>
        <Typography variant="h3" component="p" sx={{ fontWeight: 400, color: 'text.secondary', maxWidth: 760, mb: 6 }}>
          {about.mission}
        </Typography>

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
          {about.values.map((v) => {
            const ValueIcon = VALUE_ICONS[v.icon];
            return (
              <Box
                key={v.title}
                sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
              >
                {ValueIcon && (
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      mb: 1.5,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <ValueIcon sx={{ fontSize: 22 }} />
                  </Box>
                )}
                <Typography variant="h4" component="h3" gutterBottom>
                  {v.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {v.body}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Section>

      <Section>
        <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
          What we run
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 5, maxWidth: 620 }}>
          Four ways to get involved, from a single weekly course to a full multi-year track.
        </Typography>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
          {about.programmes.map((p) => {
            const ProgIcon = PROGRAMME_ICONS[p.icon];
            return (
              <Box
                key={p.title}
                component={RouterLink}
                to={p.to}
                sx={{
                  p: 3,
                  display: 'block',
                  textDecoration: 'none',
                  color: 'text.primary',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                }}
              >
                {ProgIcon && <ProgIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1.5 }} />}
                <Typography variant="h4" component="h3" gutterBottom>
                  {p.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {p.body}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', fontWeight: 700, fontSize: '0.875rem' }}>
                  Explore
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
            );
          })}
        </Box>

        {hasStats && (
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, textAlign: 'center', mt: 7 }}>
            {about.stats
              .filter((s) => s.value)
              .map((s) => (
                <Box key={s.label}>
                  <Typography variant="h2" component="p" color="primary.main">
                    {s.value}
                  </Typography>
                  <Typography color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
          </Box>
        )}
      </Section>

      <CTABanner />
    </>
  );
}
