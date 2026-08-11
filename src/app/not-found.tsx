import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-950">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="glow-orb animate-pulse-glow absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="animate-fade-in-up relative z-10 mx-auto max-w-lg px-6 text-center">
        {/* 404 number */}
        <h1 className="font-display text-[8rem] font-bold leading-none tracking-tight text-white md:text-[10rem]">
          <span className="gradient-text">404</span>
        </h1>

        {/* Divider line */}
        <div className="mx-auto my-6 h-px w-24 bg-gradient-to-r from-transparent via-seridian-500/40 to-transparent" />

        {/* Message */}
        <p className="text-lg text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-seridian-500 px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-seridian-400"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Go home
        </Link>
      </div>
    </section>
  );
}
