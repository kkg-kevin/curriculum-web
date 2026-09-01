/**
 * Shared helpers for the build scripts. These run in Node (not Vite), so they
 * read process.env and load .env files manually.
 *
 * Mode resolution (matches how you'd run Vite):
 *   --mode <x> arg  >  VITE_MODE env  >  NODE_ENV  >  "production"
 * `vite build` defaults to production, so that's our default too. For a local
 * mock build, run e.g. `node scripts/generate-sitemap.js --mode development`
 * or set VITE_MODE=development.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const DIST = path.join(ROOT, 'dist');

export function resolveMode() {
  const argIdx = process.argv.indexOf('--mode');
  if (argIdx !== -1 && process.argv[argIdx + 1]) return process.argv[argIdx + 1];
  return process.env.VITE_MODE || process.env.NODE_ENV || 'production';
}

/** Minimal .env loader — reads .env then .env.<mode>, then .local variants; later wins. */
export function loadEnv(mode = resolveMode()) {
  const files = ['.env', `.env.${mode}`, '.env.local', `.env.${mode}.local`];
  const env = {};
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      if (/^\s*#/.test(line)) continue;
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!m) continue;
      let [, key, val = ''] = m;
      val = val.trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  // Real process.env still wins over files.
  return { ...env, ...process.env };
}

export function getConfig() {
  const mode = resolveMode();
  const env = loadEnv(mode);
  const siteUrl = (env.VITE_SITE_URL || 'https://africa.digifunzi.com').replace(/\/$/, '');
  const apiUrl = (env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const useMock = env.VITE_USE_MOCK === 'true';
  return { mode, siteUrl, apiUrl, useMock, env };
}

export function ensureDist() {
  if (!fs.existsSync(DIST)) {
    throw new Error(`dist/ not found at ${DIST}. Run "vite build" first.`);
  }
}
