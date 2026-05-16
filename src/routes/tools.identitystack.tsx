import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/identitystack")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: IdentityStack,
});

const GAME_DURATION = 30;
const C = "#E11D48";

interface CardItem { id: number; text: string; isGood: boolean; }

const GOOD_CARDS = [
  "Daily discipline", "Early riser", "I train my mind",
  "I keep promises", "Stay focused", "One day at a time",
  "I show up", "Build the habit", "I am in control",
  "Progress not perfection", "I earn my rest", "Strong mind wins",
];

const BAD_CARDS = [
  "Just this once", "Nobody will know", "I'll start Monday",
  "One won't hurt", "I deserve a break", "Give in now",
  "It's too hard", "I can't stop", "Tomorrow is better",
  "What's the point", "No one cares", "I'm already failing",
];

function makeQueue(): CardItem[] {
  const pool = [
    ...GOOD_CARDS.map((text, i) => ({ id: i, text, isGood: true })),
    ...BAD_CARDS.map((text, i) => ({ id: GOOD_CARDS.length + i, text, isGood: false })),
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function IdentityStack() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [queue, setQueue] = useState<CardItem[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "done">("idle");
  const locked = useRef(false);

  function clear() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function start() {
    clear();
    locked.current = false;
    phaseRef.current = "playing";
    setPhase("playing");
    setQueue(makeQueue());
    setScore(0);
    setWrong(0);
    setFeedback(null);
    setSwipe(null);
    setTimeLeft(GAME_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clear(); phaseRef.current = "done"; setPhase("done"); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function decide(keep: boolean) {
    if (phaseRef.current !== "playing" || queue.length === 0 || locked.current) return;
    locked.current = true;
    const card = queue[0];
    const correct = keep === card.isGood;
    setSwipe(keep ? "right" : "left");
    setFeedback(correct ? "ok" : "bad");
    if (correct) setScore((s) => s + 1);
    else setWrong((w) => w + 1);
    setTimeout(() => {
      setSwipe(null);
      setFeedback(null);
      locked.current = false;
      setQueue((q) => {
        const rest = q.slice(1);
        if (rest.length === 0) {
          clear();
          phaseRef.current = "done";
          setPhase("done");
        }
        return rest;
      });
    }, 380);
  }

  useEffect(() => () => clear(), []);

  const card = queue[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <button
        onClick={() => { clear(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Identity Stack</p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: C }}>{score}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stacked</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{wrong}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wrong</p>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && card && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="flex w-full max-w-xs justify-between text-xs px-2" style={{ color: "var(--muted-foreground)", opacity: 0.55 }}>
            <span>← Discard</span>
            <span>Stack →</span>
          </div>
          {/* Card deck shadow effect */}
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-0 rounded-3xl -translate-y-2 rotate-1 scale-95 opacity-30"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}/>
            <div className="absolute inset-0 rounded-3xl -translate-y-1 -rotate-1 scale-97 opacity-50"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}/>
            <div
              className="relative rounded-3xl p-8 text-center"
              style={{
                background: feedback === "ok" ? `${C}18` : feedback === "bad" ? "rgba(239,68,68,0.12)" : "var(--card)",
                border: `1.5px solid ${feedback === "ok" ? C : feedback === "bad" ? "#ef4444" : "var(--border)"}`,
                boxShadow: feedback === "ok" ? `0 0 32px ${C}44` : "none",
                transform: swipe === "left"
                  ? "translateX(-72px) rotate(-10deg)"
                  : swipe === "right"
                  ? "translateX(72px) rotate(10deg)"
                  : "none",
                transition: "transform 0.32s ease, border-color 0.15s, background 0.15s",
              }}
            >
              <p className="text-lg font-bold leading-snug">{card.text}</p>
              {feedback && (
                <p className="mt-3 text-sm font-bold" style={{ color: feedback === "ok" ? C : "#ef4444" }}>
                  {feedback === "ok" ? "✓ Correct!" : "✗ Wrong"}
                </p>
              )}
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-4 w-full max-w-xs">
            <button
              onClick={() => decide(false)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all"
              style={{ background: "rgba(239,68,68,0.10)", border: "1.5px solid rgba(239,68,68,0.30)", color: "#ef4444" }}
            >
              ✕ Discard
            </button>
            <button
              onClick={() => decide(true)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all"
              style={{ background: `${C}14`, border: `1.5px solid ${C}50`, color: C }}
            >
              ✓ Stack
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/40">{queue.length} cards remaining</p>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold" style={{ color: C }}>{score}</p>
                <p className="text-sm text-muted-foreground">correct sorts · {wrong} wrong</p>
              </div>
              <p className="text-lg font-semibold">
                {score >= 15 ? "Identity locked in." : score >= 8 ? "Strong self-awareness." : "Keep sorting."}
              </p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Stack your identity.</p>
              <p className="text-sm text-muted-foreground">
                Keep good habits, discard the bad ones.<br />Choose fast — the timer doesn't wait.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #9F1239)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}
