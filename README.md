# Digifunzi Landing Page

Public, unauthenticated marketing site for Digifunzi. **Runs standalone:** a
React SPA plus a small JSON-backed API in [`server/`](./server) — no database,
no external system. Content lives in `data/content/*.json`; form submissions are
stored to `data/leads.json` / `data/contacts.json` and viewed at `/admin`.
Full architecture in [`STANDALONE.md`](./STANDALONE.md).

- **Stack:** React 19 + Vite, MUI, React Router, TanStack Query, react-helmet-async,
  react-hook-form + Zod. API: Express 5, zero other deps.
- **SEO:** per-route meta tags, JSON-LD, build-time prerendering (Puppeteer),
  generated `sitemap.xml` / `robots.txt`.
- **No auth on the site.** `/admin` on the API is HTTP basic-auth.

## Quick start

```bash
npm install
npm run api:install                  # one-time: server/ deps (express)
cp server/.env.example server/.env   # set ADMIN_PASSWORD, PUBLIC_SITE_URL

# two terminals:
npm run api      # JSON API  → http://localhost:5050
npm run dev      # SPA       → http://localhost:5175
```

**Fully offline (no API):** set `VITE_USE_MOCK=true` in `.env`, then just
`npm run dev` — content from `src/mocks/fixtures/`, form submissions logged to
the console and not stored.

