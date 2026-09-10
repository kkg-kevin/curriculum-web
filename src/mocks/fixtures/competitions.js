import { slugify } from '../../utils/slugify.js';

/**
 * Offline mock for GET /api/public/competitions[/:idOrSlug] — the designated admin's
 * `competitions` records flipped "Show on the website" (status Open/Closed) in the portal's
 * Competitions module (WEBSITE_INTEGRATION_CONTRACT.md §3.13). Shape mirrors the real
 * projection in server/src/modules/public-site/public-competition.service.js.
 */
const raw = [
  {
    id: 'c0000000-0001-4000-8000-000000000001',
    name: 'Codeavour 8.0',
    edition: '2026 · 8.0',
    level: 'Ages 7–18',
    format: 'team',
    cadence: 'annual',
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    coverImage: null,
    status: 'open',
    description:
      'The world’s largest AI, coding and robotics competition for young innovators. Learners pick a track, build a project with their team, and present it to a panel of judges — with regional finals leading to a global showcase.',
    tracks: [
      {
        id: 'track-1',
        name: 'Innovation and Entrepreneurship',
        subtitle: 'Solve a real problem with code',
        description:
          'Build an app, a game or an AI project that addresses one of the UN Sustainable Development Goals, then pitch it like a startup.',
        highlights: [
          'Choose your own SDG and problem statement',
          'Build in Scratch, Python or the block/AI editor',
          'Pitch deck and demo to the judging panel',
        ],
        registerUrl: '',
        knowMoreUrl: '',
      },
      {
        id: 'track-2',
        name: 'Clean Energy AI-Robo Challenge',
        subtitle: 'Robotics meets sustainability',
        description:
          'Design and program a robot that models a clean-energy solution — solar tracking, smart grids, waste sorting — on a themed arena.',
        highlights: [
          'Themed arena revealed 6 weeks before finals',
          'Hardware + code judged together',
          'Design-journal submission',
        ],
        registerUrl: '',
        knowMoreUrl: '',
      },
      {
        id: 'track-3',
        name: 'Robo Soccer League',
        subtitle: 'Autonomous 2-a-side',
        description:
          'Teams build and code two autonomous robots to play a fast-paced soccer match. Best strategy and cleanest code win.',
        highlights: ['2 v 2 autonomous matches', 'Round-robin then knockouts', 'Pit-crew repairs allowed'],
        registerUrl: '',
        knowMoreUrl: '',
      },
    ],
  },
];

export const competitions = raw.map((c) => ({
  ...c,
  slug: slugify(c.name) || 'competition',
  trackCount: c.tracks.length,
}));

// The list projection is the item minus description and the tracks array.
const LIST_FIELDS = [
  'id', 'slug', 'name', 'edition', 'level', 'format', 'cadence', 'startDate', 'endDate',
  'coverImage', 'status', 'trackCount',
];
export const competitionList = competitions.map((c) =>
  Object.fromEntries(LIST_FIELDS.map((k) => [k, c[k]])),
);

export function competitionDetail(idOrSlug) {
  return competitions.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
}
