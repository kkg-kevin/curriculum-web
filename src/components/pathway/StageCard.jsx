import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { ageLabel } from '../../utils/format.js';

/**
 * One developmental stage of a pathway, on the pathway's page: which stage it is (1, 2, …), its
 * name and ages, what it's like, the first few courses in it, and a link to the stage's own page
 * with all its courses (`/pathways/:slug/:stageSlug`). Same look as the pathway cards (PathwayCard):
 * a coloured band on top, the details below.
 *
 * `stage` — { slug, name, description, minAge, maxAge, courses[] } from GET /api/public/pathways/:slug.
 */
export default function StageCard({ pathwaySlug, stage, index, accent }) {
  const ages = ageLabel(stage.minAge, stage.maxAge);
  const courses = stage.courses || [];
  const preview = courses.slice(0, 3);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms ease, border-color 220ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 'shadow.lg', borderColor: 'primary.main' },
        '&:hover .stage-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/pathways/${pathwaySlug}/${stage.slug}`}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%', '&:hover': { backgroundColor: 'transparent' } }}
      >
        {/* band — stage number, name and ages */}
        <Box
          sx={{
            position: 'relative',
            minHeight: 128,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 2.5,
            overflow: 'hidden',
            color: '#fff',
            background: `linear-gradient(150deg, ${accent} 0%, ${accent}CC 100%)`,
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: '-20%',
              top: '-55%',
              width: '80%',
              paddingBottom: '80%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
            <Typography component="span" sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
              Stage {index + 1}
            </Typography>
            {ages && (
              <Box component="span" sx={{ fontSize: 11.5, fontWeight: 800, px: 1, py: 0.25, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {ages}
              </Box>
            )}
          </Box>
          <Typography component="h3" sx={{ position: 'relative', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25 }}>
            {stage.name || 'More courses'}
          </Typography>
        </Box>

        <CardContent sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          {stage.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, mb: 2 }}
            >
              {stage.description}
            </Typography>
          )}

          <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </Typography>
          <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 0.75 }}>
            {preview.map((course, i) => (
              <Box component="li" key={`${course.name}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  sx={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 800, color: '#fff', bgcolor: accent }}
                >
                  {i + 1}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.name}
                </Typography>
              </Box>
            ))}
            {courses.length > preview.length && (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 3.75 }}>
                + {courses.length - preview.length} more
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 'auto', pt: 2.5, display: 'flex', alignItems: 'center' }}>
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
              See the courses
              <ArrowForwardRoundedIcon className="stage-arrow" sx={{ fontSize: 18, transition: 'transform 200ms ease' }} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
