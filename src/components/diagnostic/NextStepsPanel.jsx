import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RouteIcon from '@mui/icons-material/Route';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BootcampEnrollForm from '../forms/BootcampEnrollForm.jsx';

/**
 * "Where to from here" — the guided next step shown under the diagnostic report. Reused for both
 * the plain pathway diagnostic (/pathways/:slug/diagnostic) and a pathway diagnostic reached from
 * a bootcamp's own "Take the diagnostic" picker (/pathways/:slug/diagnostic?bootcamp=:slug — see
 * BootcampDetailPage.jsx) — the diagnostic flow itself is identical either way (this pathway's own
 * assessment, see public-bootcamp.service.js's resolvePathwayDiagnostics comment for why), only
 * the "enrol" option differs:
 *   1a. Enrol in the pathway (no bootcamp context) → opens a list of the hubs it runs at (set in
 *       the curriculum system), each going to the /enroll lead flow with that hub picked; with
 *       none set, one option to enrol and choose a hub there
 *   1b. Enrol in the bootcamp (bootcamp prop set)  → BootcampEnrollForm inline, auto-provisions a
 *       real learner account for that bootcamp (see server: bootcamp-enrollment.service.js) —
 *       same as the bootcamp-scoped diagnostic used to offer before it was folded in here.
 *   2. See the full pathway → opens every course of the pathway, by developmental stage
 *
 * Props: enrollTo, pathwayName, courses[] (flat, when there are no stages), stages[], hubs[],
 * accent, bootcamp?: { slug, name, defaultParentName?, defaultParentPhone?, defaultLearnerName?, defaultLearnerDateOfBirth?, attemptId? }
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

// One row of an open dropdown — a hub to enrol at.
function DropdownRow({ to, icon, title, body }) {
  return (
    <Box component={RouterLink} to={to}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', textDecoration: 'none', '&:hover': { borderColor: 'primary.main' } }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{title}</Typography>
        {body && <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{body}</Typography>}
      </Box>
      <ArrowForwardIcon fontSize="small" sx={{ color: 'text.disabled' }} />
    </Box>
  );
}

const ageText = (s) => (s.minAge != null && s.maxAge != null ? `ages ${s.minAge}–${s.maxAge}` : null);
const chevron = (open) => (
  <ExpandMoreIcon fontSize="small" sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }} />
);

export default function NextStepsPanel({
  enrollTo,
  pathwayName,
  courses = [],
  stages = [],
  hubs = [],
  accent,
  bootcamp,
  // false hides "See the full pathway" — a bootcamp's Enroll flow keeps the pathway out of view.
  roadmap = true,
}) {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showHubs, setShowHubs] = useState(false);
  // Every course, by developmental stage when the pathway has named stages.
  const groups = stages.some((s) => s.name && (s.courses || []).length)
    ? stages.filter((s) => (s.courses || []).length)
    : [{ name: null, courses }];
  const courseTotal = groups.reduce((n, g) => n + (g.courses || []).length, 0);
  const [showBootcampEnroll, setShowBootcampEnroll] = useState(false);

  if (showBootcampEnroll && bootcamp) {
    return (
      <BootcampEnrollForm
        bootcampSlug={bootcamp.slug}
        bootcampName={bootcamp.name}
        defaultParentName={bootcamp.defaultParentName}
        defaultParentPhone={bootcamp.defaultParentPhone}
        defaultLearnerName={bootcamp.defaultLearnerName}
        defaultLearnerDateOfBirth={bootcamp.defaultLearnerDateOfBirth}
        attemptId={bootcamp.attemptId}
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
        {bootcamp ? (
          <OptionCard
            highlighted
            icon={<HowToRegIcon />}
            title={`Enroll now in ${bootcamp.name}`}
            body="Set up an account right away — pay by cash and your account unlocks fully as soon as that's confirmed."
            onClick={() => setShowBootcampEnroll(true)}
          />
        ) : (
          <>
            <OptionCard
              highlighted
              icon={<HowToRegIcon />}
              title={`Enrol in ${pathwayName}`}
              body={hubs.length
                ? `Runs at ${hubs.length} hub${hubs.length === 1 ? '' : 's'} — choose where the learner will attend.`
                : 'We place the learner at the right course for their age and this result, and get them started.'}
              onClick={() => setShowHubs((v) => !v)}
              trailingIcon={chevron(showHubs)}
            />
            <Collapse in={showHubs} unmountOnExit>
              <Box sx={{ display: 'grid', gap: 1, px: { xs: 0.5, sm: 1 }, py: 0.5 }}>
                {hubs.length > 0 ? hubs.map((hub) => (
                  <DropdownRow
                    key={hub.id}
                    to={`${enrollTo}&hubId=${encodeURIComponent(hub.id)}`}
                    icon={<PlaceOutlinedIcon fontSize="small" />}
                    title={hub.name}
                    body={[hub.town, hub.deliveryMode !== 'in_person' ? hub.deliveryLabel : null].filter(Boolean).join(' · ') || hub.deliveryLabel}
                  />
                )) : (
                  <DropdownRow to={enrollTo} icon={<HowToRegIcon fontSize="small" />} title={`Enrol in ${pathwayName}`} body="You’ll choose a learning hub on the next step." />
                )}
              </Box>
            </Collapse>
          </>
        )}

        {roadmap && (
          <>
            <OptionCard
              icon={<RouteIcon />}
              title={showRoadmap ? 'Hide the courses' : 'See the full pathway'}
              body={`All ${courseTotal} course${courseTotal === 1 ? '' : 's'} in ${pathwayName}, in order${groups.length > 1 ? ', by stage' : ''}.`}
              onClick={() => setShowRoadmap((v) => !v)}
              trailingIcon={chevron(showRoadmap)}
            />

            <Collapse in={showRoadmap} unmountOnExit>
              <Box
                sx={{
                  mt: 0.5,
                  px: { xs: 0.5, sm: 1 },
                  py: 1,
                }}
              >
                {courseTotal === 0 ? (
                  <Typography variant="body2" color="text.secondary">No courses have been added to this pathway yet.</Typography>
                ) : groups.map((group, gi) => (
                  <Box key={group.name || gi} sx={{ mb: 2 }}>
                    {group.name && (
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', mb: 0.75 }}>
                        {group.name}{ageText(group) ? <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}> · {ageText(group)}</Box> : null}
                      </Typography>
                    )}
                    <Box component="ol" sx={{ m: 0, pl: 0, listStyle: 'none', display: 'grid', gap: 0.75 }}>
                      {(group.courses || []).map((course, ci) => (
                        <Box component="li" key={`${course.name}-${ci}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                          <Box sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: '#fff', bgcolor: accent || 'primary.main' }}>{ci + 1}</Box>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{course.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
                {bootcamp ? (
                  <Button variant="contained" sx={{ mt: 3 }} onClick={() => setShowBootcampEnroll(true)}>
                    Enroll now in {bootcamp.name}
                  </Button>
                ) : (
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => { setShowRoadmap(false); setShowHubs(true); }}>
                    Enrol in {pathwayName}
                  </Button>
                )}
              </Box>
            </Collapse>
          </>
        )}

      </Box>
    </Box>
  );
}
