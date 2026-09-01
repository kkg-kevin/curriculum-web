import SeoHead from '../components/seo/SeoHead.jsx';
import JsonLd, { organizationSchema } from '../components/seo/JsonLd.jsx';
import Hero from '../components/home/Hero.jsx';
import ValueProps from '../components/home/ValueProps.jsx';
import SectionSummaries from '../components/home/SectionSummaries.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import CTABanner from '../components/home/CTABanner.jsx';

export default function HomePage() {
  return (
    <>
      <SeoHead
        title="Robotics & STEM Learning for Kids in Kenya"
        titleTemplate={false}
        description="Digifunzi teaches robotics, coding and STEM to children across Kenya through hands-on weekly projects, holiday bootcamps, competitions and the Quarky robot."
      />
      <JsonLd data={organizationSchema()} />

      <Hero />
      <ValueProps />
      <SectionSummaries />
      <Testimonials />
      <CTABanner />
    </>
  );
}
