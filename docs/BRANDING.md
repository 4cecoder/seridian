# Seridian Branding Kit

Complete visual identity reference for designers and developers.

---

## Logo

### "S" Monogram Mark

The Seridian mark is a stylized "S" — a continuous, flowing form that suggests connectivity, motion, and infrastructure pipelines. It's rendered as an animated video (`/assets/images/Can_you_make_a_video_of_that_a.mp4`) in the header, giving it a living, dynamic quality.

**Characteristics:**
- Single continuous stroke forming the letter "S"
- No serifs — clean, modern, geometric feel
- Conveys flow, continuity, and technical precision
- Works at small sizes (36×36px in header) and large (hero sections)

### Usage Guidelines

| Context | Treatment |
|---------|-----------|
| **Header** | 36×36px container, `rounded-lg`, object-contain. Always paired with "Seridian" wordmark. |
| **Favicon** | Not yet implemented — use `src/app/icon.tsx` route. |
| **Dark backgrounds** | Default. Logo is designed for dark contexts. |
| **Light backgrounds** | Ensure sufficient contrast; use `filter: brightness(0)` for dark-on-light. |
| **Animated** | Prefer the MP4 loop (autoplay, loop, muted, playsInline). Static fallback: use the "S" shape as SVG. |
| **Minimum size** | 24×24px. Below this, legibility degrades. |

**Do:**
- Keep clear space around the mark (minimum 8px padding at standard sizes)
- Pair with the "Seridian" wordmark in `font-display` (Space Grotesk)
- Use the animated version when possible for brand differentiation

**Don't:**
- Stretch, distort, or rotate the mark
- Apply drop shadows or bevels
- Place on busy/low-contrast backgrounds without sufficient padding
- Recolor the mark (keep original gradient/colors)

---

## Colors

### Seridian Palette

All colors are defined in `src/app/globals.css` via `@theme` and CSS custom properties.

#### Primary — Seridian Cyan

| Token | Hex | Usage |
|-------|-----|-------|
| `seridian-50` | `#ecfeff` | Lightest tint — hover states, highlights |
| `seridian-100` | `#cffafe` | Light tint — text on dark backgrounds |
| `seridian-200` | `#a5f3fc` | Subtle highlights, gradient endpoints |
| `seridian-300` | `#67e8f9` | Secondary text on dark, badge text |
| `seridian-400` | `#22d3ee` | Active states, hover backgrounds, icons |
| **`seridian-500`** | **`#06b6d4`** | **Primary brand color — buttons, accents, links** |
| `seridian-600` | `#0891b2` | Pressed states, darker accent |
| `seridian-700` | `#0e7490` | Deep accent, borders on hover |
| `seridian-800` | `#155e75` | Muted accent backgrounds |
| `seridian-900` | `#164e63` | Darkest tint — subtle backgrounds |

#### Backgrounds — Dark Navy Scale

| Token | Hex | CSS Variable | Role |
|-------|-----|--------------|------|
| `slate-950` | `#070b14` | `--astryx-color-background-body` | Page background, body |
| `slate-925` | `#0c1222` | `--astryx-color-background-card` | Card backgrounds, popover surfaces |
| `slate-850` | `#172033` | `--astryx-color-background-surface` | Elevated surfaces, muted backgrounds |

#### Surfaces & Overlays

| Color | Hex/Value | Usage |
|-------|-----------|-------|
| White 5% | `rgba(255,255,255,0.05)` | Borders, subtle dividers |
| White 10% | `rgba(255,255,255,0.1)` | Stronger borders, icon buttons |
| Cyan 10% | `rgba(6,182,212,0.1)` | Badge backgrounds, icon containers |
| Cyan 15% | `rgba(6,182,212,0.15)` | Muted accent backgrounds, priority badges |
| Cyan 20% | `rgba(6,182,212,0.2)` | Border accents, hover states |

#### Text Colors

| Token | Hex/Value | Role |
|-------|-----------|------|
| Primary | `#e2e8f0` (dark) / `#171717` (light) | Headings, body text |
| Secondary | `#94a3b8` (dark) / `#737373` (light) | Descriptions, secondary info |
| White | `#ffffff` | Emphasis, badges, CTAs on cyan |
| Slate-950 | `#070b14` | Text on primary buttons (dark on cyan) |

