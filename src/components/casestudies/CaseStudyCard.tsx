import Link from "next/link";
import { Badge, Card, CardContent } from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";
import { Doc } from "convex/_generated/dataModel";

type CaseStudy = Doc<"caseStudies">;

interface CaseStudyCardProps {
  study: CaseStudy;
}

export function CaseStudyCard({ study }: CaseStudyCardProps) {
  return (
    <Link href={`/casestudies/${study._id}`} className="group block">
      <Card
        className={cn(
          "h-full overflow-hidden rounded-xl border-white/[0.06] bg-[#0c1222]/80",
          "transition-all duration-200",
          "hover:border-seridian-500/20 hover:bg-[#0c1222]"
        )}
      >
        {study.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={study.imageUrl}
              alt={study.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] to-transparent" />
          </div>
        )}
        <CardContent className="p-6">
          {study.industry && (
            <Badge
              variant="outline"
              className="mb-3 inline-flex items-center rounded-full border-seridian-500/20 bg-seridian-500/5 px-2.5 py-0.5 text-[11px] text-seridian-400"
            >
              {study.industry}
            </Badge>
          )}
          <h3 className="font-display text-lg font-semibold text-white group-hover:text-seridian-300 transition-colors">
            {study.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
            {study.summary}
          </p>
          {study.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {study.technologies.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-500"
                >
                  {tech}
                </span>
              ))}
              {study.technologies.length > 5 && (
                <span className="inline-flex items-center rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  +{study.technologies.length - 5}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
