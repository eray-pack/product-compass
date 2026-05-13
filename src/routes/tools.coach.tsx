import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { sendCoachMessage, type ChatMessage } from "@/lib/coach";

export const Route = createFileRoute("/tools/coach")({
  component: Coach,
});

const FIRST_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hey. I'm here. How are you holding up today?",
};

function Coach() {
  const [messages, setMessages] = useState<ChatMessage[]>([FIRST_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsTyping(true);

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
            placeholder="Say anything…"
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground leading-relaxed py-1"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
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
        <p className="text-center text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
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