#### Priority Colors

| Priority | Background | Text | Border | Hex |
|----------|------------|------|--------|-----|
| Urgent | `bg-red-500/15` | `text-red-400` | `border-red-500/20` | `#ef4444` |
| High | `bg-orange-500/15` | `text-orange-400` | `border-orange-500/20` | `#f97316` |
| Medium | `bg-yellow-500/15` | `text-yellow-400` | `border-yellow-500/20` | `#eab308` |
| Low | `bg-blue-500/15` | `text-blue-400` | `border-blue-500/20` | `#3b82f6` |
| None | `bg-slate-500/15` | `text-slate-400` | `border-slate-500/20` | `#64748b` |

**Pattern:** All priority badges use `15%` opacity background, `400` weight text, and `20%` opacity border. This ensures consistent visual weight across the scale.

---

## Typography

### Font Stack

| Role | Font | CSS Variable | Weight Range | Tailwind Utility |
|------|------|--------------|--------------|------------------|
| Display / Headings | Space Grotesk | `--font-space-grotesk` | 600–700 | `font-display`, `font-heading` |
| Body / UI | Inter | `--font-body` | 400–500 | `font-sans` (default) |
| Code / Mono | JetBrains Mono | `--font-jetbrains-mono` | 400–500 | `font-mono` |

### Type Scale

| Element | Size (mobile → desktop) | Weight | Font | Line Height |
|---------|------------------------|--------|------|-------------|
| `h1` | `text-4xl` → `text-6xl` | `font-bold` (700) | `font-display` | `leading-tight` → `leading-[1.1]` |
| `h2` | `text-3xl` → `text-4xl` | `font-bold` (700) | `font-display` | `tracking-tight` |
| `h3` | `text-xl` → `text-xl` | `font-semibold` (600) | `font-display` | — |
| Body | `text-base` → `text-lg` | `font-normal` (400) | `font-sans` | `leading-relaxed` |
| Small | `text-sm` | `font-normal` (400) | `font-sans` | `leading-relaxed` |
| Micro | `text-xs` | `font-normal` (400) | `font-sans` | — |
| Mono badge | `text-sm` | `font-medium` (500) | `font-mono` | — |

### Usage Patterns

```tsx
// Hero heading
<h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl md:leading-[1.1]">

// Section title
<h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">

// Card title
<h3 className="font-display text-lg font-semibold text-white">

// Body paragraph
<p className="text-lg leading-relaxed text-slate-400 md:text-xl">

// Badge / label
<span className="font-mono text-sm font-medium uppercase tracking-wider text-seridian-400">

// Stat value
<div className="font-display text-lg font-semibold text-seridian-400">
```

---

## Spacing

### Border Radius Patterns

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 0.5rem (8px) | Buttons, inputs, mobile menu toggle, logo container |
| `rounded-xl` | 0.75rem (12px) | Issue cards, stat cards, icon containers |
| `rounded-2xl` | 1rem (16px) | Service cards, contact card, major containers |
| `rounded-full` | 9999px | Badges (pill shape), avatar circles, status dots |

**Rule:** Larger containers get larger radius. Cards that hold substantial content use `rounded-2xl`. Interactive elements (buttons, inputs) use `rounded-lg`. Badges and pills use `rounded-full`.

### Gap Patterns

| Context | Gap | Tailwind |
|---------|-----|----------|
| Grid cards (services) | 2rem | `gap-8` |
| Flex row buttons | 1rem | `gap-4` |
| Inline badge items | 0.5rem | `gap-2` |
| Section padding | 6rem | `py-24` |
| Container horizontal | 1.5rem | `px-6` |
| Max width | 72rem | `max-w-6xl` |
| Card internal | 1.5rem | `p-6` |
| Card internal (large) | 2rem–4rem | `p-8` → `md:p-16` |

### Layout Grid

```
max-w-6xl (72rem / 1152px) — main container
├── Hero: single column, centered (max-w-3xl inner)
├── Services: 3-col grid (lg:grid-cols-3), gap-8
├── Approach: 2-col grid (lg:grid-cols-2), gap-16
├── Contact: 2-col grid (lg:grid-cols-2), gap-12
└── Stats: 3-col grid (sm:grid-cols-3), gap-6
```

