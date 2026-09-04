# Deploying to Truehost (Node.js app)

The site is a React SPA + a small Node API (`server/`). Truehost cPanel supports
Node apps via **Setup Node.js App** (Passenger). Two ways to serve the SPA:

- **A — one process** (simplest): the Node app serves both `/api/*` and the built
  SPA. Set `SERVE_STATIC=true`.
- **B — split**: SPA served as static files by Apache, Node app mounted at `/api`.
  Slightly faster for static assets; more moving parts.

This guide uses **A**.

---

## 1. Build locally

The prerender step fetches the API, so run the API while building:

```bash
npm install
npm run api:install

# terminal 1
npm run api                     # http://localhost:5050

# terminal 2 — build the SPA (prerender pulls content from :5050)
npm run build
```

You now have `dist/` (the built, prerendered SPA).

> If you skip running the API during the build, the build still succeeds but
> `/bootcamps`, `/projects`, `/pathways` ship as client-rendered routes (no
> prerendered HTML). Fine, just less ideal for SEO.

---

## 2. What to upload

Upload to the Truehost account (via cPanel File Manager or SFTP), into the app
folder (e.g. `/home/<cpuser>/digifunzi-landing`):

```
digifunzi-landing/
  dist/                 ← the built SPA (from step 1)
  server/               ← the API (index.js, admin.js, lib/, package.json)
  data/
    content/            ← bootcamps.json, projects.json, pathways.json
  package.json          ← root (only needed for the "api" script convenience)
```

Do **not** upload: `node_modules/` (cPanel installs them), `src/`, `.env` files
(you set env vars in the cPanel UI), `data/leads.json` / `data/contacts.json`
(created at runtime).

### Put lead data outside the web root

Create a folder **not** under `public_html`, e.g.
`/home/<cpuser>/digifunzi-data`. You'll point `DATA_DIR` at it so
`leads.json` can never be downloaded over the web. Copy `data/content/` there
too, or set `CONTENT_DIR` separately:

```
/home/<cpuser>/digifunzi-data/
  content/
    bootcamps.json
    projects.json
    pathways.json
  (leads.json, contacts.json created here at runtime)
```

---

## 3. cPanel → Setup Node.js App

| Field | Value |
|---|---|
| Node.js version | 18 or higher |
| Application mode | Production |
| Application root | `digifunzi-landing` (where you uploaded `server/`) |
| Application URL | `africa.digifunzi.com` |
| Application startup file | `server/index.js` |

Then **Environment variables** (Add Variable for each):

| Name | Value |
|---|---|
| `PUBLIC_SITE_URL` | `https://africa.digifunzi.com` |
| `ADMIN_USER` | `admin` (or your choice) |
| `ADMIN_PASSWORD` | a strong password |
| `DATA_DIR` | `/home/<cpuser>/digifunzi-data` |
| `CONTENT_DIR` | `/home/<cpuser>/digifunzi-data/content` |
| `SERVE_STATIC` | `true` |
| `NODE_ENV` | `production` |

> `PORT` is assigned by Passenger — don't set it.

Click **Create**, then in the app's row:

1. **Run NPM Install** (installs `express` from `server/package.json` — note the
   app root must contain `server/package.json`; if your Application root is the
   repo root, change the startup file to `server/index.js` and add a
   `package.json` in `server/` — which this repo has).
2. **Restart**.

### package.json note

Passenger runs `npm install` in the **Application root**. Point the Application
root at the folder that has the `package.json` listing `express` — i.e. set
Application root to `digifunzi-landing/server` and startup file to `index.js`,
**or** keep root at `digifunzi-landing` and ensure its `package.json`
`dependencies` includes `express`. Simplest: **Application root = `.../server`,
startup file = `index.js`.** Then `DATA_DIR` / `CONTENT_DIR` must be absolute
paths (they are, above).

---

## 4. Serve the SPA

With `SERVE_STATIC=true` and Application root = `server/`, the app looks for
`../dist`. Upload `dist/` as a sibling of `server/`:

```
digifunzi-landing/
  server/     ← Application root
  dist/       ← served by the app
```

If you set Application root to the repo root instead, `dist/` is already a
sibling of `server/` — fine.

Passenger also needs an `.htaccess` in the domain's document root to hand all
requests to the Node app. cPanel's Setup Node.js App creates this automatically.
If the SPA 404s on deep links, confirm that `.htaccess` exists and contains the
`PassengerAppRoot` / `PassengerStartupFile` lines cPanel generated — don't
overwrite it with the SPA `public/.htaccess` (that one is for static-only
hosting).

---

## 5. Verify

```bash
# API up
curl -s https://africa.digifunzi.com/api/health
# → {"ok":true,"mode":"standalone-json"}

# content
curl -s https://africa.digifunzi.com/api/public/bootcamps | head -c 200

# CORS (from the site's own origin)
curl -s -i -X OPTIONS https://africa.digifunzi.com/api/public/leads \
  -H 'Origin: https://africa.digifunzi.com' \
  -H 'Access-Control-Request-Method: POST' | grep -i access-control-allow-origin
# → access-control-allow-origin: https://africa.digifunzi.com

# admin (should prompt for basic auth)
curl -s -o /dev/null -w '%{http_code}\n' https://africa.digifunzi.com/admin      # 401
curl -s -u admin:YOURPASS https://africa.digifunzi.com/admin | grep '<h1>'       # 200
```

Then in a browser:

1. Open the site, click through Bootcamps / Projects / Pathways — content loads.
2. Submit the Contact form and the Enroll form.
3. Open `https://africa.digifunzi.com/admin` — both submissions appear.

---

## 6. Updating content

Edit the JSON in `DATA_DIR/content/` (via File Manager or SFTP). Changes show on
the next request — no restart needed.

## 7. Updating the site

Rebuild `dist/` locally (step 1), upload it over the old `dist/`, and **Restart**
the Node app in cPanel (to bust Passenger's cache).

## 8. Backing up leads

Download `DATA_DIR/leads.json` and `contacts.json` periodically, or pull them via
`https://africa.digifunzi.com/admin/leads.json` (basic-auth). These are the files
to import when you migrate to a database.
