"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@bytecats/ui-kit";
import { TemplateList } from "@/components/emailtemplates/TemplateList";
import { TemplateForm } from "@/components/emailtemplates/TemplateForm";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export default function TemplatesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"emailTemplates"> | undefined>();

  const editingTemplate = useQuery(
    api.emailTemplates.get,
    editingId ? { templateId: editingId } : "skip",
  );

  function handleAdd() {
    setEditingId(undefined);
    setFormOpen(true);
  }

  function handleEdit(id: Id<"emailTemplates">) {
    setEditingId(id);
    setFormOpen(true);
  }

  function handleSuccess() {
    setFormOpen(false);
    setEditingId(undefined);
  }

  return (
    <DashboardGuard>
      <TemplateList onAdd={handleAdd} onEdit={handleEdit} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-[#0c1222] border-white/[0.08] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          {editingId === undefined || editingTemplate !== undefined ? (
            <TemplateForm
              template={editingTemplate ?? undefined}
              onSuccess={handleSuccess}
              onCancel={() => setFormOpen(false)}
            />
          ) : (
            <div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />
          )}
        </DialogContent>
      </Dialog>
    </DashboardGuard>
  );
}
