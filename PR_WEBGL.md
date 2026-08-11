# feat(webgl): immersive WebGL hero (shader gradient, reduced-motion, 2D fallback)

## Summary

Adds a lightweight, immersive WebGL hero background to `Hero.tsx` without regressing performance or CLS.
Primary implementation is **vanilla WebGL2 fragment shader** — no `three` dependency at all. Lazy chunk gzips to **~3.2 KB**; First Load JS stays at **104 kB** (Route `/` = 1.25 kB).

Branch `feature/webgl` (fork: `4cecoder/seridian`), bun-only Next.js 15.5.23 App Router, Tailwind 4, Seridian theme `#070b14`.

---

## Files

```
src/components/WebGLHero.tsx   — client component, vanilla WebGL2 shader hero (default export)
src/components/HeroWebGL.tsx   — client wrapper, dynamic-imports WebGLHero with ssr:false
src/components/Hero.tsx        — imports HeroWebGL as absolute background layer, z-0 behind content z-10
src/app/globals.css            — .webgl-hero utilities (bg #070b14, contain:strict) + reduced-motion handling
PR_WEBGL.md                    — this doc
```

**Removed:** `src/components/HeroCanvas.tsx` — dead three.js placeholder (imported nowhere; `three` was never a dependency, so nothing to uninstall). `grid-bg` + `glow-orb` preserved as low-opacity overlays (40%/60%) for texture & graceful fallback.

---

## Implementation details

### Canvas layout — no CLS
- `Hero` section keeps `bg-slate-950` (`#070b14`) so first paint has a background before the canvas hydrates.
- Background wrapper `absolute inset-0 z-0` inside `relative overflow-hidden` — intrinsic height comes from content; canvas never pushes layout (CLS 0).
- `WebGLHero` root: `pointer-events-none absolute inset-0 overflow-hidden` + `contain:strict`; canvas is `aria-hidden="true"` / `role="presentation"` (as is the wrapper). No tab stops.
- Canvas starts `opacity-0` and fades to 1 via `transition-opacity duration-700` — fixed cost, no reflow.
- `HeroWebGL` uses `dynamic(..., { ssr:false })` in a Client Component so server HTML contains no canvas markup — avoids hydration mismatch for DPR/shaders. Hero content is server-rendered, so no-JS renders full content.

### DPR & resize
- `devicePixelRatio` clamped to `2` (prevents 3x mobile memory spike).
- Size math: `wrap.getBoundingClientRect()` × dpr → `canvas.width/height` + `gl.viewport` + `u_res`.
- `ResizeObserver` on wrapper + `window.resize` listener (DPR changes on zoom/screen move). Disconnected on unmount.

### Shaders
- **Vertex**: pass-through fullscreen triangle `[-1,-1, 3,-1, -1,3]` — one draw call, no index buffer.
- **Fragment** (`#version 300 es`, `highp`):
  - Base `#070b14`, palette `#06b6d4` / `#22d3ee` / `#67e8f9`.
  - Two drifting blobs, soft flow lines, top-center orb aligned with `glow-orb`, 8 seeded drifting particles (`hash()`), vignette.
  - Single `u_time` uniform, no textures. `alpha:false` → cheaper compositing.

### Motion & lifecycle
- `prefers-reduced-motion: reduce` → one static frame (`t=0`), never starts rAF; live toggle handled via `matchMedia` listener.
- `document.visibilitychange` → `cancelAnimationFrame` when hidden, snapshot `elapsed`, resume with `start = now - elapsed*1000` (seamless).
- Unmount cleanup: cancel rAF, remove visibility/mql/resize listeners, `ResizeObserver.disconnect()`, `gl.deleteProgram`, `gl.deleteBuffer`, and `WEBGL_lose_context.loseContext()` to release GPU memory. Animation clock is `performance.now()` — no drift.

### Fallback (matured)
- No `webgl2` context → 2D canvas path (same `setupFallback2D`): fills `#070b14`, radial orb gradient, two blobs, 18 static dots; respects reduced-motion; resizes via RO.
- **Shader compile/link error** → also `setupFallback2D`. Fixed: a canvas that already holds a `webgl2` context returns `null` from `getContext("2d")`, so the old code silently rendered nothing — the fallback now swaps in a fresh canvas (attributes copied, opacity forced to 1) and wires the same RO/mql cleanup. The failed shader path also deletes its vertex shader on fragment-compile failure (no leak).

---

## Verification (all passed on this branch)

```sh
bun install --frozen-lockfile   # ✔ 324 installs / 400 packages, no changes
bun run lint                   # ✔ No ESLint warnings or errors
bunx tsc --noEmit              # ✔ exit 0
bun run build                  # ✔ Next.js 15.5.23, compiled in 3.7s
```

Build output:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    1.25 kB         104 kB
├ ○ /_not-found                            990 B         104 kB
└ ○ /icon                                  123 B         103 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-…                         46.4 kB
  ├ chunks/4bd1b…                        54.2 kB
  └ other shared chunks (total)          1.96 kB

○  (Static)  prerendered as static content
```

- Route `/` is **static**; WebGLHero chunk (`108-*.js`) is lazy-loaded (`ssr:false`) and NOT in First Load JS.
- Lazy chunk: 8.0 KB raw, **3,227 B gzipped** — well under the 5 KB budget.
- Runtime smoke test: canvas renders, `webgl2` context live at DPR 2 (2400×1807 on 1200×903 viewport), opacity fades to 1, 0 console errors; composited frames change over time (animation running); with `prefers-reduced-motion: reduce` no rAF loop is scheduled (0 frames in 1 s).

---

## Accessibility

- Decorative canvas: `aria-hidden="true"` + `role="presentation"` (canvas and wrapper) — SR ignores it; section keeps semantic `<h1>`, `<p>`, nav landmarks.
- Contrast: overlays at low opacity; text on `#070b14` remains WCAG AA.
- `prefers-reduced-motion: reduce` → static gradient (no animation, `transition:none` via CSS), particle shimmer disabled.
- `pointer-events-none` → not focusable, no tab stops.

---

## How to test locally

```sh
bun install --frozen-lockfile
bun run dev    # http://localhost:3000
# DevTools > Rendering > Emulate prefers-reduced-motion → static frame
# Switch tabs → animation pauses, resumes seamlessly
# Resize → canvas resizes with no CLS
# chrome://flags disable WebGL2 → 2D gradient fallback (also on shader error)
```

---

## Commits

```
e0d113e feat(webgl): mature hero — fix shader-error fallback, dispose GPU resources, drop dead three wrapper
a201cb8 feat(webgl): immersive WebGL hero (shader gradient, bun, reduced-motion)
```
