"use client";

import { cn } from "@/lib/utils";

function formatTimeSince(ts: number | null): string {
  if (!ts) return "Never";
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface SyncCardProps {
  title: string;
  icon: string;
  lastSynced: number | null;
  count: number;
  countLabel: string;
  syncing: boolean;
  onSync: () => void;
  connected: boolean;
  className?: string;
  details?: { label: string; value: number | string }[];
  syncLabel?: string;
}

export function SyncCard({
  title,
  icon,
  lastSynced,
  count,
  countLabel,
  syncing,
  onSync,
  connected,
  className,
  details,
  syncLabel,
}: SyncCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-[#0c1222]/80 p-5 transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-seridian-500/10 text-lg text-seridian-400">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  connected ? "bg-emerald-400" : "bg-slate-500",
                )}
              />
              <span className="text-xs text-slate-500">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            syncing
              ? "cursor-not-allowed bg-white/5 text-slate-500"
              : "bg-seridian-500/15 text-seridian-400 hover:bg-seridian-500/25",
          )}
        >
          {syncing ? (
            <>
              <svg
                className="h-3 w-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Syncing...
            </>
          ) : (
            syncLabel ?? "Sync"
          )}
        </button>
      </div>

      {syncing && (
        <div className="mt-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-seridian-400"
              style={{ width: "60%", animation: "pulse 1.5s ease-in-out infinite" }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tabular-nums">
          {count}
        </span>
        <span className="text-xs text-slate-500">{countLabel}</span>
      </div>

      {details && details.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{d.label}</span>
              <span className="text-slate-300 tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <span className="text-xs text-slate-500">
          Last synced: {formatTimeSince(lastSynced)}
        </span>
      </div>
    </div>
  );
}
