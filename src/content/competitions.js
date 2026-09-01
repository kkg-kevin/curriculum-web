/**
 * Static content for the Competitions section (spec §4.3, Option A).
 * There is no backing data model in the main system yet — this is authored by hand.
 * When a real recurring competitions programme exists, revisit Option B.
 *
 * TODO: replace placeholder copy and dates with real programme details.
 */
export const competitionsIntro = {
  heading: 'Digifunzi Competitions',
  lead: 'We run friendly, skills-building competitions that give learners a real goal to build towards — and a stage to show what they have made.',
  body: [
    'Competitions are team-based and mentor-supported. The emphasis is on learning by building, presenting clearly, and good sportsmanship — not just winning.',
    'Most events are open to learners already enrolled in a Digifunzi project or bootcamp. Schools can also enter teams directly.',
  ],
};

export const competitions = [
  {
    id: 'robotics-challenge',
    slug: 'annual-robotics-challenge',
    name: 'Annual Robotics Challenge',
    format: 'Teams of 3–4',
    level: 'Primary & Secondary (separate divisions)',
    cadence: 'Once a year, Term 2',
    summary:
      'Teams design and program a robot to complete a themed course under time pressure. The theme changes every year.',
    highlights: [
      'Themed missions announced 8 weeks before the event',
      'Design-journal judging alongside the on-course run',
      'Mentor clinics in the weeks leading up',
    ],
  },
  {
    id: 'code-quest',
    slug: 'code-quest',
    name: 'Code Quest',
    format: 'Individual or pairs',
    level: 'Ages 10+',
    cadence: 'Twice a year',
    summary:
      'A timed set of progressively harder programming puzzles. Beginner and advanced tracks run in parallel.',
    highlights: ['Beginner and advanced tracks', 'Puzzles released in rounds', 'Same-day results'],
  },
  {
    id: 'invent-fair',
    slug: 'invent-fair',
    name: 'Invent Fair',
    format: 'Teams of 2–5',
    level: 'All ages',
    cadence: 'Once a year, end of Term 3',
    summary:
      'An open showcase: teams build something that solves a problem in their community and present it to judges and families.',
    highlights: ['Open-ended brief', 'Community-impact judging criterion', 'Public showcase evening'],
  },
];
