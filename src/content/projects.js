/**
 * Static catalogue of PROJECTS you buy (spec: "we will be selling projects").
 *
 * A project is sold the way an online course is: one purchase unlocks all its
 * lessons, checkpoints and challenges for a learner, with no time limit. This is
 * its own top-level section (`/projects`), separate from the Store, which sells
 * physical goods (the Quarky robot, bundles, accessories — src/content/store.js).
 *
 * ⚠️ PLACEHOLDER content and prices — see src/content/catalog.js. There is no
 * commerce API yet; "Enquire to buy" posts a lead via /api/public/leads.
 *
 * Item shape + PRICING_IS_PLACEHOLDER: src/content/catalog.js.
 */
import { PRICING_IS_PLACEHOLDER } from './catalog.js';

export { PRICING_IS_PLACEHOLDER };

/** Difficulty levels, in display order — the Projects list filters by these. */
export const PROJECT_LEVELS = [
  { key: 'all', label: 'All levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

const rawProjects = [
  {
    slug: 'smart-home-starter-project',
    icon: 'home',
    name: 'Smart Home Starter',
    kind: 'project',
    nature: 'digital',
    level: 'beginner',
    track: 'Robotics',
    tagline: 'Make a model room that reacts to you',
    summary:
      'A first automation project: a light that comes on in the dark, a fan that runs when it is hot, a buzzer that warns of an open door. Buy once, build at your own pace.',
    description:
      'Five short lessons introducing inputs, outputs and simple decision logic through a model "smart room". Learners wire each device, write the rule that controls it, then combine everything into one program. No prior coding needed — this is often a learner\'s very first project.',
    price: { amount: 1800, currency: 'KES', unit: 'per learner', compareAt: null },
    priceNote: 'One-time purchase — lifetime access. Classroom licences (10+ learners) are discounted.',
    status: 'available',
    badge: 'Great first project',
    image: null,
    gallery: [],
    highlights: [
      '5 short, friendly lessons',
      'No prior coding needed',
      'Every lesson ends with something working',
      'Lifetime access',
    ],
    includes: [
      'Lifetime access to all 5 lessons for one learner',
      'Wiring cards for each device',
      'Starter and solution code',
      'Ideas for extending the project further',
    ],
    specs: [
      { label: 'Format', value: 'Self-paced online project' },
      { label: 'Lessons', value: '5 (approx. 3–4 hours)' },
      { label: 'Hardware needed', value: 'Quarky or compatible parts (not included)' },
      { label: 'Prerequisites', value: 'None' },
    ],
    audience: 'Ages 8–12',
    usedIn: ['Code Foundations 3', 'Robotics pathway'],
    faqs: [
      {
        q: 'Is this too easy for a teenager?',
        a: 'It is aimed at younger or first-time builders. Older learners usually start with the Line-Following Robot or the Weather Station instead.',
      },
      {
        q: 'Do we need to buy anything else?',
        a: 'You need a Quarky or compatible parts to build on — sold separately in the Store. The project itself is the lessons, wiring guides and code.',
      },
    ],
  },
  {
    slug: 'line-following-robot-project',
    icon: 'route',
    name: 'Line-Following Robot',
    kind: 'project',
    nature: 'digital',
    level: 'intermediate',
    track: 'Robotics',
    tagline: 'A guided build project — buy once, keep forever',
    summary:
      'A step-by-step project that takes a learner from a bare robot to one that drives a track on its own. Bought like an online course: lifetime access to every lesson, checkpoint and challenge.',
    description:
      'Learners work through eight guided lessons: reading the line sensor, tuning thresholds, turning on a junction, and finally a full autonomous lap. Each lesson has a short video, a build checklist and a code checkpoint the learner can compare against. Runs on a Quarky (sold separately) or any compatible robot. One purchase unlocks the whole project for one learner, with no time limit.',
    price: { amount: 2500, currency: 'KES', unit: 'per learner', compareAt: null },
    priceNote: 'One-time purchase — lifetime access. Classroom licences (10+ learners) are discounted.',
    status: 'available',
    badge: 'Most popular',
    image: null,
    gallery: [],
    highlights: [
      '8 guided lessons with video walkthroughs',
      'Code checkpoints to compare your work against',
      'Works with Quarky or any compatible robot',
      'Lifetime access — revisit any lesson any time',
    ],
    includes: [
      'Lifetime access to all 8 lessons for one learner',
      'Downloadable build checklists and wiring diagrams',
      'Starter and solution code for every checkpoint',
      'A printable completion certificate',
    ],
    specs: [
      { label: 'Format', value: 'Self-paced online project' },
      { label: 'Lessons', value: '8 (approx. 6 hours)' },
      { label: 'Hardware needed', value: 'Quarky or compatible robot (not included)' },
      { label: 'Prerequisites', value: 'Comfortable with block coding' },
    ],
    audience: 'Ages 9–14',
    usedIn: ['Intro to Robotics', 'Robotics pathway'],
    faqs: [
      {
        q: 'Is this a physical kit?',
        a: 'No — this is the project itself: the lessons, guidance and code. You run it on a robot you already have, or buy a Quarky from the Store.',
      },
      {
        q: 'How long do we have access?',
        a: 'Access does not expire. Once a project is bought for a learner, they can come back to it whenever they like.',
      },
      {
        q: 'Can a teacher buy this for a whole class?',
        a: 'Yes. Ask us about a classroom licence — one purchase covering every learner in the group, at a lower per-learner price.',
      },
    ],
  },
  {
    slug: 'weather-station-data-project',
    icon: 'data',
    name: 'Build a Weather Station',
    kind: 'project',
    nature: 'digital',
    level: 'intermediate',
    track: 'Data & AI',
    tagline: 'Collect real data, then make it tell a story',
    summary:
      'A data-and-sensors project: build a small weather station, log temperature and humidity over a week, then chart it and present what you found. Bought once, yours to keep.',
    description:
      'Six lessons that blend hardware and data skills. Learners wire up temperature and humidity sensors, write code to log readings on a schedule, then move to a laptop to clean, chart and interpret the week of data they collected. Finishes with a short presentation brief. A gentle, real-world introduction to how data projects actually work.',
    price: { amount: 2500, currency: 'KES', unit: 'per learner', compareAt: null },
    priceNote: 'One-time purchase — lifetime access. Classroom licences (10+ learners) are discounted.',
    status: 'available',
    badge: null,
    image: null,
    gallery: [],
    highlights: [
      '6 lessons spanning sensors, code and data',
      'Learners keep and present their own week of real data',
      'Bridges into the Data & AI pathway',
      'Lifetime access',
    ],
    includes: [
      'Lifetime access to all 6 lessons for one learner',
      'Sensor wiring guide and logging code',
      'A data workbook template for charting the results',
      'Presentation brief and rubric',
    ],
    specs: [
      { label: 'Format', value: 'Self-paced online project' },
      { label: 'Lessons', value: '6 (approx. 5 hours over a week)' },
      { label: 'Hardware needed', value: 'Quarky or compatible sensors (not included)' },
      { label: 'Prerequisites', value: 'None — a good first data project' },
    ],
    audience: 'Ages 11–16',
    usedIn: ['Working with Data', 'Data & AI pathway'],
    faqs: [
      {
        q: 'Do we need special equipment?',
        a: 'A Quarky covers every sensor this project uses. If your school already has temperature/humidity sensors, those work too — the wiring guide covers the common ones.',
      },
      {
        q: 'Why does it run over a week?',
        a: 'The point is real data. Learners log readings for several days so their charts show an actual pattern, not a flat line from one afternoon.',
      },
    ],
  },
];

/** Full projects catalogue. */
export const projects = rawProjects;

/** One project by slug, or null. */
export function getProject(slug) {
  return projects.find((p) => p.slug === slug) || null;
}

/** Projects at a level ('all' returns everything). */
export function projectsByLevel(levelKey) {
  if (!levelKey || levelKey === 'all') return projects;
  return projects.filter((p) => p.level === levelKey);
}

/** Only the levels that actually have at least one project (plus 'all'). */
export function activeProjectLevels() {
  return PROJECT_LEVELS.filter(
    (l) => l.key === 'all' || projects.some((p) => p.level === l.key),
  );
}
