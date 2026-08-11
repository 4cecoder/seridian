"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@bytecats/ui-kit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@bytecats/ui-kit";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { CaseStudyList } from "@/components/casestudies/CaseStudyList";
import { CaseStudyForm } from "@/components/casestudies/CaseStudyForm";
import { BusinessOverview } from "@/components/business/BusinessOverview";
import { ProposalList } from "@/components/proposals/ProposalList";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { TemplateList } from "@/components/emailtemplates/TemplateList";
import { TemplateForm } from "@/components/emailtemplates/TemplateForm";
import { FileManager } from "@/components/files/FileManager";
import { Id } from "convex/_generated/dataModel";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<
    Id<"clients"> | undefined
  >();
  const [caseStudyFormOpen, setCaseStudyFormOpen] = useState(false);
  const [editingCaseStudyId, setEditingCaseStudyId] = useState<
    Id<"caseStudies"> | undefined
  >();
  const [proposalFormOpen, setProposalFormOpen] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<
    Id<"proposals"> | undefined
  >();
  const [viewingProposalId, setViewingProposalId] = useState<
    Id<"proposals"> | undefined
  >();
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<
    Id<"emailTemplates"> | undefined
  >();

  const editingClient = useQuery(
    api.clients.get,
    editingClientId ? { clientId: editingClientId } : "skip"
  );

  const editingCaseStudy = useQuery(
    api.caseStudies.get,
    editingCaseStudyId ? { caseStudyId: editingCaseStudyId } : "skip"
  );

  const editingProposal = useQuery(
    api.proposals.get,
    editingProposalId ? { proposalId: editingProposalId } : "skip"
  );

  const editingTemplate = useQuery(
    api.emailTemplates.get,
    editingTemplateId ? { templateId: editingTemplateId } : "skip"
  );

  function handleAddClient() {
    setEditingClientId(undefined);
    setClientFormOpen(true);
  }

  function handleEditClient(clientId: Id<"clients">) {
    setEditingClientId(clientId);
    setClientFormOpen(true);
  }

  function handleClientFormSuccess() {
    setClientFormOpen(false);
    setEditingClientId(undefined);
  }

  function handleAddCaseStudy() {
    setEditingCaseStudyId(undefined);
    setCaseStudyFormOpen(true);
  }

  function handleEditCaseStudy(caseStudyId: Id<"caseStudies">) {
    setEditingCaseStudyId(caseStudyId);
    setCaseStudyFormOpen(true);
  }

  function handleCaseStudyFormSuccess() {
    setCaseStudyFormOpen(false);
    setEditingCaseStudyId(undefined);
  }

  function handleAddProposal() {
    setEditingProposalId(undefined);
    setViewingProposalId(undefined);
    setProposalFormOpen(true);
  }

  function handleEditProposal(proposalId: Id<"proposals">) {
    setEditingProposalId(proposalId);
    setViewingProposalId(undefined);
    setProposalFormOpen(true);
  }

  function handleViewProposal(proposalId: Id<"proposals">) {
    setViewingProposalId(proposalId);
    setEditingProposalId(undefined);
    setProposalFormOpen(false);
  }

  function handleProposalFormSuccess() {
    setProposalFormOpen(false);
    setEditingProposalId(undefined);
  }

  function handleAddTemplate() {
    setEditingTemplateId(undefined);
    setTemplateFormOpen(true);
  }

  function handleEditTemplate(templateId: Id<"emailTemplates">) {
    setEditingTemplateId(templateId);
    setTemplateFormOpen(true);
  }

  function handleTemplateFormSuccess() {
    setTemplateFormOpen(false);
    setEditingTemplateId(undefined);
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="overview" className="gap-1.5">
            <span aria-hidden="true">⌂</span>
            Overview
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-1.5">
            <span aria-hidden="true">☐</span>
            Issues
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-1.5">
            <span aria-hidden="true">◎</span>
            Clients
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1.5">
            <span aria-hidden="true">◷</span>
            Bookings
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <span aria-hidden="true">▭</span>
            Sales
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-1.5">
            <span aria-hidden="true">⊞</span>
            Proposals
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <span aria-hidden="true">✉</span>
            Templates
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5">
            <span aria-hidden="true"><FileIcon /></span>
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <BusinessOverview />
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ClientList onAdd={handleAddClient} onEdit={handleEditClient} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <BookingTab />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesTab />
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          {viewingProposalId ? (
            <ProposalCard
              proposalId={viewingProposalId}
              onBack={() => setViewingProposalId(undefined)}
              onEdit={handleEditProposal}
            />
          ) : (
            <ProposalList
              onAdd={handleAddProposal}
              onEdit={handleEditProposal}
              onView={handleViewProposal}
            />
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateList onAdd={handleAddTemplate} onEdit={handleEditTemplate} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileManager />
        </TabsContent>
      </Tabs>

      <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingClientId ? "Edit Client" : "New Client"}
            </DialogTitle>
          </DialogHeader>
          {editingClientId === undefined || editingClient !== undefined ? (
            <ClientForm
              client={editingClient ?? undefined}
              onSuccess={handleClientFormSuccess}
              onCancel={() => setClientFormOpen(false)}
            />
          ) : (
            <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={caseStudyFormOpen} onOpenChange={setCaseStudyFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCaseStudyId ? "Edit Case Study" : "New Case Study"}
            </DialogTitle>
          </DialogHeader>
          {editingCaseStudyId === undefined || editingCaseStudy !== undefined ? (
            <CaseStudyForm
              caseStudy={editingCaseStudy ?? undefined}
              onSuccess={handleCaseStudyFormSuccess}
              onCancel={() => setCaseStudyFormOpen(false)}
            />
          ) : (
            <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={proposalFormOpen} onOpenChange={setProposalFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProposalId ? "Edit Proposal" : "New Proposal"}
            </DialogTitle>
          </DialogHeader>
          {editingProposalId === undefined || editingProposal !== undefined ? (
            <ProposalForm
              proposal={editingProposal ?? undefined}
              onSuccess={handleProposalFormSuccess}
              onCancel={() => setProposalFormOpen(false)}
            />
          ) : (
            <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={templateFormOpen} onOpenChange={setTemplateFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTemplateId ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          {editingTemplateId === undefined || editingTemplate !== undefined ? (
            <TemplateForm
              template={editingTemplate ?? undefined}
              onSuccess={handleTemplateFormSuccess}
              onCancel={() => setTemplateFormOpen(false)}
            />
          ) : (
            <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingTab() {
  const bookings = useQuery(api.bookings.list, {});
  const clients = useQuery(api.clients.list, {});

  const clientMap = new Map<string, string>();
  if (clients) {
    for (const c of clients) {
      clientMap.set(c._id, c.name);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Bookings</h2>
        <p className="text-sm text-slate-500">
          {bookings === undefined
            ? "Loading..."
            : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
        </p>
      </div>
      {bookings === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[60px] animate-pulse rounded-lg bg-white/[0.02]" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-sm text-slate-600">
          No bookings yet.
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3 transition-all duration-150 hover:border-seridian-500/20 hover:bg-[#0c1222]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-seridian-500/10 text-sm text-seridian-400">
                ◷
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {booking.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {clientMap.get(booking.clientId) ?? "Unknown client"} ·{" "}
                  {booking.type}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-500">
                  {new Date(booking.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-[11px] text-slate-600">
                  {new Date(booking.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SalesTab() {
  const deals = useQuery(api.deals.list, {});
  const clients = useQuery(api.clients.list, {});

  const clientMap = new Map<string, string>();
  if (clients) {
    for (const c of clients) {
      clientMap.set(c._id, c.name);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Sales Pipeline</h2>
        <p className="text-sm text-slate-500">
          {deals === undefined
            ? "Loading..."
            : `${deals.length} deal${deals.length !== 1 ? "s" : ""}`}
        </p>
      </div>
      {deals === undefined ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[60px] animate-pulse rounded-lg bg-white/[0.02]" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/[0.06] text-sm text-slate-600">
          No deals yet.
        </div>
      ) : (
        <div className="space-y-2">
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0c1222]/80 px-4 py-3 transition-all duration-150 hover:border-seridian-500/20 hover:bg-[#0c1222]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {deal.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {clientMap.get(deal.clientId) ?? "Unknown client"} ·{" "}
                  {deal.stage.replace("_", " ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white tabular-nums">
                  {formatCurrency(deal.value)}
                </p>
                <p className="text-[11px] text-slate-600">
                  {deal.probability}% prob.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block align-[-0.125em]"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
