import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type Env = {
  ANTHROPIC_API_KEY?: string;
};

type ServerEntry = {
  fetch: (request: Request, env: Env, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// ── Rate limiter — in-memory per Cloudflare isolate ──────────────────────────
// 20 requests per IP per 60 seconds. Protects Anthropic credits from abuse.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

const SUPABASE_URL = "https://iikoxopupfjiavjjvkgm.supabase.co";

// Verify Supabase JWT — returns user id if valid, null if not
async function verifySupabaseJWT(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "Authorization": `Bearer ${token}`, "apikey": "sb_publishable_lG6o7ZK94dOd5Px5iaBL-Q_d0rQGJ_f" },
    });
    if (!res.ok) return null;
    const user = await res.json() as { id?: string };
    return user.id ?? null;
  } catch {
    return null;
  }
}

// ── /api/chat — Anthropic proxy ──────────────────────────────────────────────
// Handled before TanStack so the API key (from Cloudflare env binding) never
// touches the client bundle or the SSR renderer.
async function handleChatApi(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Rate limit by IP
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Slow down." }), {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": "60" },
    });
  }

  // Verify user is logged in — blocks unauthenticated abuse
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const userId = await verifySupabaseJWT(token);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Priority: Cloudflare binding (wrangler/prod) → process.env baked by vite define → import.meta.env (vite dev)
  // env is undefined in vite dev (no Cloudflare runtime), so use optional chaining.
  const apiKey =
    env?.ANTHROPIC_API_KEY ??
    process.env.ANTHROPIC_API_KEY ??
    (import.meta.env as Record<string, string>).ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("/api/chat: ANTHROPIC_API_KEY binding is not set");
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { messages?: unknown; context?: { habit?: string; day?: number; strikes?: number } };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // The coach knows the user's REAL state (habit, streak day, 3-strike count) —
  // a context-blind canned chatbot was indistinguishable from template apps.
  const ctxParts: string[] = [];
  if (body.context?.habit) ctxParts.push(`They are quitting: ${String(body.context.habit).slice(0, 60)}.`);
  if (typeof body.context?.day === "number") ctxParts.push(`Today is day ${Math.max(1, Math.floor(body.context.day))} of their current streak.`);
  if (typeof body.context?.strikes === "number") ctxParts.push(`They have logged ${Math.max(0, Math.floor(body.context.strikes))} of 3 slips this streak (the 3rd resets their counter — the app is honest about this).`);

  const SYSTEM_PROMPT =
    "You are a compassionate recovery coach inside the Stopamine app. You help users with habit recovery, urge management, motivation, and general life support. You are warm, direct, and non-judgmental. You never shame the user. You focus on progress, not perfection. Keep responses concise and human — no bullet points, no clinical language. You know the user is on a recovery journey and may be struggling." +
    (ctxParts.length ? " Known context about this user: " + ctxParts.join(" ") : "");

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: body.messages,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error(`/api/chat: Anthropic ${upstream.status} — ${text}`);
    return new Response(JSON.stringify({ error: "Upstream API error", detail: upstream.status }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const json = (await upstream.json()) as { content?: { text: string }[] };
  const text = json.content?.[0]?.text;
  if (!text) {
    return new Response(JSON.stringify({ error: "Empty response" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}


// ── /api/reframe — post-relapse AI reframe ───────────────────────────────────
// Lives here (not in a createServerFn) because only this fetch handler receives
// the Cloudflare env binding — the old createServerFn version baked an empty
// key at build time and was dead code in every production deploy.
async function handleReframeApi(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429, headers: { "content-type": "application/json", "retry-after": "60" },
    });
  }

  const token = (request.headers.get("authorization") ?? "").replace("Bearer ", "").trim();
  if (!token || !(await verifySupabaseJWT(token))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { "content-type": "application/json" },
    });
  }

  const apiKey = env?.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500, headers: { "content-type": "application/json" },
    });
  }

  let data: { trigger?: string; onboardingTriggers?: string[]; streakDay?: number; addictionName?: string; timeOfDay?: string };
  try { data = await request.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "content-type": "application/json" },
    });
  }

  const system =
    "You are a clinical psychologist specializing in addiction recovery. " +
    "Your responses are direct, evidence-based, and free of spiritual or motivational fluff. " +
    "You speak to intelligent adults who want truth, not comfort.";
  const user =
    `A user just relapsed. Context:\n` +
    `- Addiction: ${String(data.addictionName ?? "unknown").slice(0, 60)}\n` +
    `- Clean streak before relapse: ${Math.max(0, Math.floor(Number(data.streakDay) || 0))} days\n` +
    `- Time of day: ${String(data.timeOfDay ?? "unknown").slice(0, 40)}\n` +
    `- Known trigger profile from onboarding: ${Array.isArray(data.onboardingTriggers) && data.onboardingTriggers.length ? data.onboardingTriggers.slice(0, 8).join(", ").slice(0, 200) : "not specified"}\n` +
    `- What happened right before: ${String(data.trigger ?? "not specified").slice(0, 200)}\n\n` +
    `Write a 3-4 sentence reframe. Be direct and clinical. Acknowledge what happened, connect it to their specific trigger pattern, and give one concrete psychological insight they can act on. ` +
    `Do not use phrases like "it's okay" or "you've got this". Do not be preachy. End with one specific action they should take right now.`;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 220, system, messages: [{ role: "user", content: user }] }),
  });
  if (!upstream.ok) {
    console.error(`/api/reframe: Anthropic ${upstream.status}`);
    return new Response(JSON.stringify({ error: "Upstream API error" }), {
      status: 502, headers: { "content-type": "application/json" },
    });
  }
  const json = (await upstream.json()) as { content?: { text: string }[] };
  const text = json.content?.[0]?.text;
  if (!text) {
    return new Response(JSON.stringify({ error: "Empty response" }), {
      status: 502, headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ text }), { status: 200, headers: { "content-type": "application/json" } });
}

export default {
  async fetch(request: Request, env: Env, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      return handleChatApi(request, env);
    }
    if (url.pathname === "/api/reframe") {
      return handleReframeApi(request, env);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
