import { lazy, Suspense } from 'react';
import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import Hero from '../components/home/Hero.jsx';
import ValueProps from '../components/home/ValueProps.jsx';
import SectionSummaries from '../components/home/SectionSummaries.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import HomeFaq from '../components/home/HomeFaq.jsx';
import CTABanner from '../components/home/CTABanner.jsx';

// The only part of the home page that talks to the API. Split out so the rest of the page —
// the eager, first-paint bundle — doesn't carry axios and the bootcamp card with it.
const UpcomingBootcamps = lazy(() => import('../components/home/UpcomingBootcamps.jsx'));

// Takes no space. role="status" is what scripts/prerender.js (via utils/prerenderSignal.js)
// reads as "still loading", so the snapshot waits for the section instead of missing it.
const upcomingFallback = <span role="status" aria-label="Loading upcoming bootcamps" />;

export default function HomePage() {
  return (
    <>
      <SeoHead
        title="Digifunzi — Robotics, Coding & STEM for Kids in Kenya"
        titleTemplate={false}
        description="Digifunzi teaches robotics, coding and STEM to children across Kenya through hands-on projects, holiday bootcamps, competitions and the Quarky robot."
      />
      <JsonLd data={organizationSchema()} />

      <Hero />
      <Suspense fallback={upcomingFallback}>
        <UpcomingBootcamps />
      </Suspense>
      <ValueProps />
      <SectionSummaries />
      <Testimonials />
      <HomeFaq />
      <CTABanner />
    </>
  );
}
