import { supabase } from "@/lib/supabase";

export type ReframeInput = {
  trigger: string;
  onboardingTriggers: string[];
  streakDay: number;
  addictionName: string;
  timeOfDay: string;
};

// Thin client for /api/reframe. The previous createServerFn version read
// process.env.ANTHROPIC_API_KEY, which vite baked as "" at build time — the
// feature was dead in every production deploy. Only the worker fetch handler
// in src/server.ts receives the Cloudflare env binding, so the call lives there.
export async function getReframe({ data }: { data: ReframeInput }): Promise<{ text: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not logged in");

  const res = await fetch("/api/reframe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || !json.text) throw new Error(json.error ?? `Error ${res.status}`);
  return { text: json.text };
}
