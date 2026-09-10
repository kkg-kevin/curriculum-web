import { slugify } from '../../utils/slugify.js';

/**
 * Mock data for the public diagnostic endpoints (WEBSITE_INTEGRATION_CONTRACT.md §3.8, §4.3).
 * Offline stand-in only — offers one pathway ("Robotics") a diagnostic, age range 6-13,
 * with a small mixed-kind question set covering every item kind the real API can send.
 */
const OFFERED_SLUG = slugify('Robotics');
const AGE_MIN = 6;
const AGE_MAX = 13;

const ITEMS = [
  {
    id: 'q1',
    kind: 'mcqSingle',
    question: '<p>Which block makes a Quarky robot move forward?</p>',
    points: 1,
    options: ['Move forward', 'Turn left', 'Wait 1 second', 'Set colour'],
  },
  {
    id: 'q2',
    kind: 'trueFalse',
    question: '<p>A loop lets you repeat the same blocks without copying them.</p>',
    points: 1,
    options: ['True', 'False'],
  },
  {
    id: 'q3',
    kind: 'mcqMultiple',
    question: '<p>Which of these are sensors a robot might use? (choose all that apply)</p>',
    points: 2,
    options: ['Ultrasonic sensor', 'Light bulb', 'Line sensor', 'Speaker'],
  },
  {
    id: 'q4',
    kind: 'ordering',
    question: '<p>Put these steps in the order you would follow to program a robot to avoid an obstacle.</p>',
    points: 2,
    sequence: ['Read the sensor', 'Check if something is close', 'Stop or turn', 'Move forward again'],
  },
  {
    id: 'q5',
    kind: 'matching',
    question: '<p>Match each block to what it controls.</p>',
    points: 2,
    pairs: [
      { left: 'Motor block', right: '' },
      { left: 'LED block', right: '' },
    ],
    rightOptions: ['Movement', 'Lights'],
  },
  {
    id: 'q6',
    kind: 'fillBlank',
    question: '<p>Fill in the blank: A ____ repeats a set of blocks a number of times.</p>',
    points: 1,
    blanks: [''],
  },
];

export function diagnosticAvailability(idOrSlug) {
  const available = idOrSlug === OFFERED_SLUG;
  return {
    diagnosticAvailable: available,
    minAge: available ? AGE_MIN : null,
    maxAge: available ? AGE_MAX : null,
  };
}

/** The `diagnostic` object embedded in a pathway-detail response (fixtures/pathways.js). */
export function diagnosticInfoForSlug(slug) {
  const available = slug === OFFERED_SLUG;
  return {
    available,
    minAge: available ? AGE_MIN : null,
    maxAge: available ? AGE_MAX : null,
  };
}

export function diagnosticQuestionSet(idOrSlug, age) {
  if (idOrSlug !== OFFERED_SLUG) return null;
  const parsedAge = Number(age);
  if (!Number.isFinite(parsedAge) || parsedAge < AGE_MIN || parsedAge > AGE_MAX) return null;
  return {
    pathwayId: 'p0000000-0002-4000-8000-000000000002',
    pathwayName: 'Robotics',
    assessmentId: 'mock-diagnostic-assessment',
    name: 'Robotics Starting-Point Diagnostic',
    instructions: '<p>Answer as many as you can — there is no time limit and no wrong-answer penalty.</p>',
    minAge: AGE_MIN,
    maxAge: AGE_MAX,
    items: ITEMS,
  };
}

// In-memory store of graded mock attempts, keyed by attemptId — so the offline report page
// (GET /api/public/diagnostics/attempts/:attemptId) can render what submit just produced.
const mockAttempts = new Map();

// Rough auto-grader for the mock only — the real server grades against the actual
// correct answers, which are never sent to this client-side mock.
export function gradeDiagnostic(answers = [], body = {}) {
  const byId = new Map(answers.map((a) => [a.itemId, a.response]));
  const itemResults = ITEMS.map((item) => {
    const response = byId.get(item.id);
    const answered =
      response != null &&
      (Array.isArray(response) ? response.length > 0 && response.some(Boolean) : response !== '');
    // Mock has no real answer key — credit anything answered so the demo report isn't all zeros.
    const marksAwarded = answered ? item.points : 0;
    return { itemId: item.id, correct: answered, marksAwarded, maxMarks: item.points };
  });
  const totalScore = itemResults.reduce((sum, r) => sum + r.marksAwarded, 0);
  const maxScore = ITEMS.reduce((sum, i) => sum + i.points, 0);
  const attemptId = `mock-attempt-${Math.random().toString(36).slice(2, 10)}`;

  // Per-indicator (kept for back-compat) plus the competency roll-up the report now renders —
  // each competency expandable to the indicators that fed it.
  const indicatorBreakdown = [
    { indicatorId: 'mock-ind-1', name: 'Sequencing', marksEarned: Math.min(totalScore, 2), marksPossible: 2 },
    { indicatorId: 'mock-ind-2', name: 'Decomposition', marksEarned: Math.min(Math.max(totalScore - 2, 0), 3), marksPossible: 3 },
    { indicatorId: 'mock-ind-3', name: 'Sensors & Reactions', marksEarned: Math.max(totalScore - 5, 0), marksPossible: 4 },
  ];
  const competencyBreakdown = [
    {
      competencyId: 'mock-comp-1',
      name: 'Computational Thinking',
      marksEarned: indicatorBreakdown[0].marksEarned + indicatorBreakdown[1].marksEarned,
      marksPossible: 5,
      indicators: [indicatorBreakdown[0], indicatorBreakdown[1]],
    },
    {
      competencyId: 'mock-comp-2',
      name: 'Physical Computing',
      marksEarned: indicatorBreakdown[2].marksEarned,
      marksPossible: 4,
      indicators: [indicatorBreakdown[2]],
    },
  ];

  mockAttempts.set(attemptId, {
    attemptId,
    pathwayName: 'Robotics',
    assessmentName: 'Robotics Starting-Point Diagnostic',
    childName: body.childName || null,
    childAge: body.childAge ?? null,
    completedAt: new Date().toISOString(),
    totalScore,
    maxScore,
    indicatorBreakdown,
    competencyBreakdown,
  });

  return {
    attemptId,
    pathwayName: 'Robotics',
    assessmentName: 'Robotics Starting-Point Diagnostic',
    totalScore,
    maxScore,
    itemResults,
    indicatorBreakdown,
    competencyBreakdown,
  };
}

/** GET /api/public/diagnostics/attempts/:attemptId — null (→ 404) for an unknown id. */
export function diagnosticAttemptReport(attemptId) {
  return mockAttempts.get(attemptId) || null;
}
