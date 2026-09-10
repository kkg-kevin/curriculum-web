import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RouteIcon from '@mui/icons-material/Route';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PathwayRoadmap from '../pathway/PathwayRoadmap.jsx';

/**
 * "Where to from here" — the guided next step shown under the diagnostic report. Three routes,
 * each as a tappable option card (icon + title + one line) rather than a bare button row, so
 * every path has room to say what it is:
 *   1. Enrol            → the existing /enroll flow
 *   2. See the pathway  → expands the ordered course roadmap in place (progressive disclosure)
 *   3. Talk it through  → WhatsApp (wa.me) if a number is configured, else /contact
 *
 * Props: enrollTo, pathwayName, courses[], accent, mentorHref, mentorIsExternal
 */

function OptionCard({ icon, title, body, onClick, to, href, external, trailingIcon, highlighted }) {
  const common = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    textAlign: 'left',
    p: { xs: 2, sm: 2.25 },
    borderRadius: 3,
    border: '1px solid',
    borderColor: highlighted ? 'primary.main' : 'divider',
    bgcolor: highlighted ? 'primary.main' : 'background.paper',
    color: highlighted ? 'primary.contrastText' : 'text.primary',
    cursor: 'pointer',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
    textDecoration: 'none',
    '&:hover': {
      borderColor: 'primary.main',
      boxShadow: 'shadow.lg',
      transform: 'translateY(-2px)',
    },
    '&:hover .ns-arrow': { transform: 'translateX(3px)' },
  };

  const inner = (
    <>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: highlighted ? 'rgba(255,255,255,0.16)' : 'surface.subtle',
          color: highlighted ? '#fff' : 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.3 }}>{title}</Typography>
        <Typography
          sx={{
            fontSize: '0.82rem',
            lineHeight: 1.45,
            color: highlighted ? 'rgba(255,255,255,0.82)' : 'text.secondary',
          }}
        >
          {body}
        </Typography>
      </Box>
      <Box
        className="ns-arrow"
        sx={{
          flexShrink: 0,
          display: 'flex',
          color: highlighted ? 'rgba(255,255,255,0.8)' : 'text.disabled',
          transition: 'transform 160ms ease',
        }}
      >
        {trailingIcon || <ArrowForwardIcon fontSize="small" />}
      </Box>
    </>
  );

  if (to) {
    return (
      <Box component={RouterLink} to={to} sx={common}>
        {inner}
      </Box>
    );
  }
  if (href) {
    return (
      <Box
        component="a"
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        sx={common}
      >
        {inner}
      </Box>
    );
  }
  return (
    <Box component="button" type="button" onClick={onClick} sx={{ ...common, font: 'inherit' }}>
      {inner}
    </Box>
  );
}

export default function NextStepsPanel({
  enrollTo,
  pathwayName,
  courses = [],
  accent,
  mentorHref,
  mentorIsExternal,
}) {
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.subtle',
      }}
    >
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
        Where to from here
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5, maxWidth: 560 }}>
        The diagnostic is a starting point. Pick whichever suits you — nothing here is a
        commitment.
      </Typography>

      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <OptionCard
          highlighted
          icon={<HowToRegIcon />}
          title={`Enrol in ${pathwayName}`}
          body="We place the learner at the right course for their age and this result, and get them started."
          to={enrollTo}
        />

        <OptionCard
          icon={<RouteIcon />}
          title={showRoadmap ? 'Hide the course roadmap' : 'See the full pathway'}
          body="The courses in order — from where to start through to the finish."
          onClick={() => setShowRoadmap((v) => !v)}
          trailingIcon={
            <ExpandMoreIcon
              fontSize="small"
              sx={{ transform: showRoadmap ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }}
            />
          }
        />

        <Collapse in={showRoadmap} unmountOnExit>
          <Box
            sx={{
              mt: 0.5,
              px: { xs: 0.5, sm: 1 },
              py: 1,
            }}
          >
            <PathwayRoadmap courses={courses} accent={accent} name={pathwayName} />
            <Button component={RouterLink} to={enrollTo} variant="contained" sx={{ mt: 3 }}>
              Enrol in {pathwayName}
            </Button>
          </Box>
        </Collapse>

        <OptionCard
          icon={<WhatsAppIcon />}
          title="Talk it through with a mentor"
          body={
            mentorIsExternal
              ? 'Chat on WhatsApp about the result and the best place to start.'
              : 'Send us a message and we’ll talk you through the result and next steps.'
          }
          href={mentorHref}
          external={mentorIsExternal}
        />
      </Box>
    </Box>
  );
}
