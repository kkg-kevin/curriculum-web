/**
 * Static copy for the Home page (spec §1.1).
 * TODO: replace testimonials with real, permissioned quotes and photos.
 */

export const hero = {
  eyebrow: 'Robotics · Coding · STEM for kids',
  heading: 'Where Kenya’s young makers learn to build',
  sub: 'Digifunzi teaches children to design, code and build real things — through weekly projects, holiday bootcamps, competitions, and the Quarky robot.',
  primaryCta: { label: 'Enroll a learner', to: '/enroll' },
  secondaryCta: { label: 'Browse projects', to: '/projects' },
};

export const valueProps = [
  {
    title: 'Learn by building',
    body: 'Every session ends with something that works — a robot that moves, a program that plays, a circuit that lights up.',
  },
  {
    title: 'Progression that makes sense',
    body: 'Projects, bootcamps and competitions fit together into a path from first steps to confident young engineer.',
  },
  {
    title: 'Mentors, not just teachers',
    body: 'Small groups, hands-on help, and adults who are excited about what your child is making.',
  },
  {
    title: 'Built for Kenyan classrooms',
    body: 'Durable kits, offline-friendly tools, and a curriculum aligned to how schools here actually run their terms.',
  },
];

export const sectionSummaries = [
  {
    title: 'Bootcamps',
    to: '/bootcamps',
    blurb: 'Intensive, dated holiday programmes where learners go deep on one theme and finish with a showcase project.',
  },
  {
    title: 'Projects',
    to: '/projects',
    blurb: 'Our termly courses — robotics, coding, computer vision and electronics — taught weekly in small groups.',
  },
  {
    title: 'Pathways',
    to: '/pathways',
    blurb: 'Structured, multi-course tracks that take a learner from first steps to job-ready in one area, at their own pace.',
  },
  {
    title: 'Competitions',
    to: '/competitions',
    blurb: 'Friendly, team-based challenges that give learners a real goal to build towards and a stage to present on.',
  },
  {
    title: 'Quarky',
    to: '/quarky',
    blurb: 'The rugged learning robot at the centre of Digifunzi’s courses, and available for schools and families to buy.',
  },
];

export const testimonials = [
  {
    quote:
      'My daughter went from being nervous about computers to explaining sensor loops at the dinner table. The change in her confidence is the real result.',
    name: 'Parent, Nairobi', // TODO: real attribution with permission
  },
  {
    quote:
      'We brought Digifunzi in for our Grade 5–7 club. The kits held up, the lessons were ready to run, and our teachers felt supported the whole term.',
    name: 'Deputy Head, primary school', // TODO
  },
  {
    quote:
      'The holiday bootcamp was the highlight of my son’s year. He still talks about demo day.',
    name: 'Parent, Kiambu', // TODO
  },
];
