# Learning Pathways

A **Pathway** is a curriculum-agnostic roadmap — a named track (e.g. "Software
Engineer", "Robotics") made of an ordered list of courses a learner works
through, with a description and an accent colour. The canonical, reusable list
lives in the main system's `pathway_templates` table, authored in the portal
under **Settings → Pathways**.

This section lets a visitor who has heard about "learning pathways" browse the
pathways on offer, see what each covers, and hit an Enroll CTA.

- Listing: [`/pathways`](src/pages/PathwaysListPage.jsx)
- Detail: [`/pathways/:slug`](src/pages/PathwayDetailPage.jsx) — ordered course
  stepper + Enroll CTA
- Data: [`usePathways.js`](src/hooks/usePathways.js) →
  [`publicApi.listPathways` / `getPathway`](src/services/api.js)
- Mock fixtures: [`src/mocks/fixtures/pathways.js`](src/mocks/fixtures/pathways.js)
  (3 pathways — Software Engineer, Robotics, Data & AI). Shape matches the real
  contract exactly, so `VITE_USE_MOCK=false` needs no page changes.
- Nav: added to the header ([`Header.jsx`](src/components/layout/Header.jsx)),
  mobile menu and footer.
- Sitemap / prerender: `/pathways` is a static route; detail URLs are fetched
  from `/api/public/pathways` at build time
  ([`generate-sitemap.js`](scripts/generate-sitemap.js),
  [`prerender.js`](scripts/prerender.js)) — same as projects.

---

## API contract (`/api/public/pathways`)

Implemented on the main system in `server/src/modules/public-site/`
(`public-site.{routes,controller,service}.js`), following that module's existing
patterns: **bare array / object responses** (no `{ success, data }` wrapper),
mounted outside `protect` under `/api/public`, CORS already allows the landing
origin via `PUBLIC_SITE_URL`. Read-only — no admin CRUD (pathway templates are
authored in Settings → Pathways).

### `GET /api/public/pathways` → list

```json
[
  {
    "id": "0446eb56-d0c4-4462-8ad7-c6f1e235596a",
    "slug": "robotics",
    "name": "Robotics",
    "description": "…",
    "color": "#25476a",
    "courseCount": 4
  }
]
```

- `slug` — derived server-side from `name` with `server/src/shared/utils/slugify.js`
  (same as bootcamps/projects). `pathway_templates` has **no** `slug` column; it's
  computed at read time. No migration, no `uniqueSlug()` disambiguation — the
  catalog already enforces case-insensitive name uniqueness, so an exact slug
  clash is very unlikely.
- `courseCount` — number of ids in `pathway_templates.courses` that still resolve
  to a real `courses` row with `status = "active"` (same "still exists" hygiene
  the reports code uses). A bogus / deleted / archived course id is not counted.

### `GET /api/public/pathways/:idOrSlug` → detail

List item **plus** `courses`:

```json
{
  "id": "…", "slug": "robotics", "name": "Robotics",
  "description": "…", "color": "#25476a", "courseCount": 4,
  "courses": [
    {
      "name": "Code Foundations 1",
      "description": "short blurb (plain text — course HTML is flattened server-side)",
      "ageMin": 5,
      "ageMax": 10,
      "coverImage": "https://…/uploads/….png"
    }
  ]
}
```

- `courses` resolves `pathway_templates.courses` (id array) against the `courses`
  table, **preserving the template's order** — that order is the learning
  sequence the detail page renders as a numbered stepper.
- Only `status = "active"` courses are included.
- **Exactly these five fields** per course: `name`, `description`, `ageMin`,
  `ageMax`, `coverImage`. Course ids and every internal field are never exposed.
- `description` is run through a small HTML→text flatten (course descriptions are
  authored as TipTap rich text; the landing page renders plain text).

### `:idOrSlug` resolution

`findById(idOrSlug)` first; if nothing, scan `findAll()` for a template whose
computed slug matches.

### 404

- Unknown `:idOrSlug`.
- A pathway whose **every** course is inactive / deleted (nothing to show) —
  matches how `getPublicBootcamp` 404s an unpublished record. (Such a pathway
  still appears in the list with `courseCount: 0`.)

### Verified with curl against a local main-system instance

| Case | Result |
|---|---|
| `GET /api/public/pathways` | `200`, bare array, `courseCount: 4` |
| `GET /api/public/pathways/robotics` (slug) | `200`, 4 courses in template order |
| `GET /api/public/pathways/<uuid>` (id) | `200` |
| `GET /api/public/pathways/does-not-exist` | `404 {"message":"Pathway not found"}` |
| All 4 courses set to `archived` | detail `404`; list shows `courseCount: 0` |
| Bogus id added to `pathway_templates.courses` | filtered out; `courseCount` unchanged |
| Course objects | contain no `id` / internal fields |

---

## What the marketing team would need to add for richer pathway pages

`pathway_templates` today has only **name, description, colour, and the course
id list**. It has:

- **no cover / hero image** of its own — the detail page has no `og:image` and
  falls back to the site default; the header has no hero art.
- **no age range of its own** — the page infers a rough range only from the
  per-course `ageMin`/`ageMax` chips.
- **no "outcomes" / "what you'll be able to do" copy** — the page shows the
  pathway `description` and the course list, nothing more.
- **no published / draft flag** — every row in `pathway_templates` is public the
  moment it exists. There is currently one ("Robotics"). If the team wants to
  stage pathways before they go live, this is the first thing to add.

If richer pages are wanted later, that's a **follow-up migration + Settings UI on
the main system**:

1. `ALTER TABLE pathway_templates ADD COLUMN` `coverImage VARCHAR(500) NULL`,
   `ageMin INT NULL`, `ageMax INT NULL`, `outcomes JSON NULL` (bullet list),
   `isPublished BOOLEAN NOT NULL DEFAULT true`.
2. Settings → Pathways form gains those fields (image upload reusing the existing
   `/uploads` flow, a published toggle).
3. Public endpoint: filter the list/detail to `isPublished = true` (like
   `public_bootcamps`), and add the new fields to the response shapes.
4. Frontend: `PathwayDetailPage` renders the hero image + `og:image`, an
   "Outcomes" section, and a pathway-level age chip; `PathwayCard` can show the
   image. All additive — no breaking change to the current contract.
