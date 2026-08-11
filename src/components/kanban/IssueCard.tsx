"use client";

import { Doc, Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Issue = Doc<"issues">;

const priorityConfig: Record<
  Issue["priority"],
  { color: string; icon: string; label: string }
> = {
  urgent: {
    color: "bg-red-500/15 text-red-400 border-red-500/20",
    icon: "!!",
    label: "Urgent",
  },
  high: {
    color: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    icon: "!",
    label: "High",
  },
  medium: {
    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    icon: "~",
    label: "Medium",
  },
  low: {
    color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    icon: "↓",
    label: "Low",
  },
  none: {
    color: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    icon: "—",
    label: "None",
  },
};

interface IssueCardProps {
  issue: Issue;
  clientName?: string;
  onClick?: (issueId: Id<"issues">) => void;
}

export function IssueCard({ issue, clientName, onClick }: IssueCardProps) {
  const priority = priorityConfig[issue.priority];

  return (
    <button
      type="button"
      onClick={() => onClick?.(issue._id)}
      className={cn(
        "group w-full text-left rounded-lg border border-white/[0.06] bg-[#0c1222]/80 p-3",
        "transition-all duration-150",
        "hover:border-seridian-500/20 hover:bg-[#0c1222]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white">
          {issue.title}
        </h4>
        <span
          className={cn(
            "shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] rounded border px-1 text-[10px] font-bold tabular-nums",
            priority.color
          )}
          title={priority.label}
        >
          {priority.icon}
        </span>
      </div>

      {(clientName || issue.labels.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {clientName && (
            <span className="inline-flex items-center rounded-md bg-seridian-500/10 px-1.5 py-0.5 text-[11px] font-medium text-seridian-400">
              {clientName}
            </span>
          )}
          {issue.labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-500"
            >
              {label}
            </span>
          ))}
          {issue.labels.length > 2 && (
            <span className="text-[11px] text-slate-600">
              +{issue.labels.length - 2}
            </span>
          )}
        </div>
      )}

      {issue.assignee && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full bg-slate-700/50 flex items-center justify-center text-[9px] font-medium text-slate-400 uppercase">
            {issue.assignee.charAt(0)}
          </div>
          <span className="text-[11px] text-slate-500">{issue.assignee}</span>
        </div>
      )}
    </button>
  );
}
