"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  Badge,
  Button,
  Skeleton,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  urgent: { color: "bg-red-500/15 text-red-400 border-red-500/20", label: "Urgent" },
  high: { color: "bg-orange-500/15 text-orange-400 border-orange-500/20", label: "High" },
  medium: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", label: "Medium" },
  low: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "Low" },
  none: { color: "bg-slate-500/15 text-slate-400 border-slate-500/20", label: "None" },
} as const;

const STATUS_CONFIG = {
  backlog: { color: "bg-slate-500/15 text-slate-400 border-slate-500/20", label: "Backlog" },
  todo: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "Todo" },
  in_progress: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", label: "In Progress" },
  in_review: { color: "bg-purple-500/15 text-purple-400 border-purple-500/20", label: "In Review" },
  done: { color: "bg-green-500/15 text-green-400 border-green-500/20", label: "Done" },
} as const;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = use(params);
  const issue = useQuery(api.issues.get, { issueId: issueId as Id<"issues"> });
  const client = useQuery(
    api.clients.get,
    issue?.clientId ? { clientId: issue.clientId } : "skip",
  );
  const clients = useQuery(api.clients.list, {});

  const updateIssue = useMutation(api.issues.update);
  const [editOpen, setEditOpen] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<string>("todo");
  const [editPriority, setEditPriority] = useState<string>("none");
  const [editClientId, setEditClientId] = useState<string>("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLabelsText, setEditLabelsText] = useState("");
  const [saving, setSaving] = useState(false);

  function openEdit() {
    if (!issue) return;
    setEditTitle(issue.title);
    setEditDescription(issue.description);
    setEditStatus(issue.status);
    setEditPriority(issue.priority);
    setEditClientId(issue.clientId ?? "");
    setEditAssignee(issue.assignee ?? "");
    setEditDueDate(issue.dueDate ?? "");
    setEditLabelsText(issue.labels.join(", "));
    setEditOpen(true);
  }

  async function handleSave() {
    if (!issue) return;
    setSaving(true);
    try {
      const labels = editLabelsText
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      await updateIssue({
        issueId: issue._id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus as "backlog" | "todo" | "in_progress" | "in_review" | "done",
        priority: editPriority as "urgent" | "high" | "medium" | "low" | "none",
        clientId: editClientId ? (editClientId as Id<"clients">) : null,
        assignee: editAssignee.trim() || undefined,
        dueDate: editDueDate || undefined,
        labels,
      });
      setEditOpen(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (issue === undefined) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (issue === null) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-slate-600">
        Issue not found.
      </div>
    );
  }

  const priority = PRIORITY_CONFIG[issue.priority];
  const status = STATUS_CONFIG[issue.status];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-seridian-500/20 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </a>
        <div className="flex-1" />
        <Button type="button" size="sm" onClick={openEdit}>
          Edit Issue
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0c1222]/80 p-6">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "inline-flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-md border px-1.5 text-xs font-bold tabular-nums",
              priority.color
            )}
          >
            {issue.priority === "urgent" ? "!!" : issue.priority === "high" ? "!" : issue.priority === "medium" ? "~" : issue.priority === "low" ? "\u2193" : "\u2014"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">{issue.title}</h1>
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", status.color)}>
                {status.label}
              </Badge>
            </div>
            {issue.identifier && (
              <p className="mt-1 text-xs text-slate-500">{issue.identifier}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Priority</p>
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", priority.color)}>
              {priority.label}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Status</p>
            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", status.color)}>
              {status.label}
            </Badge>
          </div>

          {issue.assignee && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Assignee</p>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-slate-700/50 flex items-center justify-center text-[9px] font-medium text-slate-400 uppercase">
                  {issue.assignee.charAt(0)}
                </div>
                <span className="text-sm text-slate-300">{issue.assignee}</span>
              </div>
            </div>
          )}

          {client && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Client</p>
              <a
                href={`/dashboard/clients/${client._id}`}
                className="inline-flex items-center gap-1.5 text-sm text-seridian-400 hover:text-seridian-300 transition-colors"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-seridian-500/10 text-[10px] font-semibold text-seridian-400 uppercase">
                  {client.name.charAt(0)}
                </span>
                {client.name}
              </a>
            </div>
          )}

          {issue.dueDate && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Due Date</p>
              <p className="text-sm text-slate-300">{formatDate(issue.dueDate)}</p>
            </div>
          )}

          {issue.linearId && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Linear ID</p>
              <p className="text-sm text-slate-400 font-mono">{issue.linearId}</p>
            </div>
          )}
        </div>

        {issue.labels.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-400 border border-white/[0.06]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Description</p>
          <div className="mt-2 whitespace-pre-wrap rounded-lg bg-white/[0.02] p-4 text-sm leading-relaxed text-slate-300">
            {issue.description}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-xs text-slate-400">Title *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1222] border-white/[0.08]">
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Priority</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1222] border-white/[0.08]">
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Client</Label>
                <Select value={editClientId} onValueChange={setEditClientId}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
                    <SelectValue placeholder="No client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c1222] border-white/[0.08]">
                    {clients === undefined ? (
                      <SelectItem value="__loading" disabled>Loading...</SelectItem>
                    ) : clients.length === 0 ? (
                      <SelectItem value="__empty" disabled>No clients</SelectItem>
                    ) : (
                      clients.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-assignee" className="text-xs text-slate-400">Assignee</Label>
                <Input
                  id="edit-assignee"
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  placeholder="Name"
                  className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-due" className="text-xs text-slate-400">Due Date</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-labels" className="text-xs text-slate-400">Labels (comma-separated)</Label>
                <Input
                  id="edit-labels"
                  value={editLabelsText}
                  onChange={(e) => setEditLabelsText(e.target.value)}
                  placeholder="frontend, urgent, bug"
                  className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-xs text-slate-400">Description</Label>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
                className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving || !editTitle.trim()}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
