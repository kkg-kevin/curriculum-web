# CLAUDE.md — Digifunzi Landing Page

Guidance for Claude working in this repo. Read alongside `README.md`,
`API_CONTRACT.md`, `THEME.md`, and `DEPLOYMENT.md`.

## What this is

A standalone, **unauthenticated, SEO-first** marketing site for Digifunzi. It is
NOT the learner/teacher/admin portal (`client/` in the `curriculum` repo). It
talks to the main system only over HTTP, via a new `/api/public/*` namespace.

## Hard rules

- **No auth, ever.** No login link, no JWT, no cookies/session handling, no
  direct DB access. If a task implies any of these, stop and flag it.
- **No new heavy dependencies.** No Next.js, no Redux or other state libraries
  (React Query is the only data/state layer). No `jspdf`/`html2canvas`-class
  libraries — this is a marketing site, keep the bundle lean.
- **Styling:** MUI `sx`/`style` props inline. No CSS-in-JS library beyond
  Emotion (which MUI brings). Matches `client/` convention.
- **Theming:** light + dark mode is wired up. **Never write a raw colour** (hex,
  `rgb()`, `grey.*`) in a component — always a semantic token
  (`background.paper`, `text.secondary`, `divider`, `surface.*`, `primary.*`).
  Full token list and the new-feature checklist are in `THEME.md`. Colours live
  only in `src/theme/palette.js`.
- **Public data only.** Anything rendered from the API must be a field the
  `API_CONTRACT.md` marks safe for public display.

## SEO is a feature, not a nice-to-have

Every page component must render a `<SeoHead>` (title + description at minimum)
and, where applicable, `<JsonLd>`. New routes must be added to
`src/config/site.js` → `STATIC_ROUTES` so the sitemap and prerender scripts pick
them up. Detail routes are discovered from the API by those scripts.

Keep semantic HTML: one `<h1>` per page, real heading hierarchy, `alt` text on
every image (`SmartImage` requires an `alt` prop — always pass a real one).

## Data layer

```
page → src/hooks/use*.js → src/services/api.js (publicApi.*) → axios
     → mock adapter (VITE_USE_MOCK=true) OR real /api/public/* (false)
```

When adding an endpoint call: add it to `publicApi` in `services/api.js`, add a
handler to `src/mocks/mockApi.js` + a fixture, then a hook in `src/hooks/`, then
a case in `src/mocks/mockApi.test.js`.

## Code splitting & prerender

Route components (except Home) are `React.lazy` in `src/routes/routes.jsx`. If
you add a route, lazy-load it there and add its path to `STATIC_ROUTES` in
`src/config/site.js`.

`scripts/prerender.js` waits for `window.__APP_READY__` (set by
`src/utils/prerenderSignal.js` — true once React mounted, the route chunk
resolved, and React Query is idle). If you add a global loading state, make sure
it clears so the signal can fire, or prerender will snapshot a spinner.

## Forms

Both public forms use `react-hook-form` + Zod (`src/components/forms/schemas.js`)
and include `<Honeypot register={register} />` plus an `isBot(values)` early
return in `onSubmit`. Keep that pattern on any new public form. `FormStatus` is
an `aria-live` region — don't replace it with a bare conditional `<Alert>`.

## Static content

Competitions and Quarky have **no backend** by design. Their content lives in
`src/content/competitions.js` and `src/content/quarky.js`. Editing copy there is
the intended workflow — do not build an API for them unless the spec's §4.3/§4.4
Option B is explicitly chosen.

## Placeholders

`TODO` markers throughout `src/config/site.js` and `src/content/` are real open
items (domain, address, brand assets, testimonials, Quarky specs). Don't invent
values to replace them — leave the TODO and mention it.

## Before committing

- `npm run lint`
- `npm run test`
- `npm run verify:pipeline` (full build + sitemap + prerender on fixtures) must pass
