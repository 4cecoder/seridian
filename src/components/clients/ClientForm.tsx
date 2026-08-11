"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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

type Client = Doc<"clients">;

interface ClientFormProps {
  client?: Client;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);

  const [name, setName] = useState(client?.name ?? "");
  const [company, setCompany] = useState(client?.company ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [website, setWebsite] = useState(client?.website ?? "");
  const [industry, setIndustry] = useState(client?.industry ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(
    client?.status ?? "active"
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!company.trim()) next.company = "Company is required";
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Invalid email address";
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
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        status,
      };

      if (client) {
        await updateClient({ clientId: client._id, ...payload });
      } else {
        await createClient(payload);
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
        <div className="space-y-1.5">
          <Label htmlFor="client-name" className="text-xs text-slate-400">
            Name *
          </Label>
          <Input
            id="client-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
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
          <Label htmlFor="client-company" className="text-xs text-slate-400">
            Company *
          </Label>
          <Input
            id="client-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.company && "border-red-500/40"
            )}
          />
          {errors.company && (
            <p className="text-[11px] text-red-400">{errors.company}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-email" className="text-xs text-slate-400">
            Email *
          </Label>
          <Input
            id="client-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@acme.com"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.email && "border-red-500/40"
            )}
          />
          {errors.email && (
            <p className="text-[11px] text-red-400">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-phone" className="text-xs text-slate-400">
            Phone
          </Label>
          <Input
            id="client-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-website" className="text-xs text-slate-400">
            Website
          </Label>
          <Input
            id="client-website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://acme.com"
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-industry" className="text-xs text-slate-400">
            Industry
          </Label>
          <Input
            id="client-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Technology"
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as "active" | "inactive")}
          >
            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1222] border-white/[0.08]">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="client-notes" className="text-xs text-slate-400">
          Notes
        </Label>
        <Textarea
          id="client-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this client..."
          rows={3}
          className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : client
              ? "Update Client"
              : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
