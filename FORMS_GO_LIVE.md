# Forms Go-Live — Enroll & Contact → Admin

**Goal:** the landing site's **Enroll** and **Contact** forms submit real data to
the curriculum system, where an admin sees each submission and can respond. The
content pages (Bootcamps / Projects / Pathways) stay on fixture data for now —
this is **forms only**.

This doc is for the **curriculum-system team**. It says what the landing site
will send, what we need back, and the small gaps to close on the admin side so a
staff member can actually reply.

---

## 1. What the landing site will do

- Switch the two forms from mock to real network calls. Content pages keep using
  fixtures (a "hybrid" mode — mock adapter still handles GETs, POSTs go to the
  network).
- `POST` to your existing public endpoints:
  - **Enroll form** → `POST {API}/api/public/leads`
  - **Contact form** → `POST {API}/api/public/contact`
    *(or route Contact through `/api/public/leads` with `interestedIn: "general"`
    — your call, see §5 Q1)*
- No auth, no cookies. `Content-Type: application/json`.
- Client-side validation (Zod) + a honeypot field already run before the POST.
- On success we show the `message` string from your response verbatim.
- On error we show `response.data.message`.

### Request bodies (already implemented on our side)

**`POST /api/public/leads`** (Enroll):

```jsonc
{
  "parentName":  "string, 2–120, required",
  "parentEmail": "valid email, ≤160, required",
  "parentPhone": "string 7–20, /^[+0-9()\\-\\s]+$/, required on our form",
  "learnerName": "string ≤120, required on our form",
  "learnerAge":  "integer 3–19, required on our form",
  "interestedIn": "\"bootcamp\" | \"project\" | \"quarky\" | \"general\"",
  "referenceId": "string ≤100 — the bootcamp/project/pathway SLUG the form was opened from, or null",
  "note":        "string ≤1000, optional — the visitor's free-text message"
}
```

**`POST /api/public/contact`** (Contact):

```jsonc
{
  "name":    "string, 2–120, required",
  "email":   "valid email, ≤160, required",
  "phone":   "string 7–20, optional (may be \"\")",
  "message": "string, 10–2000, required"
}
```

### Success response we expect

```jsonc
// 201
{ "success": true, "message": "Thanks! Our team will be in touch shortly.", "data": { /* the created record */ } }
```

### Error response we expect

```jsonc
// 400
{ "success": false, "message": "human-readable summary", "errors": [ /* optional field details */ ] }
```

---

## 2. What we need FROM the curriculum system

### 2.1 CORS — **blocking**

Add the landing site's origin to the API's allowed origins:

```
PUBLIC_SITE_URL=https://africa.digifunzi.com
```

- Allow methods `POST, OPTIONS` and header `Content-Type` for `/api/public/*`.
- Single origin — no `www`, no apex, no separate staging host.
- Until this is set, the browser's preflight blocks the POST before it reaches
  Express and **every submission fails**.
- For our local testing, also allow `http://localhost:5175` (dev) if that's easy;
  not required for production.

### 2.2 Confirm the endpoints are deployed and reachable

We were told (3 Sep 2026 release) that `POST /api/public/leads` and
`POST /api/public/contact` are live and rate-limited (20 req / 15 min / IP).
Please confirm the production host — we currently have
**`https://nodeapp.digifunzi.com`**. A quick curl we can run from outside:

```bash
curl -i -X POST https://nodeapp.digifunzi.com/api/public/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","phone":"","message":"Integration smoke test — please ignore."}'
```

Expected: `201` with `{ success: true, message: "...", data: {...} }`.

### 2.3 The stored lead must carry enough for an admin to respond

For each submission the admin needs to see and act on, the `leads` record (or
however you store contacts) should retain at least:

| Field | From | Why the admin needs it |
|---|---|---|
| Name | `parentName` / `name` | Who to address |
| Email | `parentEmail` / `email` | **Primary reply channel** |
| Phone | `parentPhone` / `phone` | Alternate reply channel |
| Message | `note` / `message` | What they asked |
| Type | `interestedIn` (leads) or a `source: "contact"` marker | Triage |
| Reference | `referenceId` | Which bootcamp/project/pathway — ideally shown as a link in the portal |
| Learner name + age | `learnerName`, `learnerAge` (Enroll only) | Context for enrolment |
| Received at | server timestamp | Ordering / SLA |
| Status | server default `"new"` | Triage workflow |

