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

describe('mockApi adapter — POST', () => {
  const api = makeClient();

  it('accepts a valid lead', async () => {
    const { data } = await api.post('/api/public/leads', {
      parentName: 'Al',
      parentEmail: 'a@b.com',
      parentPhone: '0700',
      learnerName: 'Kid',
      learnerAge: 9,
      interestedIn: 'bootcamp',
    });
    expect(data.ok).toBe(true);
  });

  it('422s a lead missing required fields', async () => {
    await expect(api.post('/api/public/leads', { parentName: '' })).rejects.toMatchObject({
      response: { status: 422 },
    });
  });

  it('accepts a valid contact message', async () => {
    const { data } = await api.post('/api/public/contact', {
      name: 'Al',
      email: 'a@b.com',
      phone: '',
      message: 'hello there',
    });
    expect(data.ok).toBe(true);
  });
});
