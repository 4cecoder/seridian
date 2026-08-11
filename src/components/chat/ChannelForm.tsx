"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ChannelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (channelId: Id<"channels">) => void;
}

export function ChannelForm({ open, onOpenChange, onSuccess }: ChannelFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createChannel = useMutation(api.channels.create);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const channelId = await createChannel({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        createdBy: "current-user",
        participants: [],
      });
      setName("");
      setDescription("");
      setType("public");
      onSuccess(channelId);
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0c1222] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Create Channel</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-white/[0.05] hover:text-slate-300 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="channel-name"
              className="mb-1.5 block text-xs font-medium text-slate-400"
            >
              Name
            </label>
            <input
              id="channel-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. general"
              className="w-full rounded-lg border border-white/[0.08] bg-[#070b14] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/30 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="channel-description"
              className="mb-1.5 block text-xs font-medium text-slate-400"
            >
              Description
            </label>
            <input
              id="channel-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-lg border border-white/[0.08] bg-[#070b14] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/30 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Type
            </label>
            <div className="flex gap-2">
              {(["public", "private"] as const).map((channelType) => (
                <button
                  key={channelType}
                  type="button"
                  onClick={() => setType(channelType)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                    type === channelType
                      ? "border-seridian-500/30 bg-seridian-500/10 text-seridian-400"
                      : "border-white/[0.08] bg-[#070b14] text-slate-500 hover:border-white/[0.12] hover:text-slate-300"
                  )}
                >
                  {channelType}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="rounded-lg bg-seridian-500 px-4 py-2 text-sm font-medium text-[#070b14] hover:bg-seridian-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
