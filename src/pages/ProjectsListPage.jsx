import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import ProjectCard from '../components/cards/ProjectCard.jsx';
import { usePublicProjects } from '../hooks/usePublicProjects.js';

const GRID_SX = {
  display: 'grid',
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
};

const LEVELS = [
  { key: 'all', label: 'All levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

function CardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'surface.card',
      }}
    >
      <Skeleton variant="rectangular" height={138} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="55%" sx={{ mt: 2 }} />
        <Skeleton variant="text" width="35%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

/**
 * Projects section (`/projects`). A project is a `type: "project"` assessment the curriculum
 * team flipped "For sale" in the Assessment Builder — see GET /api/public/projects. A learner
 * buys it once (via an "Enquire to buy" lead, no checkout yet) and keeps it for life.
 *
 * `?level=` filters the grid client-side.
 */
export default function ProjectsListPage() {
  const { data, isLoading, isError, error, refetch } = usePublicProjects();
  const [params, setParams] = useSearchParams();

  const requested = params.get('level');
  const active = LEVELS.some((l) => l.key === requested) ? requested : 'all';

  // Only show a level chip if at least one project actually has that level.
  const availableLevels = useMemo(() => {
    const present = new Set((data || []).map((p) => p.level).filter(Boolean));
    return LEVELS.filter((l) => l.key === 'all' || present.has(l.key));
  }, [data]);

  const list = useMemo(() => {
    const all = data || [];
    return active === 'all' ? all : all.filter((p) => p.level === active);
  }, [data, active]);

  const setLevel = (key) => {
    setParams(
      (prev) => {
        if (key === 'all') prev.delete('level');
        else prev.set('level', key);
        return prev;
      },
      { replace: true },
    );
  };

  const count = data?.length || 0;

  return (
    <>
      <SeoHead
        title="Projects — Guided Build Projects for Kids"
        description="Guided build projects a child works through at their own pace — robotics, coding, data and automation. Bought once, yours for life."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            (data || []).map((p) => ({ name: p.name, url: `/projects/${p.slug}` })),
            { name: 'Digifunzi Projects' },
          ),
        ]}
      />

      <PageHeader
        title="Projects"
        lead="A project is a guided build a child works through at their own pace — clear steps, and a finished thing to show at the end. Buy it once like an online course; it's theirs to revisit for life."
      >
        {!isLoading && !isError && count > 0 && (
          <Box
            sx={{
              mt: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'surface.card',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {count} {count === 1 ? 'project' : 'projects'} available now
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section dots>
        <Box
          role="note"
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            backgroundColor: 'surface.subtle',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Prices shown are indicative.</strong> Online checkout is coming soon — for now,
            open a project and send an enquiry. We&apos;ll confirm the final price, arrange payment
            and unlock it for your learner.
          </Typography>
        </Box>

        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && count === 0 && (
          <EmptyBlock
            title="Projects are on the way"
            body="We're finalising our first guided build projects. Check back soon — or contact us and we'll tell you what's coming this term."
          />
        )}

        {!isLoading && !isError && count > 0 && (
          <>
            {availableLevels.length > 2 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {availableLevels.map((l) => (
                  <Chip
                    key={l.key}
                    label={l.label}
                    onClick={() => setLevel(l.key)}
                    color={l.key === active ? 'primary' : 'default'}
                    variant={l.key === active ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            )}

            {list.length === 0 ? (
              <EmptyBlock
                title="No projects at this level yet"
                body="Try another level, or get in touch and tell us what your learner is ready for."
              />
            ) : (
              <Box sx={GRID_SX}>
                {list.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </Box>
            )}
          </>
        )}
      </Section>

      <CTABanner
        heading="Buying projects for a class?"
        body="Tell us how many learners you have and which projects you're interested in — we'll put together a classroom licence quote."
        primary={{ label: 'Request a quote', to: '/contact?subject=Classroom%20project%20licence' }}
        secondary={{ label: 'Robots & kits in the store', to: '/store' }}
      />
    </>
  );
}
