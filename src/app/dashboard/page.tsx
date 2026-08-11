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

  const editingClient = useQuery(
    api.clients.get,
    editingClientId ? { clientId: editingClientId } : "skip"
  );

  const editingCaseStudy = useQuery(
    api.caseStudies.get,
    editingCaseStudyId ? { caseStudyId: editingCaseStudyId } : "skip"
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
          <TabsTrigger value="case-studies" className="gap-1.5">
            <span aria-hidden="true">✦</span>
            Case Studies
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

        <TabsContent value="case-studies" className="mt-6">
          <CaseStudyList
            onAdd={handleAddCaseStudy}
            onEdit={handleEditCaseStudy}
          />
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
    </div>
  );
}
