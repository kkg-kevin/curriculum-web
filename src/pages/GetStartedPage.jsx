import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SeoHead from '../components/seo/SeoHead.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import Reveal from '../components/common/Reveal.jsx';
import { programmeIcon } from '../components/home/programmeIcons.js';
import { getStarted } from '../content/getStarted.js';

/**
 * /get-started — where the header's Enroll button (desktop bar and phone menu) leads. One card per
 * programme a family can enrol in themselves (Bootcamps, Home Schooling, Tech Clubs), each going
 * straight into that programme's own sign-up, with the enquiry form (/enroll) as the fallback for
 * anyone still deciding. Every other "Enroll" link on the site still goes to /enroll.
 */
function OptionCard({ option, index }) {
  const Icon = programmeIcon(option.key);
  return (
    <Reveal delay={80 + index * 90} y={18} sx={{ height: '100%' }}>
      <Box
        component={RouterLink}
        to={option.to}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          textDecoration: 'none',
          color: 'text.primary',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'shadow.sm',
          transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: 'shadow.lg', borderColor: 'primary.main' },
          '&:hover .df-option-cta': { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' },
          '&:hover .df-option-arrow': { transform: 'translateX(3px)' },
          '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: 'primary.contrastText',
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
              boxShadow: 'shadow.sm',
            }}
          >
            <Icon sx={{ fontSize: 26 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {option.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {option.hint}
            </Typography>
          </Box>
        </Box>

        <Typography color="text.secondary" sx={{ lineHeight: 1.6, mb: 2.5 }}>
          {option.body}
        </Typography>

        {/* How it goes, in three numbered steps. */}
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25, mb: 3 }}>
          {option.steps.map((step, i) => (
            <Box component="li" key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                component="span"
                aria-hidden
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'primary.main',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                }}
              >
                {i + 1}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {step}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Looks like a button; the whole card is the link. */}
        <Box
          className="df-option-cta"
          sx={{
            mt: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1.25,
            px: 2,
            borderRadius: 999,
            border: '1.5px solid',
            borderColor: 'primary.main',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'background-color 180ms ease, color 180ms ease',
          }}
        >
          {option.cta}
          <ArrowForwardIcon className="df-option-arrow" sx={{ fontSize: 18, transition: 'transform 180ms ease' }} />
        </Box>
      </Box>
    </Reveal>
  );
}

export default function GetStartedPage() {
  const { title, lead, options, help } = getStarted;
  return (
    <>
      <SeoHead title="Enroll" description={lead} noindex />
      <PageHeader title={title} lead={lead} />

      <Section py={{ xs: 5, md: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
            alignItems: 'stretch',
          }}
        >
          {options.map((option, i) => (
            <OptionCard key={option.key} option={option} index={i} />
          ))}
        </Box>

        {/* Still deciding — the enquiry form. */}
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'surface.subtle',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}
        >
          <HelpOutlineIcon sx={{ color: 'primary.main', fontSize: 30, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontWeight: 800 }}>{help.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {help.body}
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to={help.to}
            variant="outlined"
            sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
          >
            {help.cta}
          </Button>
        </Box>
      </Section>
    </>
  );
}
