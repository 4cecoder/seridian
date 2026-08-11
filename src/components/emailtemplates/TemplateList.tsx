"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { Badge, Button, Skeleton } from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

type EmailTemplate = Doc<"emailTemplates">;

const categoryConfig: Record<string, { color: string; label: string }> = {
  proposal: {
    color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    label: "Proposal",
  },
  invoice: {
    color: "bg-green-500/15 text-green-400 border-green-500/20",
    label: "Invoice",
  },
  follow_up: {
    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    label: "Follow Up",
  },
  welcome: {
    color: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    label: "Welcome",
  },
  custom: {
    color: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    label: "Custom",
  },
};

interface TemplateListProps {
  onEdit?: (templateId: Id<"emailTemplates">) => void;
  onAdd?: () => void;
}

function TemplateCard({
  template,
  onEdit,
}: {
  template: EmailTemplate;
  onEdit?: (id: Id<"emailTemplates">) => void;
}) {
  const category = categoryConfig[template.category] ?? categoryConfig.custom;

  return (
    <button
      type="button"
      onClick={() => onEdit?.(template._id)}
      className={cn(
        "group w-full text-left rounded-lg border border-white/[0.06] bg-[#0c1222]/80 p-4",
        "transition-all duration-150",
        "hover:border-seridian-500/20 hover:bg-[#0c1222]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white">
          {template.name}
        </h4>
        <Badge
          variant="secondary"
          className={cn("shrink-0 text-[10px] px-1.5 py-0", category.color)}
        >
          {category.label}
        </Badge>
      </div>

      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
        {template.subject}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-600">
          {template.variables.length} variable
          {template.variables.length !== 1 ? "s" : ""}
        </span>
        <span className="text-[11px] text-slate-600">
          {new Date(template.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </button>
  );
}

export function TemplateList({ onEdit, onAdd }: TemplateListProps) {
  const templates = useQuery(api.emailTemplates.list, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Email Templates</h2>
          <p className="text-sm text-slate-500">
            {templates === undefined
              ? "Loading..."
              : `${templates.length} template${templates.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button type="button" size="sm" onClick={onAdd}>
          + New Template
        </Button>
      </div>

      {templates === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-sm text-slate-600">
          No templates yet. Create your first email template to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
