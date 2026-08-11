"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { IssueCard } from "./IssueCard";
import { cn } from "@/lib/utils";

type Issue = Doc<"issues">;
type Status = Issue["status"];

const COLUMNS: { key: Status; label: string; headerColor: string }[] = [
  {
    key: "backlog",
    label: "Backlog",
    headerColor: "border-t-slate-500/40",
  },
  {
    key: "todo",
    label: "Todo",
    headerColor: "border-t-slate-400/60",
  },
  {
    key: "in_progress",
    label: "In Progress",
    headerColor: "border-t-yellow-500/60",
  },
  {
    key: "in_review",
    label: "In Review",
    headerColor: "border-t-blue-500/60",
  },
  {
    key: "done",
    label: "Done",
    headerColor: "border-t-green-500/60",
  },
];

interface KanbanBoardProps {
  onIssueClick?: (issueId: Id<"issues">) => void;
}

export function KanbanBoard({ onIssueClick }: KanbanBoardProps) {
  const issues = useQuery(api.issues.list, {});
  const clients = useQuery(api.clients.list, {});

  const clientMap = useMemo(() => {
    return new Map<Id<"clients">, string>(
      (clients ?? []).map((c: Doc<"clients">) => [c._id, c.name]),
    );
  }, [clients]);

  const issuesByStatus = useMemo(() => {
    if (!issues) return {} as Record<Status, Issue[]>;
    const grouped: Record<Status, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    for (const issue of issues) {
      grouped[issue.status].push(issue);
    }
    for (const key of Object.keys(grouped) as Status[]) {
      grouped[key].sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [issues]);

  return (
    <div className="flex h-[calc(100vh-14rem)] sm:h-[calc(100vh-12rem)] gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      {COLUMNS.map((column) => {
        const columnIssues = issuesByStatus[column.key] ?? [];

        return (
          <div
            key={column.key}
            className="flex w-[260px] min-w-[260px] sm:w-[280px] sm:min-w-[280px] flex-col"
          >
            <div
              className={cn(
                "flex items-center justify-between border-t-2 bg-transparent px-1 pb-3 pt-3",
                column.headerColor,
              )}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-400">
                  {column.label}
                </h3>
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/5 px-1.5 text-[11px] font-medium text-slate-500 tabular-nums">
                  {issues === undefined ? "—" : columnIssues.length}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5">
              {issues === undefined ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[72px] animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.02]"
                    />
                  ))}
                </div>
              ) : columnIssues.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-xs text-slate-600">
                  No issues
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    clientName={
                      issue.clientId
                        ? clientMap.get(issue.clientId) ?? undefined
                        : undefined
                    }
                    onClick={onIssueClick}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