---

## Components

### Buttons

#### Primary Button (Cyan)

```tsx
<Button
  className="rounded-lg bg-seridian-500 px-8 py-3.5 text-sm font-semibold text-slate-950 hover:bg-seridian-400"
>
  Schedule a consultation
</Button>
```

| Property | Value |
|----------|-------|
| Background | `bg-seridian-500` (`#06b6d4`) |
| Text | `text-slate-950` (`#070b14`) — dark text on cyan |
| Hover | `hover:bg-seridian-400` (`#22d3ee`) — lighter on hover |
| Radius | `rounded-lg` (8px) |
| Padding (lg) | `px-8 py-3.5` |
| Padding (sm) | `px-4 py-2` |
| Font | `text-sm font-semibold` |
| Height | Auto — `h-auto` with explicit padding |
| Disabled | `disabled:cursor-not-allowed disabled:opacity-60` |

#### Outline Button

```tsx
<Button
  variant="outline"
  className="rounded-lg border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
>
  Explore services
</Button>
```

| Property | Value |
|----------|-------|
| Background | `bg-white/5` (very subtle) |
| Border | `border-white/10` |
| Text | `text-white` |
| Hover | `hover:bg-white/10` — slightly brighter |
| Radius | `rounded-lg` |

#### Ghost Button (Icon)

```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
>
  {/* hamburger / close icon */}
</Button>
```

#### Button Sizes

| Size | Classes | Use Case |
|------|---------|----------|
| `lg` | `px-8 py-3.5 text-sm` | Hero CTAs, form submit |
| `sm` | `px-4 py-2 text-sm` | Header nav CTA |
| `icon` | `h-10 w-10` | Icon-only buttons |

---

### Cards

#### Standard Card

```tsx
<Card className="card-glow rounded-2xl border-white/5 bg-slate-850/30 p-8 transition-all hover:border-seridian-500/20">
  <CardHeader>
    <CardTitle className="font-display text-xl font-semibold text-white">
      Card Title
    </CardTitle>
    <CardDescription className="text-sm leading-relaxed text-slate-400">
      Description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

| Property | Value |
|----------|-------|
| Background | `bg-slate-850/30` (translucent `#172033`) |
| Border | `border-white/5` → `hover:border-seridian-500/20` |
| Radius | `rounded-2xl` (16px) |
| Padding | `p-8` |
| Shadow | `card-glow` class (see below) |

#### Card Glow Effect

```css
.card-glow {
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.08),
    0 4px 24px rgba(0, 0, 0, 0.4);
}

.card-glow:hover {
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.2),
    0 8px 32px rgba(6, 182, 212, 0.1),
    0 4px 24px rgba(0, 0, 0, 0.4);
}
```

Creates a subtle cyan ring on hover that intensifies, paired with a dark drop shadow.

#### Card Variants

| Variant | Background | Border | Use |
|---------|------------|--------|-----|
| Standard | `bg-slate-850/30` | `border-white/5` | Service cards, approach steps |
| Compact | `bg-slate-850/50` | `border-white/5` | Stat cards, small items |
| Dark | `bg-[#0c1222]/80` | `border-white/[0.06]` | Issue cards, kanban |
| Featured | `bg-slate-925` + gradient | `border-seridian-500/20` | Contact section |

---

### Badges

#### Standard Badge

```tsx
<Badge
  variant="secondary"
  className="border-seridian-500/20 bg-seridian-500/10 text-seridian-400 uppercase tracking-wider"
>
  Services
</Badge>
```

| Property | Value |
|----------|-------|
| Background | `bg-seridian-500/10` (10% cyan) |
| Border | `border-seridian-500/20` (20% cyan) |
| Text | `text-seridian-400` (`#22d3ee`) |
| Radius | `rounded-full` (pill) |
| Font | `font-mono text-sm uppercase tracking-wider` |

#### Badge Variants

