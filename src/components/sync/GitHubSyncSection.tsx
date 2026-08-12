"use client";

import { useState, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { SyncCard } from "./SyncCard";

import { CheckSquare, FolderKanban } from "lucide-react";

interface GitHubSyncSectionProps {
  onSyncComplete?: () => void;
}

export function GitHubSyncSection({ onSyncComplete }: GitHubSyncSectionProps) {
  const stats = useQuery(api.githubIngest.getGitHubStats);
  const syncAll = useAction(api.githubSync.syncAllGitHub);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const isConfigured = stats?.isConfigured ?? false;

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    setResultMsg(null);
    try {
      const result = await syncAll({});
      if (!result.configured) {
        setError("GitHub token is not configured. Add GITHUB_TOKEN to your Convex environment to enable GitHub sync.");
      } else {
        setResultMsg(
          `Synced ${result.issues.total} issues (${result.issues.created} new, ${result.issues.updated} updated) and ${result.projects.total} projects`,
        );
        onSyncComplete?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [syncAll, onSyncComplete]);

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
      </div>
    );
  }

  const issueDetails = Object.entries(stats.issuesByState).map(
    ([state, count]) => ({
      label: state,
      value: count,
    }),
  );

  const projectDetails = Object.entries(stats.projectsByState).map(
    ([state, count]) => ({
      label: state,
      value: count,
    }),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">GitHub Sync</h2>
          <p className="text-sm text-slate-500">
            {isConfigured
              ? "Manage GitHub repository data synchronization"
              : "GitHub integration not configured"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing || !isConfigured}
          className="inline-flex items-center gap-2 rounded-lg bg-seridian-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-seridian-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? (
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

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {resultMsg && (
        <div className="rounded-lg border border-seridian-500/20 bg-seridian-500/10 px-4 py-3 text-sm text-seridian-400">
          {resultMsg}
        </div>
      )}

      {!isConfigured && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <p className="font-medium">GitHub integration requires setup</p>
          <p className="mt-1 text-amber-400/80">
            Add a <code className="rounded bg-amber-500/10 px-1">GITHUB_TOKEN</code> environment variable
            to your Convex deployment to enable GitHub sync.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SyncCard
          title="Issues"
          icon={CheckSquare}
          lastSynced={stats.lastIssueSync}
          count={stats.totalIssues}
          countLabel="synced issues"
          syncing={syncing}
          onSync={handleSync}
          connected={true}
          configured={isConfigured}
          details={issueDetails.length > 0 ? issueDetails : undefined}
        />
        <SyncCard
          title="Projects"
          icon={FolderKanban}
          lastSynced={stats.lastProjectSync}
          count={stats.totalProjects}
          countLabel="synced projects"
          syncing={syncing}
          onSync={handleSync}
          connected={true}
          configured={isConfigured}
          details={projectDetails.length > 0 ? projectDetails : undefined}
        />
      </div>
    </div>
  );
}
