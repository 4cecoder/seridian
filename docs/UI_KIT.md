# Seridian × @bytecats/ui-kit

Seridian consumes the private **@bytecats/ui-kit**, vendored into `vendor/ui-kit/`. The kit itself combines **shadcn/ui** (component layer) + **Meta Astryx tokens** (design-token layer) + **Magic UI** (animated effects), shipped as **compiled CSS + JS** — consumers don't need Tailwind installed.

> Token provenance: values in the kit's `src/styles/globals.css` are copied verbatim from `dist/theme.css` of `@astryxdesign/theme-neutral@0.1.7` and `@astryxdesign/theme-stone@0.1.7` (also `@astryxdesign/core@0.1.7` spacing). See kit README "Where the token values come from" — pulled via `npm pack`, not docs.

---

## Install (bun-only)

The kit is **prebuilt and vendored** at `vendor/ui-kit/` (committed `dist/`), consumed via a
relative `file:` dependency in `package.json` (`file:./vendor/ui-kit`) — no install step needed.
Absolute `file:` paths break CI/Netlify, so keep the vendored relative path.

```bash
# rebuild the kit from its own repo if you change kit source, then re-vendor here:
bun run build   # (in the ui-kit repo) → dist/styles.css + dist/index.js

# or consume directly from the private repo:
bun add "git+ssh://git@github.com/4cecoder/ui-kit.git"
```

No `npm`, no `shadcn add` by hand — the kit **is** the shadcn/ui source, themed with Astryx.

---

## Import (once, at root)

```tsx
// src/app/layout.tsx — import order matters: kit styles before app globals
import "@bytecats/ui-kit/styles.css"; // compiled Tailwind v4 sheet — base + tokens + component utilities
import "./globals.css";                // Seridian overrides (cyan etc.)

import { Button, Card, CardHeader, CardTitle, Badge, Input } from "@bytecats/ui-kit";
```

Only import `styles.css` **once**. The kit ships compiled CSS so Seridian doesn't need to run Tailwind for the kit.

---

## Override Seridian cyan

Seridian brand is **cyan** (`#06b6d4` / `#22d3ee`), while the kit defaults are Astryx `neutral`/`stone`. Override in `src/app/globals.css` via CSS variables (as done in the `feature/ui-kit` branch `aa4668b`):

```css
/* src/app/globals.css — after @import "tailwindcss" */
@theme {
  --color-seridian-500: #06b6d4;
  --color-seridian-400: #22d3ee;
  /* ... full scale in globals.css */
}

/* Override Astryx accent that the kit uses for primary buttons etc. */
:root {
  --astryx-color-accent: #06b6d4;
  --astryx-color-accent-foreground: #ffffff;
}

/* Or scope to a wrapper: */
.seridian-theme {
  --astryx-color-accent: #06b6d4;
}
```

The kit theming uses CSS variables + `color-scheme: light dark` + `light-dark()` (automatic dark mode, no `.dark` class). Switching kit theme is `data-ui-theme="stone"|"neutral"` on `<html>`. Seridian keeps the sheet and overrides `--astryx-color-accent` to cyan — no fork needed.

---

## Components Seridian uses

**Core (shadcn + Astryx tokens):** `Button`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Badge`, `Input`, `Dialog`, `DropdownMenu`, `Tabs`, `Tooltip`, `Avatar`, `Separator`, `Skeleton`, and others as needed. See kit README for full list (30+).

**Hand-built (kit-only):** `EmptyState`, `Kbd`/`KbdGroup`, `SegmentedControl`.

**Magic UI (animated):** `Marquee`, `ShimmerButton`, `AnimatedBeam`, `BentoGrid`/`BentoCard`, `BorderBeam`, `NumberTicker`, `Confetti` — `motion` + `canvas-confetti` are kit runtime deps.

For Seridian:

- **ui-kit track** (`feature/ui-kit`) — wires kit styles, `cn` re-export in `src/lib/utils.ts`, page shells with `Button`/`Card`/`Badge`.
- **webgl track** — no kit component needed; hero is vanilla WebGL2 (`WebGLHero.tsx`) with cyan `06b6d4/22d3ee` shader, 4KB gz, `prefers-reduced-motion` fallback.
- **fonts track** — `next/font/google` `Space_Grotesk` / `Inter` / `JetBrains_Mono` with `variable` + `display:swap`, `@theme inline` in `globals.css`.

Add more kit components as needed:

```bash
bunx shadcn@latest add <component>   # in the kit repo
# then re-export in src/index.ts and rebuild the kit (dist/styles.css + dist/index.js)
```

---

## Tailwind 4 note

Seridian and the kit both use **Tailwind 4** (`@tailwindcss/postcss`). Kit build compiles `src/styles/globals.css` → `dist/styles.css` via Tailwind CLI. Consumers don't need `@tailwindcss/postcss` for the kit, but Seridian itself keeps it for `src/app/globals.css` (`@import "tailwindcss"` + `@theme`).

---

## References

- Kit README: in the `@bytecats/ui-kit` repo (see `vendor/ui-kit/package.json`)
- Kit globals (token source comments): kit repo `src/styles/globals.css`
- Kit demo: kit repo `src/demo.tsx`
- Linear skill (tracks): `~/.config/opencode/skills/linear/SKILL.md`
