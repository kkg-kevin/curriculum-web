import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BootcampEnrollForm from '../forms/BootcampEnrollForm.jsx';

/**
 * "Where to from here" for the Bootcamp diagnostic report — the lean counterpart to
 * NextStepsPanel.jsx (Pathways). A bootcamp has no ordered course roadmap to place a learner
 * into, so this is just two options: enroll now (opens BootcampEnrollForm inline, below this
 * panel — a real account is auto-provisioned, not just a lead), or talk it through with a
 * mentor. Opening the form inline (rather than navigating to a separate page/route) lets the
 * diagnostic's already-collected parentName/parentPhone/childName/childAge pass straight
 * through as plain props instead of round-tripping through a URL.
 *
 * Props: bootcampSlug, bootcampName, mentorHref, mentorIsExternal,
 * defaultParentName?, defaultParentPhone?, defaultLearnerName?, defaultLearnerAge?
 */

function OptionCard({ icon, title, body, href, to, onClick, external, highlighted }) {
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
    textDecoration: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
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
        <ArrowForwardIcon fontSize="small" />
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
  if (onClick) {
    return (
      <Box component="button" type="button" onClick={onClick} sx={{ ...common, cursor: 'pointer', font: 'inherit' }}>
        {inner}
      </Box>
    );
  }
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

export default function BootcampNextStepsPanel({
  bootcampSlug,
  bootcampName,
  mentorHref,
  mentorIsExternal,
  defaultParentName,
  defaultParentPhone,
  defaultLearnerName,
  defaultLearnerAge,
}) {
  const [showEnroll, setShowEnroll] = useState(false);

  if (showEnroll) {
    return (
      <BootcampEnrollForm
        bootcampSlug={bootcampSlug}
        bootcampName={bootcampName}
        defaultParentName={defaultParentName}
        defaultParentPhone={defaultParentPhone}
        defaultLearnerName={defaultLearnerName}
        defaultLearnerAge={defaultLearnerAge}
      />
    );
  }

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
          title={`Enroll now in ${bootcampName}`}
          body="Set up an account right away — pay by cash and your account unlocks fully as soon as that's confirmed."
          onClick={() => setShowEnroll(true)}
        />

        <OptionCard
          icon={<WhatsAppIcon />}
          title="Talk it through with a mentor"
          body={
            mentorIsExternal
              ? 'Chat on WhatsApp about the result and whether this bootcamp is the right fit.'
              : 'Send us a message and we’ll talk you through the result and next steps.'
          }
          href={mentorHref}
          external={mentorIsExternal}
        />
      </Box>
    </Box>
  );
}
