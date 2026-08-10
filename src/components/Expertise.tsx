const technologies = [
  {
    category: "Cloud Platforms",
    items: ["AWS", "Azure", "Google Cloud", "DigitalOcean"],
  },
  {
    category: "Infrastructure",
    items: ["Terraform", "Pulumi", "Kubernetes", "Docker", "Helm"],
  },
  {
    category: "Languages & Frameworks",
    items: ["TypeScript", "Python", "Go", "React", "Next.js", "Node.js"],
  },
  {
    category: "Data & Messaging",
    items: ["PostgreSQL", "Redis", "MongoDB", "Kafka", "RabbitMQ"],
  },
  {
    category: "DevOps & Observability",
    items: ["GitHub Actions", "GitLab CI", "Datadog", "Grafana", "Prometheus"],
  },
  {
    category: "Security",
    items: ["IAM & RBAC", "Vault", "WAF", "SOC 2 readiness", "Zero Trust"],
  },
];

export function Expertise() {
  return (
    <section id="expertise" className="border-t border-white/5 bg-slate-925 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-sm font-medium uppercase tracking-wider text-seridian-400">
            Expertise
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Technology we work with
          </h2>
          <p className="mt-4 text-slate-400">
            Deep experience across the modern cloud and application stack.
            We choose the right tools for your context — not whatever is trending.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((group) => (
            <div
              key={group.category}
              className="card-glow rounded-xl border border-white/5 bg-slate-850/30 p-6"
            >
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-seridian-400">
                {group.category}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-white/5 bg-white/5 px-3 py-1.5 font-mono text-sm text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