| Variant | Classes | Use |
|---------|---------|-----|
| Section label | `bg-seridian-500/10 text-seridian-400 uppercase tracking-wider` | Section headers |
| Outline | `border-seridian-500/20 bg-seridian-500/5 text-seridian-300` | Inline status |
| Nav badge | `bg-seridian-500/10 text-seridian-300` | "Consulting" in header |
| Client tag | `bg-seridian-500/10 text-seridian-400` | Client name on cards |
| Label tag | `bg-white/5 text-slate-500` | Generic labels |

#### Priority Badge

```tsx
<span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded border px-1 text-[10px] font-bold tabular-nums bg-red-500/15 text-red-400 border-red-500/20">
  !!
</span>
```

---

## Decorative Classes

These utility classes are defined in `globals.css` for atmospheric effects.

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #67e8f9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Used for emphasis in hero headings: `Build and scale with <span class="gradient-text">clarity and confidence</span>`

### Grid Background

```css
.grid-bg {
  background-image:
    linear-gradient(to right, rgba(34, 211, 238, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}
```

Subtle 64px grid pattern overlay at 3% cyan opacity.

### Glow Orb

```css
.glow-orb {
  background: radial-gradient(
    circle,
    rgba(6, 182, 212, 0.15) 0%,
    rgba(6, 182, 212, 0.05) 40%,
    transparent 70%
  );
}
```

Large radial glow — used as decorative background element. Typical size: `h-[600px] w-[800px]`.

### Selection

```css
::selection {
  background-color: color-mix(in srgb, #22d3ee 30%, transparent);
  color: white;
}
```

Text selection uses 30% cyan with white text.

---

## Quick Reference

### Spacing Tokens (Tailwind)

| Token | Value | Common Use |
|-------|-------|------------|
| `p-0` | 0 | CardContent reset |
| `p-3` | 0.75rem | Compact cards |
| `p-6` | 1.5rem | Standard cards |
| `p-8` | 2rem | Large cards, padding |
| `px-6` | 1.5rem | Container padding |
| `py-24` | 6rem | Section vertical padding |
| `gap-2` | 0.5rem | Inline items |
| `gap-4` | 1rem | Flex rows |
| `gap-6` | 1.5rem | Grid gaps (compact) |
| `gap-8` | 2rem | Grid gaps (standard) |
| `gap-12` | 3rem | Contact form grid |
| `gap-16` | 4rem | Approach section |

### Common Patterns

```tsx
// Section wrapper
<section id="section-id" className="border-t border-white/5 bg-slate-950 py-24">

// Container
<div className="mx-auto max-w-6xl px-6">

// Section header
<div className="mx-auto max-w-2xl text-center">
  <Badge variant="secondary" className="...uppercase tracking-wider">
    Label
  </Badge>
  <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
    Title
  </h2>
  <p className="mt-4 text-slate-400">Description</p>
</div>

// Icon container
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-seridian-500/10 text-seridian-400">
  {/* icon */}
</div>

// Status dot
<span className="h-1.5 w-1.5 rounded-full bg-seridian-400" />
```

---

## Theme Support

Seridian uses Astryx's `light-dark()` CSS function for theme switching. The body respects `prefers-color-scheme` by default.

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| `background-body` | `#070b14` | `#f1f1f1` |
| `background-surface` | `#172033` | `#ffffff` |
| `background-card` | `#0c1222` | `#ffffff` |
| `text-primary` | `#e2e8f0` | `#171717` |
| `text-secondary` | `#94a3b8` | `#737373` |
| `border` | `rgba(255,255,255,0.05)` | `#ebebeb` |

**Note:** The marketing site is primarily dark-mode focused. Light mode support exists via Astryx tokens but is not the primary design target. If building light-mode features, test all color combinations for contrast compliance (WCAG AA minimum).

---

## Accessibility

- **Contrast:** Cyan (#06b6d4) on dark navy (#070b14) = 7.2:1 ratio ✓
- **Focus rings:** Use `focus-visible:border-seridian-500/50 focus-visible:ring-seridian-500/50`
- **Reduced motion:** `.webgl-hero canvas` respects `prefers-reduced-motion: reduce`
- **Screen readers:** Use `sr-only` for status text, `aria-label` on icon buttons
- **Selection:** Cyan-tinted selection with white text for readability

---

*Last updated: August 2026*
*Source of truth: `src/app/globals.css` + `vendor/ui-kit/`*
