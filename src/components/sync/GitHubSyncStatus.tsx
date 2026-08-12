"use client";

import { useState, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { cn } from "@/lib/utils";

function formatTimestamp(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export function GitHubSyncStatus() {
  const stats = useQuery(api.githubIngest.getGitHubStats);
  const syncAll = useAction(api.githubSync.syncAllGitHub);
  const syncIssues = useAction(api.githubSync.syncGitHubIssues);
  const syncProjects = useAction(api.githubSync.syncGitHubProjects);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleSyncAll = useCallback(async () => {
    setSyncing(true);
    setLastResult(null);
    try {
      const result = await syncAll({});
      if (!result.configured) {
        setLastResult("GitHub token is not configured. Add GITHUB_TOKEN to your Convex environment.");
      } else {
        setLastResult(
          `Synced ${result.issues.total} issues (${result.issues.created} new, ${result.issues.updated} updated) and ${result.projects.total} projects`,
        );
      }
    } catch (err) {
      setLastResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  }, [syncAll]);

  const handleSyncIssues = useCallback(async () => {
    setSyncing(true);
    setLastResult(null);
    try {
      const result = await syncIssues({});
      if ("configured" in result && !result.configured) {
        setLastResult("GitHub token is not configured. Add GITHUB_TOKEN to your Convex environment.");
      } else {
        setLastResult(
          `Synced ${result.total} issues (${result.created} new, ${result.updated} updated)`,
        );
      }
    } catch (err) {
      setLastResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  }, [syncIssues]);

  const handleSyncProjects = useCallback(async () => {
    setSyncing(true);
    setLastResult(null);
    try {
      const result = await syncProjects({});
      if ("configured" in result && !result.configured) {
        setLastResult("GitHub token is not configured. Add GITHUB_TOKEN to your Convex environment.");
      } else {
        setLastResult(
          `Synced ${result.total} projects (${result.created} new, ${result.updated} updated)`,
        );
      }
    } catch (err) {
      setLastResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  }, [syncProjects]);

  if (stats === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.02]" />
      </div>
    );
  }

  const isConfigured = stats.isConfigured ?? false;
  const issueStates = Object.entries(stats.issuesByState);
  const projectStates = Object.entries(stats.projectsByState);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">GitHub Sync</h2>
          <p className="text-sm text-slate-400">
            {!isConfigured
              ? "Not configured — add GITHUB_TOKEN to enable"
              : `Last full sync: ${formatTimestamp(stats.lastFullSync)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={syncing || !isConfigured}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            syncing || !isConfigured
              ? "cursor-not-allowed bg-white/5 text-slate-500"
              : "bg-seridian-500/20 text-seridian-400 hover:bg-seridian-500/30",
          )}
        >
          {syncing ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Syncing...
            </>
          ) : (
            "Sync Now"
          )}
        </button>
      </div>

      {lastResult && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            lastResult.startsWith("Error")
              ? "border-red-500/20 bg-red-500/10 text-red-400"
              : "border-seridian-500/20 bg-seridian-500/10 text-seridian-400",
          )}
        >
          {lastResult}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300">Issues</h3>
            <span className="text-2xl font-bold text-white">{stats.totalIssues}</span>
          </div>
          <div className="mt-3 space-y-1">
            {issueStates.length > 0 ? (
              issueStates.map(([state, count]) => (
                <div key={state} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{state}</span>
                  <span className="text-slate-300 tabular-nums">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No issues synced</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-xs text-slate-500">
              Last issue sync: {formatTimestamp(stats.lastIssueSync)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncIssues}
            disabled={syncing || !isConfigured}
            className={cn(
              "mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              syncing || !isConfigured
                ? "cursor-not-allowed bg-white/5 text-slate-500"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
            )}
          >
            Sync Issues
          </button>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300">Projects</h3>
            <span className="text-2xl font-bold text-white">{stats.totalProjects}</span>
          </div>
          <div className="mt-3 space-y-1">
            {projectStates.length > 0 ? (
              projectStates.map(([state, count]) => (
                <div key={state} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{state}</span>
                  <span className="text-slate-300 tabular-nums">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No projects synced</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-xs text-slate-500">
              Last project sync: {formatTimestamp(stats.lastProjectSync)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncProjects}
            disabled={syncing || !isConfigured}
            className={cn(
              "mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              syncing || !isConfigured
                ? "cursor-not-allowed bg-white/5 text-slate-500"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
            )}
          >
            Sync Projects
          </button>
        </div>
      </div>
    </div>
  );
}
