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

// ── /api/chat — Anthropic proxy ──────────────────────────────────────────────
// Handled before TanStack so the API key (from Cloudflare env binding) never
// touches the client bundle or the SSR renderer.
async function handleChatApi(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
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

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const SYSTEM_PROMPT =
    "You are a compassionate recovery coach inside the Stopamine app. You help users with habit recovery, urge management, motivation, and general life support. You are warm, direct, and non-judgmental. You never shame the user. You focus on progress, not perfection. Keep responses concise and human — no bullet points, no clinical language. You know the user is on a recovery journey and may be struggling.";

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


export default {
  async fetch(request: Request, env: Env, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      return handleChatApi(request, env);
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
