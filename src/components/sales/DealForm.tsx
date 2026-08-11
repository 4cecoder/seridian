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

type Deal = Doc<"deals">;

interface DealFormProps {
  deal?: Deal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  clientId?: string;
  value?: string;
  stage?: string;
  probability?: string;
}

export function DealForm({ deal, onSuccess, onCancel }: DealFormProps) {
  const createDeal = useMutation(api.deals.create);
  const updateDeal = useMutation(api.deals.update);
  const clients = useQuery(api.clients.list, {});

  const [name, setName] = useState(deal?.name ?? "");
  const [clientId, setClientId] = useState<string>(deal?.clientId ?? "");
  const [value, setValue] = useState(deal?.value?.toString() ?? "");
  const [stage, setStage] = useState<Deal["stage"]>(deal?.stage ?? "lead");
  const [probability, setProbability] = useState(deal?.probability?.toString() ?? "10");
  const [expectedCloseDate, setExpectedCloseDate] = useState(deal?.expectedCloseDate ?? "");
  const [notes, setNotes] = useState(deal?.notes ?? "");
  const [contactEmail, setContactEmail] = useState(deal?.contactEmail ?? "");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!clientId) next.clientId = "Client is required";
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      next.value = "Value must be a positive number";
    }
    const prob = Number(probability);
    if (isNaN(prob) || prob < 0 || prob > 100) {
      next.probability = "Probability must be 0–100";
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
        name: name.trim(),
        clientId: clientId as Id<"clients">,
        value: Number(value),
        stage,
        probability: Number(probability),
        expectedCloseDate: expectedCloseDate || undefined,
        notes: notes.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      };

      if (deal) {
        await updateDeal({ dealId: deal._id, ...payload });
      } else {
        await createDeal(payload);
      }
      onSuccess?.();
    } catch {
      setErrors({ name: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="deal-name" className="text-xs text-slate-400">
            Deal Name *
          </Label>
          <Input
            id="deal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website redesign project"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.name && "border-red-500/40"
            )}
          />
          {errors.name && (
            <p className="text-[11px] text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal-client" className="text-xs text-slate-400">
            Client *
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
          {errors.clientId && (
            <p className="text-[11px] text-red-400">{errors.clientId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal-value" className="text-xs text-slate-400">
            Value (USD) *
          </Label>
          <Input
            id="deal-value"
            type="number"
            min="0"
            step="100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="50000"
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
          <Label htmlFor="deal-stage" className="text-xs text-slate-400">
            Stage *
          </Label>
          <Select value={stage} onValueChange={(v) => setStage(v as Deal["stage"])}>
            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1222] border-white/[0.08]">
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal-probability" className="text-xs text-slate-400">
            Probability (%) *
          </Label>
          <Input
            id="deal-probability"
            type="number"
            min="0"
            max="100"
            value={probability}
            onChange={(e) => setProbability(e.target.value)}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.probability && "border-red-500/40"
            )}
          />
          {errors.probability && (
            <p className="text-[11px] text-red-400">{errors.probability}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal-close" className="text-xs text-slate-400">
            Expected Close Date
          </Label>
          <Input
            id="deal-close"
            type="date"
            value={expectedCloseDate}
            onChange={(e) => setExpectedCloseDate(e.target.value)}
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal-email" className="text-xs text-slate-400">
            Contact Email
          </Label>
          <Input
            id="deal-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@example.com"
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deal-notes" className="text-xs text-slate-400">
          Notes
        </Label>
        <Textarea
          id="deal-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Deal context, requirements, next steps..."
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
          {submitting ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
        </Button>
      </div>
    </form>
  );
}
