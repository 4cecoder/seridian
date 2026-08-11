import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="glow-orb animate-pulse-glow absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="animate-fade-in-up relative z-10 mx-auto max-w-lg px-6 text-center">
        {/* 404 number */}
        <h1 className="font-display text-[7rem] font-bold leading-none tracking-tight text-white md:text-[8rem]">
          <span className="gradient-text">404</span>
        </h1>

        {/* Divider line */}
        <div className="mx-auto my-5 h-px w-20 bg-gradient-to-r from-transparent via-seridian-500/40 to-transparent" />

        {/* Message */}
        <p className="text-base text-slate-400">
          This dashboard page could not be found.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-seridian-500 px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-seridian-400"
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
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}
