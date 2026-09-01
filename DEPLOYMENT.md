# Deployment Guide — Digifunzi Landing Page

**Status:** ✅ Live since 2026-09-01 — `https://africa.digifunzi.com` (padlock, Force HTTPS on,
Let's Encrypt cert auto-renewing Nov 2026). Part 1 is done; day-to-day work is Part 2 only.
**Live URL:** `https://africa.digifunzi.com`
**Host:** Truehost cPanel (shared hosting), account `sendusco`, server IP `102.212.246.83`
**Type:** static site — no Node, no database, no backend to run on the server

`digifunzi.africa` (the domain) was never bought — `africa.digifunzi.com` is a free subdomain
of `digifunzi.com` (which runs a separate live system; adding this subdomain did not touch it).
The cPanel document root folder is still named `digifunzi.africa`.

The landing page is a bundle of HTML/CSS/JS files. You **build it on your PC** and
**upload the result** to cPanel. Truehost only serves the files; it never runs
any code for this site.

---

## Part 1 — One-time setup in cPanel ✅ DONE (2026-09-01)

> Completed. Kept here as a record and for rebuilding if the account is ever
> migrated. Skip to Part 2 for normal deploys.
>
> What was done: subdomain `africa.digifunzi.com` created with document root
> `/home/sendusco/digifunzi.africa`; `http://` served a 403 (empty folder) then
> the site after the first upload; AutoSSL validated the domain on its own (no
> manual "Run AutoSSL" needed); **Force HTTPS Redirect** toggled on in
> cPanel → Domains. The stray `digifunzi.africa` *addon* domain from an earlier
> attempt was removed first.

You already own `digifunzi.com` on Truehost. `africa.digifunzi.com` is a free
**subdomain** of it — no domain to buy, no DNS wait. Creating it does **not**
affect `digifunzi.com`, `curriculum.digifunzi.com`, `app.digifunzi.com` or
anything else on the account.

### 1.1 Create the subdomain

1. cPanel → search **"Domains"** → open it → **Create A New Domain**.
2. **Domain:** type `africa.digifunzi.com`
   (cPanel recognises `digifunzi.com` is yours and makes it a subdomain.)
3. **Uncheck** the box *"Share document root … with sharedpossibility.com"*.
   A **Document Root** field appears.
4. **Document Root:** type `digifunzi.africa`
   (the folder you already created and extracted the zip into — full path
   `/home/sendusco/digifunzi.africa`). Keeping that folder name is fine; it does
   not need to match the subdomain.
5. Click **Submit**.

> If cPanel auto-filled the Document Root with `africa.digifunzi.com`, change it
> to `digifunzi.africa` so it points at your existing files. Or, if you'd rather,
> rename the folder to `africa.digifunzi.com` in File Manager first and use that.

### 1.2 Check it resolves

Open **`http://africa.digifunzi.com/`** (plain `http`, no **s**) in a browser.

- **Your site loads** → DNS is working, go to 1.3.
- **"Server not found" / a different page** → DNS hasn't propagated. Wait
  15–60 minutes and retry. (Subdomains of a domain already on Truehost are
  usually instant.)

### 1.3 Get the SSL certificate (HTTPS)

1. cPanel → search **"SSL"** → **SSL/TLS Certificates** → **Status** tab.
2. Find `africa.digifunzi.com` in the list.
   - **Not listed?** DNS from 1.2 isn't ready yet, or the subdomain wasn't
     created. Fix that first, then reload this page.
3. Tick the checkbox next to `africa.digifunzi.com` (and `www.africa.digifunzi.com`
   if it appears).
4. Click **Run AutoSSL**.
5. Wait **5–15 minutes**. Refresh. You want a green padlock 🔒 and
   *"Certificate: … Let's Encrypt"*.

**If AutoSSL fails with a validation / DCV error:**
The forced-HTTPS rule in `.htaccess` can block Let's Encrypt's check on a brand
new host. Fix:
- File Manager → in the site folder, rename `.htaccess` → `.htaccess.off`
- Run AutoSSL again → wait for the padlock
- Rename `.htaccess.off` → `.htaccess`

**If there's no "Run AutoSSL" / "Status" anywhere:**
Open a Truehost support ticket: *"Please issue a Let's Encrypt SSL certificate
for africa.digifunzi.com."* They do it in minutes.

### 1.4 Confirm

- `https://africa.digifunzi.com/` → loads with a padlock, no warning
- `http://africa.digifunzi.com/` → auto-redirects to `https://`

Setup is done. From now on, deploying is just Part 2.

---

## Part 2 — Deploying (every time you have changes)

### 2.1 Build + package (on your PC)

Open a terminal in the project folder:

```powershell
cd "C:\Users\user\OneDrive - United States International University (USIU)\Desktop\DIGIFUNZII\system website\digifunzi-landing"
npm run deploy:build
```

This runs `vite build`, generates `sitemap.xml` / `robots.txt`, prerenders each
page to static HTML, and zips it all to:

```
Guide\africa-digifunzi-com-dist.zip
```

**Expected output while the main-system API is not live yet:**

```
[prerender] could not list bootcamps ... 
[prerender] skipping /bootcamps — API unreachable, leaving it as a client-rendered SPA route.
[prerender] NOTE: ... Re-run the build once the API is live.
[prerender] done — 6/6 routes written
[package] wrote Guide\africa-digifunzi-com-dist.zip (~1.3 MB).
```

That's normal. The 6 content pages (home, about, competitions, quarky, enroll,
contact) are prerendered. `/bootcamps` and `/projects` still work — they just
render in the browser instead of being pre-baked, and aren't in the sitemap yet.

