# System Integration — landing site ↔ curriculum system (FUTURE / reference)

> **Not the current setup.** The site runs standalone on its own API today
> ([STANDALONE.md](STANDALONE.md)). This document is the contract for a *later*
> migration to the curriculum system's public API.

How **digifunzi-landing** (this public marketing site) would talk to the
**curriculum system** (`Systems/curriculum` — Node/Express + MySQL API, plus the
admin portal), and the state of that wiring on this side.

This file is the **website side** of the contract. The curriculum system keeps
its own counterpart (`Website ⇄ Curriculum System — Integration Contract`). Where
they disagree, the running API wins — fix the mock here to match.

- **This site:** standalone Vite + React SPA → `https://africa.digifunzi.com`
  (Truehost cPanel subdomain).
- **Curriculum API:** `https://nodeapp.digifunzi.com` (prod),
  `http://localhost:5000` (dev).
- **Admin portal:** `https://curriculum.digifunzi.com` — not touched by this site.
- **Traffic is one-way:** the browser calls `/api/public/*` over HTTPS. The
  curriculum system never calls this site.
- **Auth:** none. This site holds no JWT, no cookie, and must not set
  `withCredentials` on the axios instance. Every endpoint below is public.
- **Backend status:** all endpoints are **live** as of the curriculum system's
  3 Sep 2026 release.

> ## Current state: STANDALONE (own API)
>
> This site currently runs on its **own** JSON-backed API in [`server/`](server/)
> — content from `data/content/*.json`, form submissions stored to
> `data/leads.json` / `data/contacts.json`, viewed at `/admin`. See
> [STANDALONE.md](STANDALONE.md) and [DEPLOY_TRUEHOST.md](DEPLOY_TRUEHOST.md).
>
> **This document describes a *future* migration path** — pointing the site at
> the curriculum system's `/api/public/*` instead. That API's response shapes
> already match `server/`'s exactly (both were built to the same contract), so
> the switch is: change `VITE_API_URL`, have the curriculum backend fix its CORS
> (its preflight currently omits `Access-Control-Allow-Origin` — the open blocker
> in the thread), and rebuild. Until then this doc is reference, not active.

---

## 1. Response conventions

| | Shape |
|---|---|
| **Public GET** (`/api/public/*` reads) | Bare JSON array / object. **No** `{ success, data }` wrapper. |
| **Public POST** success (`/leads`, `/contact`) | `201` + `{ success: true, message: string, data: <record> }` |
| **Public POST** validation error | `400` + `{ success: false, message: string, errors: [...] }` |
| **GET 404** | `{ "message": "..." }` |

The client only ever reads the top-level `message` from an error (via the axios
interceptor in [src/services/api.js](src/services/api.js)) and shows it in
[FormStatus.jsx](src/components/forms/FormStatus.jsx). Field-level `errors[]` are
received but not surfaced — see §6.

---

## 2. This site's integration layer (all built)

| Piece | File | Notes |
|---|---|---|
| axios instance | [src/services/api.js](src/services/api.js) | `baseURL` = `VITE_API_URL`, 15 s timeout, no auth. Interceptor normalises every error to `{ status, message, raw }`. |
| API surface | `publicApi` in [src/services/api.js](src/services/api.js) | The 8 calls in §4. |
| Data hooks | [useBootcamps.js](src/hooks/useBootcamps.js), [useProjects.js](src/hooks/useProjects.js), [usePathways.js](src/hooks/usePathways.js) | React Query, 5 min `staleTime`, no retry on 404. |
| Form hooks | [useLeadSubmission.js](src/hooks/useLeadSubmission.js) | `useLeadSubmission` (Enroll + Contact), `useContactSubmission`. |
| Enroll form | [EnrollForm.jsx](src/components/forms/EnrollForm.jsx) + [schemas.js](src/components/forms/schemas.js) | Zod-validated, honeypot spam field → `POST /api/public/leads`. |
| Contact form | [ContactForm.jsx](src/components/forms/ContactForm.jsx) | → `POST /api/public/contact` by default; `useLeadsEndpoint` prop routes it through `/leads` with `interestedIn: 'general'`. |
| Media URL resolver | [src/utils/media.js](src/utils/media.js) | `resolveMediaUrl()` — turns a relative `/uploads/...` `coverImage` into an absolute URL against `MEDIA_BASE_URL`. Used inside [SmartImage.jsx](src/components/common/SmartImage.jsx) (covers every card + detail page) and for `og:image` on the bootcamp/project detail pages. |
| Mock backend | [src/mocks/mockApi.js](src/mocks/mockApi.js) + [fixtures/](src/mocks/fixtures/) | Custom axios adapter implementing every endpoint at the shapes in §4. Active when `VITE_USE_MOCK=true`. Contract tests: [mockApi.test.js](src/mocks/mockApi.test.js). |
| Build-time fetch | [scripts/prerender.js](scripts/prerender.js), [scripts/generate-sitemap.js](scripts/generate-sitemap.js) | Node `fetch` to `/api/public/{bootcamps,projects,pathways}` to discover detail-page slugs and prerender static HTML. Degrades gracefully if the API is unreachable. |

