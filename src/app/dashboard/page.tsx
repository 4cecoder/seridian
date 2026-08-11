"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@bytecats/ui-kit";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";
import { BusinessOverview } from "@/components/business/BusinessOverview";
import { ProposalList } from "@/components/proposals/ProposalList";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { ProposalCard } from "@/components/proposals/ProposalCard";
import { TemplateList } from "@/components/emailtemplates/TemplateList";
import { TemplateForm } from "@/components/emailtemplates/TemplateForm";
import { FileManager } from "@/components/files/FileManager";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { PipelineBoard } from "@/components/sales/PipelineBoard";
import { LoginScreen } from "@/components/auth/LoginScreen";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("seridian_user");
  if (stored) {
    try { return JSON.parse(stored); } catch { return null; }
  }
  return null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ pubkey: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  function handleLogin(pubkey: string, name: string) {
    localStorage.setItem("seridian_user", JSON.stringify({ pubkey, name }));
    setUser({ pubkey, name });
  }

  function handleLogout() {
    localStorage.removeItem("seridian_user");
    setUser(null);
  }

  if (loading) return null;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const [activeTab, setActiveTab] = useState("overview");

  // Client form state
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<Id<"clients"> | undefined>();

  // Proposal form state
  const [proposalFormOpen, setProposalFormOpen] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<Id<"proposals"> | undefined>();
  const [viewingProposalId, setViewingProposalId] = useState<Id<"proposals"> | undefined>();

  // Template form state
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<Id<"emailTemplates"> | undefined>();

  // Deal form state
  const [dealFormOpen, setDealFormOpen] = useState(false);

  // Booking form state
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingFormDate, setBookingFormDate] = useState<string | undefined>();

  // Convex queries for edit data
  const editingClient = useQuery(
    api.clients.get,
    editingClientId ? { clientId: editingClientId } : "skip",
  );

  const editingProposal = useQuery(
    api.proposals.get,
    editingProposalId ? { proposalId: editingProposalId } : "skip",
  );

  const editingTemplate = useQuery(
    api.emailTemplates.get,
    editingTemplateId ? { templateId: editingTemplateId } : "skip",
  );

  // --- Client handlers ---
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

  // --- Proposal handlers ---
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

  // --- Template handlers ---
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

  // --- Booking handlers ---
  function handleBookingDayClick(date: string) {
    setBookingFormDate(date);
    setBookingFormOpen(true);
  }

  // --- Deal handlers ---
  function handleAddDeal() {
    setDealFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{user.name}</span>
          <span className="text-xs text-slate-500">({user.pubkey})</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Sign out
        </button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="gap-0.5">
          <TabsTrigger value="overview" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">⌂</span>
            Overview
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">☐</span>
            Issues
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">◎</span>
            Clients
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">◷</span>
            Bookings
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">▭</span>
            Sales
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">⊞</span>
            Proposals
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1 px-3 py-1.5 text-xs">
            <span aria-hidden="true">✉</span>
            Templates
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1 px-3 py-1.5 text-xs">
            <FileIcon />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3">
          <BusinessOverview />
        </TabsContent>

        <TabsContent value="issues" className="mt-3">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="clients" className="mt-3">
          <ClientList onAdd={handleAddClient} onEdit={handleEditClient} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-3">
          <BookingCalendar onDayClick={handleBookingDayClick} />
        </TabsContent>

        <TabsContent value="sales" className="mt-3">
          <PipelineBoard onAddDeal={handleAddDeal} />
        </TabsContent>

        <TabsContent value="proposals" className="mt-3">
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

        <TabsContent value="templates" className="mt-3">
          <TemplateList onAdd={handleAddTemplate} onEdit={handleEditTemplate} />
        </TabsContent>

        <TabsContent value="files" className="mt-3">
          <FileManager />
        </TabsContent>
      </Tabs>

      {/* --- Client Dialog --- */}
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

      {/* --- Proposal Dialog --- */}
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

      {/* --- Template Dialog --- */}
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

      {/* --- Deal Dialog --- */}
      <Dialog open={dealFormOpen} onOpenChange={setDealFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">New Deal</DialogTitle>
          </DialogHeader>
          <DealFormWrapper onSuccess={() => setDealFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* --- Booking Dialog --- */}
      <Dialog open={bookingFormOpen} onOpenChange={setBookingFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">New Booking</DialogTitle>
          </DialogHeader>
          <BookingFormWrapper
            defaultDate={bookingFormDate}
            onSuccess={() => {
              setBookingFormOpen(false);
              setBookingFormDate(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Thin wrappers that lazy-load the form components ---- */

function DealFormWrapper({ onSuccess }: { onSuccess: () => void }) {
  // Dynamically import DealForm to keep the main bundle small.
  const [DealForm, setDealForm] = useState<React.ComponentType<{ onSuccess: () => void }> | null>(null);

  // Lazy-load on mount
  if (!DealForm) {
    import("@/components/sales/DealForm").then((mod) => {
      setDealForm(() => mod.DealForm);
    });
  }

  if (!DealForm) {
    return <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />;
  }

  return <DealForm onSuccess={onSuccess} />;
}

function BookingFormWrapper({
  defaultDate,
  onSuccess,
}: {
  defaultDate?: string;
  onSuccess: () => void;
}) {
  const [BookingForm, setBookingForm] = useState<React.ComponentType<{ defaultDate?: string; onSuccess: () => void }> | null>(null);

  if (!BookingForm) {
    import("@/components/bookings/BookingForm").then((mod) => {
      setBookingForm(() => mod.BookingForm);
    });
  }

  if (!BookingForm) {
    return <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />;
  }

  return <BookingForm defaultDate={defaultDate} onSuccess={onSuccess} />;
}

/* ---- Small inline SVG icon ---- */
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
