import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Lock } from "lucide-react";
import { sendCoachMessage, type ChatMessage } from "@/lib/coach";
import { useAppState } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

const FREE_DAILY_LIMIT = 3;
const LIMIT_KEY = "stopamine.coach.free";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // "2026-05-16"
}

function getFreeUsage(): number {
  try {
    const raw = localStorage.getItem(LIMIT_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    if (date !== getTodayKey()) return 0;
    return count;
  } catch { return 0; }
}

function incrementFreeUsage() {
  const count = getFreeUsage() + 1;
  localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: getTodayKey(), count }));
  return count;
}

export const Route = createFileRoute("/tools/coach")({
  component: Coach,
});

const FIRST_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hey. I'm here. How are you holding up today?",
};

const QUICK_SUGGESTIONS = [
  "I'm struggling right now",
  "I need motivation",
  "Talk me through a craving",
];

function Coach() {
  const [state] = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([FIRST_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [freeUsed, setFreeUsed] = useState(getFreeUsage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLimitReached = !state.isPremium && freeUsed >= FREE_DAILY_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend(override?: string) {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;

    // Free limit check
    if (!state.isPremium && freeUsed >= FREE_DAILY_LIMIT) {
      triggerPaywall();
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsTyping(true);

    if (!state.isPremium) {
      const newCount = incrementFreeUsage();
      setFreeUsed(newCount);
    }

    try {
      const reply = await sendCoachMessage(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Sorry, something went wrong. Try again in a moment." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-grow textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  return (
    <div
      className="flex flex-col h-[100dvh]"
      style={{ background: "var(--background)" }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-4 pt-12 pb-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link
          to="/tools"
          className="h-9 w-9 rounded-xl grid place-items-center transition-colors"
          style={{ background: "var(--surface-2)", color: "var(--foreground)" }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {/* Robot icon */}
        <svg width="32" height="40" viewBox="0 0 52 66" fill="none" overflow="visible" className="robot-body" style={{ flexShrink: 0 }}>
          <line x1="26" y1="9" x2="26" y2="2" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="26" cy="2" r="2.5" fill="#C4873A" />
          <rect x="8" y="9" width="36" height="22" rx="6" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />
          <circle cx="19" cy="20" r="3.5" fill="#C4873A" opacity="0.85" />
          <circle cx="33" cy="20" r="3.5" fill="#C4873A" opacity="0.85" />
          <circle cx="20.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
          <circle cx="34.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
          <path d="M 20 26 Q 26 30.5 32 26" stroke="#C4873A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />
          <rect x="21" y="31" width="10" height="5" rx="2.5" fill="#261F15" />
          <rect x="5" y="36" width="42" height="26" rx="6" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />
          <rect x="14" y="42" width="24" height="12" rx="3" fill="#261F15" stroke="#C4873A" strokeWidth="0.6" opacity="0.75" />
          <circle cx="23" cy="48" r="2.5" fill="#C4873A" opacity="0.35" />
          <circle cx="30" cy="48" r="2.5" fill="#C4873A" opacity="0.9" />
          <rect x="0" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />
          <rect x="43" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" className="robot-wave-arm" />
        </svg>

        <div className="flex-1">
          <p className="font-semibold text-sm leading-tight">Your Recovery Coach</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Always here, no judgment
          </p>
        </div>
        {/* subtle online dot */}
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: "#3a9a6e", boxShadow: "0 0 6px #3a9a6e88" }}
        />
      </header>

      {/* ── Messages ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderBottomRightRadius: 4,
                    }
                  : {
                      background: "var(--card)",
                      color: "var(--foreground)",
                      borderBottomLeftRadius: 4,
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Quick suggestion buttons — visible only before the user sends anything */}
        {messages.length === 1 && !isTyping && (
          <div className="flex flex-col items-start gap-2 pt-1">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="text-sm font-medium px-4 py-2.5 rounded-full text-left active:scale-95 transition-transform"
                style={{
                  background: "oklch(0.16 0.025 265 / 0.9)",
                  border: "1px solid rgba(196,135,58,0.30)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "var(--card)",
                color: "var(--muted-foreground)",
                borderBottomLeftRadius: 4,
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pb-8 pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* Free limit banner */}
        {!state.isPremium && (
          <div className="mb-3 flex items-center justify-between text-[11px] px-1">
            {isLimitReached ? (
              <button
                onClick={() => triggerPaywall()}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-medium"
                style={{ background: "oklch(0.62 0.22 255 / 0.1)", border: "1px solid oklch(0.62 0.22 255 / 0.3)", color: "var(--primary)" }}
              >
                <Lock className="h-3.5 w-3.5" />
                You've used your 3 free messages today — unlock PRO to continue
              </button>
            ) : (
              <p style={{ color: "var(--muted-foreground)" }}>
                {FREE_DAILY_LIMIT - freeUsed} free message{FREE_DAILY_LIMIT - freeUsed !== 1 ? "s" : ""} left today
              </p>
            )}
          </div>
        )}

        {!isLimitReached && (
          <div
            className="flex items-end gap-2 rounded-2xl px-3 py-2"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what's on your mind…"
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground leading-relaxed py-1"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="h-8 w-8 rounded-xl grid place-items-center shrink-0 transition-all mb-0.5"
              style={{
                background: input.trim() && !isTyping ? "var(--primary)" : "var(--surface-2)",
                color: input.trim() && !isTyping ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {!isLimitReached && (
          <p className="text-center text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 h-4">
      <span className="typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="typing-dot" style={{ animationDelay: "160ms" }} />
      <span className="typing-dot" style={{ animationDelay: "320ms" }} />
    </span>
  );
}
