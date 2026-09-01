import { slugify } from '../../utils/slugify.js';

/**
 * Mock data for GET /api/public/bootcamps.
 * Shape mirrors spec §4.1. Replace with the real endpoint by setting
 * VITE_USE_MOCK=false once server/src/modules/public-site/ ships.
 */
const raw = [
  {
    id: 'b1a2c3d4-0001-4000-8000-000000000001',
    name: 'Junior Robotics Bootcamp',
    description:
      'A two-week intensive where learners build, wire and program their first autonomous robot using the Quarky platform. Runs during the April school holiday.',
    coverImage: null,
    status: 'upcoming',
    startDate: '2026-04-06',
    endDate: '2026-04-17',
    educationLevel: 'Primary',
    gradeFrom: 'Grade 4',
    gradeTo: 'Grade 6',
  },
  {
    id: 'b1a2c3d4-0002-4000-8000-000000000002',
    name: 'AI & Coding Accelerator',
    description:
      'Teens explore machine-learning concepts, build a computer-vision project and present it on demo day. Held over the August holiday.',
    coverImage: null,
    status: 'active',
    startDate: '2026-08-04',
    endDate: '2026-08-22',
    educationLevel: 'Secondary',
    gradeFrom: 'Form 1',
    gradeTo: 'Form 4',
  },
  {
    id: 'b1a2c3d4-0003-4000-8000-000000000003',
    name: 'Creative Electronics Camp',
    description:
      'Learners design wearable and interactive art pieces with sensors, LEDs and micro-controllers. Completed cohort — next run to be announced.',
    coverImage: null,
    status: 'completed',
    startDate: '2025-12-01',
    endDate: '2025-12-12',
    educationLevel: 'Primary',
    gradeFrom: 'Grade 5',
    gradeTo: 'Grade 8',
  },
];

// Detail-only extras (spec §4.1 detail endpoint).
const details = {
  'b1a2c3d4-0001-4000-8000-000000000001': {
    classes: ['Robotics A — Morning', 'Robotics B — Afternoon'],
    courses: [{ name: 'Intro to Robotics', slug: 'intro-to-robotics' }],
  },
  'b1a2c3d4-0002-4000-8000-000000000002': {
    classes: ['AI Cohort 2026'],
    courses: [
      { name: 'Python Foundations', slug: 'python-foundations' },
      { name: 'Computer Vision Basics', slug: 'computer-vision-basics' },
    ],
  },
  'b1a2c3d4-0003-4000-8000-000000000003': {
    classes: ['Electronics December 2025'],
    courses: [],
  },
};

export const bootcamps = raw.map((b) => ({ ...b, slug: slugify(b.name) }));

export function bootcampDetail(idOrSlug) {
  const item = bootcamps.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
  if (!item) return null;
  return { ...item, ...(details[item.id] || { classes: [], courses: [] }) };
}