### Config ([.env](.env), [.env.production](.env.production))

| Var | Dev | Prod | Meaning |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | `https://nodeapp.digifunzi.com` | Curriculum API base URL. Unused while mock is on. |
| `VITE_USE_MOCK` | **`true`** | **`true`** | Currently `true` (standalone). Set `false` to hit the real API. |
| `VITE_MEDIA_BASE_URL` | *(unset → API URL)* | *(unset → API URL)* | Base for relative `coverImage` paths. Override only if uploads move to a CDN. |
| `VITE_SITE_URL` | `http://localhost:5175` | `https://africa.digifunzi.com` | This site's own public origin (canonical tags, sitemap). |

---

## 3. What the curriculum system needs from us

1. **CORS origin.** The server must have
   `PUBLIC_SITE_URL=https://africa.digifunzi.com` in its `.env`, or the browser's
   preflight blocks the form POSTs before they reach Express. **We deploy to a
   single origin** — no `www`, no apex, no separate staging host — so one value
   is enough. (Server-to-server GETs from the prerender step carry no `Origin`
   header and are unaffected.)
2. **`referenceId` is a slug.** Every "Enroll" entry point sends the programme's
   **slug** (`junior-robotics-bootcamp`, `robotics`, …), not the uuid — so the
   staff Enquiries "came from" value is readable. The API accepts either and
   stores it as a bare string; nothing else required.
3. **Fields we render** — so content authors know what must be filled in:
   - *Bootcamp card/detail:* `name`, `slug`, `description`, `coverImage`,
     `status`, `startDate`, `endDate`, `educationLevel`, `gradeFrom`, `gradeTo`;
     detail also uses `classes[]` and `courses[]` (`{ name, slug }`).
   - *Project card/detail:* `name`, `slug`, `description`, `coverImage`,
     `ageMin`, `ageMax`, `sessionCount`, `requirements[]`; detail also `modules[]`.
   - *Pathway card/detail:* `name`, `slug`, `description`, `color`,
     `courseCount`; detail also `courses[]`
     (`{ name, description, ageMin, ageMax, coverImage }`, in learning order).
   - We **ignore** `id`, `isPublished`, `createdAt`, `updatedAt` — fine to send,
     we don't read them.
4. **`coverImage`** — we accept an absolute URL, a `data:` URI, **or** a
   server-relative `/uploads/...` path (resolved against `VITE_MEDIA_BASE_URL`,
   which defaults to the API origin). If uploads ever move to a CDN, tell us the
   host and we set `VITE_MEDIA_BASE_URL`.

We do **not** push any content or events to the curriculum system.

---

## 4. Endpoint contracts

> The mock in [src/mocks/](src/mocks/) is the executable copy of this section. A
> real response that differs is a bug in the mock/fixtures, not the pages — pages
> only read the fields shown here.

### 4.1 `GET /api/public/bootcamps` → `200`, array *(published only, newest first)*

