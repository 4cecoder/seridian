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
  Checkbox,
} from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

type CaseStudy = Doc<"caseStudies">;

interface CaseStudyFormProps {
  caseStudy?: CaseStudy;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  summary?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  industry?: string;
  technologies?: string;
}

export function CaseStudyForm({ caseStudy, onSuccess, onCancel }: CaseStudyFormProps) {
  const createCaseStudy = useMutation(api.caseStudies.create);
  const updateCaseStudy = useMutation(api.caseStudies.update);
  const clients = useQuery(api.clients.list, { status: "active" });

  const [title, setTitle] = useState(caseStudy?.title ?? "");
  const [clientId, setClientId] = useState<string>(caseStudy?.clientId ?? "");
  const [summary, setSummary] = useState(caseStudy?.summary ?? "");
  const [challenge, setChallenge] = useState(caseStudy?.challenge ?? "");
  const [solution, setSolution] = useState(caseStudy?.solution ?? "");
  const [results, setResults] = useState(caseStudy?.results ?? "");
  const [technologiesInput, setTechnologiesInput] = useState(
    caseStudy?.technologies.join(", ") ?? ""
  );
  const [industry, setIndustry] = useState(caseStudy?.industry ?? "");
  const [imageUrl, setImageUrl] = useState(caseStudy?.imageUrl ?? "");
  const [published, setPublished] = useState(caseStudy?.published ?? false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required";
    if (!summary.trim()) next.summary = "Summary is required";
    if (!challenge.trim()) next.challenge = "Challenge is required";
    if (!solution.trim()) next.solution = "Solution is required";
    if (!results.trim()) next.results = "Results are required";
    if (!industry.trim()) next.industry = "Industry is required";
    const techs = technologiesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (techs.length === 0) next.technologies = "At least one technology is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const technologies = technologiesInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        clientId: (clientId as Id<"clients">) || undefined,
        summary: summary.trim(),
        challenge: challenge.trim(),
        solution: solution.trim(),
        results: results.trim(),
        technologies,
        industry: industry.trim(),
        imageUrl: imageUrl.trim() || undefined,
        published,
      };

      if (caseStudy) {
        await updateCaseStudy({ caseStudyId: caseStudy._id, ...payload });
      } else {
        await createCaseStudy(payload);
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
          <Label htmlFor="cs-title" className="text-xs text-slate-400">
            Title *
          </Label>
          <Input
            id="cs-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cloud Migration for Enterprise Client"
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
          <Label htmlFor="cs-client" className="text-xs text-slate-400">
            Client
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1222] border-white/[0.08]">
              <SelectItem value="none">No client</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client._id} value={client._id}>
                  {client.name} — {client.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cs-industry" className="text-xs text-slate-400">
            Industry *
          </Label>
          <Input
            id="cs-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Technology, Healthcare, Finance..."
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.industry && "border-red-500/40"
            )}
          />
          {errors.industry && (
            <p className="text-[11px] text-red-400">{errors.industry}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cs-technologies" className="text-xs text-slate-400">
            Technologies * (comma-separated)
          </Label>
          <Input
            id="cs-technologies"
            value={technologiesInput}
            onChange={(e) => setTechnologiesInput(e.target.value)}
            placeholder="React, Node.js, AWS, PostgreSQL"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.technologies && "border-red-500/40"
            )}
          />
          {errors.technologies && (
            <p className="text-[11px] text-red-400">{errors.technologies}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cs-summary" className="text-xs text-slate-400">
            Summary *
          </Label>
          <Textarea
            id="cs-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief overview of this case study..."
            rows={3}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none",
              errors.summary && "border-red-500/40"
            )}
          />
          {errors.summary && (
            <p className="text-[11px] text-red-400">{errors.summary}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cs-challenge" className="text-xs text-slate-400">
            Challenge *
          </Label>
          <Textarea
            id="cs-challenge"
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="What problem were you solving?"
            rows={3}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none",
              errors.challenge && "border-red-500/40"
            )}
          />
          {errors.challenge && (
            <p className="text-[11px] text-red-400">{errors.challenge}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cs-solution" className="text-xs text-slate-400">
            Solution *
          </Label>
          <Textarea
            id="cs-solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="How did you approach the problem?"
            rows={3}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none",
              errors.solution && "border-red-500/40"
            )}
          />
          {errors.solution && (
            <p className="text-[11px] text-red-400">{errors.solution}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cs-results" className="text-xs text-slate-400">
            Results *
          </Label>
          <Textarea
            id="cs-results"
            value={results}
            onChange={(e) => setResults(e.target.value)}
            placeholder="What outcomes were achieved?"
            rows={3}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none",
              errors.results && "border-red-500/40"
            )}
          />
          {errors.results && (
            <p className="text-[11px] text-red-400">{errors.results}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cs-imageUrl" className="text-xs text-slate-400">
            Image URL
          </Label>
          <Input
            id="cs-imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="cs-published"
            checked={published}
            onCheckedChange={(checked) => setPublished(checked === true)}
          />
          <Label htmlFor="cs-published" className="text-xs text-slate-400 cursor-pointer">
            Publish this case study
          </Label>
        </div>
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
            : caseStudy
              ? "Update Case Study"
              : "Create Case Study"}
        </Button>
      </div>
    </form>
  );
}
