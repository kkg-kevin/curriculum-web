import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import PathwayCard from '../components/cards/PathwayCard.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import { usePathways } from '../hooks/usePathways.js';

const GRID_SX = {
  display: 'grid',
  gap: 3,
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
};

function PathwaySkeletons() {
  return (
    <Box sx={GRID_SX}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
  );
}

export default function PathwaysListPage() {
  const { data, isLoading, isError, error, refetch } = usePathways();

  return (
    <>
      <SeoHead
        title="Learning Pathways — Robotics, Software Engineering & Data"
        description="Structured tracks of Digifunzi courses that take a learner from beginner to job-ready in one area — robotics, software engineering, data & AI and more."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            (data || []).map((p) => ({ name: p.name, url: `/pathways/${p.slug}` })),
            { name: 'Digifunzi Learning Pathways' },
          ),
        ]}
      />

      <PageHeader
        title="Learning Pathways"
        lead="A learning pathway is a structured track of courses that takes a learner from beginner to job-ready in one area. Start at the beginning, or pick up wherever a diagnostic places you."
      />

      <Section>
        {isLoading && <PathwaySkeletons />}
        {isError && <ErrorBlock error={error} onRetry={refetch} />}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <EmptyBlock
            title="Pathways are being finalised"
            body="Check back soon — or contact us and we’ll talk through the tracks we’re running this term."
          />
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <Box sx={GRID_SX}>
            {data.map((p) => (
              <PathwayCard key={p.id} pathway={p} />
            ))}
          </Box>
        )}
      </Section>

      <CTABanner
        heading="Not sure which pathway fits?"
        body="Tell us your learner’s age and what they’re into. We’ll recommend a pathway and, if it helps, a short diagnostic to place them at the right step."
      />
    </>
  );
}
