/**
 * Activity feed types and utilities for the dashboard overview.
 *
 * Activities are derived from existing Convex entities (issues, deals,
 * bookings, proposals, clients) rather than a dedicated activity log.
 */

export type ActivityType =
  | "issue_created"
  | "issue_updated"
  | "deal_created"
  | "deal_stage_changed"
  | "booking_created"
  | "proposal_sent"
  | "client_added";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: number;
  user?: string;
  entityId?: string;
  entityType?: string;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(date: Date): string {
  const now = startOfDay(new Date());
  const target = startOfDay(date);

  const diff = now.getTime() - target.getTime();
  if (diff < 0) return "Upcoming";
  if (diff < DAY_MS) return "Today";
  if (diff < 2 * DAY_MS) return "Yesterday";
  return "Earlier";
}

/**
 * Group activities by day labels: "Today", "Yesterday", "Earlier".
 * Returns an ordered Map from most recent to oldest.
 */
export function groupByDate(activities: Activity[]): Map<string, Activity[]> {
  const grouped = new Map<string, Activity[]>();

  for (const activity of [...activities].sort((a, b) => b.timestamp - a.timestamp)) {
    const label = formatDateLabel(new Date(activity.timestamp));
    const existing = grouped.get(label);
    if (existing) {
      existing.push(activity);
    } else {
      grouped.set(label, [activity]);
    }
  }

  return grouped;
}

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

/**
 * Return a human-readable relative time string (e.g. "5m ago", "2h ago",
 * "Yesterday", "3d ago").
 */
export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0) return "just now";

  const seconds = Math.floor(diff / 1_000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  // Fallback to absolute date
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Activity icons (text-based, no extra dependencies)
// ---------------------------------------------------------------------------

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  issue_created: "☐",
  issue_updated: "☑",
  deal_created: "▭",
  deal_stage_changed: "▷",
  booking_created: "◷",
  proposal_sent: "✉",
  client_added: "◎",
};

export function getActivityIcon(type: ActivityType): string {
  return ACTIVITY_ICONS[type] ?? "•";
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  issue_created: "text-blue-400 bg-blue-500/10",
  issue_updated: "text-amber-400 bg-amber-500/10",
  deal_created: "text-emerald-400 bg-emerald-500/10",
  deal_stage_changed: "text-violet-400 bg-violet-500/10",
  booking_created: "text-cyan-400 bg-cyan-500/10",
  proposal_sent: "text-orange-400 bg-orange-500/10",
  client_added: "text-pink-400 bg-pink-500/10",
};

export function getActivityColor(type: ActivityType): string {
  return ACTIVITY_COLORS[type] ?? "text-slate-400 bg-slate-500/10";
}
