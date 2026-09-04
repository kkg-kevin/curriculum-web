/**
 * Static copy for the About page (spec §5 — good for SEO + trust signals).
 * TODO: replace with the real company story, founding year, team and partners.
 */
export const about = {
  heading: 'About Digifunzi',
  lead: 'We are a Kenyan STEM education company on a simple mission: give every child the chance to build with technology, not just consume it.',
  story: [
    'Digifunzi started with a small set of after-school robotics clubs and a belief that children learn engineering best by making real things they care about.',
    'Today we run weekly project courses, holiday bootcamps and competitions, and we build the Quarky robot that ties the hands-on parts of our curriculum together.',
    'We work with families directly and partner with schools to bring structured, well-supported STEM programmes into classrooms across the country.',
  ],
  mission:
    'To make hands-on robotics, coding and STEM learning normal, joyful and accessible for children across Kenya.',
  values: [
    { title: 'Make it real', body: 'If a learner can hold it, run it or show it, they understand it.', icon: 'build' },
    {
      title: 'Meet learners where they are',
      body: 'Small groups, patient mentors, and a path that adjusts to each child.',
      icon: 'diversity',
    },
    {
      title: 'Support the adults too',
      body: 'Teachers and parents get materials, training and a person to call.',
      icon: 'support',
    },
  ],
  // TODO: real numbers once verified. Left blank (not '—') deliberately — the
  // About page only renders a stat once `value` is set, rather than showing a
  // placeholder dash that reads as a broken page.
  stats: [
    { value: '', label: 'Learners taught' },
    { value: '', label: 'Partner schools' },
    { value: '', label: 'Bootcamps run' },
  ],
  programmes: [
    { title: 'Project courses', body: 'Weekly, termly, small-group.', to: '/projects', icon: 'code' },
    { title: 'Bootcamps', body: 'Intensive, dated, holiday.', to: '/bootcamps', icon: 'rocket' },
    { title: 'Pathways', body: 'Structured multi-course tracks.', to: '/pathways', icon: 'route' },
    { title: 'Competitions', body: 'Team-based, mentor-supported.', to: '/competitions', icon: 'trophy' },
  ],
};
