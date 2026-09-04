/**
 * Append-only JSON file store for form submissions.
 *
 * Each collection is a flat JSON array on disk (data/<name>.json). Writes are
 * serialised per file and written atomically (temp file + rename) so a crash
 * mid-write can't corrupt the file. This is deliberately simple — when you move
 * to a database, `readAll` / `append` are the only two calls to reimplement.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

// One in-flight write chain per file, so concurrent appends don't clobber.
const locks = new Map();

function filePath(name) {
  if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error(`bad collection name: ${name}`);
  return path.join(DATA_DIR, `${name}.json`);
}

export async function readAll(name) {
  try {
    const raw = await fs.readFile(filePath(name), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(name, rows) {
  const target = filePath(name);
  const tmp = `${target}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  await fs.rename(tmp, target);
}

/**
 * Append one record. Adds `id` (uuid) and `createdAt` (ISO) if absent.
 * Returns the stored record.
 */
export async function append(name, record) {
  const prev = locks.get(name) || Promise.resolve();
  let release;
  const gate = new Promise((res) => (release = res));
  locks.set(name, prev.then(() => gate));

  try {
    await prev;
    const rows = await readAll(name);
    const stored = {
      id: record.id || crypto.randomUUID(),
      createdAt: record.createdAt || new Date().toISOString(),
      ...record,
    };
    rows.push(stored);
    await writeAll(name, rows);
    return stored;
  } finally {
    release();
    if (locks.get(name) === gate) locks.delete(name);
  }
}

export { DATA_DIR };
