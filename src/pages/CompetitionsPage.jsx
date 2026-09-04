import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { competitionsIntro, competitions } from '../content/competitions.js';

const ICONS = { trophy: EmojiEventsIcon, timeline: TimelineIcon, groups: GroupsIcon };

// Each competition's `accent` key picks a brand scale; card visuals (band,
// chip, CTA colour) all derive from the one gradient pair below.
const ACCENTS = {
  blue: { from: '#1565C0', to: '#3B84D9', solid: '#1565C0' },
  orange: { from: '#DC6E00', to: '#FF9A28', solid: '#DC6E00' },
  green: { from: '#2E7D32', to: '#4CAF50', solid: '#2E7D32' },
};

function CompetitionCard({ competition: c }) {
  const Icon = ICONS[c.icon] || EmojiEventsIcon;
  const accent = ACCENTS[c.accent] || ACCENTS.blue;
  const contactHref = `/contact?subject=${encodeURIComponent(`${c.name} — entry details`)}`;

  return (
    <Box
      component="article"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      {/* accent rail with icon badge */}
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: '100%', md: 176 },
          minHeight: { xs: 96, md: 'auto' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
        }}
      >
        <Icon aria-hidden sx={{ fontSize: 96, color: '#fff', opacity: 0.18, position: 'absolute', transform: 'rotate(-10deg)' }} />
        <Icon aria-hidden sx={{ fontSize: 40, color: '#fff', position: 'relative' }} />
      </Box>

      <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, minWidth: 0 }}>
        <Typography variant="h3" component="h2" gutterBottom>
          {c.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            size="small"
            icon={<GroupIcon sx={{ fontSize: '16px !important' }} />}
            label={c.format}
            sx={{ bgcolor: `${accent.solid}14`, color: 'text.primary', fontWeight: 600 }}
          />
          <Chip
            size="small"
            icon={<SchoolIcon sx={{ fontSize: '16px !important' }} />}
            label={c.level}
            sx={{ bgcolor: `${accent.solid}14`, color: 'text.primary', fontWeight: 600 }}
          />
          <Chip
            size="small"
            icon={<CalendarMonthIcon sx={{ fontSize: '16px !important' }} />}
            label={c.cadence}
            sx={{ bgcolor: `${accent.solid}14`, color: 'text.primary', fontWeight: 600 }}
          />
        </Box>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>{c.summary}</Typography>
        <Box component="ul" sx={{ pl: 3, color: 'text.secondary', mb: 3, '& li': { mb: 0.5 } }}>
          {c.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </Box>
        <Button
          component={RouterLink}
          to={contactHref}
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          sx={{ color: accent.solid, borderColor: accent.solid, '&:hover': { borderColor: accent.solid, bgcolor: `${accent.solid}0F` } }}
        >
          Ask about entering
        </Button>
      </Box>
    </Box>
  );
}

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
            <CompetitionCard key={c.id} competition={c} />
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
