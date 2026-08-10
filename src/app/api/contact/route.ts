import { NextResponse } from "next/server";
import { createLinearIssue } from "@/lib/linear";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

const rateMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
};

type ValidationResult =
  | { ok: true; data: { name: string; email: string; message: string } }
  | { ok: false; error: string };

function validate(body: ContactBody): ValidationResult {
  const { name, email, message, company } = body;

  if (typeof company === "string" && company.trim().length > 0) {
    return { ok: false, error: "Spam detected" };
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    return { ok: false, error: "Name must be at least 2 characters" };
  }
  if (name.trim().length > 100) {
    return { ok: false, error: "Name too long (max 100 characters)" };
  }

  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { ok: false, error: "A valid email is required" };
  }

  if (typeof message !== "string" || message.trim().length < 10) {
    return { ok: false, error: "Message must be at least 10 characters" };
  }
  if (message.length > 2000) {
    return { ok: false, error: "Message too long (max 2000 characters)" };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    },
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "contact",
    hint: "POST { name, email, message } to create a Linear issue",
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Rate limited — please try again in a minute" },
      { status: 429 }
    );
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Could not read request body" }, { status: 400 });
  }
  if (raw.length === 0) {
    return NextResponse.json({ ok: false, error: "Empty request body" }, { status: 400 });
  }
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request body too large" }, { status: 400 });
  }

  let body: ContactBody;
  try {
    body = JSON.parse(raw) as ContactBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validate(body);
  if (!validated.ok) {
    if (validated.error === "Spam detected") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json({ ok: false, error: validated.error }, { status: 400 });
  }

  const teamId = process.env.LINEAR_TEAM_ID;
  if (!teamId) {
    console.error("[/api/contact] LINEAR_TEAM_ID is not configured");
    return NextResponse.json(
      { ok: false, error: "Contact submissions are temporarily unavailable" },
      { status: 500 }
    );
  }

  const { name, email, message } = validated.data;
  const title = `Contact form: ${name} <${email}>`.slice(0, 120);
  const description = [
    "**Submitted via:** seridian.dev contact form",
    `**From:** ${name} <${email}>`,
    "",
    "---",
    "",
    message,
  ].join("\n");

  const result = await createLinearIssue({ title, description, teamId });

  if (!result.ok) {
    console.error("[/api/contact] createLinearIssue failed:", result.error);
    return NextResponse.json(
      { ok: false, error: "Contact submission failed — please try again later" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, identifier: result.identifier }, { status: 201 });
}
