# feat(ui): consume @bytecats/ui-kit (Astryx+shadcn+MagicUI) with Seridian overrides

## Summary
Replace manual shadcn scaffolding with the shared **@bytecats/ui-kit** design system (Astryx tokens + shadcn/ui primitives + Magic UI animations) via `bun` file linkage. Seridian cyan `#06b6d4` on dark `#070b14` brand is preserved by overriding Astryx accent tokens while keeping the full Astryx structure (light-dark, data-ui-theme, radius/typography/shadows). Five sections refactored to use ui-kit primitives; `src/lib/utils.ts` now re-exports `cn` from the kit; `styles.css` is imported once at the app root.

Branch: `feature/ui-kit` (from `main` @ 30b9939). Stack: bun-only, Next.js 15, Tailwind v4 (no npm).

## Installation — bun-only proof

**Command used (no npm):**
```bash
bun add "file:/Users/fource/bytecats/ui-kit" --cwd /tmp/wt-shadcn
# also verified as: bun add file:/Users/fource/bytecats/ui-kit --cwd /tmp/wt-shadcn
```

**package.json** now contains:
```json
"dependencies": {
  "@bytecats/ui-kit": "file:/Users/fource/bytecats/ui-kit",
  "next": "^15.4.6",
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

**bun.lock** entry:
```
"@bytecats/ui-kit": "file:/Users/fource/bytecats/ui-kit",
"@bytecats/ui-kit": ["@bytecats/ui-kit@file:../../../Users/fource/bytecats/ui-kit", { "dependencies": { "canvas-confetti": "^1.9.4", "class-variance-authority": "^0.7.1", "clsx": "^2.1.1", "cmdk": "^1.1.1", ... } }]
```

**dist exists (pre-built, committed as per ui-kit README):**
```
-rw-r--r-- 100610 /Users/fource/bytecats/ui-kit/dist/styles.css
-rw-r--r-- 121947 /Users/fource/bytecats/ui-kit/dist/index.cjs
-rw-r--r-- 106408 /Users/fource/bytecats/ui-kit/dist/index.js
-rw-r--r--  27216 /Users/fource/bytecats/ui-kit/dist/index.d.ts
```
`dist/` is committed so `bun add file:` works without a build step (kit README explains `prepare` is blocked by bun untrusted).

No `npm` was used; `packageManager: bun@1.4.0` enforced.

## Theming

**Import order (src/app/layout.tsx):**
```tsx
import "@bytecats/ui-kit/styles.css"; // once, at app root, BEFORE globals.css
import "./globals.css";
...
<body className="min-h-screen bg-background text-foreground antialiased">
```
This satisfies: import `styles.css` once, keep `globals.css` but thin.

**ui-kit theming model (README verified):**
- Two themes: `neutral` (default, warm grays) and `stone` (warm stone/slate). Switch via `<html data-ui-theme="stone">`.
- Dark mode is automatic via CSS `light-dark()` + `color-scheme: light dark` — no `.dark` class, no JS toggle, respects `prefers-color-scheme`.

**Seridian overrides (src/app/globals.css, after Tailwind import):**
Keeps Tailwind v4 `@theme` Seridian palette (`--color-seridian-*`, `--color-slate-850/925/950`) but adds a `:root` bridge that overrides Astryx tokens to Seridian cyan while preserving Astryx structure:

```css
:root {
  --astryx-color-accent: #06b6d4;
  --astryx-color-accent-muted: rgba(6,182,212,0.15);
  --astryx-color-on-accent: #070b14;
  --astryx-color-ring: #06b6d4;
  --color-primary: var(--astryx-color-accent);
  --color-primary-foreground: var(--astryx-color-on-accent);
  --color-ring: var(--astryx-color-accent);
  --astryx-color-background-body: light-dark(#f1f1f1, #070b14);
  --astryx-color-background-surface: light-dark(#ffffff, #172033);
  --astryx-color-background-card: light-dark(#ffffff, #0c1222);
  --astryx-color-background-muted: light-dark(#f1f1f1, #172033);
  --astryx-color-border: light-dark(#ebebeb, rgba(255,255,255,0.05));
  --astryx-color-border-emphasized: light-dark(#d4d4d4, rgba(255,255,255,0.1));
  --astryx-color-text-primary: light-dark(#171717, #e2e8f0);
}
body {
  background-color: var(--astryx-color-background-body, var(--color-slate-950));
  color: var(--astryx-color-text-primary, #e2e8f0);
}
```

Result: ui-kit components (`bg-primary`, `bg-background`, `text-foreground`, `border-border`, etc.) resolve to Seridian cyan/dark via the overridden tokens, but Astryx radius/typography/shadows and `light-dark()` dark-mode behavior remain intact.

**Preserved Seridian utilities** (adapted to use ui-kit vars where sensible, still visually identical):
`.gradient-text`, `.grid-bg`, `.glow-orb`, `.card-glow` (and hover) — all kept in `globals.css`.

**src/lib/utils.ts:**
```ts
export { cn } from "@bytecats/ui-kit";
```
Re-exports kit’s `cn` (clsx + tailwind-merge); no local duplication.

## Components Refactored

All keep **exact copy/structure** but swap raw `div`/`button`/`input`/`span` for ui-kit primitives:

| File | ui-kit primitives used | Notes |
|------|------------------------|-------|
| **Header.tsx** | `Button`, `Badge` | `Button` `asChild` for desktop/mobile CTA (now `bg-primary` → cyan), `Button` `variant="ghost"` `size="icon"` for hamburger, `Badge` `variant="secondary"` next to logo (“Consulting”) with Seridian muted style |
| **Hero.tsx** | `Button`, `Badge`, `Card`, `CardContent` | Top pill now `Badge` `variant="outline"` (`border-seridian-500/20 bg-seridian-500/5`), CTAs are `Button` (`default`/`outline` `size="lg"` mapped to cyan/white), stats are `Card`+`CardContent` with `card-glow` retained |
| **Services.tsx** | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge` | Section label now `Badge`, each service is `Card` with `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`, `card-glow` + `hover:border-seridian-500/20` retained, icon tile still Seridian cyan |
| **Approach.tsx** | `Card`, `CardContent` | Each step is `Card` (`flex flex-row` override of kit’s `flex-col`) + `CardContent`, number remains `text-seridian-500/40`, `card-glow` retained |
| **Contact.tsx** | `Card`, `CardContent`, `Input`, `Textarea`, `Button`, `Label`, `Separator` | Outer wrapper is `Card`+`CardContent` with glow orbs, `Separator` between intro/contact, form fields use `Label`+`Input`/`Textarea` with `focus-visible:border-seridian-500/50` overrides, submit is `Button` cyan |
| **Expertise.tsx** | `Badge`, `Card`, `CardHeader`, `CardTitle`, `CardContent` | Section label `Badge`, each tech group `Card`+`CardHeader`/`CardTitle`/`CardContent`, items are `Badge` `variant="secondary"` (`bg-white/5 text-slate-300`) |

Other files unchanged: `Footer.tsx` (no primitives needed), `page.tsx` (composition), `layout.tsx` (import ordering).

## Verification

All bun-only, Tailwind v4, no npm:

```
$ bun install --cwd /tmp/wt-shadcn
bun install v1.4.0-canary.1 (ae4b17de6)

+ @bytecats/ui-kit@../../../Users/fource/bytecats/ui-kit

1 package installed [3.72s]

$ bun run --cwd /tmp/wt-shadcn lint
$ next lint
`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .

✔ No ESLint warnings or errors

$ /tmp/wt-shadcn/node_modules/.bin/tsc --noEmit --project /tmp/wt-shadcn/tsconfig.json
(tsc exit:0 — no output, types clean)

$ bun run --cwd /tmp/wt-shadcn build
$ next build
   ▲ Next.js 15.5.23

   Creating an optimized production build ...
 ✓ Compiled successfully in 3.7s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/5) ...
   Generating static pages (1/5) 
   Generating static pages (2/5) 
   Generating static pages (3/5) 
 ✓ Generating static pages (5/5)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      162 B         260 kB
├ ○ /_not-found                            995 B         104 kB
└ ○ /icon                                  123 B         103 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-87552e6e05b8e3aa.js       46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.91 kB

○  (Static)  prerendered as static content
```

All four pass: `bun install`, `lint`, `tsc --noEmit`, `build`. Bundle: ~103kB shared First Load JS (expected for Next 15 + ui-kit deps). No TypeScript errors.

## Files Changed
- `package.json` + `bun.lock` — add `@bytecats/ui-kit` file linkage
- `src/app/layout.tsx` — import `@bytecats/ui-kit/styles.css` before globals, body `bg-background text-foreground`
- `src/app/globals.css` — thinned to Seridian palette + `:root` Astryx→Seridian cyan overrides + preserved utilities
- `src/lib/utils.ts` — **new**, re-exports `cn` from kit
- `src/components/Header.tsx` — Button/Badge
- `src/components/Hero.tsx` — Button/Badge/Card
- `src/components/Services.tsx` — Card/Badge
- `src/components/Approach.tsx` — Card
- `src/components/Contact.tsx` — Card/Input/Textarea/Button/Label/Separator
- `src/components/Expertise.tsx` — Badge/Card
- `PR_UI_KIT.md` — this doc

## Constraints Met
- ✅ bun-only (`bun add file:`, `bun.lock`, `packageManager bun@1.4.0`, no npm)
- ✅ Tailwind v4 (kit ships compiled `dist/styles.css`; consumer needs no Tailwind preset)
- ✅ Import `styles.css` once at root
- ✅ Seridian cyan `#06b6d4` on dark `#070b14` preserved inside Astryx token system
- ✅ No `npm` usage
