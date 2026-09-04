# Standalone architecture

This site runs on its own — a React SPA plus a small JSON-backed API in
[`server/`](server/). No external system, no database. When you're ready to move
lead data into a database or hand it to the curriculum system, the API is the
only piece that changes; the React app just points at a different URL.

```
┌──────────────────────┐      /api/public/*       ┌────────────────────────────┐
│  React SPA (Vite)    │  ───────GET content────►  │  server/  (Express)        │
│  africa.digifunzi.com│  ──POST leads / contact─► │   • reads data/content/*.json│
│                     │  ◄──201 { ok, data }────  │   • appends data/leads.json  │
└──────────────────────┘                           │            data/contacts.json│
                                                   │   • /admin  (basic-auth view)│
        staff  ──────────GET /admin───────────────►│                            │
                                                   └────────────────────────────┘
```

## What's where

| Path | Purpose | In git? |
|---|---|---|
| `data/content/bootcamps.json` | Bootcamp content — hand-edit this | ✅ tracked |
| `data/content/projects.json` | Course content | ✅ tracked |
| `data/content/pathways.json` | Pathway content (ordered course lists) | ✅ tracked |
| `data/leads.json` | Enroll-form submissions (created at runtime) | ❌ gitignored |
| `data/contacts.json` | Contact-form submissions (created at runtime) | ❌ gitignored |
| `server/index.js` | The API — routes, CORS, rate limit | ✅ |
| `server/lib/content.js` | Loads + shapes the content JSON | ✅ |
| `server/lib/jsonStore.js` | Atomic append to the submission files | ✅ |
| `server/lib/validate.js` | Server-side body validation | ✅ |
| `server/admin.js` | `/admin` submissions viewer + JSON export | ✅ |
| `src/mocks/` | Offline fallback (`VITE_USE_MOCK=true`) — no API needed at all | ✅ |

## Running it locally

```bash
npm install
npm run api:install          # one-time: installs server/ deps (express)
cp server/.env.example server/.env   # then edit ADMIN_PASSWORD etc.

# two terminals:
npm run api                  # API on http://localhost:5050
npm run dev                  # SPA on http://localhost:5175
```

`.env` already has `VITE_API_URL=http://localhost:5050` and `VITE_USE_MOCK=false`.

**No API at all?** Set `VITE_USE_MOCK=true` in `.env` and just `npm run dev` —
content comes from `src/mocks/fixtures/`, form submissions are logged to the
browser console and go nowhere.

## The API

All responses are bare JSON (arrays/objects), no `{ success, data }` wrapper on
GETs. This matches the curriculum system's `/api/public/*` contract exactly, so
migrating later is only an env change.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/health` | `{ ok: true, mode: "standalone-json" }` |
| `GET` | `/api/public/bootcamps` · `/:idOrSlug` | 404 `{ message }` on miss |
| `GET` | `/api/public/projects` · `/:idOrSlug` | |
| `GET` | `/api/public/pathways` · `/:idOrSlug` | 404 if the pathway has no courses |
| `POST` | `/api/public/leads` | Enroll form. `201` + `{ ok, success, message, data }` · `400` + `{ success:false, message, errors:[{field,message}] }` |
| `POST` | `/api/public/contact` | Contact form. Same response shapes |
| `GET` | `/admin` | Basic-auth. HTML table of all submissions |
| `GET` | `/admin/leads.json` · `/admin/contacts.json` | Basic-auth. Raw arrays for export |

- **CORS:** `PUBLIC_SITE_URL` is a comma-separated allow-list of browser origins.
  Requests with no `Origin` (curl) always pass. Disallowed origins get no
  `Access-Control-Allow-Origin` header and the browser blocks them.
- **Rate limit:** 20 requests / 15 min / IP on the two POST endpoints.
- **Honeypot:** a `companyWebsite` field non-empty in the body → the request
  gets a fake `201` and is **not** stored.
- **Content is read fresh per request** — edit a `data/content/*.json` file and
  the change shows without restarting.

## Editing content

Edit the JSON in `data/content/`. Rules:

- `slug` is **computed from `name`** — don't add a `slug` field. Renaming changes
  the URL.
- `coverImage`: an absolute URL, or `null`. (Relative `/uploads/...` paths also
  work — resolved against `VITE_MEDIA_BASE_URL` — but absolute is simplest.)
- Bootcamp `status`: `upcoming` | `active` | `completed`.
- A pathway with an empty `courses` array 404s on its detail page (by design —
  matches the curriculum system).
- `id` can be any stable unique string. The current values are throwaway UUIDs.

## Deploying to Truehost (Node app)

See [DEPLOY_TRUEHOST.md](DEPLOY_TRUEHOST.md) for the step-by-step. In short:

1. Build the SPA: `npm run build` (with the API reachable so prerender gets real
   content — or accept client-rendered data pages).
2. Upload the repo (or `dist/` + `server/` + `data/`) to the Truehost account.
3. In cPanel **Setup Node.js App**: point it at `server/index.js`, set the env
   vars from `server/.env.example`, set **`DATA_DIR` to a folder outside the web
   root** so `leads.json` isn't publicly downloadable.
4. Serve the SPA either from the same Node process (`SERVE_STATIC=true`) or as
   static files with the Node app mounted at `/api`.

## Migrating leads to a database later

`server/lib/jsonStore.js` has two functions: `readAll(name)` and
`append(name, record)`. Reimplement those against your database and nothing else
changes. To move existing submissions, `GET /admin/leads.json` and
`/admin/contacts.json` give you the full arrays.
