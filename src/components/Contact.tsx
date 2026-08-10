import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Separator,
  Textarea,
} from "@bytecats/ui-kit";

export function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Card className="relative overflow-hidden rounded-2xl border-seridian-500/20 bg-gradient-to-br from-slate-850 to-slate-925 p-0">
          <div className="glow-orb absolute -right-32 -top-32 h-96 w-96" />
          <div className="glow-orb absolute -bottom-32 -left-32 h-96 w-96" />

          <CardContent className="relative grid gap-12 p-8 md:p-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-seridian-400">
                Contact
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Let&apos;s talk about your next project
              </h2>
              <p className="mt-4 leading-relaxed text-slate-400">
                Whether you&apos;re planning a cloud migration, building a new product,
                or need an experienced technical partner — reach out for a no-obligation
                conversation about how Seridian can help.
              </p>

              <Separator className="my-8 bg-white/5" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <svg className="h-5 w-5 text-seridian-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href="mailto:hello@seridian.dev" className="transition-colors hover:text-seridian-400">
                    hello@seridian.dev
                  </a>
                </div>
              </div>
            </div>

            <form
              className="space-y-5"
              action="mailto:hello@seridian.dev"
              method="POST"
              encType="text/plain"
            >
              <div>
                <Label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600 focus-visible:border-seridian-500/50 focus-visible:ring-seridian-500/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600 focus-visible:border-seridian-500/50 focus-visible:ring-seridian-500/50"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <Label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-300">
                  How can we help?
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full resize-none border-white/10 bg-slate-950/50 text-white placeholder:text-slate-600 focus-visible:border-seridian-500/50 focus-visible:ring-seridian-500/50"
                  placeholder="Tell us about your project or challenge..."
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg bg-seridian-500 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-seridian-400 h-auto"
              >
                Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
