import HeroWebGL from "./HeroWebGL";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-16">
      {/* WebGL background layer — absolute, behind content, no CLS */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <HeroWebGL />
        {/* subtle grid + orb kept as low-opacity overlay for fallback/texture */}
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="glow-orb pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[800px] -translate-x-1/2 opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-seridian-500/20 bg-seridian-500/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-seridian-400" />
            <span className="text-sm text-seridian-300">
              Cloud Infrastructure & Application Development
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl md:leading-[1.1]">
            Build and scale with{" "}
            <span className="gradient-text">clarity and confidence</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Seridian partners with organizations to architect resilient cloud
            infrastructure, ship modern applications, and navigate complex
            technical decisions — so your team can focus on what matters.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="w-full rounded-lg bg-seridian-500 px-8 py-3.5 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-seridian-400 sm:w-auto"
            >
              Schedule a consultation
            </a>
            <a
              href="#services"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-8 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Explore services
            </a>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { value: "Cloud-native", label: "Architecture & migration" },
            { value: "Full-stack", label: "Application development" },
            { value: "DevOps", label: "CI/CD & automation" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-glow rounded-xl border border-white/5 bg-slate-850/50 p-6 text-center backdrop-blur-sm transition-all"
            >
              <div className="text-lg font-semibold text-seridian-400">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
