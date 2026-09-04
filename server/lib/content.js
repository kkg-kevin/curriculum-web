/**
 * Loads the hand-authored content JSON (data/content/*.json) and projects it
 * into the /api/public/* response shapes the landing site expects — the same
 * contract the curriculum system implements, so switching between this server
 * and that API is only an env change.
 *
 * Content is read fresh on every request (files are tiny) so you can edit a
 * JSON file and see the change without restarting.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { slugify } from './slugify.js';

const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(process.cwd(), 'data', 'content');

async function load(name) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, `${name}.json`), 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

// ---- Bootcamps -------------------------------------------------------------

export async function listBootcamps() {
  const rows = await load('bootcamps');
  return rows.map(shapeBootcamp);
}

export async function getBootcamp(idOrSlug) {
  const rows = await load('bootcamps');
  const hit = rows.find((b) => b.id === idOrSlug || slugify(b.name) === idOrSlug);
  return hit ? shapeBootcamp(hit) : null;
}

function shapeBootcamp(b) {
  return {
    id: b.id,
    name: b.name,
    slug: slugify(b.name),
    description: b.description ?? '',
    coverImage: b.coverImage ?? null,
    status: b.status ?? 'upcoming',
    startDate: b.startDate ?? null,
    endDate: b.endDate ?? null,
    educationLevel: b.educationLevel ?? null,
    gradeFrom: b.gradeFrom ?? null,
    gradeTo: b.gradeTo ?? null,
    classes: Array.isArray(b.classes) ? b.classes : [],
    courses: Array.isArray(b.courses) ? b.courses : [],
  };
}

// ---- Projects (courses) ---------------------------------------------------

export async function listProjects() {
  const rows = await load('projects');
  return rows.map(shapeProject);
}

export async function getProject(idOrSlug) {
  const rows = await load('projects');
  const hit = rows.find((p) => p.id === idOrSlug || slugify(p.name) === idOrSlug);
  return hit ? shapeProject(hit) : null;
}

function shapeProject(p) {
  return {
    id: p.id,
    name: p.name,
    slug: slugify(p.name),
    description: p.description ?? '',
    coverImage: p.coverImage ?? null,
    ageMin: p.ageMin ?? null,
    ageMax: p.ageMax ?? null,
    sessionCount: p.sessionCount ?? null,
    requirements: Array.isArray(p.requirements) ? p.requirements : [],
    modules: Array.isArray(p.modules) ? p.modules : [],
  };
}

// ---- Pathways -----------------------------------------------------------

export async function listPathways() {
  const rows = await load('pathways');
  return rows.map((p) => ({
    id: p.id,
    slug: slugify(p.name),
    name: p.name,
    description: p.description ?? '',
    color: p.color ?? '#25476a',
    courseCount: Array.isArray(p.courses) ? p.courses.length : 0,
  }));
}

export async function getPathway(idOrSlug) {
  const rows = await load('pathways');
  const hit = rows.find((p) => p.id === idOrSlug || slugify(p.name) === idOrSlug);
  if (!hit) return null;
  const courses = Array.isArray(hit.courses) ? hit.courses : [];
  if (courses.length === 0) return null; // "nothing to show" -> 404, matches curriculum API
  return {
    id: hit.id,
    slug: slugify(hit.name),
    name: hit.name,
    description: hit.description ?? '',
    color: hit.color ?? '#25476a',
    courseCount: courses.length,
    courses: courses.map((c) => ({
      name: c.name,
      description: c.description ?? '',
      ageMin: c.ageMin ?? null,
      ageMax: c.ageMax ?? null,
      coverImage: c.coverImage ?? null,
    })),
  };
}

export { CONTENT_DIR };
