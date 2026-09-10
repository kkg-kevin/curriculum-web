import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { mockAdapter } from './mockApi.js';

function makeClient() {
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
  });
  api.defaults.adapter = mockAdapter;
  return api;
}

describe('mockApi adapter — GET', () => {
  const api = makeClient();

  it('lists for-sale projects with the public contract shape', async () => {
    const { data: list } = await api.get('/api/public/projects');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      name: expect.any(String),
      deliverableCount: expect.any(Number),
      milestoneCount: expect.any(Number),
    });
  });

  it('fetches a project by slug with build detail', async () => {
    const { data } = await api.get('/api/public/projects/smart-home-starter');
    expect(data.slug).toBe('smart-home-starter');
    expect(Array.isArray(data.deliverables)).toBe(true);
    expect(Array.isArray(data.milestones)).toBe(true);
    expect(Array.isArray(data.requirements)).toBe(true);
  });

  it('404s an unknown project', async () => {
    await expect(api.get('/api/public/projects/does-not-exist')).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('lists for-sale store items with the public contract shape', async () => {
    const { data: list } = await api.get('/api/public/store');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      name: expect.any(String),
      storeCategory: expect.any(String),
      highlightCount: expect.any(Number),
    });
    // list projection must not carry the detail-only arrays
    expect(list[0]).not.toHaveProperty('specs');
  });

  it('fetches a store item by slug with the full marketing detail', async () => {
    const { data } = await api.get('/api/public/store/quarky-robot-kit');
    expect(data.slug).toBe('quarky-robot-kit');
    expect(typeof data.description).toBe('string');
    expect(Array.isArray(data.highlights)).toBe(true);
    expect(Array.isArray(data.includes)).toBe(true);
    expect(Array.isArray(data.specs)).toBe(true);
  });

  it('404s an unknown store item', async () => {
    await expect(api.get('/api/public/store/does-not-exist')).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('lists pathways with the public contract shape', async () => {
    const { data } = await api.get('/api/public/pathways');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      color: expect.any(String),
      courseCount: expect.any(Number),
    });
  });

  it('fetches a pathway by slug with an ordered course list', async () => {
    const { data } = await api.get('/api/public/pathways/robotics');
    expect(data.slug).toBe('robotics');
    expect(Array.isArray(data.courses)).toBe(true);
    expect(data.courses.length).toBe(data.courseCount);
    expect(data.courses[0]).toMatchObject({
      name: expect.any(String),
      description: expect.any(String),
    });
    // course objects must not leak internal fields
    expect(data.courses[0]).not.toHaveProperty('id');
  });

  it('404s an unknown pathway', async () => {
    await expect(api.get('/api/public/pathways/does-not-exist')).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('lists public competitions with the contract shape (no detail-only fields)', async () => {
    const { data: list } = await api.get('/api/public/competitions');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toMatchObject({
      id: expect.any(String),
      slug: expect.any(String),
      name: expect.any(String),
      status: expect.stringMatching(/^(open|closed)$/),
      trackCount: expect.any(Number),
    });
    expect(list[0]).not.toHaveProperty('tracks');
    expect(list[0]).not.toHaveProperty('description');
  });

  it('fetches a competition by slug with its track cards', async () => {
    const { data } = await api.get('/api/public/competitions/codeavour-8-0');
    expect(data.slug).toBe('codeavour-8-0');
    expect(typeof data.description).toBe('string');
    expect(Array.isArray(data.tracks)).toBe(true);
    expect(data.tracks.length).toBe(data.trackCount);
    expect(data.tracks[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      subtitle: expect.any(String),
      description: expect.any(String),
      highlights: expect.any(Array),
    });
  });

  it('404s an unknown competition', async () => {
    await expect(api.get('/api/public/competitions/does-not-exist')).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('lists non-school hub types with a count each', async () => {
    const { data } = await api.get('/api/public/hubs/types');
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((t) => t.type === 'tech_club')).toBe(true);
    expect(data.every((t) => t.type !== 'school')).toBe(true);
    expect(data[0]).toMatchObject({ type: expect.any(String), label: expect.any(String), hubCount: expect.any(Number) });
  });

  it('lists hubs with a schedule + delivery mode, filterable by type', async () => {
    const all = await api.get('/api/public/hubs');
    expect(all.data.length).toBeGreaterThan(0);
    expect(all.data[0]).toMatchObject({
      name: expect.any(String),
      hubType: expect.any(String),
      hubTypeLabel: expect.any(String),
      deliveryMode: expect.stringMatching(/^(in_person|virtual|hybrid)$/),
      isVirtual: expect.any(Boolean),
      schedule: { opensAt: expect.any(String), closesAt: expect.any(String), days: expect.any(Array) },
    });
    // a virtual hub reports town "Online"
    const virtual = all.data.find((h) => h.isVirtual);
    expect(virtual?.town).toBe('Online');
    // a virtual hub still has session times
    expect(virtual?.schedule.days.length).toBeGreaterThan(0);

    const filtered = await api.get('/api/public/hubs', { params: { type: 'tech_club' } });
    expect(filtered.data.every((h) => h.hubType === 'tech_club')).toBe(true);
    // never leak operational detail — email or the meeting link
    expect(all.data[0]).not.toHaveProperty('email');
    expect(all.data[0]).not.toHaveProperty('meetingLink');
  });

  it('resolves the path whether the URL is relative or absolute', async () => {
    const abs = await api.request({ method: 'get', url: 'http://localhost:5000/api/public/projects' });
    expect(abs.data.length).toBeGreaterThan(0);
  });
});

describe('mockApi adapter — public diagnostics (§3.8, §4.3)', () => {
  const api = makeClient();

  it('reports availability + age range for the offered pathway, unavailable otherwise', async () => {
    const { data: yes } = await api.get('/api/public/diagnostics/robotics/availability');
    expect(yes).toMatchObject({ diagnosticAvailable: true });
    expect(typeof yes.minAge).toBe('number');
    expect(typeof yes.maxAge).toBe('number');
    const { data: no } = await api.get('/api/public/diagnostics/data-ai/availability');
    expect(no).toMatchObject({ diagnosticAvailable: false, minAge: null, maxAge: null });
  });

  it('fetches a question set for an in-range age, reading age from config.params', async () => {
    // Regression: config.params (how axios's `api.get(url, { params })` call shape passes a
    // GET's query object) must be merged into the URL the adapter parses — it does not arrive
    // pre-serialised into config.url the way a real network request would.
    const { data } = await api.get('/api/public/diagnostics/robotics', { params: { age: 10 } });
    expect(data.pathwayName).toBe('Robotics');
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items[0]).toHaveProperty('kind');
  });

  it('404s a question-set request for an out-of-range age', async () => {
    await expect(
      api.get('/api/public/diagnostics/robotics', { params: { age: 17 } }),
    ).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('404s a question-set request for a pathway with no diagnostic offered', async () => {
    await expect(
      api.get('/api/public/diagnostics/data-ai', { params: { age: 12 } }),
    ).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('grades a submitted diagnostic (201 + report + attemptId) — name + phone required', async () => {
    const res = await api.post('/api/public/diagnostics/robotics/submit', {
      answers: [{ itemId: 'q1', response: 'Move forward' }],
      parentName: 'Sam Parent',
      parentPhone: '0700000000',
      childName: 'Kid',
      childAge: 10,
    });
    expect(res.status).toBe(201);
    expect(res.data.ok).toBe(true);
    expect(res.data.data).toMatchObject({
      attemptId: expect.any(String),
      totalScore: expect.any(Number),
      maxScore: expect.any(Number),
      itemResults: expect.any(Array),
      indicatorBreakdown: expect.any(Array),
    });
    // the report response never carries the lead id (it's on the attempt server-side only)
    expect(res.data.data.leadId).toBeUndefined();
  });

  it('400s a diagnostic submission with no name / phone', async () => {
    await expect(
      api.post('/api/public/diagnostics/robotics/submit', {
        answers: [{ itemId: 'q1', response: 'Move forward' }],
        childAge: 10,
      }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('serves the permanent shareable report for a completed attempt', async () => {
    const submit = await api.post('/api/public/diagnostics/robotics/submit', {
      answers: [{ itemId: 'q1', response: 'Move forward' }],
      parentName: 'Sam Parent',
      parentPhone: '0700000000',
      childName: 'Amara',
      childAge: 9,
    });
    const { attemptId } = submit.data.data;

    const { data } = await api.get(`/api/public/diagnostics/attempts/${attemptId}`);
    expect(data).toMatchObject({
      attemptId,
      pathwayName: expect.any(String),
      childName: 'Amara',
      childAge: 9,
      completedAt: expect.any(String),
      totalScore: expect.any(Number),
      maxScore: expect.any(Number),
      indicatorBreakdown: expect.any(Array),
      competencyBreakdown: expect.any(Array),
    });
    // the report is competency-grouped and carries no per-question section / answer key
    expect(data.items).toBeUndefined();
    expect(data.competencyBreakdown[0]).toMatchObject({
      name: expect.any(String),
      marksEarned: expect.any(Number),
      marksPossible: expect.any(Number),
      indicators: expect.any(Array),
    });
  });

  it('404s an unknown report id', async () => {
    await expect(
      api.get('/api/public/diagnostics/attempts/not-a-real-attempt'),
    ).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('400s a diagnostic submission with no childAge', async () => {
    await expect(
      api.post('/api/public/diagnostics/robotics/submit', { answers: [] }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });
});

describe('mockApi adapter — POST', () => {
  const api = makeClient();

  it('accepts a valid lead (201 + { success, message, data })', async () => {
    const res = await api.post('/api/public/leads', {
      parentName: 'Al',
      parentEmail: 'a@b.com',
      parentPhone: '0700',
      learnerName: 'Kid',
      learnerAge: 9,
      interestedIn: 'bootcamp',
      referenceId: 'junior-robotics-bootcamp',
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(typeof res.data.message).toBe('string');
    expect(res.data.data).toMatchObject({ status: 'new' });
  });

  it('400s a lead missing required fields', async () => {
    await expect(api.post('/api/public/leads', { parentName: '' })).rejects.toMatchObject({
      response: { status: 400, data: { success: false } },
    });
  });

  it('accepts a valid contact message (201)', async () => {
    const res = await api.post('/api/public/contact', {
      name: 'Al',
      email: 'a@b.com',
      phone: '',
      message: 'hello there',
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
  });

  it('400s a contact message missing required fields', async () => {
    await expect(api.post('/api/public/contact', { name: 'Al' })).rejects.toMatchObject({
      response: { status: 400 },
    });
  });
});
