import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
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
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
};

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
      <Skeleton variant="rectangular" height={116} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="75%" height={28} />
        <Skeleton variant="text" width="55%" height={28} />
        <Skeleton variant="text" width="95%" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rounded" width={120} height={12} sx={{ mt: 2, borderRadius: 999 }} />
        <Skeleton variant="text" width="40%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

function PathwaySkeletons() {
  return (
    <Box sx={GRID_SX}>
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Box>
  );
}

export default function PathwaysListPage() {
  const { data, isLoading, isError, error, refetch } = usePathways();
  const count = data?.length || 0;

  return (
    <>
      <SeoHead
        title="Learning Pathways — Robotics, Coding, AI & Design for Kids"
        description="Guided tracks of Digifunzi courses a child works through in order — robotics, coding, AI, data, digital design and more — building real skills one course at a time."
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
        lead="A pathway is a set of courses a child works through in order — each one builds on the last. Start at the very beginning, or take a short quiz and jump in where it fits."
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
              {count} {count === 1 ? 'pathway' : 'pathways'} running this term
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section dots>
        {isLoading && <PathwaySkeletons />}
        {isError && <ErrorBlock error={error} onRetry={refetch} />}
        {!isLoading && !isError && count === 0 && (
          <EmptyBlock
            title="Pathways are being finalised"
            body="Check back soon — or contact us and we’ll talk through the tracks we’re running this term."
          />
        )}
        {!isLoading && !isError && count > 0 && (
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
