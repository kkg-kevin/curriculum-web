import Box from '@mui/material/Box';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import BootcampCard from '../components/cards/BootcampCard.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import { useBootcamps } from '../hooks/useBootcamps.js';

export default function BootcampsListPage() {
  const { data, isLoading, isError, error, refetch } = useBootcamps();

  return (
    <>
      <SeoHead
        title="STEM Bootcamps for Kids in Kenya"
        description="Intensive, dated holiday bootcamps where young learners in Kenya go deep on robotics, coding or electronics and finish with a real showcase project."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title="Bootcamps"
        lead="Intensive, dated holiday programmes. Learners focus on one theme, build every day, and present a finished project at the end."
      />

      <Section>
        {isLoading && <LoadingBlock label="Loading bootcamps…" />}
        {isError && <ErrorBlock error={error} onRetry={refetch} />}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <EmptyBlock
            title="No bootcamps scheduled right now"
            body="New dates are announced each term. Get in touch to be notified when the next one opens."
          />
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {data.map((b) => (
              <BootcampCard key={b.id} bootcamp={b} />
            ))}
          </Box>
        )}
      </Section>

      <CTABanner
        heading="Want your child in the next cohort?"
        body="Register your interest and we’ll hold a place and send you the details."
      />
    </>
  );
}
