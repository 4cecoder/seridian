"use client";

import { useState, useMemo } from "react";
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

type EmailTemplate = Doc<"emailTemplates">;

const categoryOptions = [
  { value: "proposal", label: "Proposal" },
  { value: "invoice", label: "Invoice" },
  { value: "follow_up", label: "Follow Up" },
  { value: "welcome", label: "Welcome" },
  { value: "custom", label: "Custom" },
] as const;

interface TemplateFormProps {
  template?: EmailTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  name?: string;
  subject?: string;
  body?: string;
  category?: string;
}

export function TemplateForm({ template, onSuccess, onCancel }: TemplateFormProps) {
  const createTemplate = useMutation(api.emailTemplates.create);
  const updateTemplate = useMutation(api.emailTemplates.update);

  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [category, setCategory] = useState<string>(
    template?.category ?? "custom"
  );
  const [variablesInput, setVariablesInput] = useState(
    template?.variables.join(", ") ?? ""
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const variables = useMemo(
    () =>
      variablesInput
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    [variablesInput]
  );

  const previewSubject = useMemo(() => {
    let result = subject;
    for (const v of variables) {
      result = result.replaceAll(`{{${v}}}`, `[${v}]`);
    }
    return result;
  }, [subject, variables]);

  const previewBody = useMemo(() => {
    let result = body;
    for (const v of variables) {
      result = result.replaceAll(`{{${v}}}`, `[${v}]`);
    }
    return result;
  }, [body, variables]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!subject.trim()) next.subject = "Subject is required";
    if (!body.trim()) next.body = "Body is required";
    if (!category) next.category = "Category is required";
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
        subject: subject.trim(),
        body: body.trim(),
        category: category as EmailTemplate["category"],
        variables,
      };

      if (template) {
        await updateTemplate({ templateId: template._id, ...payload });
      } else {
        await createTemplate(payload);
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
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name" className="text-xs text-slate-400">
              Template Name *
            </Label>
            <Input
              id="tpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Welcome Email"
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
            <Label htmlFor="tpl-category" className="text-xs text-slate-400">
              Category *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className={cn(
                  "bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20",
                  errors.category && "border-red-500/40"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0c1222] border-white/[0.08]">
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-subject" className="text-xs text-slate-400">
              Subject *
            </Label>
            <Input
              id="tpl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Hello {{client_name}}, here is your proposal"
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
                "focus:border-seridian-500/40 focus:ring-seridian-500/20",
                errors.subject && "border-red-500/40"
              )}
            />
            {errors.subject && (
              <p className="text-[11px] text-red-400">{errors.subject}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-body" className="text-xs text-slate-400">
              Body *
            </Label>
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Dear {{client_name}},&#10;&#10;Thank you for your interest..."
              rows={10}
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none font-mono text-xs",
                errors.body && "border-red-500/40"
              )}
            />
            {errors.body && (
              <p className="text-[11px] text-red-400">{errors.body}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tpl-vars" className="text-xs text-slate-400">
              Variables (comma-separated)
            </Label>
            <Input
              id="tpl-vars"
              value={variablesInput}
              onChange={(e) => setVariablesInput(e.target.value)}
              placeholder="client_name, project_name, amount"
              className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
            />
            {variables.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {variables.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center rounded-md bg-seridian-500/10 px-1.5 py-0.5 text-[11px] font-medium text-seridian-400"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Preview</Label>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="border-b border-white/[0.06] pb-3 mb-3">
              <p className="text-[11px] text-slate-600">Subject:</p>
              <p className="text-sm text-slate-200 mt-1">
                {previewSubject || "No subject"}
              </p>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {previewBody || "No body content"}
            </div>
          </div>
        </div>
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
            : template
              ? "Update Template"
              : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
