# Linear + GitHub Tandem Workflow (Seridian)

> **Principle:** One Linear issue = one GitHub Issue = one worktree = one PR. Linear is source of truth for product planning; GitHub Issues make that work visible to CI/review without losing Linear.

Project: **Seridian Site Refresh** (team `SER`, tracks `track:ui-kit` / `track:webgl` / `track:fonts` / `track:workflow`).

---

## 1. Official Linear MCP only

This repo uses **only** the official Linear MCP server:

```
https://mcp.linear.app/sse  via mcp-remote
```

`mcp-remote` command (from `/Users/fource/.config/opencode/skills/linear/SKILL.md`):

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

## 2. Create flow (AI or human)

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

## 3. Issue templates & labels

- `.github/ISSUE_TEMPLATE/bug.yml` — bug report (requires Linear link, track, worktree)
- `.github/ISSUE_TEMPLATE/feature.yml` — feature (same)
- `.github/ISSUE_TEMPLATE/track.yml` — track task with fields: **track** (`ui-kit/webgl/fonts/workflow`), **Linear issue link**, **worktree path**, **acceptance criteria**
- `.github/ISSUE_TEMPLATE/config.yml` — disables blank issues, points to Linear
- `.github/labels.yml` — syncs Linear labels (`track:ui-kit`, `track:webgl`, `track:fonts`, `track:workflow`, `ci:passed`, etc.). Sync via `gh` or `github-label-sync`.
- `.github/workflows/linear-sync.yml` — on `issues:labeled` comments the Linear link (stub; uses `gh` cli + Linear MCP notes; official MCP only). Keep bun-only (`oven-sh/setup-bun`, `bun --version`).

---

## 4. Using the linear skill in opencode

From any worktree:

```
use linear skill — list SER issues for Seridian Site Refresh
use linear skill — create SER-6 for footer polish (track:workflow)
use linear skill — update SER-5 to In Review
```

The skill at `/Users/fource/.config/opencode/skills/linear/SKILL.md` wires the OAuth flow and documents `linear_create_issue`, `linear_update_issue`, `linear_list_issues`, `linear_create_comment`, `linear_list_projects`.

If opencode doesn't show the `linear` tools, restart it after editing `opencode.json` and verify network reaches `https://mcp.linear.app/sse`.

---

## 5. Troubleshooting

- **OAuth `invalid_redirect_uri`** — don't add trailing slash to callback; retry auth.
- **No tools listed** — restart opencode, check `npx -y mcp-remote https://mcp.linear.app/sse` reaches network.
- **Want PAT fallback** — see §1; set `LINEAR_API_KEY=lin_api_...` and add `linear-pat` server.
- **Bun-only enforcement** — CI fails if `package-lock.json` appears; never run `npm install`.

---

## 6. References

- Skill: `/Users/fource/.config/opencode/skills/linear/SKILL.md`
- UI kit: `/Users/fource/bytecats/ui-kit/README.md`
- PR workflow: `.github/workflows/pr.yml` (bun-only)
- PR template: `.github/PULL_REQUEST_TEMPLATE.md` (requires Linear + GitHub links)
