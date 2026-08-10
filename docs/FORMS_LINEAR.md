# Contact Form → Linear

> Every `seridian.dev#contact` submission becomes a **Linear issue** — no more `mailto:`.

## Flow

```
Contact (client)  →  POST /api/contact  →  Linear GraphQL issueCreate  →  Linear triage
    useState+fetch        Next App Router       https://api.linear.app/graphql     team SER
                                                     Authorization: <LINEAR_API_KEY>
```

- **Client:** `src/components/Contact.tsx` is a `"use client"` component with controlled inputs, a honeypot `company` field, inline validation, a loading spinner, and an inline toast showing the returned Linear identifier (e.g. `SER-12`) on success.
- **API:** `src/app/api/contact/route.ts` validates `{ name, email, message }` (min lengths, email regex, max 2000), checks the honeypot, rate-limits 5/min per IP, reads `LINEAR_TEAM_ID` at request time, then calls `createLinearIssue`. Returns `201 { ok: true, identifier }` on success; `400` for invalid/empty/oversized bodies, `429` rate-limited, `500` when not configured, `502` when Linear is unreachable. `export const runtime = "nodejs"`.
- **Linear helper:** `src/lib/linear.ts` runs `mutation issueCreate(input: { teamId, title, description, labelIds? })` against `https://api.linear.app/graphql` with `Authorization: <LINEAR_API_KEY>` (Linear GraphQL accepts the raw API key). Reads `LINEAR_API_KEY` from env at request time only — never at build time. Returns a typed `{ ok: true, identifier } | { ok: false, error }` and never throws.

## Linear mapping

- **Team:** `LINEAR_TEAM_ID` (e.g. `SER`) — read from env at request time in the route. Required.
- **Labels:** optional — pass `labels: string[]` to `createLinearIssue` if you want to tag issues (e.g. `source:contact-form`).
- **Title:** `Contact form: <name> <email>` (120 char cap)
- **Description:** markdown with submitted-by/from + free-form message.

## Env

Copy `.env.example` → `.env.local` and fill in:

```bash
LINEAR_API_KEY=lin_api_...   # required for real issues — https://linear.app/settings/api
LINEAR_TEAM_ID=SER           # team identifier
```

`.env*` is gitignored; only `.env.example` is committed (via `git add -f`).

## Test

```bash
# health
curl http://localhost:3000/api/contact

# valid (with LINEAR_API_KEY + LINEAR_TEAM_ID set in .env.local)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@seridian.dev","message":"Hello from a 20-char test — cloud migration question."}'
# → 201 { "ok": true, "identifier": "SER-12" }

# invalid
curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"A","email":"nope","message":"short"}'
# → 400 { "ok": false, "error": "..." }

# honeypot (fake 200, no issue created)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"bot@example.com","message":"spam spam spam spam spam","company":"acme"}'
```

With `LINEAR_API_KEY` + `LINEAR_TEAM_ID` set and `bun run dev` running, a successful POST creates e.g. `SER-123` at `https://linear.app/seridian/issue/SER-123`.

## Bun-only

No npm install; use `bun install --frozen-lockfile`, `bun run lint`, `bunx tsc --noEmit`, `bun run build`.
