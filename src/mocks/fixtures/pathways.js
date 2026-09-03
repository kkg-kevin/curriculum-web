import { slugify } from '../../utils/slugify.js';

/**
 * Mock data for GET /api/public/pathways (Learning Pathways).
 *
 * Shape mirrors the main system's server/src/modules/public-site contract exactly:
 *   list item: { id, slug, name, description, color, courseCount }
 *   detail:    list item + courses: [{ name, description, ageMin, ageMax, coverImage }]
 * so flipping VITE_USE_MOCK to false needs no page changes.
 *
 * A Pathway is a curriculum-agnostic roadmap — an ordered list of courses a learner
 * works through. The order of `courses` below IS the learning sequence.
 */
const raw = [
  {
    id: 'p0000000-0001-4000-8000-000000000001',
    name: 'Software Engineer',
    description:
      'From first lines of code to building and shipping real applications. Learners move through programming fundamentals, object-oriented design and system design, finishing able to plan and build a full project on their own.',
    color: '#25476a',
    courses: [
      {
        name: 'Python Foundations',
        description:
          'A gentle first programming course: variables, loops, functions and a final text-based game project.',
        ageMin: 10,
        ageMax: 15,
        coverImage: null,
      },
      {
        name: 'Java & Object-Oriented Design',
        description:
          'Classes, objects, inheritance and interfaces — learners model a small real-world system and build it in Java.',
        ageMin: 13,
        ageMax: 18,
        coverImage: null,
      },
      {
        name: 'Introduction to System Design',
        description:
          'How larger software fits together: APIs, databases, and breaking a big idea into services. Ends with a design document for a project of the learner’s choice.',
        ageMin: 15,
        ageMax: 18,
        coverImage: null,
      },
    ],
  },
  {
    id: 'p0000000-0002-4000-8000-000000000002',
    name: 'Robotics',
    description:
      'A four-step track that takes a learner from block-based coding to programming autonomous robots. Each level builds on the last, ending with a robot the learner has designed, wired and programmed.',
    color: '#c1121f',
    courses: [
      {
        name: 'Code Foundations 1',
        description:
          'A fun, interactive introduction to coding using Scratch in PictoBlox. Learners build logic, creativity and problem-solving skills.',
        ageMin: 5,
        ageMax: 10,
        coverImage: null,
      },
      {
        name: 'Code Foundations 2',
        description:
          'Sequencing, loops and events applied to on-screen sprites and simple simulations.',
        ageMin: 5,
        ageMax: 12,
        coverImage: null,
      },
      {
        name: 'Code Foundations 3',
        description:
          'Learners meet the Quarky robot and control its motors and lights from code for the first time.',
        ageMin: 6,
        ageMax: 12,
        coverImage: null,
      },
      {
        name: 'Code Foundations 4',
        description:
          'Sensors, decisions and autonomy — the robot reacts to the world on its own. Ends with a self-designed robot challenge.',
        ageMin: 7,
        ageMax: 13,
        coverImage: null,
      },
    ],
  },
  {
    id: 'p0000000-0003-4000-8000-000000000003',
    name: 'Data & AI',
    description:
      'For learners curious about how machines learn. Starts with reading and plotting data, moves through training simple models, and finishes with a working AI project the learner presents.',
    color: '#2a9d8f',
    courses: [
      {
        name: 'Working with Data',
        description:
          'Collecting, cleaning and charting real datasets. Learners tell a story with a dataset they pick themselves.',
        ageMin: 11,
        ageMax: 16,
        coverImage: null,
      },
      {
        name: 'Intro to Machine Learning',
        description:
          'Train a classifier, measure how well it does, and understand where it goes wrong — no heavy maths.',
        ageMin: 13,
        ageMax: 18,
        coverImage: null,
      },
      {
        name: 'Computer Vision Project',
        description:
          'Build a project that reacts to what a camera sees, and present it on demo day.',
        ageMin: 13,
        ageMax: 18,
        coverImage: null,
      },
    ],
  },
];

export const pathways = raw.map((p) => ({
  id: p.id,
  slug: slugify(p.name),
  name: p.name,
  description: p.description,
  color: p.color,
  courseCount: p.courses.length,
}));

export function pathwayDetail(idOrSlug) {
  const item = raw.find((p) => p.id === idOrSlug || slugify(p.name) === idOrSlug);
  if (!item) return null;
  if (item.courses.length === 0) return null; // matches the server's "nothing to show" 404
  return {
    id: item.id,
    slug: slugify(item.name),
    name: item.name,
    description: item.description,
    color: item.color,
    courseCount: item.courses.length,
    courses: item.courses.map((c) => ({
      name: c.name,
      description: c.description,
      ageMin: c.ageMin ?? null,
      ageMax: c.ageMax ?? null,
      coverImage: c.coverImage ?? null,
    })),
  };
}
