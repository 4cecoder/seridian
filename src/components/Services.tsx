const services = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
    title: "Cloud Infrastructure",
    description:
      "Design, deploy, and optimize cloud environments on AWS, Azure, and GCP. From greenfield architecture to legacy migration, we build infrastructure that scales with your business.",
    items: [
      "Cloud architecture & strategy",
      "Infrastructure as Code (Terraform, Pulumi)",
      "Kubernetes & container orchestration",
      "Cost optimization & FinOps",
      "Security & compliance hardening",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: "Application Development",
    description:
      "Build modern, maintainable applications with the right tools for the job. We deliver production-ready software with clean architecture and developer experience in mind.",
    items: [
      "Full-stack web applications",
      "API design & microservices",
      "Frontend & backend development",
      "Database design & optimization",
      "Performance tuning & refactoring",
    ],
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "DevOps & Platform Engineering",
    description:
      "Streamline delivery pipelines and empower your engineering teams with reliable tooling, observability, and automation that reduces friction from code to production.",
    items: [
      "CI/CD pipeline design",
      "Monitoring & observability",
      "GitOps workflows",
      "Developer platform setup",
      "Incident response & SRE practices",
    ],
  },
];

export function Services() {
  return (
    <section id="services" className="border-t border-white/5 bg-slate-925 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-sm font-medium uppercase tracking-wider text-seridian-400">
            Services
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            End-to-end technical consulting
          </h2>
          <p className="mt-4 text-slate-400">
            Whether you need a strategic advisor or hands-on engineering support,
            Seridian delivers practical solutions tailored to your stage and goals.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="card-glow group rounded-2xl border border-white/5 bg-slate-850/30 p-8 transition-all hover:border-seridian-500/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-seridian-500/10 text-seridian-400 transition-colors group-hover:bg-seridian-500/20">
                {service.icon}
              </div>
              <h3 className="font-display mt-6 text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {service.description}
              </p>
              <ul className="mt-6 space-y-2.5">
                {service.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-seridian-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
