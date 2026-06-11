import { supabase } from "@/lib/supabase";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoachContext = { habit?: string; day?: number; strikes?: number };

export async function sendCoachMessage(messages: ChatMessage[], context?: CoachContext): Promise<string> {
  // Get current session JWT — required for server-side auth verification
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not logged in");

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  const json = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || !json.text) throw new Error(json.error ?? `Error ${res.status}`);
  return json.text;
}
