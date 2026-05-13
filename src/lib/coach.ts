export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function sendCoachMessage(messages: ChatMessage[]): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    throw new Error(`/api/chat error: ${res.status}`);
  }

  const json = (await res.json()) as { text?: string; error?: string };
  if (!json.text) throw new Error(json.error ?? "Empty response");
  return json.text;
}
