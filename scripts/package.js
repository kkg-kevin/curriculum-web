/**
 * Zip dist/ for upload to cPanel. The zip is named after the site the build is for, so the two
 * websites can't be confused:
 *   --mode production (npm run deploy:build)     → Guide/digifunzi-co-ke-dist.zip       (Live data)
 *   --mode dev        (npm run deploy:build:dev) → Guide/africa-digifunzi-com-dist.zip  (Dev data)
 * Any other mode → Guide/<mode>-dist.zip.
 *
 * Why a script and not `Compress-Archive`: PowerShell's Compress-Archive writes
 * entry paths with backslashes, which Linux `unzip` (what cPanel's Extract uses)
 * treats as literal filenames — folders don't get created and the deploy breaks.
 * The system `zip` always writes forward slashes.
 *
 * The zip lands in Guide/ (the deployment-handover folder), not the repo root.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DIST, ROOT, ensureDist, getConfig } from './_shared.js';

const ZIP_NAMES = { production: 'digifunzi-co-ke-dist.zip', dev: 'africa-digifunzi-com-dist.zip' };
const { mode, siteUrl } = getConfig();
const OUT_DIR = path.join(ROOT, 'Guide');
const OUT = path.join(OUT_DIR, ZIP_NAMES[mode] || `${mode}-dist.zip`);

ensureDist();
fs.mkdirSync(OUT_DIR, { recursive: true });
if (fs.existsSync(OUT)) fs.rmSync(OUT);

// Prefer the system `zip` (Git Bash ships it on Windows; standard on macOS/Linux).
try {
  execFileSync('zip', ['-r', '-q', OUT, '.'], { cwd: DIST, stdio: 'inherit' });
} catch {
  console.error(
    '[package] `zip` not found. On Windows run this from Git Bash (ships `zip`), or zip ' +
      'the CONTENTS of dist/ manually ensuring forward-slash paths. Do NOT use PowerShell ' +
      'Compress-Archive — cPanel cannot extract its backslash paths.',
  );
  process.exit(1);
}

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(
  `[package] wrote ${path.relative(ROOT, OUT)} (${kb} KB).\n` +
    `          Upload it to the ${new URL(siteUrl).host} document root in cPanel and Extract.`,
);