```jsonc
{
  "id": "uuid",
  "name": "Junior Robotics Bootcamp",
  "slug": "junior-robotics-bootcamp",
  "description": "plain text / light markup",
  "coverImage": "https://…/x.png | /uploads/x.png | null",
  "status": "upcoming | active | completed",
  "startDate": "2026-04-06 | null",
  "endDate": "2026-04-17 | null",
  "educationLevel": "Primary | Secondary | … | null",
  "gradeFrom": "Grade 4 | null",
  "gradeTo": "Grade 6 | null",
  "classes": ["string", …],                       // may be [] in the list
  "courses": [{ "name": "…", "slug": "…" }],       // may be [] in the list
  "isPublished": true,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### 4.2 `GET /api/public/bootcamps/:idOrSlug` → `200` | `404`

Same object; `classes[]` / `courses[]` populated. `:idOrSlug` accepts the uuid or
the slug. `404 { "message": "Bootcamp not found" }` for unknown / unpublished.

### 4.3 `GET /api/public/projects` → `200`, array  *(Projects = Courses)*

```jsonc
{
  "id": "uuid",
  "name": "Intro to Robotics",
  "slug": "intro-to-robotics",
  "description": "plain text (rich text flattened server-side)",
  "coverImage": "… | null",
  "ageMin": 8,           // 0–25 | null
  "ageMax": 12,          // 0–25 | null
  "sessionCount": 12,    // integer | null
  "requirements": ["A Quarky kit (provided)", "A laptop"],
  "modules": ["…"],      // may be [] in the list
  "isPublished": true,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### 4.4 `GET /api/public/projects/:idOrSlug` → `200` | `404`

Same object; `modules[]` populated. `404 { "message": "Project not found" }`.

### 4.5 `GET /api/public/pathways` → `200`, array

```jsonc
{
  "id": "uuid",
  "slug": "robotics",              // computed from name at read time (no column)
  "name": "Robotics",
  "description": "plain text",
  "color": "#25476a",              // default "#25476a"
  "courseCount": 4                 // still-active courses only
}
```

### 4.6 `GET /api/public/pathways/:idOrSlug` → `200` | `404`

List item **plus** an **ordered** `courses[]` (template order = learning
sequence). Exactly five fields per course — never the course id or internal
fields:

```jsonc
{
  "courses": [
    {
      "name": "Code Foundations 1",
      "description": "short blurb, plain text",
      "ageMin": 5,          // integer | null
      "ageMax": 10,         // integer | null
      "coverImage": "… | null"
    }
  ]
}
```

`404 { "message": "Pathway not found" }` for unknown id/slug **or** a pathway
with no active courses left (it still appears in the list with `courseCount: 0`).
Deeper notes + curl matrix: [PATHWAYS.md](PATHWAYS.md).

> **Slug stability:** pathway slugs are derived from `name` at read time. Renaming
> a pathway in Settings → Pathways changes its public URL (and breaks inbound
> links / that page's SEO history). Acceptable today (few pathways, rarely
> renamed); revisit with the backend if pathways get heavily marketed.

### 4.7 `POST /api/public/leads` → `201` | `400`

Rate limit: **20 req / 15 min / IP.** Request (JSON):

```jsonc
{
  "parentName":  "required, 2–120",
  "parentEmail": "required, valid email, ≤160",
  "parentPhone": "optional (or \"\"), 7–20, /^[+0-9()\\-\\s]+$/",
  "learnerName": "optional (or \"\"), ≤120",
  "learnerAge":  "optional / null, integer 3–19",
  "interestedIn": "bootcamp | project | quarky | general   (default general)",
  "referenceId": "optional / null, ≤100 — the programme SLUG the form came from",
  "note":        "optional (or \"\"), ≤1000 — the form's 'anything else' field"
}
```

- **This site's Enroll form is stricter:** it requires `parentPhone` and
  `learnerName` (it's an enrolment — the team needs a phone to follow up). That's
  a client-side choice; the API would accept them empty.
- Success `201`: `{ success, message, data }` — `message` is shown verbatim to
  the user (currently *"Thanks! Our team will contact you to arrange next
  steps."*).
- `400`: `{ success: false, message, errors: [...] }`.

### 4.8 `POST /api/public/contact` → `201` | `400`

Same rate limit. Request:

```jsonc
{
  "name":    "required, 2–120",
  "email":   "required, valid email, ≤160",
  "phone":   "optional (or \"\"), same regex as above",
  "message": "required, 10–2000"
}
```

- Success `201`: `{ success, message, data }` — currently *"Message received. We
  usually reply within one working day."*
- Both `/contact` and routing the contact form through `/leads`
  (`interestedIn: 'general'`) are supported by the API. This site uses `/contact`
  ([ContactForm.jsx](src/components/forms/ContactForm.jsx) default). Flip the
  `useLeadsEndpoint` prop if the team consolidates on one inbox.

### 4.9 `GET /api/public/learners/:publicToken`

The QR-share learner profile. **Not used by this site** — listed for boundary
awareness only.

---

## 5. What staff do with a lead (context, not our concern)

Every `POST` notifies **every admin** in-app (no enquirer auto-reply email yet).
Staff triage on the portal's **Enquiries** page (`GET /api/leads`,
`PATCH /api/leads/:id/status` → `new | contacted | closed`, admin JWT). A lead is
never auto-provisioned into a learner.

---

## 6. Open items

| # | Item | Owner | State |
|---|---|---|---|
| 1 | `PUBLIC_SITE_URL` must be set to `https://africa.digifunzi.com` on the server before the deployed forms work. | Curriculum | **Blocking go-live.** One origin — no list needed. |
| 2 | `coverImage` may be absolute or relative `/uploads`. Handled — [utils/media.js](src/utils/media.js) resolves it. If uploads move to a CDN, backend tells us the host → we set `VITE_MEDIA_BASE_URL`. | Both | Resolved on our side. |
| 3 | Field-level validation errors: the API returns `errors: [...]` on a `400`; this site only shows the top-level `message`. Acceptable — client-side Zod catches almost everything first. Revisit only if real 400s slip through. | Website | Accepted as-is. |
| 4 | Enquirer auto-reply email (SMTP) — not built on the backend. This site's success copy doesn't promise an email, so no dependency. | Curriculum | No action here. |
| 5 | No `programs` endpoint. Confirmed **not needed** — bootcamps + projects + pathways cover every page. | Website | Closed. |
| 6 | Analytics / "lead submitted" webhook back to this site. **Not needed.** | Website | Closed. |
| 7 | Pathway slug instability on rename (§4.6). Low risk today. | Both | Watch. |
| 8 | Prerender fetch runs from Node (no `Origin` header) so it isn't CORS-bound; the earlier `localhost:4199` concern doesn't apply to server-to-server. Confirm on the first real production build that `/bootcamps`, `/projects`, `/pathways` are prerendered (log shows fetched slugs, not "API unreachable"). | Website | Verify at deploy. |

---

## 7. Cut-over checklist (mock → live API)

1. Backend sets `PUBLIC_SITE_URL=https://africa.digifunzi.com` in the server
   `.env` (item 1).
2. Confirm `VITE_API_URL` in [.env.production](.env.production) — currently
   `https://nodeapp.digifunzi.com`.
3. From outside the server, curl each GET endpoint (see PATHWAYS.md for the
   pathways matrix; same idea for bootcamps/projects).
4. **Set `VITE_USE_MOCK=false`** in [.env](.env) and
   [.env.production](.env.production). No other code change — the SPA and
   prerender pick up real data automatically.
5. `npm run build` → check the prerender log fetches the data-driven routes
   (item 8), not "API unreachable".
6. Submit one real Enroll and one real Contact from the deployed site → confirm
   admins get the in-app notification and the row lands in `leads`.
7. If a content record has a relative `coverImage`, confirm the image renders on
   the deployed site (it should — [utils/media.js](src/utils/media.js)).

---

## 8. Quick reference

```
GET   /api/public/bootcamps
GET   /api/public/bootcamps/:idOrSlug
GET   /api/public/projects
GET   /api/public/projects/:idOrSlug
GET   /api/public/pathways
GET   /api/public/pathways/:idOrSlug
POST  /api/public/leads     { parentName, parentEmail, parentPhone?, learnerName?, learnerAge?, interestedIn?, referenceId?, note? }  → 201
POST  /api/public/contact   { name, email, phone?, message }                                                                        → 201
```

Admin-only (JWT — the boundary this site never crosses): `GET /api/leads`,
`PATCH /api/leads/:id/status`, `*/api/site/{bootcamps,projects}`.
