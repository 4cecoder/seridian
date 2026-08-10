# Linear + GitHub Tandem Workflow (Seridian)

> **Principle:** One Linear issue = one GitHub Issue = one worktree = one PR. Linear is source of truth for product planning; GitHub Issues make that work visible to CI/review without losing Linear.

Project: **Seridian Site Refresh** (team `SER`, tracks `track:ui-kit` / `track:webgl` / `track:fonts` / `track:workflow`).

Everything here applies to the **server-side contact form → Linear** endpoint too (`POST /api/contact`, `src/lib/linear.ts`) — see §2 and `docs/FORMS_LINEAR.md`.

---

## 1. Official Linear MCP only

This repo uses **only** the official Linear MCP server:

```
https://mcp.linear.app/sse  via mcp-remote
```

`mcp-remote` command (from the linear skill at `~/.config/opencode/skills/linear/SKILL.md`):

```json
{
  "mcp": {
    "linear": {
      "type": "local",
      "command": ["npx", "-y", "mcp-remote", "https://mcp.linear.app/sse"],
      "enabled": true
    }
  }
}
```

- No `LINEAR_API_KEY` needed — auth is **browser OAuth** on first tool use. `mcp-remote` opens a browser, you approve workspace **Seridian**.
- For Claude Code equivalent: `claude mcp add --transport sse linear-server https://mcp.linear.app/sse`
- Spec: `2025-03-26`. Source: https://linear.app/changelog/2025-05-01-mcp
- Verify: `npx -y mcp-remote https://mcp.linear.app/sse --help` and check opencode logs show `linear` connected with tools `create_issue`, `update_issue`, `list_issues`, etc.

### Fallback PAT (only if OAuth blocked)

If behind a firewall that blocks OAuth, temporarily add a second local server:

```json
{
  "mcp": {
    "linear-pat": {
      "type": "local",
      "command": ["npx", "-y", "linear-mcp"],
      "env": { "LINEAR_API_KEY": "lin_api_..." }
    }
  }
}
```

Prefer OAuth — PAT is fallback only. Do **not** use community `linear-mcp` unless asked.

---

## 2. Contact form → Linear (server-side)

The site's contact form creates a real Linear issue via a server-side API key — no MCP/OAuth needed at runtime.

```
src/components/Contact.tsx  →  POST /api/contact  →  createLinearIssue()  →  issueCreate mutation
      (client, "use client")    Next App Router route    src/lib/linear.ts      api.linear.app/graphql
```

- **Endpoint:** `src/app/api/contact/route.ts` (`export const runtime = "nodejs"`). Validates + sanitizes `{ name, email, message }` (rejects empty/oversized/invalid payloads with `400`), rate-limits 5/min per IP (`429`), then calls `createLinearIssue`. Returns `201 { ok: true, identifier }` on success (e.g. `SER-12`), `500` if Linear isn't configured, `502` if Linear fails. Never logs or returns the API key.
- **Helper:** `src/lib/linear.ts` — `createLinearIssue({ title, description, teamId, labels? })` POSTs an `issueCreate` mutation to `https://api.linear.app/graphql` with the official REST-style header `Authorization: <api key>` (Linear GraphQL accepts the raw key). Reads `LINEAR_API_KEY` from `process.env` **at request time only**, so it never crashes a build. Returns a typed `{ ok: true, identifier } | { ok: false, error }`. No new npm deps — global `fetch`.
- **Client:** `src/components/Contact.tsx` shows loading, inline validation, honeypot, and the created Linear identifier on success.

### Getting a Linear API key

1. Open https://linear.app/settings/api
2. Create a **Personal API key** (e.g. `lin_api_...`). Scope it to the `SER` workspace team that owns these issues.
3. Add it to `.env.local` (never commit it — `.env*` is gitignored).

### Required env vars (read at request time)

| Variable | Purpose |
|----------|---------|
| `LINEAR_API_KEY` | Personal API key for `api.linear.app/graphql`. Missing → form returns `500`. |
| `LINEAR_TEAM_ID` | Team identifier for created issues (e.g. `SER`, from `https://linear.app/<workspace>/team/<TEAM_ID>`). Missing → form returns `500`. |

Copy `.env.example` → `.env.local` to configure locally. Full API contract and curl tests: `docs/FORMS_LINEAR.md`.

---

## 3. Create flow (AI or human)

### Step 1 — Linear (official MCP)

In opencode, prompt:

```
use linear skill — create SER issue for <title>
```

AI calls:

```
linear_create_issue({
  title: "feat(ui): consume @bytecats/ui-kit ...",
  description: "GitHub: #Y (to fill after step 2)\nWorktree: /tmp/wt-ui-kit\n...",
  teamId: "SER",
  projectId: "<Seridian Site Refresh id via linear_list_projects>",
  labelIds: ["<track:ui-kit id>"],
  priority: 2
})
```

→ returns `SER-5` with URL `https://linear.app/seridian/issue/SER-5`.

You can also call the MCP tool directly if opencode exposes `linear_create_issue`.

### Step 2 — Mirror to GitHub Issue

