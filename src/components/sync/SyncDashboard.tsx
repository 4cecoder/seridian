"use client";

import { useState, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { LinearSyncSection } from "./LinearSyncSection";
import { GitHubSyncSection } from "./GitHubSyncSection";

export function SyncDashboard() {
  const linearStats = useQuery(api.linearIngest.getLinearStats);
  const githubStats = useQuery(api.githubIngest.getGitHubStats);
  const syncLinear = useAction(api.linearSync.syncAllLinear);
  const syncGitHub = useAction(api.githubSync.syncAllGitHub);
  const [syncingAll, setSyncingAll] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  const linearConnected = !!process.env.NEXT_PUBLIC_LINEAR_API_KEY || linearStats !== undefined;
  const githubConnected = !!process.env.NEXT_PUBLIC_GITHUB_TOKEN || githubStats !== undefined;

  const handleSyncAll = useCallback(async () => {
    setSyncingAll(true);
    setLastSyncResult(null);
    try {
      const [linearResult, githubResult] = await Promise.allSettled([
        syncLinear({}),
        syncGitHub({}),
      ]);

      const parts: string[] = [];
      if (linearResult.status === "fulfilled") {
        const r = linearResult.value as { issues?: { created: number; updated: number } };
        parts.push(
          `Linear: ${r.issues?.created ?? 0} new, ${r.issues?.updated ?? 0} updated`,
        );
      } else {
        parts.push(`Linear: ${linearResult.reason instanceof Error ? linearResult.reason.message : "failed"}`);
      }

      if (githubResult.status === "fulfilled") {
        const r = githubResult.value as { issues: { created: number; updated: number }; projects: { created: number; updated: number } };
        parts.push(
          `GitHub: ${r.issues.created + r.projects.created} new, ${r.issues.updated + r.projects.updated} updated`,
        );
      } else {
        parts.push(`GitHub: ${githubResult.reason instanceof Error ? githubResult.reason.message : "failed"}`);
      }

      setLastSyncResult(parts.join(" | "));
    } catch (err) {
      setLastSyncResult(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncingAll(false);
    }
  }, [syncLinear, syncGitHub]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sync Management</h1>
          <p className="text-sm text-slate-500">
            Synchronize data from external services
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={syncingAll}
          className="inline-flex items-center gap-2 rounded-lg bg-seridian-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-seridian-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncingAll ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
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
              Syncing All...
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
              Sync All
            </>
          )}
        </button>
      </div>

      {lastSyncResult && (
        <div className="rounded-lg border border-seridian-500/20 bg-seridian-500/10 px-4 py-3 text-sm text-seridian-400">
          {lastSyncResult}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <LinearSyncSection />
        <GitHubSyncSection />
      </div>
    </div>
  );
}
