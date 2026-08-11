import { Card, CardContent } from "@bytecats/ui-kit";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We start by understanding your business context, current systems, constraints, and goals. No assumptions — just clarity on where you are and where you want to go.",
  },
  {
    number: "02",
    title: "Architect",
    description:
      "Together we design a pragmatic roadmap. Whether it's a cloud migration plan, application architecture, or platform strategy, every recommendation is grounded in your reality.",
  },
  {
    number: "03",
    title: "Deliver",
    description:
      "We roll up our sleeves and execute alongside your team. Hands-on implementation, knowledge transfer, and documentation ensure lasting impact beyond the engagement.",
  },
  {
    number: "04",
    title: "Evolve",
    description:
      "Technology never stands still. We help you iterate, optimize, and adapt as your organization grows — building systems and practices that scale with you.",
  },
];

export function Approach() {
  return (
    <section id="approach" className="border-t border-white/5 bg-slate-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div>
            <p className="font-mono text-sm font-medium uppercase tracking-wider text-seridian-400">
              Our Approach
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Practical consulting, not slide decks
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Seridian is built on the belief that great consulting means rolling up
              your sleeves. We combine strategic thinking with deep technical expertise
              to deliver outcomes — not just recommendations that gather dust.
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              Every engagement is tailored. Whether you need a fractional architect for
              a few months or targeted help on a critical project, we adapt to how your
              team works best.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="card-glow flex flex-row gap-5 rounded-xl border-white/5 bg-slate-850/50 p-6 text-slate-300 ring-white/5 transition-all hover:border-seridian-500/20"
              >
                <span className="font-mono text-2xl font-bold text-seridian-500/40">{step.number}</span>
                <CardContent className="p-0">
                  <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
