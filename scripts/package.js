/**
 * Zip dist/ into Guide/digifunzi-africa-dist.zip for upload to cPanel.
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
import { DIST, ROOT, ensureDist } from './_shared.js';

const OUT_DIR = path.join(ROOT, 'Guide');
const OUT = path.join(OUT_DIR, 'africa-digifunzi-com-dist.zip');

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
    `          Upload it to the africa.digifunzi.com document root in cPanel and Extract.`,
);
