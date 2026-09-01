# Digifunzi Landing Page

Public, unauthenticated marketing site for Digifunzi. Standalone from the main
portal (`client/` in the `curriculum` repo) — it only talks to the main system
over a new `/api/public/*` REST layer.

- **Stack:** React 19 + Vite, MUI, React Router, TanStack Query, react-helmet-async,
  react-hook-form + Zod.
- **SEO:** per-route meta tags, JSON-LD, build-time prerendering (Puppeteer),
  generated `sitemap.xml` / `robots.txt`.
- **No auth.** No login, no JWT, no direct DB access.

## Quick start

```bash
npm install
cp .env.example .env      # already present; adjust if needed
npm run dev               # http://localhost:5175
```

By default `VITE_USE_MOCK=true`, so the app serves fixture data from
`src/mocks/` and needs **no backend running**. Flip it to `false` in `.env`
once the real `/api/public/*` endpoints exist (see `API_CONTRACT.md`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server (mock data, no backend needed) |
| `npm run build` | Production: `vite build` → sitemap/robots → prerender routes into `dist/` |
| `npm run deploy:build` | `build` + `package` → produces `dist.zip` ready for cPanel upload |
| `npm run package` | Zip `dist/` → `dist.zip` (forward-slash paths so cPanel Extract works) |
| `npm run build:spa` | `vite build` only (skip SEO post-steps) |
| `npm run verify:pipeline` | Full build+sitemap+prerender using **fixture data** (`.env.mockbuild`) — use this to test the whole pipeline before the real API exists |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run test` | Vitest — unit tests for the mock adapter, form schemas, honeypot, slugify |
| `npm run test:watch` | Vitest in watch mode |
| `npm run sitemap` | Regenerate `dist/sitemap.xml` + `dist/robots.txt` |
| `npm run prerender` | Re-run the Puppeteer prerender over `dist/` |
| `npm run lint` | ESLint |

### Prerendering & the missing API

`npm run build` (production) fetches `VITE_API_URL/api/public/*` to prerender the
Bootcamps/Projects pages and list their detail URLs in the sitemap. **Until those
endpoints exist**, the build still succeeds — it prerenders the home, about,
competitions, quarky, enroll and contact pages, and leaves `/bootcamps` and
`/projects` as client-rendered SPA routes (they work, they're just not in the
static HTML yet). Re-run `npm run build` once the API is live.

To exercise the entire pipeline now, `npm run verify:pipeline` builds a
minified bundle wired to the local fixtures and prerenders all 15 routes.

## Environment variables

| Var | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the main system's API (`/api/public/*` lives here) |
| `VITE_USE_MOCK` | `true` = serve `src/mocks/` fixtures instead of the network |
| `VITE_SITE_URL` | This site's own public origin — used for canonical tags, `og:url`, sitemap |

`.env` = local dev, `.env.production` = production build, `.env.mockbuild` =
`verify:pipeline` (production-style build on fixture data). `.env.local`
overrides any of them and is git-ignored.

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
    cards/       BootcampCard, ProjectCard
    forms/       EnrollForm, ContactForm, Zod schemas, Honeypot, FormStatus
    seo/         SeoHead (helmet wrapper), JsonLd (Organization/Course/Event/Product/FAQPage)
    common/      Logo, Section, PageHeader, SmartImage, StateViews,
                 ColorModeToggle, ThemeColorMeta
  content/       hand-authored copy: home, about, competitions, quarky
  hooks/         useBootcamps, useProjects, useLeadSubmission (React Query)
  services/      api.js — single axios instance + mock adapter wiring
  mocks/         mockApi.js + fixtures/ (active while VITE_USE_MOCK=true)
  utils/         slugify, dates, format, prerenderSignal
  *.test.js      Vitest units — colocated with the code they cover
scripts/
  generate-sitemap.js   build-time sitemap.xml + robots.txt
  prerender.js          build-time headless-Chrome HTML snapshots
```

Route components except Home load via `React.lazy` (code splitting) — the
initial JS chunk is ~72 KB gzipped; each page is a 1–4 KB chunk on top.

**Light / dark / system theme** is wired throughout. New components must use
semantic theme tokens only (never a raw colour) and they inherit both modes for
free — see **[`THEME.md`](./THEME.md)**.

Public forms carry a hidden honeypot field (`src/components/forms/Honeypot.jsx`)
as a first anti-spam layer; the server still rate-limits the POST endpoints
(spec §4.6).

## Data flow

```
Component → hooks/use*.js (React Query) → services/api.js (publicApi.*)
          → axios → { mock adapter | real /api/public/* on VITE_API_URL }
```

The forms (`EnrollForm`, `ContactForm`) POST through the same `publicApi` surface
to `/api/public/leads` (and optionally `/api/public/contact`).

## What still needs the backend team

Everything under `/api/public/*` is **new work on the main system** and does not
exist yet. See [`API_CONTRACT.md`](./API_CONTRACT.md) for the full contract, the
schema gaps to close (cover images, `slug`, `sessionCount`), CORS, and rate
limiting. Until it ships, this site runs entirely on mocks.

Competitions and Quarky are **static content** (`src/content/`) by design
(spec §4.3 / §4.4, Option A) — no API involved.

## Deployment

Target: **https://africa.digifunzi.com** — a subdomain of `digifunzi.com` on
Truehost cPanel (static hosting; the apex `digifunzi.com` is used by another
system for now). Build on your machine, upload the zip — Truehost runs no
Node/Chrome. **Full step-by-step in [`DEPLOYMENT.md`](./DEPLOYMENT.md)** (cPanel
subdomain setup, SSL, upload, verify, troubleshooting).

Quick version:

```powershell
npm run deploy:build   # vite build + prerender + sitemap, then zip
# -> Guide\africa-digifunzi-com-dist.zip
# upload to /home/sendusco/digifunzi.africa in cPanel File Manager, delete old files, Extract, delete zip
```

The bundled `public/.htaccess` handles HTTPS, serving prerendered
`<route>/index.html`, SPA fallback, and caching.

## Open decisions

Tracked in spec §9 — SEO region copy, whether Competitions/Quarky move to
backend models, lead-notification recipient, final brand assets. Domain is
settled (`africa.digifunzi.com`). Remaining placeholders are marked `TODO` in
`src/config/site.js` and `src/content/`.
