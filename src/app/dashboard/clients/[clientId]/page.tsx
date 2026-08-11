"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  Badge,
  Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";
import { ClientForm } from "@/components/clients/ClientForm";

const STATUS_CONFIG = {
  active: {
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    label: "Active",
  },
  inactive: {
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    label: "Inactive",
  },
} as const;

const PRIORITY_CONFIG = {
  urgent: { color: "bg-red-500/15 text-red-400 border-red-500/20", icon: "!!" },
  high: { color: "bg-orange-500/15 text-orange-400 border-orange-500/20", icon: "!" },
  medium: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", icon: "~" },
  low: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", icon: "\u2193" },
  none: { color: "bg-slate-500/15 text-slate-400 border-slate-500/20", icon: "\u2014" },
} as const;

const ISSUE_STATUS_CONFIG = {
  backlog: { color: "bg-slate-500/15 text-slate-400 border-slate-500/20", label: "Backlog" },
  todo: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "Todo" },
  in_progress: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", label: "In Progress" },
  in_review: { color: "bg-purple-500/15 text-purple-400 border-purple-500/20", label: "In Review" },
  done: { color: "bg-green-500/15 text-green-400 border-green-500/20", label: "Done" },
} as const;

const DEAL_STAGE_CONFIG = {
  lead: { color: "bg-slate-500/15 text-slate-400 border-slate-500/20", label: "Lead" },
  proposal: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "Proposal" },
  negotiation: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", label: "Negotiation" },
  closed_won: { color: "bg-green-500/15 text-green-400 border-green-500/20", label: "Won" },
  closed_lost: { color: "bg-red-500/15 text-red-400 border-red-500/20", label: "Lost" },
} as const;

