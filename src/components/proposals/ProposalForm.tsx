"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

type Proposal = Doc<"proposals">;

interface ProposalFormProps {
  proposal?: Proposal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  clientId?: string;
  content?: string;
  value?: string;
  validUntil?: string;
}

export function ProposalForm({ proposal, onSuccess, onCancel }: ProposalFormProps) {
  const createProposal = useMutation(api.proposals.create);
  const updateProposal = useMutation(api.proposals.update);
  const clients = useQuery(api.clients.list, {});

  const [title, setTitle] = useState(proposal?.title ?? "");
  const [clientId, setClientId] = useState<string>(proposal?.clientId ?? "");
  const [content, setContent] = useState(proposal?.content ?? "");
  const [value, setValue] = useState(proposal?.value?.toString() ?? "");
  const [validUntil, setValidUntil] = useState(
    proposal?.validUntil
      ? new Date(proposal.validUntil).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState(proposal?.notes ?? "");
  const [status, setStatus] = useState<Proposal["status"]>(
    proposal?.status ?? "draft"
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required";
    if (!content.trim()) next.content = "Content is required";
    if (value && (isNaN(Number(value)) || Number(value) < 0)) {
      next.value = "Value must be a positive number";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        clientId: clientId ? (clientId as Id<"clients">) : undefined,
        content: content.trim(),
        value: value ? Number(value) : undefined,
        validUntil: validUntil
          ? new Date(validUntil).getTime()
          : undefined,
        notes: notes.trim() || undefined,
        status,
        createdBy: "current-user",
      };

      if (proposal) {
        await updateProposal({ proposalId: proposal._id, ...payload });
      } else {
        await createProposal(payload);
      }
      onSuccess?.();
    } catch {
      setErrors({ title: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="proposal-title" className="text-xs text-slate-400">
            Title *
          </Label>
          <Input
            id="proposal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Website Redesign Proposal"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.title && "border-red-500/40"
            )}
          />
          {errors.title && (
            <p className="text-[11px] text-red-400">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proposal-client" className="text-xs text-slate-400">
            Client
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20",
                errors.clientId && "border-red-500/40"
              )}
            >
              <SelectValue placeholder="Select client" />
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
          <Label htmlFor="proposal-status" className="text-xs text-slate-400">
            Status
          </Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Proposal["status"])}>
            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1222] border-white/[0.08]">
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proposal-value" className="text-xs text-slate-400">
            Value (USD)
          </Label>
          <Input
            id="proposal-value"
            type="number"
            min="0"
            step="100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="25000"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.value && "border-red-500/40"
            )}
          />
          {errors.value && (
            <p className="text-[11px] text-red-400">{errors.value}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proposal-valid" className="text-xs text-slate-400">
            Valid Until
          </Label>
          <Input
            id="proposal-valid"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-content" className="text-xs text-slate-400">
          Content *
        </Label>
        <Textarea
          id="proposal-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the proposal scope, deliverables, and terms..."
          rows={8}
          className={cn(
            "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none",
            errors.content && "border-red-500/40"
          )}
        />
        {errors.content && (
          <p className="text-[11px] text-red-400">{errors.content}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-notes" className="text-xs text-slate-400">
          Notes
        </Label>
        <Textarea
          id="proposal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes, follow-up reminders..."
          rows={3}
          className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : proposal
              ? "Update Proposal"
              : "Create Proposal"}
        </Button>
      </div>
    </form>
  );
}
