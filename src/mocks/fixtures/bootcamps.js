import { slugify } from '../../utils/slugify.js';

/**
 * Offline mock for GET /api/public/bootcamps[/:idOrSlug] — the designated admin's Event
 * curricula flipped "List on the website" in the portal's Event view
 * (WEBSITE_INTEGRATION_CONTRACT.md §3.1/§3.2). Shape mirrors the real projection.
 */
const raw = [
  {
    id: 'b0000000-0001-4000-8000-000000000001',
    name: 'Robot Builders Holiday Bootcamp',
    tagline: 'A full robot build, coded and driven, in one week',
    format: 'holiday',
    duration: '1 week',
    ageMin: 9,
    ageMax: 14,
    coverImage: null,
    price: {
      amount: 12000,
      currency: 'KES',
      note: 'Includes all materials and the end-of-week showcase. Sibling discount available.',
    },
    description:
      'One intensive week of hands-on robotics. Learners start with a bare Quarky board and finish with a robot they built, coded and can drive around an obstacle course — with a showcase for families on the last afternoon. No prior coding needed.',
    highlights: [
      'Build a working robot from a bare board',
      'Write real code to make it move, sense and react',
      'Drive it through an obstacle course you design',
      'Showcase for families on the final afternoon',
    ],
    upcomingRuns: [
      {
        hubName: 'Nairobi — Westlands Hub',
        startDate: '2026-12-08',
        endDate: '2026-12-12',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'b0000000-0002-4000-8000-000000000002',
    name: 'Weekend Coders Club',
    tagline: 'Four Saturdays, one game you built from scratch',
    format: 'weekend',
    duration: '4 Saturdays',
    ageMin: 10,
    ageMax: 15,
    coverImage: null,
    price: { amount: 7500, currency: 'KES', note: 'One payment covers all four sessions.' },
    description:
      'A relaxed weekend track: each Saturday adds a new piece — sprites, movement, scoring, sound — and by the last session every learner has a small game they designed and coded, ready to share.',
    highlights: [
      'Start from a blank project — no template',
      'Add movement, scoring and sound week by week',
      'Design your own levels and characters',
      'Take home a game you can keep building on',
    ],
    upcomingRuns: [],
  },
];

export const bootcamps = raw.map((b) => ({
  ...b,
  slug: slugify(b.name),
  highlightCount: b.highlights.length,
}));

// The list projection is the item minus the detail-only fields.
const LIST_FIELDS = [
  'id', 'slug', 'name', 'tagline', 'format', 'duration', 'ageMin', 'ageMax', 'coverImage', 'price',
  'highlightCount',
];
export const bootcampList = bootcamps.map((b) =>
  Object.fromEntries(LIST_FIELDS.map((k) => [k, b[k]])),
);

export function bootcampDetail(idOrSlug) {
  return bootcamps.find((b) => b.id === idOrSlug || b.slug === idOrSlug) || null;
}
