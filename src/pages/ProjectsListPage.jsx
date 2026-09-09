import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { EmptyBlock } from '../components/common/StateViews.jsx';
import CatalogItemCard from '../components/catalog/CatalogItemCard.jsx';
import {
  projects,
  projectsByLevel,
  activeProjectLevels,
  PRICING_IS_PLACEHOLDER,
} from '../content/projects.js';

const GRID_SX = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
};

/**
 * Projects section (`/projects`) — its own top-level area, separate from the
 * Store. A project is bought the way an online course is: one purchase unlocks
 * all its lessons for a learner, for life.
 *
 * Static content (Option A — src/content/projects.js). No API call. `?level=`
 * filters the grid.
 */
export default function ProjectsListPage() {
  const [params, setParams] = useSearchParams();
  const levels = activeProjectLevels();
  const requested = params.get('level');
  const active = levels.some((l) => l.key === requested) ? requested : 'all';

  const list = useMemo(() => projectsByLevel(active), [active]);

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

  return (
    <>
      <SeoHead
        title="Projects — Buy a Guided Build Project"
        description="Guided build projects for young makers — bought once, yours for life. Step-by-step lessons, checkpoints and challenges in robotics, data and automation, run on a Quarky or compatible hardware."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            projects.map((p) => ({ name: p.name, url: `/projects/${p.slug}` })),
            { name: 'Digifunzi Projects' },
          ),
        ]}
      />

      <PageHeader
        title="Projects"
        lead="A project is a guided build a learner works through at their own pace — lessons, checkpoints and a finished thing to show. Buy it once like an online course; it's yours to revisit for life."
      />

      <Section>
        {PRICING_IS_PLACEHOLDER && (
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
              open a project and send an enquiry. We&apos;ll confirm the final price, arrange payment and
              unlock it for your learner.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {levels.map((l) => (
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

        {list.length === 0 ? (
          <EmptyBlock
            title="No projects at this level yet"
            body="Check back soon, or get in touch and tell us what your learner is ready for."
          />
        ) : (
          <Box sx={GRID_SX}>
            {list.map((p) => (
              <CatalogItemCard
                key={p.slug}
                item={p}
                to={`/projects/${p.slug}`}
                topLeft={p.level}
              />
            ))}
          </Box>
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