**Migrate to the curriculum system / a database later:** the API is the only
piece that changes — see [`STANDALONE.md`](./STANDALONE.md) "Migrating leads" and
[`SYSTEM_INTEGRATION.md`](./SYSTEM_INTEGRATION.md) for the curriculum-system
contract (its `/api/public/*` matches this API's shapes exactly).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server → :5175 (talks to the API on :5050, or fixtures if `VITE_USE_MOCK=true`) |
| `npm run api` | Standalone JSON API → :5050 (`server/index.js`, reads `server/.env`) |
| `npm run api:install` | Install `server/` dependencies (one-time) |
| `npm run build` | Production: `vite build` → sitemap/robots → prerender routes into `dist/` |
| `npm run deploy:build` | `build` + `package` → produces `dist.zip` ready for cPanel upload |
| `npm run package` | Zip `dist/` → `dist.zip` (forward-slash paths so cPanel Extract works) |
| `npm run build:spa` | `vite build` only (skip SEO post-steps) |
| `npm run verify:pipeline` | Full build+sitemap+prerender using **fixture data** (`.env.mockbuild`) — production-style pipeline smoke test |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run test` | Vitest — unit tests for the mock adapter, form schemas, honeypot, slugify |
| `npm run test:watch` | Vitest in watch mode |
| `npm run sitemap` | Regenerate `dist/sitemap.xml` + `dist/robots.txt` |
| `npm run prerender` | Re-run the Puppeteer prerender over `dist/` |
| `npm run lint` | ESLint |

### Prerendering

`npm run build` fetches `VITE_API_URL/api/public/*` to discover the detail-page
URLs and prerender them — so **the API (`npm run api`) should be running during
a production build**. If it's unreachable the build still succeeds, leaving the
data-driven pages (`/bootcamps`, `/projects`, `/pathways` and their detail
routes) as client-rendered SPA routes. With `VITE_USE_MOCK=true` it prerenders
all 19 routes from `src/mocks/fixtures/` instead — same as `npm run verify:pipeline`.

## Environment variables

**Frontend** (`.env` = dev, `.env.production` = build; `.env.local` overrides, git-ignored):

| Var | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the standalone API (`http://localhost:5050` dev). |
| `VITE_USE_MOCK` | `false` (default) = call the API; `true` = fully offline on `src/mocks/` fixtures |
| `VITE_MEDIA_BASE_URL` | Base for relative `coverImage` paths. Defaults to `VITE_API_URL` |
| `VITE_SITE_URL` | This site's own public origin — canonical tags, `og:url`, sitemap |

**API** (`server/.env`, from `server/.env.example`): `PORT`, `PUBLIC_SITE_URL`
(CORS allow-list), `ADMIN_USER` / `ADMIN_PASSWORD` (`/admin` auth), `DATA_DIR`,
`SERVE_STATIC`. See [`STANDALONE.md`](./STANDALONE.md).

## Project layout

```
src/
  config/        site metadata (site.js) + runtime env access (env.js)
  routes/        route table (routes.jsx)
  layouts/       MainLayout (header + footer + <Outlet/>)
  pages/         one component per route
  theme/         palette.js (all hex), createAppTheme.js, colorMode.js,
                 ColorModeProvider.jsx — light/dark/system, see THEME.md
  components/
    layout/      Header, Footer, MobileMenu
    home/        Hero, ValueProps, SectionSummaries, Testimonials, CTABanner
    cards/       BootcampCard, ProjectCard, PathwayCard
    forms/       EnrollForm, ContactForm, Zod schemas, Honeypot, FormStatus
    seo/         SeoHead (helmet wrapper), JsonLd (Organization/Course/Event/Product/FAQPage/ItemList)
    common/      Logo, Section, PageHeader, SmartImage, StateViews,
                 ColorModeToggle, ThemeColorMeta
  content/       hand-authored copy: home, about, competitions, quarky
  hooks/         useBootcamps, useProjects, usePathways, useLeadSubmission (React Query)
  services/      api.js — single axios instance + mock adapter wiring
  mocks/         mockApi.js + fixtures/ (offline fallback, VITE_USE_MOCK=true)
  utils/         slugify, dates, format, media, prerenderSignal
  *.test.js      Vitest units — colocated with the code they cover
server/          standalone JSON API (Express) — see STANDALONE.md
  index.js       routes, CORS, rate limit
  admin.js       /admin submissions viewer
  lib/           content.js, jsonStore.js, validate.js, slugify.js
data/
  content/       bootcamps.json, projects.json, pathways.json  (tracked, hand-edit)
  leads.json     Enroll submissions   (runtime, gitignored)
  contacts.json  Contact submissions  (runtime, gitignored)
scripts/
  generate-sitemap.js   build-time sitemap.xml + robots.txt
  prerender.js          build-time headless-Chrome HTML snapshots
```

Route components except Home load via `React.lazy` (code splitting) — the
initial JS chunk is ~72 KB gzipped; each page is a 1–4 KB chunk on top.

**Light / dark / system theme** is wired throughout. New components must use
semantic theme tokens only (never a raw colour) — see `src/theme/`.

Public forms carry a hidden honeypot field (`src/components/forms/Honeypot.jsx`);
the API also rate-limits the POST endpoints (20 req / 15 min / IP) and drops any
request with the honeypot field filled.

## Data flow

```
Component → hooks/use*.js (React Query) → services/api.js (publicApi.*)
          → axios → { mockAdapter (VITE_USE_MOCK=true) | server/ API on VITE_API_URL }

server/ API → data/content/*.json (GET)  ·  data/{leads,contacts}.json (POST)
```

The forms (`EnrollForm`, `ContactForm`) POST through `publicApi` to
`/api/public/leads` and `/api/public/contact`.

## Connecting to the curriculum system (later)

The full contract — every endpoint shape, what each side owes the other, the
cut-over checklist, and open items — is in
**[`SYSTEM_INTEGRATION.md`](./SYSTEM_INTEGRATION.md)**. The Pathways-specific
notes and curl matrix are in **[`PATHWAYS.md`](./PATHWAYS.md)**.

Short version: the curriculum system's `/api/public/*` endpoints are live; this
site's client code already matches their shapes; flip `VITE_USE_MOCK=false` and
have the backend set `PUBLIC_SITE_URL` for CORS.

Competitions and Quarky are **static content** (`src/content/`) by design — no
API involved, in standalone mode or connected.

## Deployment

Target: **https://africa.digifunzi.com** — a subdomain of `digifunzi.com` on
Truehost cPanel (static hosting; the apex `digifunzi.com` is used by another
system for now). Build on your machine, upload the zip — Truehost runs no
Node/Chrome.

Quick version:

```powershell
npm run deploy:build   # vite build + prerender + sitemap, then zip
# -> Guide\africa-digifunzi-com-dist.zip
# upload to /home/sendusco/digifunzi.africa in cPanel File Manager, delete old files, Extract, delete zip
```

The bundled `public/.htaccess` handles HTTPS, serving prerendered
`<route>/index.html`, SPA fallback, and caching.

## Open decisions

Before launch: fill the real address / phone / email / social links and final
brand assets — placeholders are marked `TODO` in `src/config/site.js` and
`src/content/`. Integration open items are tracked in
[`SYSTEM_INTEGRATION.md`](./SYSTEM_INTEGRATION.md) §6.
