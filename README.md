# Seridian

Professional consulting website for **Seridian** — cloud infrastructure and application development consulting.

## Getting Started

Install dependencies and run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles & theme
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Home page
└── components/
    ├── Header.tsx       # Navigation
    ├── Hero.tsx         # Hero section
    ├── Services.tsx     # Service offerings
    ├── Approach.tsx     # Consulting approach
    ├── Expertise.tsx    # Technology stack
    ├── Contact.tsx      # Contact form & CTA
    └── Footer.tsx       # Site footer
```

## Assets

Static files live in `public/` and are served from the site root:

```
public/assets/
├── images/   # Photos, hero images, backgrounds
├── icons/    # Logos, favicons, brand marks
└── fonts/    # Local font files (optional)
```

Reference them with root-relative paths, e.g. `/assets/images/hero.jpg` or:

```tsx
import Image from "next/image";

<Image src="/assets/icons/logo.svg" alt="Seridian" width={120} height={40} />
```

## Customization

- Update contact email in `src/components/Contact.tsx`
- Modify service offerings in `src/components/Services.tsx`
- Adjust technology tags in `src/components/Expertise.tsx`
- Edit site metadata in `src/app/layout.tsx`

## Links

- **Live site:** [https://seridian.netlify.app](https://seridian.netlify.app)
- **GitHub:** [https://github.com/therodfather/seridian](https://github.com/therodfather/seridian)
- **Netlify dashboard:** [https://app.netlify.com/projects/seridian](https://app.netlify.com/projects/seridian)

## Contact form (Linear)

Submissions from the contact form create issues in Linear via `POST /api/contact`. The API key must **never** be committed — configure it as a Netlify environment variable (and in `.env.local` for local dev).

| Variable | Required | Description |
|----------|----------|-------------|
| `LINEAR_API_KEY` | Yes | Personal API key from [Linear settings](https://linear.app/settings/api) |
| `LINEAR_TEAM_ID` | Yes | Team UUID (fetch with `{ teams { nodes { id key name } } }` against the GraphQL API) |

Copy `.env.example` → `.env.local` for local development.

**Netlify (production + deploy previews):**

```bash
npx netlify-cli env:set LINEAR_API_KEY "your_key" --context production --context deploy-preview
npx netlify-cli env:set LINEAR_TEAM_ID "your_team_uuid" --context production --context deploy-preview
```

Redeploy after changing env vars so they take effect on deployed builds.

## Deploy

Pushes to `main` automatically deploy via Netlify. To deploy manually from the CLI:

```bash
bunx netlify deploy --prod --build
```