const PROPOSAL_STATUS_CONFIG = {
  draft: { color: "bg-slate-500/15 text-slate-400 border-slate-500/20", label: "Draft" },
  sent: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "Sent" },
  accepted: { color: "bg-green-500/15 text-green-400 border-green-500/20", label: "Accepted" },
  rejected: { color: "bg-red-500/15 text-red-400 border-red-500/20", label: "Rejected" },
  expired: { color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", label: "Expired" },
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | number): string {
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const client = useQuery(api.clients.get, { clientId: clientId as Id<"clients"> });
  const issues = useQuery(api.issues.list, { clientId: clientId as Id<"clients"> });
  const deals = useQuery(api.deals.list, { clientId: clientId as Id<"clients"> });
  const bookings = useQuery(api.bookings.list, { clientId: clientId as Id<"clients"> });
  const proposals = useQuery(api.proposals.list, { clientId: clientId as Id<"clients"> });
  const files = useQuery(api.files.getByClient, { clientId: clientId as Id<"clients"> });

  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("issues");

  if (client === undefined) {
    return (
      <div className="space-y-6 p-1">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
        <SectionSkeleton />
      </div>
    );
  }

  if (client === null) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-slate-600">
        Client not found.
      </div>
    );
  }

  const status = STATUS_CONFIG[client.status];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center gap-3">
        <a
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-seridian-500/20 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Clients
        </a>
        <div className="flex-1" />
        <Button type="button" size="sm" onClick={() => setEditOpen(true)}>
          Edit Client
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0c1222]/80 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-seridian-500/10 text-xl font-bold text-seridian-400 uppercase">
            {client.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">{client.name}</h1>
              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", status.color)}>
                {status.label}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{client.company}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Email" value={client.email} href={`mailto:${client.email}`} />
          {client.phone && <InfoField label="Phone" value={client.phone} href={`tel:${client.phone}`} />}
          {client.website && (
            <InfoField
              label="Website"
              value={client.website.replace(/^https?:\/\//, "")}
              href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
              external
            />
          )}
          {client.industry && <InfoField label="Industry" value={client.industry} />}
          {client.notes && <InfoField label="Notes" value={client.notes} className="sm:col-span-2 lg:col-span-3" />}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="gap-0.5">
          <TabsTrigger value="issues" className="gap-1 px-3 py-1.5 text-xs">
            Issues
            {issues && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
                {issues.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-1 px-3 py-1.5 text-xs">
            Deals
            {deals && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
                {deals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1 px-3 py-1.5 text-xs">
            Bookings
            {bookings && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
                {bookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-1 px-3 py-1.5 text-xs">
            Proposals
            {proposals && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
                {proposals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1 px-3 py-1.5 text-xs">
            Files
            {files && (
              <span className="ml-1 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500">
                {files.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="mt-4">
          {issues === undefined ? (
            <SectionSkeleton />
          ) : issues.length === 0 ? (
            <EmptyState message="No issues assigned to this client." />
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => {
                const priority = PRIORITY_CONFIG[issue.priority];
                const issueStatus = ISSUE_STATUS_CONFIG[issue.status];
                return (
                  <a
                    key={issue._id}
                    href={`/dashboard/issues/${issue._id}`}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3",
                      "transition-all duration-150",
                      "hover:border-seridian-500/20 hover:bg-[#0c1222]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-5 min-w-[20px] items-center justify-center rounded border px-1 text-[10px] font-bold tabular-nums",
                        priority.color
                      )}
                    >
                      {priority.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                        {issue.title}
                      </p>
                      {issue.labels.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {issue.labels.slice(0, 3).map((label) => (
                            <span key={label} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className={cn("shrink-0 text-[10px] px-1.5 py-0", issueStatus.color)}>
                      {issueStatus.label}
                    </Badge>
                  </a>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          {deals === undefined ? (
            <SectionSkeleton />
          ) : deals.length === 0 ? (
            <EmptyState message="No deals with this client." />
          ) : (
            <div className="space-y-2">
              {deals.map((deal) => {
                const stage = DEAL_STAGE_CONFIG[deal.stage];
                return (
                  <div
                    key={deal._id}
                    className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">{deal.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {deal.probability}% probability
                        {deal.expectedCloseDate && (
                          <span className="ml-2">Close: {formatDate(deal.expectedCloseDate)}</span>
                        )}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-white tabular-nums">
                      {formatCurrency(deal.value)}
                    </p>
                    <Badge variant="secondary" className={cn("shrink-0 text-[10px] px-1.5 py-0", stage.color)}>
                      {stage.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          {bookings === undefined ? (
            <SectionSkeleton />
          ) : bookings.length === 0 ? (
            <EmptyState message="No bookings for this client." />
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-seridian-500/10 text-[10px] font-bold text-seridian-400 uppercase">
                    {booking.type === "consultation" ? "\u260E" : booking.type === "development" ? "\u2699" : "\u2611"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{booking.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDateTime(booking.startTime)}
                      {booking.location && <span className="ml-2">\u2302 {booking.location}</span>}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 bg-white/[0.06] text-slate-400 border-white/[0.08] capitalize">
                    {booking.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proposals" className="mt-4">
          {proposals === undefined ? (
            <SectionSkeleton />
          ) : proposals.length === 0 ? (
            <EmptyState message="No proposals for this client." />
          ) : (
            <div className="space-y-2">
              {proposals.map((proposal) => {
                const proposalStatus = PROPOSAL_STATUS_CONFIG[proposal.status];
                return (
                  <a
                    key={proposal._id}
                    href={`/dashboard/proposals/${proposal._id}`}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3",
                      "transition-all duration-150",
                      "hover:border-seridian-500/20 hover:bg-[#0c1222]"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                        {proposal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Created {formatDate(proposal.createdAt)}
                        {proposal.value !== undefined && (
                          <span className="ml-2">{formatCurrency(proposal.value)}</span>
                        )}
                      </p>
                    </div>
                    <Badge variant="secondary" className={cn("shrink-0 text-[10px] px-1.5 py-0", proposalStatus.color)}>
                      {proposalStatus.label}
                    </Badge>
                  </a>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          {files === undefined ? (
            <SectionSkeleton />
          ) : files.length === 0 ? (
            <EmptyState message="No files for this client." />
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs text-slate-500">
                    {file.type.includes("pdf") ? "PDF" : file.type.includes("image") ? "IMG" : "FILE"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{file.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatBytes(file.size)} \u00B7 {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            client={client}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoField({
  label,
  value,
  href,
  external,
  className,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      {href ? (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-sm text-seridian-400 hover:text-seridian-300 transition-colors break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-slate-300 break-all">{value}</p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-sm text-slate-600">
      {message}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
