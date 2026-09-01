import Box from '@mui/material/Box';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Section from '../components/common/Section.jsx';
import ProjectCard from '../components/cards/ProjectCard.jsx';
import CTABanner from '../components/home/CTABanner.jsx';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/common/StateViews.jsx';
import { useProjects } from '../hooks/useProjects.js';

export default function ProjectsListPage() {
  const { data, isLoading, isError, error, refetch } = useProjects();

  return (
    <>
      <SeoHead
        title="Robotics & Coding Courses for Kids in Kenya"
        description="Digifunzi’s termly project courses — robotics, Python, computer vision and electronics — taught weekly in small, mentor-led groups across Kenya."
      />
      <JsonLd data={organizationSchema()} />

      <PageHeader
        title="Projects"
        lead="Our termly courses. Each one is a series of hands-on sessions that build towards a project the learner designs and completes."
      />

      <Section>
        {isLoading && <LoadingBlock label="Loading projects…" />}
        {isError && <ErrorBlock error={error} onRetry={refetch} />}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <EmptyBlock title="No projects listed yet" body="Check back soon, or contact us about what’s running this term." />
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            {data.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </Box>
        )}
      </Section>

      <CTABanner
        heading="Find the right course for your learner"
        body="Not sure where to start? Tell us your child’s age and interests and we’ll point you to the best fit."
      />
    </>
  );
}
