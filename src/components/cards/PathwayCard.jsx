import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FramedImage from '../media/FramedImage.jsx';
import { subscriptionShort } from '../../utils/pathwayPrice.js';
import { pathwayAgeLabel, stageAgeShort, stageForAge } from '../../utils/pathwayAges.js';

const MAX_STAGE_CHIPS = 5;

/**
 * One card in the Learning Pathways grid (`/pathways`, and "Related pathways"). A pathway is a set
 * of courses a child works through in order, across developmental stages (age groups). The card
 * leads with the pathway's picture (Settings → Pathways → On the website, else its first course
 * cover; none — a brand panel), then what a parent decides on: the name, the ages, the stages,
 * where it runs and the price. Links to /pathways/:slug.
 *
 * `age` — the age picked on the list page: the card then says which stage fits that age, and
 * the link carries it (`?age=`) so the pathway's page opens on that stage.
 *
 * Data shape (GET /api/public/pathways): { slug, name, description, courseCount, stages[{ slug,
 * name, minAge, maxAge, courseCount }], price, image, places[], hubCount }.
 */
export default function PathwayCard({ pathway, age = null }) {
  const { slug, name, description, courseCount, image, places = [] } = pathway;
  const stages = (pathway.stages || []).filter((s) => s.minAge != null && s.maxAge != null);
  // Sold by subscription plans: the cheapest, "From KSh 3,000 / month".
  const subscription = subscriptionShort(pathway.subscription);
  const ages = pathwayAgeLabel(pathway);
  const fit = age != null ? stageForAge(stages, age) : null;
  const fitIndex = fit ? stages.indexOf(fit) : -1;
  const kicker = [
    ages,
    stages.length > 1 ? `${stages.length} stages` : null,
    `${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`,
  ].filter(Boolean).join(' · ');
  const to = `/pathways/${slug}${fit ? `?age=${age}` : ''}`;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition:
          'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'shadow.lg',
          borderColor: 'primary.main',
        },
        '&:hover .pw-arrow': { transform: 'translateX(4px)' },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        {/* The picture, shown whole (FramedImage) and clean — nothing printed over it, since it
            is as often a poster with words of its own as a photo. None: the brand panel, the
            same shape, so a row of cards lines up. */}
        <Box sx={{ position: 'relative', width: '100%', flexShrink: 0 }}>
          <FramedImage
            src={image}
            alt=""
            ratio="16 / 10"
            fallback={
              <Box
                aria-hidden
                sx={{
                  aspectRatio: '16 / 10',
                  display: 'grid',
                  placeItems: 'center',
                  background: (t) => `linear-gradient(150deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
                }}
              >
                <RouteRoundedIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.85)' }} />
              </Box>
            }
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          <Typography
            component="span"
            sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'primary.main' }}
          >
            {kicker}
          </Typography>
          <Typography
            component="h3"
            sx={{
              fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25, mt: 0.5, mb: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}
          >
            {name}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}
            >
              {description}
            </Typography>
          )}

          {fit ? (
            <Box
              sx={{
                mt: 2,
                p: 1.25,
                borderRadius: 2,
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                bgcolor: (t) => alpha(t.palette.success.main, 0.1),
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.15 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.45 }}>
                Age {age}: Stage {fitIndex + 1}{fit.name ? ` — ${fit.name}` : ''}
              </Typography>
            </Box>
          ) : (
            stages.length > 1 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 0.75, flexWrap: 'wrap' }} aria-label="Stages by age">
                {stages.slice(0, MAX_STAGE_CHIPS).map((s) => (
                  <Box
                    key={s.slug}
                    component="span"
                    title={s.name || undefined}
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {stageAgeShort(s.minAge, s.maxAge)}
                  </Box>
                ))}
                {stages.length > MAX_STAGE_CHIPS && (
                  <Box component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'text.disabled', alignSelf: 'center' }}>
                    +{stages.length - MAX_STAGE_CHIPS}
                  </Box>
                )}
              </Box>
            )
          )}

          {places.length > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', gap: 0.75, alignItems: 'center', color: 'text.secondary' }}>
              <PlaceOutlinedIcon sx={{ fontSize: 17 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {places.join(' · ')}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              mt: 'auto',
              pt: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {subscription ? (
              <Typography component="span" sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary' }}>
                {subscription}
              </Typography>
            ) : (
              <Typography component="span" sx={{ fontWeight: 600, fontSize: 13, color: 'text.secondary' }}>
                Enquire for pricing
              </Typography>
            )}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                fontWeight: 700,
                fontSize: '0.9rem',
                color: (t) => (t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main),
              }}
            >
              Explore
              <ArrowForwardIcon className="pw-arrow" sx={{ fontSize: 18, transition: 'transform 200ms ease' }} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
