import { slugify } from '../../utils/slugify.js';

/**
 * Offline mock for GET /api/public/projects[/:idOrSlug] — the designated admin's
 * `type: "project"` assessments marked "For sale" in the Assessment Builder
 * (WEBSITE_INTEGRATION_CONTRACT.md §3.3/§3.4). Shape mirrors the real projection.
 */
const raw = [
  {
    id: 'p0000000-0001-4000-8000-000000000001',
    name: 'Smart Home Starter',
    tagline: 'Make a model room that reacts to you',
    level: 'beginner',
    ageMin: 8,
    ageMax: 12,
    coverImage: null,
    price: { amount: 1800, currency: 'KES', note: 'One-time purchase — lifetime access.' },
    description:
      'A first automation project: a light that comes on in the dark, a fan that runs when it is hot, a buzzer that warns of an open door. No prior coding needed.',
    overview:
      'Five short lessons introducing inputs, outputs and simple decision logic through a model "smart room". Learners wire each device, write the rule that controls it, then combine everything into one program.',
    deliverables: [
      { name: 'A working smart room', description: 'All three devices responding to their sensors' },
      { name: 'A 1-minute demo video', description: 'A walkthrough of what you built' },
    ],
    milestones: [
      { name: 'A light that senses the dark', description: '' },
      { name: 'A fan that senses heat', description: '' },
      { name: 'A door buzzer', description: '' },
      { name: 'Combine it into one program', description: '' },
    ],
    requirements: ['A Quarky robot kit', 'A laptop or Chromebook'],
  },
  {
    id: 'p0000000-0002-4000-8000-000000000002',
    name: 'Line-Following Robot',
    tagline: 'Build a robot that drives itself around a track',
    level: 'intermediate',
    ageMin: 10,
    ageMax: 15,
    coverImage: null,
    price: { amount: 2500, currency: 'KES', note: 'One-time purchase — lifetime access.' },
    description:
      'Use light sensors and a control loop to make a robot follow a black line around a track, then tune it to take corners cleanly.',
    overview:
      'Six lessons on sensors, thresholds and feedback loops. Ends with a timed run on a track the learner designs.',
    deliverables: [
      { name: 'A line-following robot', description: 'Completes a lap unaided' },
      { name: 'A track design', description: 'Drawn and tested by the learner' },
    ],
    milestones: [
      { name: 'Read the light sensors', description: '' },
      { name: 'Decide: on the line or off it?', description: '' },
      { name: 'Steer back onto the line', description: '' },
      { name: 'Tune for corners', description: '' },
      { name: 'Timed lap', description: '' },
    ],
    requirements: ['A Quarky robot kit', 'A line-follower track (printable)'],
  },
];

export const projects = raw.map((p) => ({
  ...p,
  slug: slugify(p.name),
  deliverableCount: p.deliverables.length,
  milestoneCount: p.milestones.length,
}));

export function projectDetail(idOrSlug) {
  return projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}
