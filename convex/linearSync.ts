import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";

const LINEAR_API_URL = "https://api.linear.app/graphql";

type LinearStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
type LinearPriority = "urgent" | "high" | "medium" | "low" | "none";

const STATUS_MAP: Record<string, LinearStatus> = {
  backlog: "backlog",
  todo: "todo",
  "in progress": "in_progress",
  "in review": "in_review",
  done: "done",
  completed: "done",
  canceled: "done",
  cancelled: "done",
  duplicate: "done",
};

const PRIORITY_MAP: Record<number, LinearPriority> = {
  0: "none",
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

function mapStatus(name: string): LinearStatus {
  return STATUS_MAP[name.toLowerCase()] ?? "todo";
}

function mapPriority(p: number): LinearPriority {
  return PRIORITY_MAP[p] ?? "none";
}

type LinearIssueNode = {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  state: { name: string };
  priority: number;
  assignee: { name: string } | null;
  labels: { nodes: { name: string }[] } | null;
  createdAt: string;
  updatedAt: string;
};

type LinearIssuesResponse = {
  data?: {
    issues?: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      nodes: LinearIssueNode[];
    };
  };
  errors?: { message?: string }[];
};

type MappedIssue = {
  linearId: string;
  identifier: string;
  title: string;
  description: string;
  status: LinearStatus;
  priority: LinearPriority;
  assignee: string;
  labels: string[];
  linearCreatedAt: string;
  linearUpdatedAt: string;
};

function transformIssue(node: LinearIssueNode): MappedIssue {
  return {
    linearId: node.id,
    identifier: node.identifier,
    title: node.title,
    description: node.description ?? "",
    status: mapStatus(node.state.name),
    priority: mapPriority(node.priority),
    assignee: node.assignee?.name ?? "",
    labels: node.labels?.nodes?.map((l) => l.name) ?? [],
    linearCreatedAt: node.createdAt,
    linearUpdatedAt: node.updatedAt,
  };
}

const ISSUES_QUERY = `
  query SyncLinearIssues($after: String) {
    issues(first: 100, after: $after, orderBy: updatedAt) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        identifier
        title
        description
        state { name }
        priority
        assignee { name }
        labels { nodes { name } }
        createdAt
        updatedAt
      }
    }
  }
`;

const ISSUES_QUERY_WITH_TEAM = `
  query SyncLinearIssues($after: String, $teamId: String!) {
    issues(
      first: 100
      after: $after
      orderBy: updatedAt
      filter: { team: { id: { eq: $teamId } } }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        identifier
        title
        description
        state { name }
        priority
        assignee { name }
        labels { nodes { name } }
        createdAt
        updatedAt
      }
    }
  }
`;

async function fetchLinearIssues(
  apiKey: string,
  teamId?: string,
): Promise<MappedIssue[]> {
  const allIssues: MappedIssue[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  const queryStr = teamId ? ISSUES_QUERY_WITH_TEAM : ISSUES_QUERY;

  while (hasNextPage) {
    const variables: Record<string, string | null> = { after: cursor };
    if (teamId) {
      variables.teamId = teamId;
    }

    let res: Response;
    try {
      res = await fetch(LINEAR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({ query: queryStr, variables }),
      });
    } catch {
      throw new Error("Could not reach Linear API");
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Linear rejected the API key");
      }
      if (res.status === 429) {
        throw new Error("Linear rate limit reached");
      }
      throw new Error(`Linear returned HTTP ${res.status}`);
    }

    let json: LinearIssuesResponse;
    try {
      json = (await res.json()) as LinearIssuesResponse;
    } catch {
      throw new Error("Linear returned an unreadable response");
    }

    if (json.errors && json.errors.length > 0) {
      const msg = json.errors
        .map((e) => e.message ?? "Linear error")
        .join("; ");
      throw new Error(`Linear GraphQL errors: ${msg}`);
    }

    const issues = json.data?.issues;
    if (!issues) {
      throw new Error("Unexpected response structure from Linear");
    }

    for (const node of issues.nodes) {
      allIssues.push(transformIssue(node));
    }

    hasNextPage = issues.pageInfo.hasNextPage;
    cursor = issues.pageInfo.endCursor;
  }

  return allIssues;
}

const issuePayloadValidator = v.object({
  linearId: v.string(),
  identifier: v.string(),
  title: v.string(),
  description: v.string(),
  status: v.union(
    v.literal("backlog"),
    v.literal("todo"),
    v.literal("in_progress"),
    v.literal("in_review"),
    v.literal("done"),
  ),
  priority: v.union(
    v.literal("urgent"),
    v.literal("high"),
    v.literal("medium"),
    v.literal("low"),
    v.literal("none"),
  ),
  assignee: v.string(),
  labels: v.array(v.string()),
  linearCreatedAt: v.string(),
  linearUpdatedAt: v.string(),
});

export const upsertIssues = internalMutation({
  args: {
    issues: v.array(issuePayloadValidator),
  },
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;

    for (const issue of args.issues) {
      const existing = await ctx.db
        .query("issues")
        .withIndex("by_linearId", (q) => q.eq("linearId", issue.linearId))
        .unique();

      const now = Date.now();

      if (existing) {
        await ctx.db.patch(existing._id, {
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          assignee: issue.assignee,
          labels: issue.labels,
          linearCreatedAt: issue.linearCreatedAt,
          linearUpdatedAt: issue.linearUpdatedAt,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        await ctx.db.insert("issues", {
          linearId: issue.linearId,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          assignee: issue.assignee,
          labels: issue.labels,
          linearCreatedAt: issue.linearCreatedAt,
          linearUpdatedAt: issue.linearUpdatedAt,
          lastSyncedAt: now,
          order: 0,
        });
        created++;
      }
    }

    const syncMeta = await ctx.db
      .query("syncMeta")
      .withIndex("by_key", (q) => q.eq("key", "lastSyncTime"))
      .unique();

    if (syncMeta) {
      await ctx.db.patch(syncMeta._id, { value: Date.now().toString() });
    } else {
      await ctx.db.insert("syncMeta", {
        key: "lastSyncTime",
        value: Date.now().toString(),
      });
    }

    return { created, updated, total: args.issues.length };
  },
});

export const syncLinearIssues = action({
  args: {
    teamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      throw new Error("LINEAR_API_KEY is not configured");
    }

    const issues = await fetchLinearIssues(apiKey, args.teamId);

    const result: { created: number; updated: number; total: number } =
      await ctx.runMutation(internal.linearSync.upsertIssues, {
        issues,
      });

    return result;
  },
});

export const getLinearIssues = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getLastSyncTime = query({
  args: {},
  handler: async (ctx) => {
    const meta = await ctx.db
      .query("syncMeta")
      .withIndex("by_key", (q) => q.eq("key", "lastSyncTime"))
      .unique();
    return meta ? meta.value : null;
  },
});