> **Do NOT** zip the folder yourself with Windows right-click → "Send to →
> Compressed folder", and **do NOT** use PowerShell `Compress-Archive`. Both
> write Windows-style paths that cPanel's Extract turns into broken filenames.
> `npm run package` makes a correct zip. If `npm run package` says `zip` isn't
> found, run the whole thing from **Git Bash** instead of PowerShell.

### 2.2 Upload to cPanel

1. cPanel → **File Manager** → open **`/home/sendusco/digifunzi.africa`**
   (the site's document root).
2. **On a redeploy:** select everything in that folder and **Delete** it first,
   so no stale files linger. (On the very first upload, just delete any default
   `index.html`.)
3. Click **Upload** → choose `Guide\africa-digifunzi-com-dist.zip` from your PC.
4. Back in File Manager, select the uploaded `africa-digifunzi-com-dist.zip` →
   **Extract** → target the **same folder** → confirm.
5. **Delete** the `.zip` from the server (you don't want it publicly reachable).
6. File Manager → **Settings** (top right) → tick **Show Hidden Files (dotfiles)**
   → confirm **`.htaccess`** is present in the folder.

The folder should now contain:

```
index.html
.htaccess
sitemap.xml
robots.txt
logo-placeholder.svg
hero-students.png
assets/                     (js, css, fonts — long hashed filenames)
about/index.html
competitions/index.html
quarky/index.html
enroll/index.html
contact/index.html
bootcamps/  projects/        (only appear once the API is live at build time)
```

### 2.3 Verify the deploy

In a browser:

| Check | Expected |
|---|---|
| `https://africa.digifunzi.com/` | Home page with hero, real content |
| `https://africa.digifunzi.com/quarky` | Quarky page loads |
| **View Source** on `/quarky` | You can see the actual page text and `"@type":"Product"` in the HTML — **not** an empty `<div id="root"></div>`. This proves prerendering worked. |
| `https://africa.digifunzi.com/robots.txt` | Ends with `Sitemap: https://africa.digifunzi.com/sitemap.xml` |
| `https://africa.digifunzi.com/sitemap.xml` | Lists the page URLs |
| `https://africa.digifunzi.com/anything-random` | Shows the site's own "Page not found" page (styled), not a bare Apache 404 |
| `http://africa.digifunzi.com/` | Redirects to `https://` |

If all of those pass, you're live.

---

## Part 3 — After the main-system API (`/api/public/*`) is built

Nothing changes in this project. On the **backend** side (the `curriculum` repo):

- Deploy the new `server/src/modules/public-site/` routes — full spec in
  [`API_CONTRACT.md`](./API_CONTRACT.md).
- **Open CORS** on the API for `https://africa.digifunzi.com` specifically
  (not `*`).

Then here: run `npm run deploy:build` again — it will now fetch real
bootcamp/project data, prerender those pages too, and add their URLs to the
sitemap — and re-upload following Part 2.

Check the API host: `nodeapp.digifunzi.com` currently answers with a 404 (not a
connection failure), so it may already be the live server. Confirm with whoever
runs the backend, and update `VITE_API_URL` in `.env.production` if it's a
different host.

---

## Part 4 — When `digifunzi.com` (or `www.`) becomes free

**Make it the main address, keep this one as a redirect:**

1. In cPanel, point `digifunzi.com`'s (or `www.digifunzi.com`'s) Document Root at
   the **same folder** (`/home/sendusco/digifunzi.africa`).
2. Edit `.env.production` → `VITE_SITE_URL=https://digifunzi.com` (or `www.`).
3. `npm run deploy:build`, re-upload.
4. In `.htaccess`, uncomment the `digifunzi.com` redirect block (it's already
   there, near the top) so there's one canonical host and no duplicate-content
   penalty.

**Or keep `africa.digifunzi.com` as the canonical** — just uncomment the reverse
redirect in `.htaccess` and skip the rebuild.

---

## Part 5 — Google Search Console (once the site is live)

1. [search.google.com/search-console](https://search.google.com/search-console) →
   add property → `https://africa.digifunzi.com`.
2. Verify: easiest is **HTML file** — download the file Google gives you, upload
   it to the site's document root via File Manager, click Verify.
   (Or add the **DNS TXT** record in cPanel → Zone Editor.)
3. **Sitemaps** → submit `https://africa.digifunzi.com/sitemap.xml`.
4. Re-submit the sitemap after any deploy that adds pages (e.g. once Bootcamps /
   Projects go live).

---

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `https://` shows "not secure" / connection refused | SSL not issued yet — finish **1.3**. |
| Endless redirect / "redirected too many times" | Forced HTTPS in `.htaccess` but no valid cert. Finish AutoSSL, or temporarily rename `.htaccess` per **1.3**. |
| Every page 404s except `/` | `.htaccess` missing from the folder, or `mod_rewrite` off. Re-check step **2.2 #6**. If `.htaccess` is there and it still fails, ticket Truehost to confirm `mod_rewrite` / `AllowOverride All`. |
| Blank white page; console shows 404s for `/assets/*.js` | You uploaded the **folder** instead of its **contents**, or extracted into a subfolder. Files must sit directly in the document root. |
| Broken page names like `about\index.html` as a single file | The zip had Windows backslash paths. Rebuild with `npm run package` (or Git Bash `zip`), never Windows "Compressed folder" / `Compress-Archive`. |
| Old content still showing after redeploy | Didn't delete old files before extracting (step **2.2 #2**), or browser cache — hard refresh **Ctrl+F5**. |
| View-source shows empty `<div id="root">` on all pages | Prerender didn't run (used `npm run build:spa`, or Puppeteer failed on your PC). Run full `npm run deploy:build`. Site still works, just not pre-rendered for crawlers. |
| `/bootcamps` and `/projects` show "nothing scheduled" | Expected — the `/api/public/*` endpoints don't exist yet. See Part 3. |
| Enroll / Contact form shows an error on submit | Expected until `POST /api/public/leads` exists. The form still validates correctly. |

---

## Quick reference

```powershell
# every deploy:
cd "C:\Users\user\OneDrive - United States International University (USIU)\Desktop\DIGIFUNZII\system website\digifunzi-landing"
npm run deploy:build
#  -> Guide\africa-digifunzi-com-dist.zip
#  -> upload to /home/sendusco/digifunzi.africa, delete old files, Extract, delete zip
```

| Item | Value |
|---|---|
| Public URL | `https://africa.digifunzi.com` |
| cPanel document root | `/home/sendusco/digifunzi.africa` |
| Deploy artifact | `Guide/africa-digifunzi-com-dist.zip` |
| API (not built yet) | `https://nodeapp.digifunzi.com` → `/api/public/*` |
| Config file for the URL | `.env.production` (`VITE_SITE_URL`) |
