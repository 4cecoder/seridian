import { Badge, Card, CardContent, CardHeader, CardTitle } from "@bytecats/ui-kit";

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
          <Badge
            variant="secondary"
            className="border-seridian-500/20 bg-seridian-500/10 text-seridian-400 uppercase tracking-wider"
          >
            Expertise
          </Badge>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Technology we work with
          </h2>
          <p className="mt-4 text-slate-400">
            Deep experience across the modern cloud and application stack. We choose
            the right tools for your context — not whatever is trending.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((group) => (
            <Card
              key={group.category}
              className="card-glow rounded-xl border-white/5 bg-slate-850/30 p-6"
            >
              <CardHeader className="p-0">
                <CardTitle className="font-mono text-sm font-semibold uppercase tracking-wider text-seridian-400">
                  {group.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="rounded-md border-white/5 bg-white/5 px-3 py-1.5 font-mono text-sm text-slate-300 hover:bg-white/10"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
