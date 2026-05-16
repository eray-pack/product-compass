import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/clarityclimb")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: ClarityClimb,
});

const SUMMIT = 20;
const C = "#10B981";

const GOOD = [
  "Go for a walk", "Drink water", "Call a friend",
  "10 push-ups", "Meditate 2 min", "Read a page",
  "Deep breath", "Write it down", "Cold water splash",
  "Listen to music", "Step outside", "Do a stretch",
];

const BAD = [
  "One more hit", "Check later", "Nobody cares",
  "Just this once", "I can't do this", "Give up",
  "Start tomorrow", "It won't matter", "I deserve this",
  "Five more minutes", "No one will know", "What's the point",
];

function makeCard() {
  const isGood = Math.random() > 0.45;
  const list = isGood ? GOOD : BAD;
  return { text: list[Math.floor(Math.random() * list.length)], isGood };
}

function ClarityClimb() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [level, setLevel] = useState(0);
  const [card, setCard] = useState(makeCard);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [good, setGood] = useState(0);
  const [bad, setBad] = useState(0);

  function start() {
    setLevel(0);
    setCard(makeCard());
    setFeedback(null);
    setGood(0);
    setBad(0);
    setPhase("playing");
  }

  function pick(keep: boolean) {
    if (feedback) return;
    const correct = keep === card.isGood;
    setFeedback(correct ? "up" : "down");
    setTimeout(() => {
      setFeedback(null);
      setLevel((l) => {
        const next = correct ? Math.min(SUMMIT, l + 1) : Math.max(0, l - 2);
        if (next >= SUMMIT) { setPhase("done"); }
        return next;
      });
      if (correct) setGood((g) => g + 1);
      else setBad((b) => b + 1);
      setCard(makeCard());
    }, 550);
  }

  const pct = (level / SUMMIT) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <button
        onClick={() => navigate({ to: "/" })}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Clarity Climb</p>
        {phase === "playing" && (
          <p className="text-xs text-muted-foreground mt-1">{level} / {SUMMIT} steps to summit</p>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col px-6 gap-4 mt-2">
          {/* Mountain */}
          <div className="relative mx-auto w-full max-w-xs" style={{ height: 110 }}>
            <svg viewBox="0 0 300 110" width="100%" height="100%" fill="none">
              <defs>
                <clipPath id="cc-fill">
                  <rect x="0" y={110 - 100 * pct / 100} width="300" height="200"/>
                </clipPath>
              </defs>
              <path d="M10 108 L150 8 L290 108 Z" stroke={C} strokeWidth="2" opacity="0.25"/>
              <path d="M10 108 L150 8 L290 108 Z" fill={C} fillOpacity="0.06"/>
              <path d="M10 108 L150 8 L290 108 Z" fill={C} fillOpacity="0.18" clipPath="url(#cc-fill)"/>
              <circle cx="150" cy={108 - 100 * pct / 100} r="7"
                fill={C} style={{ filter: `drop-shadow(0 0 8px ${C})` }}/>
              <circle cx="150" cy="8" r="5" fill="#FFD700" opacity="0.85"/>
              <text x="150" y="5" textAnchor="middle" fontSize="10" fill="#FFD700" opacity="0.7">★</text>
            </svg>
          </div>

          {/* Card */}
          <div
            className="mx-auto w-full max-w-xs rounded-3xl p-7 text-center transition-all duration-300"
            style={{
              background: feedback === "up" ? `${C}1A` : feedback === "down" ? "rgba(239,68,68,0.12)" : "var(--card)",
              border: `1.5px solid ${feedback === "up" ? C : feedback === "down" ? "#ef4444" : "var(--border)"}`,
              boxShadow: feedback === "up" ? `0 0 28px ${C}44` : "none",
            }}
          >
            <p className="text-lg font-semibold leading-snug">{card.text}</p>
            {feedback && (
              <p className="mt-3 text-sm font-bold" style={{ color: feedback === "up" ? C : "#ef4444" }}>
                {feedback === "up" ? "↑ Climbing!" : "↓ Slipping back…"}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 max-w-xs mx-auto w-full pb-4">
            <button
              onClick={() => pick(false)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all"
              style={{ background: "rgba(239,68,68,0.10)", border: "1.5px solid rgba(239,68,68,0.32)", color: "#ef4444" }}
            >
              ✕ Discard
            </button>
            <button
              onClick={() => pick(true)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all"
              style={{ background: `${C}18`, border: `1.5px solid ${C}55`, color: C }}
            >
              ✓ Keep
            </button>
          </div>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <p className="text-5xl">🏔️</p>
              <div className="text-center space-y-1">
                <p className="text-xl font-bold">Summit reached!</p>
                <p className="text-sm text-muted-foreground">{good} good choices · {bad} missteps</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: C }}>
                Every good choice is a step upward.
              </p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Climb to the summit.</p>
              <p className="text-sm text-muted-foreground">
                Keep good choices, discard the bad.<br />Wrong answers slide you back down.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #059669)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "done" ? "Climb again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}