If `/api/public/contact` currently stores a thinner record than
`/api/public/leads`, please align them (or fold Contact into `/leads` — §5 Q1).

### 2.4 Admin can see and respond — the actual "respond" path

The integration doc says every submission fires an **in-app notification to all
admins** and staff triage on an **Enquiries page** with
`PATCH /api/leads/:id/status` (`new → contacted → closed`). For "the admin can
respond" we need to know which of these is true, and build the gap:

- **Option A — reply by email, outside the system.** Admin clicks the email
  address (a `mailto:` link) and replies from their mail client. Status is
  updated manually to `contacted`. **Nothing more needed from you** beyond 2.3.
  This is the simplest and is fine for launch.
- **Option B — reply from inside the portal.** Admin types a reply in the
  Enquiries page and the system emails the enquirer. This needs:
  - an endpoint like `POST /api/leads/:id/reply { body }` (admin JWT),
  - SMTP / transactional email configured (the doc notes email is **not built
    yet** — in-app only),
  - a reply-thread stored on the lead.

**Please tell us which option you want.** We (the landing site) don't need
anything for either — but if it's Option B, that's backend + portal work on your
side, and the enquirer should probably get an auto-acknowledgement email too
(see §5 Q2).

### 2.5 Validation error shape

Send us one real `400` response body (curl an invalid payload) so we can confirm
our form surfaces the message correctly. We currently read only the top-level
`message`; if you return `errors: [{ field, message }]` we can wire field-level
display later.

---

## 3. What we DON'T need

- No webhook or callback to the landing site.
- No content push — content stays authored in your portal.
- No auth for the landing site — it stays anonymous.
- No changes to the GET endpoints for this piece of work.

---

## 4. Our rollout plan (landing site side)

1. You confirm §2.1 (CORS) + §2.2 (endpoints reachable) + answer §5.
2. We add a "hybrid" mode: GETs still mocked, form POSTs hit the real API.
   (Small change — the mock adapter already only matches GET routes; we let
   POSTs fall through to the network.)
3. We smoke-test against the live API from a deployed preview:
   - submit a Contact message → admin sees it, can reply (Option A or B)
   - submit an Enroll (with a `referenceId` slug) → admin sees it with the
     "came from" reference
4. We deploy. The forms are live; content pages still show fixtures until the
   full cut-over (separate, later).

Rollback is a one-line env change on our side.

---

## 5. Questions for you

| # | Question | Why it matters |
|---|---|---|
| 1 | **One inbox or two?** Keep `POST /api/public/contact` as its own thing, or should the landing site send Contact through `/api/public/leads` with `interestedIn: "general"`? | Decides whether contact messages land in the same Enquiries list as enrolments. |
| 2 | **Auto-acknowledgement email** to the person who submitted — do you want the landing site to *not* promise one (current copy: "our team will be in touch"), or will you send one once SMTP is set up? | Sets expectations in our success message. |
| 3 | **Respond path — Option A (mailto) or Option B (reply from portal)?** (§2.4) | Determines if there's backend/portal work before "the admin can respond" is true. |
| 4 | **`referenceId`** — we send the **slug** (`junior-robotics-bootcamp`). Confirm that's fine and that the Enquiries page can resolve it to a readable name / link. | Staff need to know which programme an enquiry is about. |
| 5 | **Production API host** — confirm `https://nodeapp.digifunzi.com`. | We hard-code it in the build. |
| 6 | **Rate limit** — 20 req / 15 min / IP on the lead endpoints. Any allowlist needed for our deploy, or is per-visitor-IP fine? | A shared office/school NAT could hit the limit; usually fine. |

---

## 6. Summary

| | |
|---|---|
| **Scope** | Enroll + Contact forms only. Content pages unchanged. |
| **Landing site does** | Switches 2 forms to real POSTs; adds hybrid mock/live mode; smoke-tests; deploys. |
| **Curriculum system must** | 1) Set `PUBLIC_SITE_URL` for CORS (**blocking**). 2) Confirm `POST /api/public/{leads,contact}` are live at the confirmed host. 3) Ensure the stored record has the fields in §2.3. 4) Decide the "respond" path (§2.4) and build it if Option B. 5) Send us a sample `400` body. |
| **Answers needed** | The 6 questions in §5. |
| **Not needed** | Webhooks, content push, auth, GET changes. |
