import { whoWeAre } from './organisation.js';

/**
 * Static copy for the About page (spec §5 — good for SEO + trust signals). The vision, mission
 * and 2030 goal shown on the page come from content/organisation.js.
 * TODO: founding year, team and partners once confirmed.
 */
export const about = {
  heading: 'About Digifunzi',
  lead: whoWeAre,
  story: [
    'We believe young people in Africa should be building with technology, not only using it. So we teach robotics, artificial intelligence and coding through an engaging, hands-on approach that develops problem-solving, critical thinking and creativity from an early age.',
    'We work with families directly, through learning pathways, holiday bootcamps, home schooling, buildable projects and competitions, and we partner with schools through our Robotics, AI & Coding for Schools programme, which trains teachers and supports each school until it can run the programme on its own.',
    'The hands-on side of our curriculum is taught with Quarky, an AI-powered educational robot learners program in Scratch and Python. Learners also take part in global coding and robotics competitions, with Digifunzi as the Country Partner for Codeavour.',
  ],
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
    { title: 'Pathways', body: 'Structured multi-course tracks.', to: '/pathways', icon: 'route' },
    { title: 'Schools', body: 'Robotics, AI and coding in your school.', to: '/schools', icon: 'school' },
    { title: 'Projects', body: 'Guided builds you buy and keep.', to: '/projects', icon: 'code' },
    { title: 'Competitions', body: 'Team-based, mentor-supported.', to: '/competitions', icon: 'trophy' },
    { title: 'Store', body: 'The Quarky robot, kits and bundles.', to: '/store', icon: 'rocket' },
  ],
};
