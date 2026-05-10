import { createServerFn } from "@tanstack/react-start";

export type ReframeInput = {
  trigger: string;
  onboardingTriggers: string[];
  streakDay: number;
  addictionName: string;
  timeOfDay: string;
};

export const getReframe = createServerFn({ method: "POST" })
  .inputValidator((data: ReframeInput) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const system =
      "You are a clinical psychologist specializing in addiction recovery. " +
      "Your responses are direct, evidence-based, and free of spiritual or motivational fluff. " +
      "You speak to intelligent adults who want truth, not comfort.";

    const user =
      `A user just relapsed. Context:\n` +
      `- Addiction: ${data.addictionName}\n` +
      `- Clean streak before relapse: ${data.streakDay} days\n` +
      `- Time of day: ${data.timeOfDay}\n` +
      `- Known trigger profile from onboarding: ${data.onboardingTriggers.length ? data.onboardingTriggers.join(", ") : "not specified"}\n` +
      `- What happened right before: ${data.trigger}\n\n` +
      `Write a 3-4 sentence reframe. Be direct and clinical. Acknowledge what happened, connect it to their specific trigger pattern, and give one concrete psychological insight they can act on. ` +
      `Do not use phrases like "it's okay" or "you've got this". Do not be preachy. End with one specific action they should take right now.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    const json = (await res.json()) as { content: { text: string }[] };
    const text = json.content?.[0]?.text;
    if (!text) throw new Error("Empty response from Claude");
    return { text };
  });
