# `/api/public/*` — API contract for the landing page

This is the contract the landing page is built against. **None of these endpoints
exist yet** — they are new work on the main system (`server/`), to live in a new
module (e.g. `server/src/modules/public-site/`) mounted **before/outside** the
`protect` JWT middleware, mirroring the existing precedent
`server/src/modules/learners/public-profile.routes.js`.

The landing page currently fulfils this contract with in-code mocks
(`src/mocks/`), toggled by `VITE_USE_MOCK`. Flip that to `false` per environment
as each endpoint goes live.

---

## Cross-cutting requirements

- **CORS:** allow the landing page's origin **specifically** (not `*`), alongside
  the existing `CLIENT_URL` entry.
- **Public fields only:** never return internal admin IDs beyond what's needed to
  fetch a detail page, never guardian/learner PII, never pricing/business-internal
  fields unless explicitly public.
- **`slug` on every list/detail item:** derived server-side from `name` via a
  slugify util. The landing page routes on slugs (`/projects/intro-to-robotics`).
  Keep the algorithm identical to `src/utils/slugify.js` here.
- **Rate limiting:** both `POST` endpoints must use the same limiter already on
  `/api/auth/signup` and `/api/auth/login`.
- **Read-only** except the two `POST` lead endpoints.

---

## `GET /api/public/bootcamps`

`Curriculum` rows where `isProgram = true`, joined through `programs` for dates
and status. **Reuse** `program.service.js`'s existing `enrich()` logic that
computes `status: upcoming | active | completed` from `startDate` / `endDate` —
do not duplicate it.

**Schema gap:** `Curriculum` has no cover-image field. Add `coverImage`
(nullable string URL, same pattern as `Course.coverImage`) via migration before
this ships, or the section has no imagery.

List item:
```json
{
  "id": "uuid",
  "slug": "junior-robotics-bootcamp",
  "name": "string",
  "description": "string",
  "coverImage": "string | null",
  "status": "upcoming | active | completed",
  "startDate": "YYYY-MM-DD | null",
  "endDate": "YYYY-MM-DD | null",
  "educationLevel": "string",
  "gradeFrom": "string",
  "gradeTo": "string"
}
```

## `GET /api/public/bootcamps/:idOrSlug`

List item **plus**:
```json
{
  "classes": ["string"],                       // names only — no learner PII
  "courses": [{ "name": "string", "slug": "string" }]  // if the link exists; [] otherwise
}
```
404 with `{ "message": "..." }` when not found.

---

## `GET /api/public/projects`

`Course` rows where `status = "active"` only. Never expose `draft` / `archived`.

**Schema gap:** Course has no stored lesson/session count. Compute `sessionCount`
at read time via `COUNT(course_sessions WHERE courseId = ...)` — do not add a
stored field the landing page has to trust.

List item:
```json
{
  "id": "uuid",
  "slug": "intro-to-robotics",
  "name": "string",
  "description": "string",
  "coverImage": "string | null",
  "ageMin": "number | null",
  "ageMax": "number | null",
  "sessionCount": "number",
  "requirements": ["string"]
}
```

## `GET /api/public/projects/:idOrSlug`

List item **plus**:
```json
{ "modules": ["string"] }   // course_modules.name, ordered. Titles only — not session content.
```
404 with `{ "message": "..." }` when not found.

---

## `POST /api/public/leads`

Lead capture — **not** account creation. Stores to a simple `leads` table
(or notify-only, decide during implementation) and emails/notifies the Digifunzi
team, who follow up and create the real `Learner` + `Guardian` record through the
existing admin flow.

Shared by the **Enroll** and **Contact** CTAs, differentiated by `interestedIn`.

Request:
```json
{
  "parentName": "string",
  "parentEmail": "string",
  "parentPhone": "string",
  "learnerName": "string",
  "learnerAge": "number | null",
  "interestedIn": "bootcamp | project | quarky | general",
  "referenceId": "string | null",
  "note": "string | null"
}
```
> `note` is an extra free-text field the landing-page forms send. It is not
> required by the spec — store it or ignore it, but don't 400 on it.

Response: `200` with `{ "ok": true, "message": "string" }`.
Minimal validation: `parentName` and `parentEmail` required → `422` otherwise.

## `POST /api/public/contact` *(optional — pick one)*

Simpler general-inquiry variant if you'd rather keep Contact separate from
Enroll. Notify-only, no DB table needed.

Request: `{ "name": "string", "email": "string", "phone": "string", "message": "string" }`
Response: `200` with `{ "ok": true, "message": "string" }`.

If you **don't** build this, set `useLeadsEndpoint={true}` on `<ContactForm>` in
`src/pages/ContactPage.jsx` and everything routes through `/api/public/leads`
with `interestedIn: "general"`.

---

## Not in this contract (static content by design)

- **Competitions** — no backing model in the main system. Landing page uses
  `src/content/competitions.js`. Revisit only if a real recurring programme
  needs modelling (spec §4.3 Option B).
- **Quarky** — no backing model at all. Landing page uses
  `src/content/quarky.js`. Could later be a `billing_items` row or a dedicated
  `products` table (spec §4.4 Option B).
