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

  it('lists bootcamps with slugs', async () => {
    const { data } = await api.get('/api/public/bootcamps');
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('slug');
  });

  it('fetches a bootcamp by slug', async () => {
    const { data } = await api.get('/api/public/bootcamps/junior-robotics-bootcamp');
    expect(data.slug).toBe('junior-robotics-bootcamp');
    expect(Array.isArray(data.classes)).toBe(true);
  });

  it('404s an unknown bootcamp', async () => {
    await expect(api.get('/api/public/bootcamps/does-not-exist')).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('lists projects and fetches one with modules', async () => {
    const { data: list } = await api.get('/api/public/projects');
    expect(list[0]).toHaveProperty('sessionCount');
    const { data: detail } = await api.get('/api/public/projects/intro-to-robotics');
    expect(Array.isArray(detail.modules)).toBe(true);
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

  it('grades a submitted diagnostic with NO contact info (201 + report + attemptId, no lead)', async () => {
    const res = await api.post('/api/public/diagnostics/robotics/submit', {
      answers: [{ itemId: 'q1', response: 'Move forward' }],
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
    // no lead is created by the diagnostic any more
    expect(res.data.data.leadId).toBeUndefined();
  });

  it('serves the permanent shareable report for a completed attempt', async () => {
    const submit = await api.post('/api/public/diagnostics/robotics/submit', {
      answers: [{ itemId: 'q1', response: 'Move forward' }],
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
      items: expect.any(Array),
      answers: expect.any(Array),
      itemResults: expect.any(Array),
    });
    // never leak the answer key through the shareable link
    expect(data.items.every((i) => !('correctAnswer' in i))).toBe(true);
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
