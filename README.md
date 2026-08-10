# Seridian

Professional consulting website for **Seridian** — cloud infrastructure and application development consulting.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
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

## Customization

- Update contact email in `src/components/Contact.tsx`
- Modify service offerings in `src/components/Services.tsx`
- Adjust technology tags in `src/components/Expertise.tsx`
- Edit site metadata in `src/app/layout.tsx`

## Deploy

Deploy to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or any platform that supports Next.js:

```bash
npm run build
npm start
```
