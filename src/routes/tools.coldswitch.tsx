import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/coldswitch")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/" });
  },
  component: ColdSwitch,
});

const GAME_DURATION = 45;
const INITIAL_WINDOW = 1800;
const MIN_WINDOW = 500;

const TASK_PAIRS = [
  ["COUNT UP", "SAY ABC"],
  ["BREATHE", "FLEX"],
  ["EYES LEFT", "EYES RIGHT"],
  ["CLENCH", "RELAX"],
  ["STEP LEFT", "STEP RIGHT"],
];

const C = "#00BCD4";

function ColdSwitch() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<0 | 1>(0);
  const [pair, setPair] = useState(TASK_PAIRS[0]);
  const [flashSide, setFlashSide] = useState<0 | 1 | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [windowMs, setWindowMs] = useState(INITIAL_WINDOW);

  const phaseRef = useRef<"idle" | "playing" | "done">("idle");
  const windowRef = useRef(INITIAL_WINDOW);
  const targetRef = useRef<0 | 1>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (missRef.current) clearTimeout(missRef.current);
  }, []);

  function nextPrompt() {
    if (phaseRef.current !== "playing") return;
    const side = Math.random() < 0.5 ? 0 : 1;
    const p = TASK_PAIRS[Math.floor(Math.random() * TASK_PAIRS.length)];
    targetRef.current = side as 0 | 1;
    setTarget(side as 0 | 1);
    setPair(p);
    setFlashSide(side as 0 | 1);
    setTimeout(() => setFlashSide(null), 250);
    missRef.current = setTimeout(() => {
      if (phaseRef.current !== "playing") return;
      setMisses((m) => m + 1);
      setFeedback("bad");
      setTimeout(() => setFeedback(null), 300);
      nextPrompt();
    }, windowRef.current);
  }

  function start() {
    clearAll();
    phaseRef.current = "playing";
    windowRef.current = INITIAL_WINDOW;
    setPhase("playing");
    setScore(0);
    setMisses(0);
    setWindowMs(INITIAL_WINDOW);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearAll();
          phaseRef.current = "done";
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => nextPrompt(), 600);
  }

  function tap(side: 0 | 1) {
    if (phaseRef.current !== "playing") return;
    if (missRef.current) clearTimeout(missRef.current);
    const correct = side === targetRef.current;
    if (correct) {
      setScore((s) => s + 1);
      const next = Math.max(MIN_WINDOW, windowRef.current - 25);
      windowRef.current = next;
      setWindowMs(next);
      setFeedback("ok");
    } else {
      setMisses((m) => m + 1);
      setFeedback("bad");
    }
    setTimeout(() => setFeedback(null), 300);
    nextPrompt();
  }

  useEffect(() => () => clearAll(), [clearAll]);

  const rating =
    score >= 30 ? "Lightning reflexes." :
    score >= 20 ? "Sharp switch control." :
    score >= 10 ? "Building speed." : "Keep practicing.";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <button
        onClick={() => { clearAll(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Cold Switch</p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: C }}>{score}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{misses}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Misses</p>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col gap-4 px-6 mt-4">
          <div
            className="text-center py-4 rounded-2xl transition-all"
            style={{
              background: feedback === "ok" ? `${C}20` : feedback === "bad" ? "rgba(239,68,68,0.12)" : "var(--card)",
              border: `1.5px solid ${feedback === "ok" ? C : feedback === "bad" ? "#ef4444" : "var(--border)"}`,
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">Switch to →</p>
            <p className="text-2xl font-bold" style={{ color: C }}>{pair[target]}</p>
          </div>
          <div className="flex gap-3 flex-1">
            {([0, 1] as const).map((side) => (
              <button
                key={side}
                onPointerDown={(e) => { e.preventDefault(); tap(side); }}
                className="flex-1 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95"
                style={{
                  background: flashSide === side ? `${C}28` : "var(--card)",
                  border: `2px solid ${flashSide === side ? C : "var(--border)"}`,
                  boxShadow: flashSide === side ? `0 0 24px ${C}55` : "none",
                  touchAction: "none",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  {side === 0
                    ? <path d="M22 10 L12 18 L22 26 M12 18 H26" stroke={C} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    : <path d="M14 10 L24 18 L14 26 M24 18 H10" stroke={C} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  }
                </svg>
                <span className="text-xs font-bold" style={{ color: C }}>{pair[side]}</span>
              </button>
            ))}
          </div>
          <p className="text-center pb-3 text-[10px] text-muted-foreground/50">
            Window: {Math.round(windowMs)}ms
          </p>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold" style={{ color: C }}>{score}</p>
                <p className="text-sm text-muted-foreground">correct switches · {misses} misses</p>
              </div>
              <p className="text-lg font-semibold">{rating}</p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Switch fast, switch clean.</p>
              <p className="text-sm text-muted-foreground">
                Tap the side matching the task shown.<br />Gets faster every correct switch.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #0097A7)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}