```bash
gh issue create \
  --title "feat(ui): consume @bytecats/ui-kit" \
  --label "track:ui-kit,type:feature" \
  --body "$(cat <<'EOF'
Linear: SER-5 — https://linear.app/seridian/issue/SER-5
Track: track:ui-kit
Worktree: /tmp/wt-ui-kit (feature/ui-kit)

Acceptance:
- [ ] bun run lint passes
- [ ] bunx tsc --noEmit passes
- [ ] bun run build succeeds
EOF
)"
# → GitHub #Y (e.g. #5)
```

Then update Linear description to include `GitHub: #5` and worktree path:

```
linear_update_issue({ id: "SER-5", description: "GitHub: #5\nWorktree: /tmp/wt-ui-kit\n..." })
```

### Step 3 — Worktree per issue

```bash
git worktree add /tmp/wt-ui-kit -b feature/ui-kit main
# or for this workflow track:
git worktree add /tmp/wt-linear -b feature/linear-sync main
```

Branch naming: `feature/<slug>` — maps 1:1 to `SER-X` and `#Y`. See skill's table:

```
feature/ui-kit      → SER-1 → #1
feature/webgl       → SER-2 → #2
feature/fonts       → SER-3 → #3
feature/linear-sync → SER-4 → #4
```

### Step 4 — Build (bun-only!)

```bash
bun install --frozen-lockfile
bun run lint
bunx tsc --noEmit
bun run build
```

No `npm`, `yarn`, or `pnpm`. CI (`pr.yml`) enforces `oven-sh/setup-bun@v2`.

### Step 5 — PR

```bash
gh pr create \
  --head feature/ui-kit --base main \
  --title "feat(ui): consume @bytecats/ui-kit" \
  --body "$(cat <<'EOF'
Fixes #5
Linear: SER-5 — https://linear.app/seridian/issue/SER-5
Worktree: /tmp/wt-ui-kit

Bun-only: lint/typecheck/build passed.
EOF
)"
```

**PR body must contain both:**

- `Linear: SER-X` (with full URL if possible)
- `Fixes #Y` (so GitHub auto-closes the mirrored issue)

The updated `PULL_REQUEST_TEMPLATE.md` has dedicated fields for Linear issue, GitHub issue, and Worktree.

### Step 6 — Sync on merge

- GitHub auto-closes `#Y` when PR merges (via `Fixes #Y`).
- Linear: move `SER-X` → **Done** (`linear_update_issue({ id: "SER-X", stateId: "<Done>" })`) or via Linear comment bot. Optionally add `linear_create_comment({ issueId: "SER-X", body: "Merged PR #Z — built with bun" })`.
- CI bot (`linear-sync.yml` + `pr.yml`) posts `ci:passed` label and comments back to issue.

---

## 4. Issue templates & labels

- `.github/ISSUE_TEMPLATE/bug.yml` — bug report (requires Linear link, track, worktree)
- `.github/ISSUE_TEMPLATE/feature.yml` — feature (same)
- `.github/ISSUE_TEMPLATE/track.yml` — track task with fields: **track** (`ui-kit/webgl/fonts/workflow`), **Linear issue link**, **worktree path**, **acceptance criteria**
- `.github/ISSUE_TEMPLATE/config.yml` — disables blank issues, points to Linear
- `.github/labels.yml` — syncs Linear labels (`track:ui-kit`, `track:webgl`, `track:fonts`, `track:workflow`, `ci:passed`, etc.). Sync via `gh` or `github-label-sync`.
- `.github/workflows/linear-sync.yml` — on `issues:labeled` comments the Linear link (stub; uses `gh` cli + Linear MCP notes; official MCP only). Keep bun-only (`oven-sh/setup-bun`, `bun --version`).

---

## 5. Using the linear skill in opencode

From any worktree:

```
use linear skill — list SER issues for Seridian Site Refresh
use linear skill — create SER-6 for footer polish (track:workflow)
use linear skill — update SER-5 to In Review
```

The linear skill (`~/.config/opencode/skills/linear/SKILL.md`) wires the OAuth flow and documents `linear_create_issue`, `linear_update_issue`, `linear_list_issues`, `linear_create_comment`, `linear_list_projects`.

If opencode doesn't show the `linear` tools, restart it after editing `opencode.json` and verify network reaches `https://mcp.linear.app/sse`.

---

## 6. Troubleshooting

- **OAuth `invalid_redirect_uri`** — don't add trailing slash to callback; retry auth.
- **No tools listed** — restart opencode, check `npx -y mcp-remote https://mcp.linear.app/sse` reaches network.
- **Want PAT fallback** — see §1; set `LINEAR_API_KEY=lin_api_...` and add `linear-pat` server.
- **Bun-only enforcement** — CI fails if `package-lock.json` appears; never run `npm install`.

---

## 7. References

- Skill: `~/.config/opencode/skills/linear/SKILL.md`
- UI kit: `@bytecats/ui-kit` vendored at `vendor/ui-kit/` (see `docs/UI_KIT.md`)
- PR workflow: `.github/workflows/pr.yml` (bun-only)
- PR template: `.github/PULL_REQUEST_TEMPLATE.md` (requires Linear + GitHub links)
