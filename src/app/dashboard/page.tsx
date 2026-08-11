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
import { Id } from "convex/_generated/dataModel";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("issues");
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<
    Id<"clients"> | undefined
  >();

  const editingClient = useQuery(
    api.clients.get,
    editingClientId ? { clientId: editingClientId } : "skip"
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="issues" className="gap-1.5">
            <span aria-hidden="true">☐</span>
            Issues
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-1.5">
            <span aria-hidden="true">◎</span>
            Clients
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="mt-6">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ClientList onAdd={handleAddClient} onEdit={handleEditClient} />
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
    </div>
  );
}
