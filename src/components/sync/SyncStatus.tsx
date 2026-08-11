"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function formatTime(ts: number | null): string {
  if (!ts) return "Never";
  const date = new Date(ts);
  return date.toLocaleString();
}

function timeSince(ts: number | null): string {
  if (!ts) return "Never synced";
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface SyncResult {
  created: number;
  updated: number;
  total: number;
}

export function SyncStatus() {
  const stats = useQuery(api.linearIngest.getLinearStats);
  const syncAll = useAction(api.linearSync.syncAllLinear);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<Record<string, SyncResult> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setLastResult(null);
    try {
      const result = await syncAll({});
      setLastResult(result as Record<string, SyncResult>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (!stats) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-seridian-400 border-t-transparent" />
          <span className="text-sm text-slate-400">Loading sync status...</span>
        </div>
      </div>
    );
  }

  const { counts, lastSync } = stats;
  const items = [
    { label: "Issues", count: counts.issues, last: lastSync.issues },
    { label: "Teams", count: counts.teams, last: lastSync.teams },
    { label: "Projects", count: counts.projects, last: lastSync.projects },
    { label: "Labels", count: counts.labels, last: lastSync.labels },
    { label: "Users", count: counts.users, last: lastSync.users },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Linear Data Sync
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Last full sync: {timeSince(lastSync.all)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-lg bg-seridian-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-seridian-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Syncing...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync Now
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {syncing && (
        <div className="mb-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full animate-pulse rounded-full bg-seridian-400" style={{ width: "60%" }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Fetching data from Linear...
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/5 bg-white/5 p-4"
          >
            <div className="text-2xl font-bold text-white">{item.count}</div>
            <div className="mt-1 text-sm text-slate-400">{item.label}</div>
            <div className="mt-2 text-xs text-slate-500">
              {timeSince(item.last)}
            </div>
            {lastResult && lastResult[item.label.toLowerCase()] && (
              <div className="mt-2 text-xs text-seridian-400">
                +{lastResult[item.label.toLowerCase()].created} new,{" "}
                {lastResult[item.label.toLowerCase()].updated} updated
              </div>
            )}
          </div>
        ))}
      </div>

      {lastResult && (
        <div className="mt-4 rounded-lg border border-seridian-500/20 bg-seridian-500/10 px-4 py-3 text-sm text-seridian-400">
          Sync complete.{" "}
          {Object.values(lastResult).reduce(
            (acc, r) => acc + r.created,
            0,
          )}{" "}
          new items, {" "}
          {Object.values(lastResult).reduce(
            (acc, r) => acc + r.updated,
            0,
          )}{" "}
          updated.
        </div>
      )}
    </div>
  );
}
