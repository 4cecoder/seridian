/**
 * Linear GraphQL helper — bun-compatible, Next 15 App Router ready.
 * POSTs to https://api.linear.app/graphql via native fetch (no deps).
 * Reads LINEAR_API_KEY from process.env at request time only, so this
 * module never touches env at build/import time and cannot crash a build.
 */

const LINEAR_API_URL = "https://api.linear.app/graphql";

export type CreateLinearIssueParams = {
  title: string;
  description: string;
  teamId: string;
  labels?: string[];
};

export type CreateLinearIssueResult =
  | { ok: true; identifier: string; url?: string }
  | { ok: false; error: string };

type IssueCreateResponse = {
  data?: {
    issueCreate?: {
      success?: boolean;
      issue?: { identifier?: string; url?: string };
    };
  };
  errors?: { message?: string }[];
};

/**
 * Create a Linear issue via the issueCreate GraphQL mutation.
 * Uses the official REST-style auth header: `Authorization: <api key>`
 * (Linear GraphQL accepts the raw API key).
 */
export async function createLinearIssue({
  title,
  description,
  teamId,
  labels,
}: CreateLinearIssueParams): Promise<CreateLinearIssueResult> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "LINEAR_API_KEY is not configured" };
  }
  if (!teamId || !title?.trim() || !description?.trim()) {
    return { ok: false, error: "title, description, and teamId are required" };
  }

  const input: Record<string, unknown> = {
    teamId,
    title: title.trim(),
    description: description.trim(),
  };
  if (labels && labels.length > 0) {
    input.labelIds = labels;
  }

  const mutation = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          url
        }
      }
    }
  `;

  let res: Response;
  try {
    res = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: mutation, variables: { input } }),
    });
  } catch {
    return { ok: false, error: "Could not reach Linear" };
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "Linear rejected the API key (401/403)" };
    }
    if (res.status === 429) {
      return { ok: false, error: "Linear rate limit reached" };
    }
    return { ok: false, error: `Linear returned HTTP ${res.status}` };
  }

  let json: IssueCreateResponse;
  try {
    json = (await res.json()) as IssueCreateResponse;
  } catch {
    return { ok: false, error: "Linear returned an unreadable response" };
  }

  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e) => e.message ?? "Linear error").join("; ");
    return { ok: false, error: msg };
  }

  const created = json.data?.issueCreate;
  if (!created?.success || !created.issue?.identifier) {
    return { ok: false, error: "Linear did not create the issue" };
  }

  return { ok: true, identifier: created.issue.identifier, url: created.issue.url };
}
