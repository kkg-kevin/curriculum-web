import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema, itemListSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import CompetitionCard from '../components/cards/CompetitionCard.jsx';
import { usePublicCompetitions } from '../hooks/usePublicCompetitions.js';

const GRID_SX = {
  display: 'grid',
  gap: { xs: 2.5, md: 3 },
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
};

function CardSkeleton() {
  return (
    <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'surface.card' }}>
      <Skeleton variant="rectangular" height={138} />
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="55%" />
        <Skeleton variant="text" width="35%" sx={{ mt: 2.5 }} />
      </Box>
    </Box>
  );
}

/**
 * Competitions section (`/competitions`). A competition is a `competitions` record the team
 * flipped "Show on the website" in the portal's Competitions module — see
 * GET /api/public/competitions. Each detail page carries the Codeavour-style Track cards.
 *
 * API-driven since 10 Sep 2026 (was hand-authored static content before — there was no
 * competitions model in the system then).
 */
export default function CompetitionsPage() {
  const { data, isLoading, isError, error, refetch } = usePublicCompetitions();
  const count = data?.length || 0;

  return (
    <>
      <SeoHead
        title="STEM, Coding & Robotics Competitions for Kids in Kenya"
        description="Friendly, team-based coding, AI and robotics competitions for young learners in Kenya — pick a track, build a project, and present it to judges."
      />
      <JsonLd
        data={[
          organizationSchema(),
          itemListSchema(
            (data || []).map((c) => ({ name: c.name, url: `/competitions/${c.slug}` })),
            { name: 'Digifunzi Competitions' },
          ),
        ]}
      />

      <PageHeader
        title="Competitions"
        lead="We run friendly, skills-building competitions that give learners a real goal to build towards — and a stage to show what they have made. Pick a track, build with your team, and present it to judges."
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
              {count} {count === 1 ? 'competition' : 'competitions'} on now
            </Typography>
          </Box>
        )}
      </PageHeader>

      <Section dots>
        <Box sx={{ maxWidth: 760, mb: 5 }}>
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Competitions are team-based and mentor-supported. The emphasis is on learning by building,
            presenting clearly, and good sportsmanship — not just winning.
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Most events are open to learners already enrolled in a Digifunzi pathway or bootcamp.
            Schools can also enter teams directly.
          </Typography>
        </Box>

        {isLoading && (
          <Box sx={GRID_SX}>
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </Box>
        )}

        {isError && <ErrorBlock error={error} onRetry={refetch} />}

        {!isLoading && !isError && count === 0 && (
          <EmptyBlock
            title="No competitions running right now"
            body="We're between editions. Get in touch and we'll tell you what's coming this term and how to enter a team."
          />
        )}

        {!isLoading && !isError && count > 0 && (
          <Box sx={GRID_SX}>
            {data.map((c) => (
              <CompetitionCard key={c.id} competition={c} />
            ))}
          </Box>
        )}
      </Section>

      <CTABanner
        heading="Want your school to enter a team?"
        body="Tell us your learners’ ages and we’ll share the next competition calendar and entry details."
        primary={{ label: 'Get in touch', to: '/contact?subject=Competition%20entry%20enquiry' }}
        secondary={{ label: 'Explore pathways', to: '/pathways' }}
      />
    </>
  );
}
